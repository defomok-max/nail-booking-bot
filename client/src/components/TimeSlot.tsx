import { motion } from 'framer-motion';

interface Props {
  time: string;
  selected: boolean;
  onSelect: () => void;
}

export default function TimeSlot({ time, selected, onSelect }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onSelect}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        selected
          ? 'bg-primary-400 text-white shadow-md shadow-primary-200'
          : 'bg-white text-gray-700 border border-primary-100 hover:border-primary-300'
      }`}
    >
      {time}
    </motion.button>
  );
}
