import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Booking } from '../api/client';
import BookingCard from '../components/BookingCard';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getMyBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: number) => {
    await api.cancelBooking(id);
    window.Telegram?.WebApp.HapticFeedback.notificationOccurred('warning');
    load();
  };

  const upcoming = bookings.filter((b) => b.status === 'confirmed' && b.date >= new Date().toISOString().split('T')[0]);
  const past = bookings.filter((b) => b.status !== 'confirmed' || b.date < new Date().toISOString().split('T')[0]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="px-4 pt-6 safe-bottom"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Мои записи</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-primary-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-primary-50 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">У вас пока нет записей</p>
          <p className="text-gray-400 text-xs mt-1">Выберите услугу на главной странице</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Предстоящие</h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {upcoming.map((b) => (
                    <BookingCard key={b.id} booking={b} onCancel={() => handleCancel(b.id)} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">История</h2>
              <div className="space-y-3">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} showActions={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
