import { motion } from 'framer-motion';
import type { Booking } from '../api/client';

interface Props {
  booking: Booking;
  onCancel?: () => void;
  onComplete?: () => void;
  showActions?: boolean;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  confirmed: { text: 'Подтверждено', color: 'bg-green-100 text-green-700' },
  cancelled: { text: 'Отменено', color: 'bg-red-100 text-red-600' },
  completed: { text: 'Завершено', color: 'bg-gray-100 text-gray-600' },
};

export default function BookingCard({ booking, onCancel, onComplete, showActions = true }: Props) {
  const status = statusLabels[booking.status] || statusLabels.confirmed;
  const dateObj = new Date(booking.date);
  const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'short' });
  const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-primary-100"
    >
      <div className="flex items-start gap-3">
        <div className="text-xl w-10 h-10 flex items-center justify-center bg-primary-50 rounded-xl flex-shrink-0">
          {booking.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">{booking.service_name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span>📅 {dayName}, {dateStr}</span>
            <span>🕐 {booking.time}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>⏱ {booking.duration} мин</span>
            <span className="font-medium text-primary-600">{booking.price?.toLocaleString()} ₽</span>
          </div>
          {booking.user_name && (
            <div className="text-xs text-gray-400 mt-1">👤 {booking.user_name}</div>
          )}
        </div>
      </div>

      {showActions && booking.status === 'confirmed' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-primary-50">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 text-xs py-2 px-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
            >
              Отменить
            </button>
          )}
          {onComplete && (
            <button
              onClick={onComplete}
              className="flex-1 text-xs py-2 px-3 rounded-xl bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-colors"
            >
              Завершить
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
