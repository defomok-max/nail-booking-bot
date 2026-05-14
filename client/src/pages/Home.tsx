import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, Service } from '../api/client';
import ServiceCard from '../components/ServiceCard';

interface Props {
  onSelectService: (service: Service) => void;
}

export default function Home({ onSelectService }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="safe-bottom"
    >
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-white px-5 pt-8 pb-6 rounded-b-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-200/20 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="text-4xl mb-2">💅✨</div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Запись на<br/>маникюр</h1>
          <p className="text-sm text-gray-500 mt-2">Выберите услугу и запишитесь онлайн</p>
        </div>
      </div>

      {/* Services list */}
      <div className="px-4 pt-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Наши услуги</h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
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
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ServiceCard service={service} onSelect={() => onSelectService(service)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
