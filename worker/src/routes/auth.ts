import { Hono } from 'hono';
import { Env, User } from '../types';
import { hashPassword, verifyPassword } from '../utils/password';
import { createToken } from '../utils/jwt';
import { authMiddleware, requireRole } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env }>();

const EMAIL_DOMAIN = '@ohcs.gov.gh';
const SESSION_TTL = 8 * 60 * 60; // 8 hours in seconds

function validateEmail(email: string): boolean {
  return email.endsWith(EMAIL_DOMAIN) && email.length > EMAIL_DOMAIN.length;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}

async function logAudit(
  db: D1Database,
  userId: number | null,
  action: string,
  c: { req: { header: (name: string) => string | undefined } },
  details?: string,
) {
  await db
    .prepare(
      'INSERT INTO auth_audit_log (user_id, action, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      userId,
      action,
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
      c.req.header('User-Agent') || 'unknown',
      details || null,
    )
    .run();
}

// ─── Bootstrap first admin (only works when 0 users exist) ───
auth.post('/setup', async (c) => {
  const count = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first<{ cnt: number }>();
  if (count && count.cnt > 0) {
    return c.json({ error: 'Setup already completed. Contact an admin to create accounts.' }, 403);
  }

  const body = await c.req.json<{ email: string; password: string; full_name: string }>();

  if (!body.email || !body.password || !body.full_name) {
    return c.json({ error: 'email, password, and full_name are required' }, 400);
  }

  if (!validateEmail(body.email)) {
    return c.json({ error: `Email must end with ${EMAIL_DOMAIN}` }, 400);
  }

  const pwError = validatePassword(body.password);
  if (pwError) return c.json({ error: pwError }, 400);

  const { hash, salt } = await hashPassword(body.password);

  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, salt, full_name, role) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(body.email.toLowerCase(), hash, salt, body.full_name, 'admin')
    .run();

  const userId = result.meta.last_row_id as number;
  await logAudit(c.env.DB, userId, 'setup', c, 'First admin account created');

  return c.json({ message: 'Admin account created successfully', userId });
});

// ─── Login ───
auth.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  if (!body.email || !body.password) {
    return c.json({ error: 'email and password are required' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(body.email.toLowerCase())
    .first<User>();

  if (!user) {
    await logAudit(c.env.DB, null, 'login_failed', c, `Unknown email: ${body.email}`);
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  if (!user.is_active) {
    await logAudit(c.env.DB, user.id, 'login_blocked', c, 'Account deactivated');
    return c.json({ error: 'Account is deactivated. Contact an admin.' }, 403);
  }

  const valid = await verifyPassword(body.password, user.password_hash, user.salt);
  if (!valid) {
    await logAudit(c.env.DB, user.id, 'login_failed', c, 'Wrong password');
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const token = await createToken(user, c.env.JWT_SECRET);

  // Decode iat from token for session key
  const payload = JSON.parse(atob(token.split('.')[1]));
  const sessionKey = `session:${user.id}:${payload.iat}`;
  await c.env.KV.put(sessionKey, JSON.stringify({ email: user.email, role: user.role }), {
    expirationTtl: SESSION_TTL,
  });

  // Update last_login
  await c.env.DB.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(user.id)
    .run();

  await logAudit(c.env.DB, user.id, 'login', c);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      office_id: user.office_id,
    },
  });
});

// ─── Authenticated routes ───
auth.use('/me', authMiddleware);
auth.use('/logout', authMiddleware);
auth.use('/change-password', authMiddleware);
auth.use('/users', authMiddleware);
auth.use('/users/*', authMiddleware);

// ─── Get current user ───
auth.get('/me', async (c) => {
  const payload = c.get('user');
  const user = await c.env.DB.prepare(
    'SELECT id, email, full_name, role, office_id, last_login, created_at FROM users WHERE id = ?',
  )
    .bind(payload.sub)
    .first();

  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
});

// ─── Logout ───
auth.post('/logout', async (c) => {
  const payload = c.get('user');
  const sessionKey = `session:${payload.sub}:${payload.iat}`;
  await c.env.KV.delete(sessionKey);
  await logAudit(c.env.DB, payload.sub, 'logout', c);
  return c.json({ message: 'Logged out' });
});

// ─── Change own password ───
auth.put('/change-password', async (c) => {
  const payload = c.get('user');
  const body = await c.req.json<{ current_password: string; new_password: string }>();

  if (!body.current_password || !body.new_password) {
    return c.json({ error: 'current_password and new_password are required' }, 400);
  }

  const pwError = validatePassword(body.new_password);
  if (pwError) return c.json({ error: pwError }, 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(payload.sub)
    .first<User>();

  if (!user) return c.json({ error: 'User not found' }, 404);

  const valid = await verifyPassword(body.current_password, user.password_hash, user.salt);
  if (!valid) return c.json({ error: 'Current password is incorrect' }, 401);

  const { hash, salt } = await hashPassword(body.new_password);
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, salt = ?, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
  )
    .bind(hash, salt, payload.sub)
    .run();

  await logAudit(c.env.DB, payload.sub, 'password_changed', c);
  return c.json({ message: 'Password changed successfully' });
});

