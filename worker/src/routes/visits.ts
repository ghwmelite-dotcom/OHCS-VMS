import { Hono } from 'hono';
import { Env } from '../types';
import { assignBadge, releaseBadge } from '../utils/badgeAssigner';
import { refreshDashboardStats } from '../utils/kvCache';

const visits = new Hono<{ Bindings: Env }>();

// Get today's visits
visits.get('/today', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const officeFilter = c.req.query('office');

  let query = `
    SELECT v.*, vis.full_name as visitor_name, vis.organization, vis.phone as visitor_phone,
           vis.photo_key, o.abbreviation as office_abbr, o.full_name as office_name,
           o.office_type, o.room, o.floor
    FROM visits v
    JOIN visitors vis ON v.visitor_id = vis.id
    JOIN offices o ON v.office_id = o.id
    WHERE DATE(v.check_in) = ?
  `;
  const params: any[] = [today];

  if (officeFilter) {
    query += ' AND o.abbreviation = ?';
    params.push(officeFilter.toUpperCase());
  }

  query += ' ORDER BY v.check_in DESC';

  const result = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ visits: result.results });
});

// Check in a visitor
visits.post('/', async (c) => {
  const body = await c.req.json();
  const { visitor_id, office_id, purpose, host_officer, notes, ai_routed, ai_routing_confidence, ai_flag } = body;

  if (!visitor_id || !office_id || !purpose || !host_officer) {
    return c.json({ error: 'visitor_id, office_id, purpose, and host_officer are required' }, 400);
  }

  // Verify visitor exists
  const visitor = await c.env.DB.prepare(
    'SELECT * FROM visitors WHERE id = ?'
  ).bind(visitor_id).first();

  if (!visitor) return c.json({ error: 'Visitor not found' }, 404);

  // Verify office exists
  const office = await c.env.DB.prepare(
    'SELECT * FROM offices WHERE id = ? AND is_active = TRUE'
  ).bind(office_id).first();

  if (!office) return c.json({ error: 'Office not found or inactive' }, 404);

  // Insert visit
  const insertResult = await c.env.DB.prepare(`
    INSERT INTO visits (visitor_id, office_id, purpose, host_officer, notes, ai_routed, ai_routing_confidence, ai_flag, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'checked-in')
  `).bind(
    visitor_id, office_id, purpose, host_officer,
    notes || null, ai_routed ? 1 : 0, ai_routing_confidence || null, ai_flag || null
  ).run();

  const visitId = insertResult.meta.last_row_id;

  // Assign badge
  const badgeId = await assignBadge(c.env.DB, visitId as number);
  if (badgeId) {
    await c.env.DB.prepare(
      'UPDATE visits SET badge_number = ? WHERE id = ?'
    ).bind(badgeId, visitId).run();
  }

  // Increment visitor visit count
  await c.env.DB.prepare(
    'UPDATE visitors SET visit_count = visit_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(visitor_id).run();

  // Refresh KV dashboard stats
  await refreshDashboardStats(c.env.DB, c.env.KV);

  // Update Durable Object live count
  try {
    const counterId = c.env.LIVE_COUNTER.idFromName('global');
    const counter = c.env.LIVE_COUNTER.get(counterId);
    await counter.fetch(new Request(`https://dummy/checkin?office=${(office as any).abbreviation}`));
  } catch (e) {
    // Non-critical — don't fail the check-in
  }

  // Fetch the full visit record
  const visit = await c.env.DB.prepare(`
    SELECT v.*, vis.full_name as visitor_name, vis.organization,
           o.abbreviation as office_abbr, o.full_name as office_name, o.office_type, o.room, o.floor
    FROM visits v
    JOIN visitors vis ON v.visitor_id = vis.id
    JOIN offices o ON v.office_id = o.id
    WHERE v.id = ?
  `).bind(visitId).first();

  return c.json({ visit, badge: badgeId }, 201);
});

// Check out (with optional survey)
visits.put('/:id/checkout', async (c) => {
  const visitId = parseInt(c.req.param('id'));
  let rating = null;
  let feedback = null;

  // Try to parse body for survey data (optional)
  try {
    const body = await c.req.json();
    rating = body.rating || null;
    feedback = body.feedback || null;
  } catch {
    // No body — that's fine
  }

  const visit = await c.env.DB.prepare(
    'SELECT v.*, o.abbreviation as office_abbr FROM visits v JOIN offices o ON v.office_id = o.id WHERE v.id = ?'
  ).bind(visitId).first<any>();

  if (!visit) return c.json({ error: 'Visit not found' }, 404);
  if (visit.status === 'checked-out') return c.json({ error: 'Already checked out' }, 400);

  await c.env.DB.prepare(
    `UPDATE visits SET status = 'checked-out', check_out = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(visitId).run();

  // Save feedback if provided
  if (rating || feedback) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO feedback (visit_id, visitor_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(visitId, visit.visitor_id, rating, feedback).run();
    } catch {
      // Non-critical
    }
  }

  // Release badge
  if (visit.badge_number) {
    await releaseBadge(c.env.DB, visit.badge_number);
  }

  // Refresh stats
  await refreshDashboardStats(c.env.DB, c.env.KV);

  // Update Durable Object
  try {
    const counterId = c.env.LIVE_COUNTER.idFromName('global');
    const counter = c.env.LIVE_COUNTER.get(counterId);
    await counter.fetch(new Request(`https://dummy/checkout?office=${visit.office_abbr}`));
  } catch (e) {
    // Non-critical
  }

  return c.json({ success: true });
});

export default visits;
