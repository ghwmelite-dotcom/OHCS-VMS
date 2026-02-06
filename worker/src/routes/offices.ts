import { Hono } from 'hono';
import { Env, Office } from '../types';

const offices = new Hono<{ Bindings: Env }>();

// List all offices, optionally filtered by type
offices.get('/', async (c) => {
  const type = c.req.query('type');

  let query = 'SELECT * FROM offices WHERE is_active = TRUE';
  const params: string[] = [];

  if (type && ['directorate', 'unit', 'executive'].includes(type)) {
    query += ' AND office_type = ?';
    params.push(type);
  }

  query += ' ORDER BY office_type, abbreviation';

  const stmt = params.length > 0
    ? c.env.DB.prepare(query).bind(...params)
    : c.env.DB.prepare(query);

  const result = await stmt.all<Office>();
  return c.json({ offices: result.results });
});

// Get single office by abbreviation
offices.get('/:abbreviation', async (c) => {
  const abbr = c.req.param('abbreviation').toUpperCase();
  const office = await c.env.DB.prepare(
    'SELECT * FROM offices WHERE abbreviation = ?'
  ).bind(abbr).first<Office>();

  if (!office) return c.json({ error: 'Office not found' }, 404);
  return c.json({ office });
});

// Get visitors for a specific office today
offices.get('/:abbreviation/visitors', async (c) => {
  const abbr = c.req.param('abbreviation').toUpperCase();
  const today = new Date().toISOString().split('T')[0];

  const result = await c.env.DB.prepare(`
    SELECT v.*, vis.full_name, vis.organization, vis.phone,
           o.abbreviation as office_abbr, o.office_type
    FROM visits v
    JOIN visitors vis ON v.visitor_id = vis.id
    JOIN offices o ON v.office_id = o.id
    WHERE o.abbreviation = ? AND DATE(v.check_in) = ?
    ORDER BY v.check_in DESC
  `).bind(abbr, today).all();

  return c.json({ visits: result.results });
});

export default offices;
