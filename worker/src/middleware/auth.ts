import { Context, Next } from 'hono';

export interface AccessUser {
  email: string;
  name?: string;
}

export function getAccessUser(c: Context): AccessUser | null {
  const jwt = c.req.header('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    // In development, return a mock user
    if (c.env.ENVIRONMENT === 'development') {
      return { email: 'dev@ohcs.gov.gh', name: 'Dev User' };
    }
    return null;
  }

  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth in development
  if (c.env.ENVIRONMENT === 'development') {
    await next();
    return;
  }

  const user = getAccessUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
}
