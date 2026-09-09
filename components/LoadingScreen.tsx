
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';
import { useThemeStore } from './stores/useThemeStore';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { profile } = useProfileStore();
  const { mode } = useThemeStore();

  useEffect(() => {
    // Smooth, realistic loading ramp: 0 to 100% in ~1.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            if (onComplete) onComplete();
          }, 250);
          return 100;
        }
        // Accelerates towards the end
        const increment = prev < 70 ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 12) + 8;
        return Math.min(prev + increment, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div 
          key="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none"
        >
          {/* Ambient Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar with Circular Progress Bar */}
            <div className="relative mb-7">
              <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-primary/20 relative z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900 shadow-2xl"
              >
                <img 
                  src="/profile-hero.webp" 
                  alt={profile?.name || 'Al-amin'} 
                  className="w-full h-full object-cover"
                  width="128"
                  height="128"
                />
              </motion.div>

              {/* Glowing SVG Progress Ring */}
              <svg className="absolute -inset-3.5 w-[calc(100%+28px)] h-[calc(100%+28px)] -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="47%"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-800"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="47%"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray="295"
                  strokeDashoffset={295 - (295 * progress) / 100}
                  className="text-primary transition-all duration-75 ease-out"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Typography & Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                <span>Muhammad</span> <span className="gradient-text">Al-amin.</span>
              </h1>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Preparing Experience</span>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
            </motion.div>

            {/* Micro Progress Bar */}
            <div className="w-44 h-1 bg-slate-200 dark:bg-slate-800/80 mt-6 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(var(--accent-rgb),0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
