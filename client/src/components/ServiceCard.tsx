import { motion } from 'framer-motion';
import type { Service } from '../api/client';

interface Props {
  service: Service;
  onSelect: () => void;
}

export default function ServiceCard({ service, onSelect }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-primary-100 text-left transition-shadow hover:shadow-md active:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl w-10 h-10 flex items-center justify-center bg-primary-50 rounded-xl flex-shrink-0">
          {service.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">⏱ {service.duration} мин</span>
            <span className="text-sm font-bold text-primary-600">{service.price.toLocaleString()} ₽</span>
          </div>
        </div>
        <div className="text-primary-300 mt-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </motion.button>
  );
}