// ─── Admin: List users ───
auth.get('/users', requireRole('admin'), async (c) => {
  const users = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.full_name, u.role, u.office_id, u.is_active, u.last_login, u.created_at,
            o.abbreviation as office_abbreviation, o.full_name as office_name
     FROM users u
     LEFT JOIN offices o ON u.office_id = o.id
     ORDER BY u.created_at DESC`,
  ).all();

  return c.json(users.results);
});

// ─── Admin: Create user ───
auth.post('/users', requireRole('admin'), async (c) => {
  const admin = c.get('user');
  const body = await c.req.json<{
    email: string;
    password: string;
    full_name: string;
    role: string;
    office_id?: number;
  }>();

  if (!body.email || !body.password || !body.full_name || !body.role) {
    return c.json({ error: 'email, password, full_name, and role are required' }, 400);
  }

  if (!validateEmail(body.email)) {
    return c.json({ error: `Email must end with ${EMAIL_DOMAIN}` }, 400);
  }

  if (!['admin', 'receptionist', 'supervisor'].includes(body.role)) {
    return c.json({ error: 'Invalid role' }, 400);
  }

  const pwError = validatePassword(body.password);
  if (pwError) return c.json({ error: pwError }, 400);

  // Check duplicate
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(body.email.toLowerCase())
    .first();
  if (existing) return c.json({ error: 'A user with this email already exists' }, 409);

  const { hash, salt } = await hashPassword(body.password);

  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, salt, full_name, role, office_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      body.email.toLowerCase(),
      hash,
      salt,
      body.full_name,
      body.role,
      body.office_id || null,
      admin.sub,
    )
    .run();

  await logAudit(c.env.DB, admin.sub, 'user_created', c, `Created user: ${body.email}`);

  return c.json({ message: 'User created', userId: result.meta.last_row_id }, 201);
});

// ─── Admin: Update user ───
auth.put('/users/:id', requireRole('admin'), async (c) => {
  const admin = c.get('user');
  const userId = parseInt(c.req.param('id'), 10);
  const body = await c.req.json<{
    role?: string;
    office_id?: number | null;
    is_active?: boolean;
    full_name?: string;
  }>();

  if (body.role && !['admin', 'receptionist', 'supervisor'].includes(body.role)) {
    return c.json({ error: 'Invalid role' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: number; email: string }>();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const updates: string[] = [];
  const values: any[] = [];

  if (body.role !== undefined) {
    updates.push('role = ?');
    values.push(body.role);
  }
  if (body.office_id !== undefined) {
    updates.push('office_id = ?');
    values.push(body.office_id);
  }
  if (body.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(body.is_active ? 1 : 0);
  }
  if (body.full_name !== undefined) {
    updates.push('full_name = ?');
    values.push(body.full_name);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);

  await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  // If deactivated, invalidate all sessions for this user
  if (body.is_active === false) {
    const list = await c.env.KV.list({ prefix: `session:${userId}:` });
    for (const key of list.keys) {
      await c.env.KV.delete(key.name);
    }
  }

  await logAudit(
    c.env.DB,
    admin.sub,
    'user_updated',
    c,
    `Updated user ${user.email}: ${JSON.stringify(body)}`,
  );

  return c.json({ message: 'User updated' });
});

// ─── Admin: Reset user password ───
auth.put('/users/:id/reset-password', requireRole('admin'), async (c) => {
  const admin = c.get('user');
  const userId = parseInt(c.req.param('id'), 10);
  const body = await c.req.json<{ new_password: string }>();

  if (!body.new_password) {
    return c.json({ error: 'new_password is required' }, 400);
  }

  const pwError = validatePassword(body.new_password);
  if (pwError) return c.json({ error: pwError }, 400);

  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: number; email: string }>();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const { hash, salt } = await hashPassword(body.new_password);
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, salt = ?, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
  )
    .bind(hash, salt, userId)
    .run();

  // Invalidate all sessions for this user
  const list = await c.env.KV.list({ prefix: `session:${userId}:` });
  for (const key of list.keys) {
    await c.env.KV.delete(key.name);
  }

  await logAudit(c.env.DB, admin.sub, 'password_reset', c, `Reset password for ${user.email}`);

  return c.json({ message: 'Password reset successfully' });
});

export default auth;
