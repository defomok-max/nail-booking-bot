import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { BookingDraft } from '../App';

interface Props {
  draft: BookingDraft;
  onSuccess: () => void;
  onBack: () => void;
}

export default function Confirm({ draft, onSuccess, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateStr = new Date(draft.date).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await api.createBooking({
        service_id: draft.serviceId,
        date: draft.date,
        time: draft.time,
      });
      window.Telegram?.WebApp.HapticFeedback.notificationOccurred('success');
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Ошибка при записи');
      window.Telegram?.WebApp.HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="px-4 pt-6 safe-bottom"
    >
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary-600 mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Назад
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Подтверждение записи</h2>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary-100 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary-50">
          <div className="text-2xl w-12 h-12 flex items-center justify-center bg-primary-50 rounded-xl">
            {draft.serviceEmoji}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{draft.serviceName}</h3>
            <p className="text-xs text-gray-500">{draft.serviceDuration} мин</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">📅 Дата</span>
            <span className="text-sm font-medium text-gray-900 capitalize">{dateStr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">🕐 Время</span>
            <span className="text-sm font-medium text-gray-900">{draft.time}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-primary-50">
            <span className="text-sm text-gray-500">💰 Стоимость</span>
            <span className="text-lg font-bold text-primary-600">{draft.servicePrice.toLocaleString()} ₽</span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4"
        >
          {error}
        </motion.div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full py-3.5 bg-primary-400 text-white font-semibold rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-500 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Записываем...
          </span>
        ) : (
          'Подтвердить запись ✨'
        )}
      </button>
    </motion.div>
  );
}
