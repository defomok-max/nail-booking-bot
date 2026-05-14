import { Router, Response } from 'express';
import { query, run, getOne } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID) || 0;

function isAdmin(req: AuthRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  return req.telegramUser?.id === ADMIN_USER_ID;
}

router.use((req: AuthRequest, res: Response, next) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

router.get('/bookings', (req, res) => {
  const { date, status } = req.query;
  let sql = "SELECT b.*, s.name as service_name, s.price, s.duration, s.emoji FROM bookings b JOIN services s ON b.service_id = s.id";
  const conditions: string[] = [];
  const params: any[] = [];

  if (date) {
    conditions.push('b.date = ?');
    params.push(date);
  }
  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY b.date ASC, b.time ASC';

  const bookings = query(sql, params);
  res.json(bookings);
});

router.get('/schedule', (_req, res) => {
  const schedule = query('SELECT * FROM schedule ORDER BY day_of_week');
  res.json(schedule);
});

router.put('/schedule/:id', (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, is_working } = req.body;

  run('UPDATE schedule SET start_time = ?, end_time = ?, is_working = ? WHERE id = ?',
    [start_time, end_time, is_working ? 1 : 0, Number(id)]);

  res.json({ success: true });
});

router.get('/day-offs', (_req, res) => {
  const dayOffs = query('SELECT * FROM day_offs ORDER BY date');
  res.json(dayOffs);
});

router.post('/day-offs', (req, res) => {
  const { date, reason } = req.body;
  try {
    run('INSERT INTO day_offs (date, reason) VALUES (?, ?)', [date, reason || null]);
    res.status(201).json({ success: true });
  } catch {
    res.status(409).json({ error: 'Date already exists' });
  }
});

router.delete('/day-offs/:id', (req, res) => {
  run('DELETE FROM day_offs WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

router.patch('/bookings/:id/cancel', (req, res) => {
  run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

router.patch('/bookings/:id/complete', (req, res) => {
  run("UPDATE bookings SET status = 'completed' WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

router.get('/stats', (_req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const todayCount = getOne("SELECT COUNT(*) as c FROM bookings WHERE date = ? AND status = 'confirmed'", [today]);
  const weekCount = getOne("SELECT COUNT(*) as c FROM bookings WHERE date >= ? AND status IN ('confirmed', 'completed')", [weekAgo]);
  const monthCount = getOne("SELECT COUNT(*) as c FROM bookings WHERE date >= ? AND status IN ('confirmed', 'completed')", [monthAgo]);
  const monthRevenue = getOne("SELECT COALESCE(SUM(s.price), 0) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.date >= ? AND b.status IN ('confirmed', 'completed')", [monthAgo]);

  res.json({
    today: todayCount?.c || 0,
    week: weekCount?.c || 0,
    month: monthCount?.c || 0,
    revenue: monthRevenue?.total || 0,
  });
});

router.get('/check', (req: AuthRequest, res: Response) => {
  res.json({ isAdmin: isAdmin(req) });
});

export default router;
