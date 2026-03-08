import { sign, verify } from 'hono/jwt';

export interface JWTPayload {
  sub: number;
  email: string;
  role: string;
  name: string;
  office_id: number | null;
  iat: number;
  exp: number;
}

const TOKEN_EXPIRY_SECONDS = 8 * 60 * 60; // 8 hours
const ALG = 'HS256';

export async function createToken(
  user: { id: number; email: string; role: string; full_name: string; office_id: number | null },
  secret: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name,
    office_id: user.office_id,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };
  return sign(payload, secret, ALG);
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, secret, ALG) as unknown as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}
