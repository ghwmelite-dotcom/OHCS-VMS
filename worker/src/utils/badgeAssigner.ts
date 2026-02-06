export async function assignBadge(db: D1Database, visitId: number): Promise<string | null> {
  const badge = await db.prepare(
    `SELECT id FROM badges WHERE is_available = TRUE ORDER BY id LIMIT 1`
  ).first<{ id: string }>();

  if (!badge) return null;

  await db.prepare(
    `UPDATE badges SET is_available = FALSE, assigned_to = ?, assigned_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(visitId, badge.id).run();

  return badge.id;
}

export async function releaseBadge(db: D1Database, badgeId: string): Promise<void> {
  await db.prepare(
    `UPDATE badges SET is_available = TRUE, assigned_to = NULL, assigned_at = NULL WHERE id = ?`
  ).bind(badgeId).run();
}

export async function resetAllBadges(db: D1Database): Promise<void> {
  await db.prepare(
    `UPDATE badges SET is_available = TRUE, assigned_to = NULL, assigned_at = NULL`
  ).run();
}
