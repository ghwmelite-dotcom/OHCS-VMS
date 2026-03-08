import { Hono } from 'hono';
import { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { authMiddleware, requireRole } from './middleware/auth';
import authRoutes from './routes/auth';
import officeRoutes from './routes/offices';
import visitorRoutes from './routes/visitors';
import visitRoutes from './routes/visits';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import preRegistrationRoutes from './routes/preRegistrations';
import storageRoutes from './routes/storage';
import whatsappRoutes from './routes/whatsapp';
import appointmentRoutes from './routes/appointments';
import { resetAllBadges } from './utils/badgeAssigner';
import { refreshDashboardStats } from './utils/kvCache';
import { sendTemplateMessage } from './utils/whatsappClient';

export { LiveVisitorCounter } from './durable-objects/LiveVisitorCounter';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', corsMiddleware);

// Health check
app.get('/', (c) => c.json({
  name: 'OHCS Visitor Management System API',
  version: '1.0.0',
  status: 'healthy',
}));

// Auth routes (login/setup are public, other auth routes handle their own auth)
app.route('/api/auth', authRoutes);

// WhatsApp webhook (public — Meta needs unauthenticated access)
app.route('/webhook/whatsapp', whatsappRoutes);

// Apply auth middleware to all /api/* routes EXCEPT public auth endpoints
app.use('/api/*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  // Skip auth for public endpoints
  if (path === '/api/auth/login' || path === '/api/auth/setup') {
    return next();
  }
  return authMiddleware(c, next);
});

// Mount protected routes
app.route('/api/offices', officeRoutes);
app.route('/api/visitors', visitorRoutes);
app.route('/api/visits', visitRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/pre-registrations', preRegistrationRoutes);
app.route('/api/appointments', appointmentRoutes);
app.route('/api', storageRoutes);

// Role-based access on specific route groups
// Analytics: admin + supervisor only
app.use('/api/analytics/*', requireRole('admin', 'supervisor'));
// Visitor writes: admin + receptionist only (reads are open to all authed)
app.use('/api/visitors', async (c, next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT') {
    return requireRole('admin', 'receptionist')(c, next);
  }
  await next();
});
app.use('/api/visits', async (c, next) => {
  if (c.req.method === 'POST') {
    return requireRole('admin', 'receptionist')(c, next);
  }
  await next();
});
app.use('/api/visits/:id/checkout', requireRole('admin', 'receptionist'));

// WebSocket for live counts
app.get('/api/live', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ error: 'Expected WebSocket' }, 426);
  }

  const counterId = c.env.LIVE_COUNTER.idFromName('global');
  const counter = c.env.LIVE_COUNTER.get(counterId);
  return counter.fetch(new Request('https://dummy/websocket', {
    headers: { Upgrade: 'websocket' },
  }));
});

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default {
  fetch: app.fetch,

  // Cron trigger handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const hour = new Date(event.scheduledTime).getUTCHours();

    // 10 PM UTC — Anomaly detection scan
    if (hour === 22) {
      ctx.waitUntil(runAnomalyDetection(env));
    }

    // Midnight UTC — Daily analytics aggregation
    if (hour === 0) {
      ctx.waitUntil(aggregateDailyAnalytics(env));
    }

    // 6 AM UTC — Reset badges + generate predictions
    if (hour === 6) {
      ctx.waitUntil(morningReset(env));
    }

    // 3 PM UTC — Checkout reminders for long-staying visitors
    if (hour === 15) {
      ctx.waitUntil(sendCheckoutReminders(env));
    }
  },
};

