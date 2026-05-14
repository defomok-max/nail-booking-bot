import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTelegram } from './hooks/useTelegram';
import { setInitData } from './api/client';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Confirm from './pages/Confirm';
import MyBookings from './pages/MyBookings';
import Admin from './pages/Admin';
import Navigation from './components/Navigation';

export type Page = 'home' | 'calendar' | 'confirm' | 'my-bookings' | 'admin';

export interface BookingDraft {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  serviceEmoji: string;
  date: string;
  time: string;
}

export default function App() {
  const { initData } = useTelegram();
  const [page, setPage] = useState<Page>('home');
  const [draft, setDraft] = useState<BookingDraft>({
    serviceId: 0,
    serviceName: '',
    servicePrice: 0,
    serviceDuration: 0,
    serviceEmoji: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    if (initData) {
      setInitData(initData);
    }
  }, [initData]);

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '');
    if (hash === 'my-bookings') setPage('my-bookings');
    else if (hash === 'admin') setPage('admin');
  }, []);

  const navigate = (p: Page) => setPage(p);

  return (
    <div className="min-h-screen min-h-[100dvh]">
      <AnimatePresence mode="wait">
        {page === 'home' && (
          <Home
            key="home"
            onSelectService={(s) => {
              setDraft({ ...draft, serviceId: s.id, serviceName: s.name, servicePrice: s.price, serviceDuration: s.duration, serviceEmoji: s.emoji });
              navigate('calendar');
            }}
          />
        )}
        {page === 'calendar' && (
          <Calendar
            key="calendar"
            draft={draft}
            onSelectSlot={(date, time) => {
              setDraft({ ...draft, date, time });
              navigate('confirm');
            }}
            onBack={() => navigate('home')}
          />
        )}
        {page === 'confirm' && (
          <Confirm
            key="confirm"
            draft={draft}
            onSuccess={() => navigate('my-bookings')}
            onBack={() => navigate('calendar')}
          />
        )}
        {page === 'my-bookings' && (
          <MyBookings key="my-bookings" />
        )}
        {page === 'admin' && (
          <Admin key="admin" />
        )}
      </AnimatePresence>

      <Navigation current={page} onNavigate={navigate} />
    </div>
  );
}
