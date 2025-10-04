import { DurableObject } from 'cloudflare:workers';

interface ChargeSession {
  id: string;
  userId: string;
  stationId: string;
  connectorId: string;
  status: 'starting' | 'charging' | 'paused' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  endedAt?: Date;
  energyDeliveredKwh?: number;
  costAmount?: number;
  clients: Set<WebSocket>;
}

export class ChargeSessionObject extends DurableObject {
  private sessions: Map<string, ChargeSession> = new Map();
  private wsClients: Set<WebSocket> = new Set();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // WebSocket upgrade
    if (request.headers.get('upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // REST API routes
    switch (method) {
      case 'GET':
        if (path === '/session') {
          return this.getSession(request);
        } else if (path === '/sessions') {
          return this.getActiveSessions();
        }
        break;
      
      case 'POST':
        if (path === '/session') {
          return this.createSession(request);
        } else if (path === '/session/:id/start') {
          return this.startSession(request);
        } else if (path === '/session/:id/stop') {
          return this.stopSession(request);
        } else if (path === '/session/:id/pause') {
          return this.pauseSession(request);
        } else if (path === '/session/:id/resume') {
          return this.resumeSession(request);
        } else if (path === '/session/:id/status') {
          return this.updateSessionStatus(request);
        }
        break;
      
      case 'PATCH':
        if (path === '/session/:id') {
          return this.updateSession(request);
        }
        break;
      
      case 'DELETE':
        if (path === '/session/:id') {
          return this.deleteSession(request);
        }
        break;
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());
    
    client.accept();
    
    // Add to clients set
    this.wsClients.add(client);
    
    // Send current active sessions
    const activeSessions = Array.from(this.sessions.values()).filter(s => 
      s.status === 'charging' || s.status === 'starting'
    );
    client.send(JSON.stringify({
      type: 'sessions_update',
      data: activeSessions
    }));

    // Handle client messages
    client.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data);
        await this.handleClientMessage(client, message);
      } catch (error) {
        client.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    // Handle client disconnect
    client.addEventListener('close', () => {
      this.wsClients.delete(client);
      // Remove from session clients too
      this.sessions.forEach(session => {
        session.clients.delete(client);
      });
    });

    return new Response(null, { status: 101, webSocket: server });
  }

  private async handleClientMessage(client: WebSocket, message: any): Promise<void> {
    switch (message.type) {
      case 'subscribe_session':
        const session = this.sessions.get(message.sessionId);
        if (session) {
          session.clients.add(client);
          client.send(JSON.stringify({
            type: 'session_details',
            data: session
          }));
        }
        break;
      
      case 'unsubscribe_session':
        const unsubSession = this.sessions.get(message.sessionId);
        if (unsubSession) {
          unsubSession.clients.delete(client);
        }
        break;
      
      case 'ping':
        client.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
    }
  }

  private async getSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('id');
    
    if (!sessionId) {
      return new Response('Missing session ID', { status: 400 });
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getActiveSessions(): Promise<Response> {
    const activeSessions = Array.from(this.sessions.values()).filter(session =>
      session.status === 'charging' || session.status === 'starting'
    );

    return new Response(JSON.stringify(activeSessions), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async createSession(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const { userId, stationId, connectorId } = data;

      const sessionId = `session_${Date.now()}_${userId}`;
      const session: ChargeSession = {
        id: sessionId,
        userId,
        stationId,
        connectorId,
        status: 'starting',
        startedAt: new Date(),
        clients: new Set()
      };

      this.sessions.set(sessionId, session);

      // Broadcast new session to all clients
      this.broadcastToAll({
        type: 'session_created',
        data: session
      });

      return new Response(JSON.stringify(session), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Invalid request body', { status: 400 });
    }
  }

  private async startSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3]; // Extract from /session/:id/start

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    session.status = 'charging';
    
    // Broadcast status update
    this.broadcastToClients(session.clients, {
      type: 'session_status_update',
      data: { id: sessionId, status: 'charging' }
    });

    this.broadcastToAll({
      type: 'sessions_update',
      data: Array.from(this.sessions.values()).filter(s => 
        s.status === 'charging' || s.status === 'starting'
      )
    });

    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async stopSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3];

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    try {
      const data = await request.json();
      const { energyDeliveredKwh, costAmount, reason } = data;

      session.status = 'completed';
      session.endedAt = new Date();
      session.energyDeliveredKwh = energyDeliveredKwh;
      session.costAmount = costAmount;

      // Broadcast completion
      this.broadcastToClients(session.clients, {
        type: 'session_completed',
        data: {
          id: sessionId,
          status: 'completed',
          energyDeliveredKwh,
          costAmount,
          reason
        }
      });

      // Remove from active sessions
      this.broadcastToAll({
        type: 'sessions_update',
        data: Array.from(this.sessions.values()).filter(s => 
          s.status === 'charging' || s.status === 'starting'
        )
      });

      return new Response(JSON.stringify(session), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Invalid request body', { status: 400 });
    }
  }

  private async pauseSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3];

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    session.status = 'paused';

    this.broadcastToClients(session.clients, {
      type: 'session_status_update',
      data: { id: sessionId, status: 'paused' }
    });

    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async resumeSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3];

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    session.status = 'charging';

    this.broadcastToClients(session.clients, {
      type: 'session_status_update',
      data: { id: sessionId, status: 'charging' }
    });

    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async updateSessionStatus(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3];

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    try {
      const data = await request.json();
      const { status, energyDeliveredKwh, avgPowerKw, errorCode, errorMessage } = data;

      session.status = status;
      if (energyDeliveredKwh !== undefined) session.energyDeliveredKwh = energyDeliveredKwh;

      // Broadcast status update
      this.broadcastToClients(session.clients, {
        type: 'session_status_update',
        data: {
          id: sessionId,
          status,
          energyDeliveredKwh,
          avgPowerKw,
          errorCode,
          errorMessage,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(JSON.stringify(session), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Invalid request body', { status: 400 });
    }

  private async updateSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3];

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    try {
      const updates = await request.json();
      Object.assign(session, updates);

      // Broadcast update
      this.broadcastToClients(session.clients, {
        type: 'session_updated',
        data: session
      });

      return new Response(JSON.stringify(session), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Invalid request body', { status: 400 });
    }
  }

  private async deleteSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[3];

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    this.sessions.delete(sessionId);

    // Notify clients
    this.broadcastToClients(session.clients, {
      type: 'session_deleted',
      data: { id: sessionId }
    });

    this.broadcastToAll({
      type: 'sessions_update',
      data: Array.from(this.sessions.values()).filter(s => 
        s.status === 'charging' || s.status === 'starting'
      )
    });

    return new Response(null, { status: 204 });
  }

  private broadcastToClients(clients: Set<WebSocket>, message: any): void {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error('Failed to send message to client:', error);
        clients.delete(client);
      }
    });
  }

  private broadcastToAll(message: any): void {
    this.broadcastToClients(this.wsClients, message);
  }

  // Cleanup expired sessions
  async cleanup(): Promise<void> {
    const now = new Date();
    const expiredSessions = Array.from(this.sessions.entries()).filter(([_, session]) => {
      const sessionAge = now.getTime() - new Date(session.startedAt).getTime();
      return sessionAge > 24 * 60 * 60 * 1000; // 24 hours
    });

  expiredSessions.forEach(([sessionId, _]) => {
      this.sessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }
}