async function runAnomalyDetection(env: Env) {
  // Find frequent visitors in the past 7 days
  const frequentVisitors = await env.DB.prepare(`
    SELECT v.visitor_id, v2.full_name, COUNT(*) as visit_count,
           COUNT(DISTINCT v.office_id) as unique_offices,
           GROUP_CONCAT(DISTINCT o.abbreviation) as offices_visited
    FROM visits v
    JOIN visitors v2 ON v.visitor_id = v2.id
    JOIN offices o ON v.office_id = o.id
    WHERE v.check_in >= datetime('now', '-7 days')
    GROUP BY v.visitor_id
    HAVING visit_count > 3 OR unique_offices > 3
  `).all();

  for (const visitor of frequentVisitors.results as any[]) {
    try {
      const analysis: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'system',
          content: 'You are a security analyst for OHCS. Assess if this visitor pattern is suspicious. Consider that visiting multiple different Directorates AND Units in a short period is more unusual than repeat visits to the same office. Respond in JSON: {"severity": "high|medium|low", "reasoning": "..."}'
        }, {
          role: 'user',
          content: `Visitor "${visitor.full_name}" made ${visitor.visit_count} visits in 7 days across ${visitor.unique_offices} offices: ${visitor.offices_visited}`
        }]
      });

      const text = analysis.response || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        await env.DB.prepare(`
          INSERT INTO anomaly_logs (visitor_id, severity, anomaly_type, description, ai_confidence, ai_reasoning)
          VALUES (?, ?, 'frequency', ?, ?, ?)
        `).bind(
          visitor.visitor_id,
          parsed.severity || 'medium',
          `${visitor.full_name} made ${visitor.visit_count} visits across ${visitor.unique_offices} offices in 7 days`,
          0.8,
          parsed.reasoning || ''
        ).run();
      }
    } catch (e) {
      console.error('Anomaly detection AI error:', e);
    }
  }

  // Check unreturned badges (8+ hours)
  const unreturned = await env.DB.prepare(`
    SELECT b.id as badge, v.visitor_id, v2.full_name, v.check_in
    FROM badges b
    JOIN visits v ON b.assigned_to = v.id
    JOIN visitors v2 ON v.visitor_id = v2.id
    WHERE b.is_available = FALSE AND v.check_out IS NULL
    AND v.check_in < datetime('now', '-8 hours')
  `).all();

  for (const item of unreturned.results as any[]) {
    await env.DB.prepare(`
      INSERT INTO anomaly_logs (visitor_id, severity, anomaly_type, description, ai_confidence)
      VALUES (?, 'medium', 'unreturned-badge', ?, 1.0)
    `).bind(
      item.visitor_id,
      `Badge ${item.badge} unreturned by ${item.full_name} (checked in at ${item.check_in})`
    ).run();
  }
}

async function aggregateDailyAnalytics(env: Env) {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Aggregate overall stats
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_visitors,
      CAST(strftime('%H', check_in) AS INTEGER) as hour,
      COUNT(*) as hour_count
    FROM visits
    WHERE DATE(check_in) = ?
    GROUP BY hour
    ORDER BY hour_count DESC
    LIMIT 1
  `).bind(yesterday).first<any>();

  const avgDuration = await env.DB.prepare(`
    SELECT ROUND(AVG((julianday(check_out) - julianday(check_in)) * 1440), 1) as avg_mins
    FROM visits
    WHERE DATE(check_in) = ? AND check_out IS NOT NULL
  `).bind(yesterday).first<any>();

  const totalVisitors = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM visits WHERE DATE(check_in) = ?'
  ).bind(yesterday).first<any>();

  const topOffice = await env.DB.prepare(`
    SELECT office_id, COUNT(*) as cnt FROM visits
    WHERE DATE(check_in) = ? GROUP BY office_id ORDER BY cnt DESC LIMIT 1
  `).bind(yesterday).first<any>();

  const anomalyCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM anomaly_logs WHERE DATE(created_at) = ?'
  ).bind(yesterday).first<any>();

  await env.DB.prepare(`
    INSERT OR REPLACE INTO daily_analytics (date, total_visitors, peak_hour, peak_hour_count, avg_visit_duration_mins, anomalies_detected, top_office_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    yesterday,
    totalVisitors?.count ?? 0,
    stats?.hour ?? null,
    stats?.hour_count ?? null,
    avgDuration?.avg_mins ?? null,
    anomalyCount?.count ?? 0,
    topOffice?.office_id ?? null
  ).run();

  // Per-office analytics
  const officeStats = await env.DB.prepare(`
    SELECT office_id,
           COUNT(*) as visitor_count,
           ROUND(AVG(CASE WHEN check_out IS NOT NULL THEN (julianday(check_out) - julianday(check_in)) * 1440 ELSE NULL END), 1) as avg_mins,
           CAST(strftime('%H', check_in) AS INTEGER) as peak_hour
    FROM visits
    WHERE DATE(check_in) = ?
    GROUP BY office_id
  `).bind(yesterday).all();

  for (const os of officeStats.results as any[]) {
    await env.DB.prepare(`
      INSERT OR REPLACE INTO office_daily_analytics (date, office_id, visitor_count, avg_visit_duration_mins, peak_hour)
      VALUES (?, ?, ?, ?, ?)
    `).bind(yesterday, os.office_id, os.visitor_count, os.avg_mins, os.peak_hour).run();
  }
}

