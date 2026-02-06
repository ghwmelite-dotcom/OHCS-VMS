import { Hono } from 'hono';
import { Env } from '../types';

const preRegistrations = new Hono<{ Bindings: Env }>();

// QR token lookup (must be before /:id)
preRegistrations.get('/qr/:token', async (c) => {
  const token = c.req.param('token');

  const preReg = await c.env.DB.prepare(`
    SELECT pr.*, o.abbreviation as office_abbr, o.full_name as office_name, o.office_type,
           o.floor, o.room, o.head_officer
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE pr.qr_token = ? AND pr.status IN ('confirmed', 'pending')
  `).bind(token).first();

  if (!preReg) {
    return c.json({ error: 'No valid pre-registration found for this QR code' }, 404);
  }

  return c.json({ preRegistration: preReg });
});

// List pre-registrations
preRegistrations.get('/', async (c) => {
  const status = c.req.query('status');
  const date = c.req.query('date');

  let query = `
    SELECT pr.*, o.abbreviation as office_abbr, o.full_name as office_name, o.office_type
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) {
    query += ' AND pr.status = ?';
    params.push(status);
  }
  if (date) {
    query += ' AND pr.expected_date = ?';
    params.push(date);
  }

  query += ' ORDER BY pr.expected_date ASC, pr.expected_time ASC';

  const result = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ preRegistrations: result.results });
});

// Create pre-registration
preRegistrations.post('/', async (c) => {
  const body = await c.req.json();
  const { visitor_name, visitor_phone, visitor_email, visitor_organization, office_id, purpose, host_officer, expected_date, expected_time } = body;

  if (!visitor_name || !office_id || !purpose || !host_officer || !expected_date) {
    return c.json({ error: 'visitor_name, office_id, purpose, host_officer, and expected_date are required' }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO pre_registrations (visitor_name, visitor_phone, visitor_email, visitor_organization, office_id, purpose, host_officer, expected_date, expected_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    visitor_name, visitor_phone || null, visitor_email || null,
    visitor_organization || null, office_id, purpose, host_officer,
    expected_date, expected_time || null
  ).run();

  const preReg = await c.env.DB.prepare(
    'SELECT pr.*, o.abbreviation as office_abbr, o.full_name as office_name FROM pre_registrations pr JOIN offices o ON pr.office_id = o.id WHERE pr.id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json({ preRegistration: preReg }, 201);
});

// Update pre-registration
preRegistrations.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { status } = body;

  if (status) {
    await c.env.DB.prepare(
      'UPDATE pre_registrations SET status = ? WHERE id = ?'
    ).bind(status, id).run();
  }

  const preReg = await c.env.DB.prepare(
    'SELECT pr.*, o.abbreviation as office_abbr FROM pre_registrations pr JOIN offices o ON pr.office_id = o.id WHERE pr.id = ?'
  ).bind(id).first();

  if (!preReg) return c.json({ error: 'Pre-registration not found' }, 404);
  return c.json({ preRegistration: preReg });
});

export default preRegistrations;
