import { Context, Next } from 'hono';
import { Env } from '../types';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Extend Hono context to carry auth user
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Check KV session exists (for revocation support)
  const sessionKey = `session:${payload.sub}:${payload.iat}`;
  const session = await c.env.KV.get(sessionKey);
  if (!session) {
    return c.json({ error: 'Session expired or revoked' }, 401);
  }

  c.set('user', payload);
  await next();
}

export function requireRole(...roles: string[]) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  };
}
