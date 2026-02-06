import { Hono } from 'hono';
import { Env } from '../types';

const ai = new Hono<{ Bindings: Env }>();

const OFFICE_CONTEXT = `You are the OHCS Visitor Routing AI for Ghana's Office of the Head of Civil Service.

OHCS has the following offices:

EXECUTIVE:
- OHCS: Office of the Head of Civil Service (Room 301, 3rd Floor) — VIP visits, courtesy calls, executive meetings, ministerial affairs, top-level policy decisions
- OCD: Office of the Chief Director (Room 305, 3rd Floor) — administrative coordination, senior management meetings, inter-directorate coordination, operational oversight

DIRECTORATES (main functional divisions):
- RTDD: Research, Training & Development Directorate (Room 201, 2nd Floor) — training programs, workshops, capacity building, research coordination
- RSIMD: Research, Statistics & Information Management Directorate (Room 112, 1st Floor) — IT, data management, statistics, information systems, MIS
- CMD: Change Management Directorate (Room 210, 2nd Floor) — organizational change, restructuring, reform programs, institutional development
- F&A: Finance & Administration Directorate (Room 105, 1st Floor) — budgets, financial submissions, procurement, HR admin, payroll
- PBMED: Policy, Budget, Monitoring & Evaluation Directorate (Room 215, 2nd Floor) — policy formulation, budget coordination, M&E, performance management

UNITS (specialized support offices):
- IAU: Internal Audit Unit (Room 108, 1st Floor) — audit reports, compliance, financial oversight, internal controls
- Estate: Estate Unit (Room G03, Ground Floor) — building maintenance, office allocation, facilities, physical infrastructure
- CSC: Client Service Centre (Room G01, Ground Floor) — public complaints, inquiries, client feedback, front desk services
- RCU: Records & Communications Unit (Room G05, Ground Floor) — records management, correspondence, mail, archiving, communications`;

// Smart routing
ai.post('/route', async (c) => {
  const { purpose, organization, history } = await c.req.json();

  if (!purpose) return c.json({ error: 'purpose is required' }, 400);

  try {
    const result: any = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `${OFFICE_CONTEXT}

Given a visitor's stated purpose, suggest the most appropriate office. Consider whether it's a Directorate or Unit matter.
Respond in JSON only: {"office_abbreviation": "...", "office_full_name": "...", "office_type": "directorate|unit|executive", "host": "...", "room": "...", "floor": "...", "confidence": 0.0-1.0, "reason": "..."}`
        },
        {
          role: 'user',
          content: `Visitor purpose: "${purpose}". ${organization ? `Visitor organization: "${organization}".` : ''} ${history ? `Visitor history: ${JSON.stringify(history)}` : ''}`
        }
      ]
    });

    const text = result.response || '';
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Look up the office to get its ID
      const office = await c.env.DB.prepare(
        'SELECT id, abbreviation, full_name, office_type, room, floor, head_officer FROM offices WHERE abbreviation = ?'
      ).bind(parsed.office_abbreviation).first();

      return c.json({
        routing: {
          ...parsed,
          office_id: office?.id || null,
          head_officer: (office as any)?.head_officer || parsed.host,
        }
      });
    }

    return c.json({ error: 'Failed to parse AI response', raw: text }, 500);
  } catch (err: any) {
    return c.json({ error: 'AI routing failed', details: err.message }, 500);
  }
});

// AI Chat
ai.post('/chat', async (c) => {
  const { message, conversationHistory } = await c.req.json();

  if (!message) return c.json({ error: 'message is required' }, 400);

  // Gather context
  const today = new Date().toISOString().split('T')[0];

  const [todayStats, officeStats, recentAnomalies] = await Promise.all([
    c.env.KV.get('stats:today', 'json'),
    c.env.DB.prepare(`
      SELECT o.abbreviation, o.office_type, COUNT(v.id) as visitor_count
      FROM offices o LEFT JOIN visits v ON o.id = v.office_id AND DATE(v.check_in) = ?
      WHERE o.is_active = TRUE GROUP BY o.id ORDER BY visitor_count DESC
    `).bind(today).all(),
    c.env.DB.prepare(`
      SELECT al.*, o.abbreviation as office_abbr
      FROM anomaly_logs al
      LEFT JOIN visits v ON al.visit_id = v.id
      LEFT JOIN offices o ON v.office_id = o.id
      WHERE al.created_at >= datetime('now', '-24 hours')
      ORDER BY al.created_at DESC LIMIT 5
    `).all(),
  ]);

  const now = new Date().toLocaleString('en-GH', { timeZone: 'Africa/Accra' });

  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are the OHCS Visitor Management AI Assistant for Ghana's Office of the Head of Civil Service.

${OFFICE_CONTEXT}

Current context:
- Today's stats: ${JSON.stringify(todayStats || { total: 0, checkedIn: 0, preRegistered: 0, checkedOut: 0 })}
- Office breakdown: ${JSON.stringify(officeStats.results)}
- Recent anomalies: ${JSON.stringify(recentAnomalies.results)}
- Current time: ${now}

Be concise, professional, data-driven. Use office abbreviations naturally. Distinguish between Directorates and Units when relevant.`
      },
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-6));
    }

    messages.push({ role: 'user', content: message });

    const result: any = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages });
    return c.json({ response: result.response });
  } catch (err: any) {
    return c.json({ error: 'AI chat failed', details: err.message }, 500);
  }
});

// Sentiment analysis
ai.post('/sentiment', async (c) => {
  const { text, visit_id } = await c.req.json();

  if (!text) return c.json({ error: 'text is required' }, 400);

  try {
    const result: any = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'Classify this visitor feedback from OHCS (Ghana civil service) as positive, neutral, or negative. Respond JSON only: {"sentiment": "positive|neutral|negative", "score": 0.0-1.0, "office_mentioned": "ABBREVIATION or null"}'
        },
        { role: 'user', content: `Feedback: "${text}"` }
      ]
    });

    const responseText = result.response || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Store in feedback table if visit_id provided
      if (visit_id) {
        await c.env.DB.prepare(`
          INSERT INTO feedback (visit_id, comment, ai_sentiment, ai_sentiment_score)
          VALUES (?, ?, ?, ?)
        `).bind(visit_id, text, parsed.sentiment, parsed.score).run();
      }

      return c.json({ sentiment: parsed });
    }

    return c.json({ error: 'Failed to parse AI sentiment response' }, 500);
  } catch (err: any) {
    return c.json({ error: 'Sentiment analysis failed', details: err.message }, 500);
  }
});

export default ai;
