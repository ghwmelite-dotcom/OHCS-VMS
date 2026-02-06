import { Hono } from 'hono';
import { Env } from '../types';

const storage = new Hono<{ Bindings: Env }>();

// Upload visitor photo
storage.post('/photo/:visitorId', async (c) => {
  const visitorId = c.req.param('visitorId');
  const blob = await c.req.blob();

  if (!blob || blob.size === 0) {
    return c.json({ error: 'No file provided' }, 400);
  }

  const key = `photos/${visitorId}/${Date.now()}.jpg`;
  await c.env.R2.put(key, blob, {
    httpMetadata: { contentType: 'image/jpeg' },
    customMetadata: { visitorId, uploadedAt: new Date().toISOString() },
  });

  await c.env.DB.prepare(
    'UPDATE visitors SET photo_key = ? WHERE id = ?'
  ).bind(key, visitorId).run();

  return c.json({ key });
});

// Serve photo
storage.get('/photos/*', async (c) => {
  const key = c.req.path.replace('/api/photos/', '');
  const object = await c.env.R2.get(key);

  if (!object) return c.json({ error: 'Not found' }, 404);

  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

// Serve report
storage.get('/reports/*', async (c) => {
  const key = c.req.path.replace('/api/reports/', '');
  const object = await c.env.R2.get(key);

  if (!object) return c.json({ error: 'Not found' }, 404);

  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/pdf',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

export default storage;
