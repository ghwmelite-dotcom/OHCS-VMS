import { Hono } from 'hono';
import { Env, Visitor } from '../types';
import { generateVisitorId } from '../utils/idGenerator';

const visitors = new Hono<{ Bindings: Env }>();

// List visitors with optional filters
visitors.get('/', async (c) => {
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  let query = 'SELECT * FROM visitors';
  const params: any[] = [];

  if (search) {
    query += ' WHERE full_name LIKE ? OR phone LIKE ? OR organization LIKE ? OR id LIKE ?';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...params).all<Visitor>();

  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM visitors';
  const countParams: any[] = [];
  if (search) {
    countQuery += ' WHERE full_name LIKE ? OR phone LIKE ? OR organization LIKE ? OR id LIKE ?';
    const term = `%${search}%`;
    countParams.push(term, term, term, term);
  }
  const countStmt = countParams.length > 0
    ? c.env.DB.prepare(countQuery).bind(...countParams)
    : c.env.DB.prepare(countQuery);
  const total = await countStmt.first<{ count: number }>();

  return c.json({
    visitors: result.results,
    total: total?.count ?? 0,
    limit,
    offset,
  });
});

// Get single visitor with visit history
visitors.get('/:id', async (c) => {
  const id = c.req.param('id');

  const visitor = await c.env.DB.prepare(
    'SELECT * FROM visitors WHERE id = ?'
  ).bind(id).first<Visitor>();

  if (!visitor) return c.json({ error: 'Visitor not found' }, 404);

  const visits = await c.env.DB.prepare(`
    SELECT v.*, o.abbreviation as office_abbr, o.full_name as office_name, o.office_type
    FROM visits v
    JOIN offices o ON v.office_id = o.id
    WHERE v.visitor_id = ?
    ORDER BY v.check_in DESC
    LIMIT 20
  `).bind(id).all();

  return c.json({ visitor, visits: visits.results });
});

// Register new visitor
visitors.post('/', async (c) => {
  const body = await c.req.json();
  const { full_name, phone, email, organization, id_type, id_number } = body;

  if (!full_name) {
    return c.json({ error: 'full_name is required' }, 400);
  }

  const visitorId = await generateVisitorId(c.env.DB);

  await c.env.DB.prepare(`
    INSERT INTO visitors (id, full_name, phone, email, organization, id_type, id_number)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(visitorId, full_name, phone || null, email || null, organization || null, id_type || 'Ghana Card', id_number || null).run();

  const visitor = await c.env.DB.prepare(
    'SELECT * FROM visitors WHERE id = ?'
  ).bind(visitorId).first<Visitor>();

  return c.json({ visitor }, 201);
});

// Update visitor
visitors.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { full_name, phone, email, organization, id_type, id_number, is_blocklisted } = body;

  const existing = await c.env.DB.prepare(
    'SELECT * FROM visitors WHERE id = ?'
  ).bind(id).first();

  if (!existing) return c.json({ error: 'Visitor not found' }, 404);

  await c.env.DB.prepare(`
    UPDATE visitors SET
      full_name = COALESCE(?, full_name),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      organization = COALESCE(?, organization),
      id_type = COALESCE(?, id_type),
      id_number = COALESCE(?, id_number),
      is_blocklisted = COALESCE(?, is_blocklisted),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    full_name || null, phone || null, email || null,
    organization || null, id_type || null, id_number || null,
    is_blocklisted ?? null, id
  ).run();

  const visitor = await c.env.DB.prepare(
    'SELECT * FROM visitors WHERE id = ?'
  ).bind(id).first<Visitor>();

  return c.json({ visitor });
});

export default visitors;
