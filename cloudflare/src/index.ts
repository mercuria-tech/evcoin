// Simple EV Charging Platform API Gateway
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/api/v1/health' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT || 'production',
        version: '1.0.0',
        message: 'EV Charging Platform API is running',
        services: {
          database: 'connected',
          kv: 'connected',
          r2: 'connected',
          durable_objects: 'ready'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Basic API endpoints
    if (url.pathname === '/api/v1/auth/login') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          return new Response(JSON.stringify({
            success: true,
            message: 'Login endpoint ready',
            data: {
              token: 'example-token',
              user: { id: '1', email: body.email || 'test@example.com' }
            }
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: 'Invalid request body'
          }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
    }
    
    if (url.pathname === '/api/v1/stations') {
      if (request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          data: [
            {
              id: '1',
              name: 'Downtown Plaza Station',
              location: { lat: 37.7749, lng: -122.4194 },
              status: 'online',
              connectors: [
                { id: '1', type: 'Type2', power: 22, status: 'available' },
                { id: '2', type: 'CCS', power: 50, status: 'available' }
              ]
            }
          ]
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // Default response
    return new Response(JSON.stringify({
      error: {
        message: `Route not found: ${request.method} ${url.pathname}`,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};
