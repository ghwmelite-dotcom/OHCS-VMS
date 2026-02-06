import { Env } from '../types';

export async function generateVisitorId(db: D1Database): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `V-${year}-`;

  const result = await db.prepare(
    `SELECT id FROM visitors WHERE id LIKE ? ORDER BY id DESC LIMIT 1`
  ).bind(`${prefix}%`).first<{ id: string }>();

  let sequence = 1;
  if (result) {
    const lastSeq = parseInt(result.id.split('-')[2], 10);
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}
