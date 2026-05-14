import { motion } from 'framer-motion';
import type { Page } from '../App';

interface Props {
  current: Page;
  onNavigate: (page: Page) => void;
}

const tabs = [
  { id: 'home' as Page, label: 'Услуги', icon: '💅' },
  { id: 'my-bookings' as Page, label: 'Записи', icon: '📋' },
  { id: 'admin' as Page, label: 'Админ', icon: '⚙️' },
];

export default function Navigation({ current, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-primary-100 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="relative flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors"
          >
            {current === tab.id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 bg-primary-100 rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative text-lg">{tab.icon}</span>
            <span className={`relative text-xs font-medium ${current === tab.id ? 'text-primary-700' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
