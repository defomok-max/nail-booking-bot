import { Router, Response } from 'express';
import { query, run, getOne } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/available-slots', (req, res) => {
  const { date, service_id } = req.query;

  if (!date || !service_id) {
    return res.status(400).json({ error: 'date and service_id required' });
  }

  const dateStr = date as string;
  const dayOfWeek = (new Date(dateStr).getDay() + 6) % 7;

  const schedule = getOne('SELECT * FROM schedule WHERE day_of_week = ? AND is_working = 1', [dayOfWeek]);
  if (!schedule) {
    return res.json({ slots: [] });
  }

  const dayOff = getOne('SELECT * FROM day_offs WHERE date = ?', [dateStr]);
  if (dayOff) {
    return res.json({ slots: [] });
  }

  const service = getOne('SELECT * FROM services WHERE id = ?', [Number(service_id)]);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const existingBookings = query(
    "SELECT b.time, s.duration FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.date = ? AND b.status = 'confirmed'",
    [dateStr]
  );

  const slots: string[] = [];
  const [startH, startM] = schedule.start_time.split(':').map(Number);
  const [endH, endM] = schedule.end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let t = startMinutes; t + service.duration <= endMinutes; t += 30) {
    const slotStart = t;
    const slotEnd = t + service.duration;

    const conflict = existingBookings.some((b: any) => {
      const [bH, bM] = b.time.split(':').map(Number);
      const bStart = bH * 60 + bM;
      const bEnd = bStart + b.duration;
      return slotStart < bEnd && slotEnd > bStart;
    });

    if (!conflict) {
      const h = Math.floor(t / 60).toString().padStart(2, '0');
      const m = (t % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }

  res.json({ slots });
});

router.get('/available-dates', (req, res) => {
  const { month, year } = req.query;
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();

  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const dayOffs = query("SELECT date FROM day_offs WHERE date LIKE ?", [`${y}-${String(m).padStart(2, '0')}%`]);
  const dayOffSet = new Set(dayOffs.map((d: any) => d.date));

  const workingDays = query('SELECT day_of_week FROM schedule WHERE is_working = 1');
  const workingSet = new Set(workingDays.map((d: any) => d.day_of_week));

  const dates: { date: string; available: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = (new Date(dateStr).getDay() + 6) % 7;
    const isPast = dateStr < today;
    const isWorking = workingSet.has(dayOfWeek);
    const isDayOff = dayOffSet.has(dateStr);

    dates.push({
      date: dateStr,
      available: !isPast && isWorking && !isDayOff,
    });
  }

  res.json({ dates });
});

router.post('/', (req: AuthRequest, res: Response) => {
  const user = req.telegramUser!;
  const { service_id, date, time } = req.body;

  if (!service_id || !date || !time) {
    return res.status(400).json({ error: 'service_id, date, time required' });
  }

  const service = getOne('SELECT * FROM services WHERE id = ?', [service_id]);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const existing = getOne(
    "SELECT * FROM bookings WHERE date = ? AND time = ? AND status = 'confirmed'",
    [date, time]
  );
  if (existing) {
    return res.status(409).json({ error: 'Slot already booked' });
  }

  const { lastId } = run(
    'INSERT INTO bookings (user_id, user_name, service_id, date, time) VALUES (?, ?, ?, ?, ?)',
    [user.id, user.first_name, service_id, date, time]
  );

  const booking = getOne(
    'SELECT b.*, s.name as service_name, s.price, s.duration FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = ?',
    [lastId]
  );

  res.status(201).json(booking);
});

router.get('/my', (req: AuthRequest, res: Response) => {
  const user = req.telegramUser!;
  const bookings = query(
    "SELECT b.*, s.name as service_name, s.price, s.duration, s.emoji FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.user_id = ? ORDER BY b.date DESC, b.time DESC",
    [user.id]
  );
  res.json(bookings);
});

router.patch('/:id/cancel', (req: AuthRequest, res: Response) => {
  const user = req.telegramUser!;
  const { id } = req.params;

  const booking = getOne('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [Number(id), user.id]);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [Number(id)]);
  res.json({ success: true });
});

export default router;