async function morningReset(env: Env) {
  // Reset all badges
  await resetAllBadges(env.DB);

  // Reset Durable Object counter
  try {
    const counterId = env.LIVE_COUNTER.idFromName('global');
    const counter = env.LIVE_COUNTER.get(counterId);
    await counter.fetch(new Request('https://dummy/reset'));
  } catch (e) {
    console.error('Counter reset error:', e);
  }

  // Generate AI prediction
  try {
    const history = await env.DB.prepare(`
      SELECT da.date, da.total_visitors, da.peak_hour, o.abbreviation as top_office
      FROM daily_analytics da
      LEFT JOIN offices o ON da.top_office_id = o.id
      WHERE da.date >= date('now', '-30 days') ORDER BY da.date DESC
    `).all();

    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const prediction: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'system',
        content: 'You are a data analyst for OHCS. Predict today\'s visitor count, peak hour, and busiest office. Respond JSON: {"predicted_count": N, "peak_hour": H, "confidence": 0.0-1.0, "busiest_office": "ABBREVIATION", "staff_recommendation": "..."}'
      }, {
        role: 'user',
        content: `Today is ${dayOfWeek}. History: ${JSON.stringify(history.results)}`
      }]
    });

    const text = prediction.response || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      await env.KV.put('prediction:today', jsonMatch[0], { expirationTtl: 86400 });
    }
  } catch (e) {
    console.error('Prediction error:', e);
  }

  // Refresh dashboard stats
  await refreshDashboardStats(env.DB, env.KV);
}

async function sendCheckoutReminders(env: Env) {
  // Find visitors checked in 3+ hours who have a WhatsApp phone on their pre-registration
  try {
    const longStay = await env.DB.prepare(`
      SELECT v.id as visit_id, v2.full_name, pr.whatsapp_phone
      FROM visits v
      JOIN visitors v2 ON v.visitor_id = v2.id
      LEFT JOIN pre_registrations pr ON pr.whatsapp_phone IS NOT NULL
        AND v2.phone = pr.visitor_phone
        AND pr.status = 'converted'
      WHERE v.check_out IS NULL
        AND v.check_in < datetime('now', '-3 hours')
        AND pr.whatsapp_phone IS NOT NULL
      GROUP BY v.id
    `).all();

    for (const visitor of longStay.results as any[]) {
      try {
        await sendTemplateMessage(
          visitor.whatsapp_phone,
          'checkout_reminder',
          [visitor.full_name],
          env
        );
      } catch (e) {
        console.error('Checkout reminder failed for', visitor.whatsapp_phone, e);
      }
    }
  } catch (e) {
    console.error('Checkout reminders error:', e);
  }
}
