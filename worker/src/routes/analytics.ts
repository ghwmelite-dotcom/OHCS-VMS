import { Hono } from 'hono';
import { Env } from '../types';
import { getDashboardStats, refreshDashboardStats } from '../utils/kvCache';

const analytics = new Hono<{ Bindings: Env }>();

// Dashboard summary (KV-cached)
analytics.get('/dashboard', async (c) => {
  let stats = await getDashboardStats(c.env.KV);
  if (!stats) {
    stats = await refreshDashboardStats(c.env.DB, c.env.KV);
  }

  // Get per-office counts for today
  const today = new Date().toISOString().split('T')[0];
  const officeStats = await c.env.DB.prepare(`
    SELECT o.abbreviation, o.office_type, COUNT(v.id) as visitor_count
    FROM offices o
    LEFT JOIN visits v ON o.id = v.office_id AND DATE(v.check_in) = ?
    WHERE o.is_active = TRUE
    GROUP BY o.id
    ORDER BY visitor_count DESC
  `).bind(today).all();

  // Get AI prediction from KV
  const prediction = await c.env.KV.get('prediction:today', 'json');

  return c.json({ stats, officeStats: officeStats.results, prediction });
});

// Weekly analytics
analytics.get('/weekly', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM daily_analytics
    WHERE date >= date('now', '-7 days')
    ORDER BY date ASC
  `).all();

  return c.json({ analytics: result.results });
});

// Per-office traffic
analytics.get('/offices', async (c) => {
  const days = parseInt(c.req.query('days') || '7');
  const result = await c.env.DB.prepare(`
    SELECT o.abbreviation, o.office_type, o.full_name,
           COUNT(v.id) as visitor_count,
           ROUND(AVG(
             CASE WHEN v.check_out IS NOT NULL
             THEN (julianday(v.check_out) - julianday(v.check_in)) * 1440
             ELSE NULL END
           ), 1) as avg_duration_mins
    FROM offices o
    LEFT JOIN visits v ON o.id = v.office_id AND v.check_in >= datetime('now', '-' || ? || ' days')
    WHERE o.is_active = TRUE
    GROUP BY o.id
    ORDER BY visitor_count DESC
  `).bind(days).all();

  return c.json({ offices: result.results });
});

// Anomalies
analytics.get('/anomalies', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20');
  const result = await c.env.DB.prepare(`
    SELECT al.*, v.full_name as visitor_name,
           o.abbreviation as office_abbr, o.office_type
    FROM anomaly_logs al
    LEFT JOIN visitors v ON al.visitor_id = v.id
    LEFT JOIN visits vi ON al.visit_id = vi.id
    LEFT JOIN offices o ON vi.office_id = o.id
    ORDER BY al.created_at DESC
    LIMIT ?
  `).bind(limit).all();

  return c.json({ anomalies: result.results });
});

// Sentiment summary
analytics.get('/sentiment', async (c) => {
  // Try KV cache first
  const cached = await c.env.KV.get('sentiment:weekly', 'json');
  if (cached) return c.json(cached);

  const result = await c.env.DB.prepare(`
    SELECT
      SUM(CASE WHEN ai_sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN ai_sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral,
      SUM(CASE WHEN ai_sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
      COUNT(*) as total,
      ROUND(AVG(rating), 1) as avg_rating
    FROM feedback
    WHERE created_at >= datetime('now', '-7 days')
  `).first();

  const sentiment = {
    positive: (result as any)?.positive ?? 0,
    neutral: (result as any)?.neutral ?? 0,
    negative: (result as any)?.negative ?? 0,
    total: (result as any)?.total ?? 0,
    avgRating: (result as any)?.avg_rating ?? 0,
  };

  await c.env.KV.put('sentiment:weekly', JSON.stringify(sentiment), { expirationTtl: 3600 });
  return c.json(sentiment);
});

// Predictions
analytics.get('/predictions', async (c) => {
  const prediction = await c.env.KV.get('prediction:today', 'json');
  return c.json({ prediction: prediction || null });
});

export default analytics;
