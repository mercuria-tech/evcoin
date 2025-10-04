import { verifyJwt } from 'jose/jwt/verify';
import { createRemoteJWKSettler } from 'jose/jwks/remote';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  env?: any;
}

export async function authenticateUser(
  request: Request,
  env: any,
  ctx: ExecutionContext
): Promise<Response | AuthenticatedRequest> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization header',
          }
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const jwtSecret = new TextEncoder().encode(env.JWT_SECRET || 'your-secret-key');
    
    try {
      const { payload } = await verifyJwt(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'ev-charging-platform',
        clockTolerance: 30, // 30 seconds
      });

      // Extract user information from token
      const userId = payload.sub;
      
      if (!userId) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'INVALID_TOKEN',
              message: 'Token missing user ID',
            }
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Get user details from database or cache
      const user = await getUserFromToken(token, env);
      
      if (!user) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found or inactive',
            }
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Add user to request
      (request as AuthenticatedRequest).user = user;
      
      return request as AuthenticatedRequest;

    } catch (jwtError: any) {
      console.error('JWT verification failed:', jwtError.message);
      
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token verification failed',
            ...(env.ENVIRONMENT === 'development' && { details: jwtError.message })
          }
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    console.error('Authentication error:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication failed',
          ...(env.ENVIRONMENT === 'development' && { details: error.message })
        }
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getUserFromToken(token: string, env: any): Promise<any | null> {
  try {
    // Try to get user from cache first
    const cachedUser = await env.CACHE_STORE?.get(`user:${token}`);
    
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    // Decode token to get user ID (without fetching all user data)
    const jwtPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = jwtPayload.sub;

    if (!userId) {
      return null;
    }

    // Get user from database
    const userResult = await env.D1_DATABASE.prepare(
      'SELECT id, email, first_name, last_name, role, permissions FROM users WHERE id = ? AND email_verified = true'
    ).bind(userId).first();

    if (!userResult) {
      return null;
    }

    const user = {
      id: userResult.id,
      email: userResult.email,
      firstName: userResult.first_name,
      lastName: userResult.last_name,
      role: userResult.role || 'user',
      permissions: userResult.permissions ? JSON.parse(userResult.permissions) : [],
      tokenExpiry: jwtPayload.exp
    };

    // Cache user for 5 minutes
    await env.CACHE_STORE?.put(
      `user:${token}`,
      JSON.stringify(user),
      { expirationTtl: 300 }
    );

    return user;

  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export function requireRole(requiredRole: string) {
  return function authenticateRole(request: AuthenticatedRequest): Response | AuthenticatedRequest {
    const user = request.user;
    
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          }
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check role hierarchy (admin > operator > user)
    const roleHierarchy: { [key: string]: number } = {
      'user': 1,
      'operator': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'FORBIDDEN',
            message: `Insufficient permissions. Requires ${requiredRole} role or higher.`,
          }
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return request;
  };
}

export function requirePermission(requiredPermission: string) {
  return function authenticatePermission(request: AuthenticatedRequest): Response | AuthenticatedRequest {
    const user = request.user;
    
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          }
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Admin bypass - admins have all permissions
    if (user.role === 'admin') {
      return request;
    }

    // Check specific permission
    if (!user.permissions.includes(requiredPermission)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'FORBIDDEN',
            message: `Missing required permission: ${requiredPermission}`,
          }
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return request;
  };
}

export function requireOwnership(resourceOwnerKey: string = 'user_id') {
  return function authenticateOwnership(request: AuthenticatedRequest): Response | AuthenticatedRequest {
    const user = request.user;
    
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          }
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Admin bypass - admins can access all resources
    if (user.role === 'admin') {
      return request;
    }

    // Check URL parameters for resource ID
    const url = new URL(request.url);
    const resourceId = url.pathname.split('/').pop();
    
    if (!resourceId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'BAD_REQUEST',
            message: 'Missing resource ID',
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Note: In a real implementation, you would check the resource ownership in the route handler
    // This middleware adds ownership validation requirement to the request context
    (request as any).ownershipCheckRequired = true;
    (request as any).ownershipKey = resourceOwnerKey;
    (request as any).resourceId = resourceId;

    return request;
  };
}

// Utility function to validate API keys for service-to-service communication
export async function validateApiKey(request: Request, env: any): Promise<boolean> {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return false;
  }

  try {
    // Check if API key exists and is valid
    const keyExists = await env.EV_PLATFORM_KV.get(`api_key:${apiKey}`);
    
    if (!keyExists) {
      return false;
    }

    const keyData = JSON.parse(keyExists);
    
    // Check if key is still valid
    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
      await env.EV_PLATFORM_KV.delete(`api_key:${apiKey}`);
      return false;
    }

    // Update last used timestamp
    keyData.lastUsed = new Date().toISOString();
    await env.EV_PLATFORM_KV.put(`api_key:${apiKey}`, JSON.stringify(keyData));

    return true;

  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

// Rate limiting for authentication endpoints
export async function rateLimitAuth(request: Request, env: any, ctx: ExecutionContext): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `auth_rate_limit:${ip}`;
  
  try {
    const attempts = await env.CACHE_STORE.get(key);
    
    if (attempts && parseInt(attempts) >= 10) { // Max 10 attempts per hour
      return false;
    }

    const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await env.CACHE_STORE.put(key, newAttempts.toString(), { expirationTtl: 3600 }); // 1 hour

    return true;

  } catch (error) {
    console.error('Rate limiting error:', error);
    return true; // Allow on error
  }
}
