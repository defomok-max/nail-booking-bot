import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, Booking } from '../api/client';
import BookingCard from '../components/BookingCard';

const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

type Tab = 'bookings' | 'schedule' | 'stats';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, revenue: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.checkAdmin()
      .then((data) => {
        setIsAdmin(data.isAdmin);
        if (data.isAdmin) loadData();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadData = async () => {
    const [b, s, st] = await Promise.all([
      api.admin.getBookings(),
      api.admin.getSchedule(),
      api.admin.getStats(),
    ]);
    setBookings(b);
    setSchedule(s);
    setStats(st);
    setLoading(false);
  };

  const handleCancel = async (id: number) => {
    await api.admin.cancelBooking(id);
    loadData();
  };

  const handleComplete = async (id: number) => {
    await api.admin.completeBooking(id);
    loadData();
  };

  const toggleDay = async (item: any) => {
    await api.admin.updateSchedule(item.id, {
      start_time: item.start_time,
      end_time: item.end_time,
      is_working: !item.is_working,
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-primary-100 rounded w-1/2" />
          <div className="h-32 bg-primary-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="px-4 pt-6 text-center py-12">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-gray-500">Доступ только для администратора</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="px-4 pt-6 safe-bottom"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Админ-панель</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 shadow-sm border border-primary-100">
        {([['bookings', '📋 Записи'], ['schedule', '📅 График'], ['stats', '📊 Стат.']] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              tab === id ? 'bg-primary-400 text-white shadow-sm' : 'text-gray-600 hover:bg-primary-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings tab */}
      {tab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Нет записей</p>
          ) : (
            bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={() => handleCancel(b.id)}
                onComplete={() => handleComplete(b.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="space-y-2">
          {schedule.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-3 flex items-center justify-between border border-primary-100">
              <div>
                <span className={`text-sm font-medium ${item.is_working ? 'text-gray-900' : 'text-gray-400'}`}>
                  {DAY_NAMES[item.day_of_week]}
                </span>
                {item.is_working && (
                  <span className="text-xs text-gray-500 ml-2">{item.start_time} — {item.end_time}</span>
                )}
              </div>
              <button
                onClick={() => toggleDay(item)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  item.is_working ? 'bg-green-400' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  item.is_working ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-primary-100 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.today}</div>
            <div className="text-xs text-gray-500 mt-1">Сегодня</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-primary-100 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.week}</div>
            <div className="text-xs text-gray-500 mt-1">За неделю</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-primary-100 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.month}</div>
            <div className="text-xs text-gray-500 mt-1">За месяц</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-primary-100 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.revenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Выручка ₽</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
