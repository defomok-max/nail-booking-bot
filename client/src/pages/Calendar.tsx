import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, DateAvailability } from '../api/client';
import { BookingDraft } from '../App';
import TimeSlot from '../components/TimeSlot';

interface Props {
  draft: BookingDraft;
  onSelectSlot: (date: string, time: string) => void;
  onBack: () => void;
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Calendar({ draft, onSelectSlot, onBack }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dates, setDates] = useState<DateAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    api.getAvailableDates(month, year).then((data) => setDates(data.dates));
  }, [month, year]);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      setSelectedTime('');
      api.getAvailableSlots(selectedDate, draft.serviceId).then((data) => {
        setSlots(data.slots);
        setLoadingSlots(false);
      });
    }
  }, [selectedDate, draft.serviceId]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const firstDayOfMonth = (new Date(year, month - 1, 1).getDay() + 6) % 7;

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

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{draft.serviceEmoji}</span>
          <h2 className="text-lg font-bold text-gray-900">{draft.serviceName}</h2>
        </div>
        <p className="text-xs text-gray-500">{draft.serviceDuration} мин · {draft.servicePrice.toLocaleString()} ₽</p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-primary-50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-primary-50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {dates.map((d) => {
            const day = new Date(d.date).getDate();
            const isSelected = d.date === selectedDate;
            const isAvailable = d.available;

            return (
              <button
                key={d.date}
                disabled={!isAvailable}
                onClick={() => setSelectedDate(d.date)}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary-400 text-white shadow-md'
                    : isAvailable
                    ? 'text-gray-700 hover:bg-primary-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            Доступное время на {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </h3>

          {loadingSlots ? (
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-10 bg-primary-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-400">Нет свободных слотов на эту дату</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {slots.map((time) => (
                <TimeSlot
                  key={time}
                  time={time}
                  selected={time === selectedTime}
                  onSelect={() => setSelectedTime(time)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Confirm button */}
      {selectedTime && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => onSelectSlot(selectedDate, selectedTime)}
            className="w-full py-3.5 bg-primary-400 text-white font-semibold rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-500 transition-colors"
          >
            Продолжить
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
