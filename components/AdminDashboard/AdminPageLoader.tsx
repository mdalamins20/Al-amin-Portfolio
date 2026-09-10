
import React from 'react';
import { motion } from 'framer-motion';

interface AdminPageLoaderProps {
  icon?: React.ElementType;
  color?: string;
  bg?: string;
  label?: string;
}

/**
 * Global loading screen for all admin panel pages.
 * Use this instead of per-page custom spinners for visual consistency.
 *
 * Usage:
 *   if (loading) return <AdminPageLoader icon={Briefcase} color="text-blue-500" bg="bg-blue-500/10 border-blue-500/20" label="Loading Projects..." />;
 */
export const AdminPageLoader: React.FC<AdminPageLoaderProps> = ({
  icon: Icon,
  color = 'text-primary',
  bg = 'bg-primary/10 border-primary/20',
  label = 'Loading...',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-32 w-full"
    >
      {/* Outer spinning ring + icon */}
      <div className="relative flex items-center justify-center mb-6">
        <div
          className="absolute w-20 h-20 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'currentColor', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute w-16 h-16 rounded-full blur-xl ${bg.split(' ')[0]}`}
        />
        <div className={`relative w-14 h-14 rounded-2xl border ${bg} flex items-center justify-center shadow-sm z-10`}>
          {Icon ? (
            <Icon size={24} className={color} />
          ) : (
            <div className={`w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${color}`} />
          )}
        </div>
      </div>

      {/* Label + animated dots */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
        <span className="flex gap-1 ml-1">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
              className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}
            />
          ))}
        </span>
      </div>

      {/* Skeleton pulse lines */}
      <div className="mt-8 w-full max-w-2xl space-y-3 px-4 opacity-40">
        {[80, 60, 90, 50].map((w, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            className="h-3 bg-surface-variant rounded-full"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
};
