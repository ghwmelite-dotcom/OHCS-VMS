import { DashboardStats } from '../types';

export async function getDashboardStats(kv: KVNamespace): Promise<DashboardStats | null> {
  return kv.get('stats:today', 'json');
}

export async function setDashboardStats(kv: KVNamespace, stats: DashboardStats): Promise<void> {
  await kv.put('stats:today', JSON.stringify(stats), { expirationTtl: 300 });
}

export async function refreshDashboardStats(db: D1Database, kv: KVNamespace): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];

  const result = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'checked-in' THEN 1 ELSE 0 END) as checked_in,
      SUM(CASE WHEN status = 'checked-out' THEN 1 ELSE 0 END) as checked_out
    FROM visits
    WHERE DATE(check_in) = ?
  `).bind(today).first<{ total: number; checked_in: number; checked_out: number }>();

  const preRegs = await db.prepare(`
    SELECT COUNT(*) as count FROM pre_registrations
    WHERE expected_date = ? AND status = 'pending'
  `).bind(today).first<{ count: number }>();

  const stats: DashboardStats = {
    total: result?.total ?? 0,
    checkedIn: result?.checked_in ?? 0,
    preRegistered: preRegs?.count ?? 0,
    checkedOut: result?.checked_out ?? 0,
  };

  await setDashboardStats(kv, stats);
  return stats;
}
