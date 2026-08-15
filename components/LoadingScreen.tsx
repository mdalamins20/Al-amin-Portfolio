
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const { profile } = useProfileStore();

  useEffect(() => {
    // 2 seconds total duration
    const totalDuration = 2000;
    const intervalTime = totalDuration / 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        
        {/* User Image with Animated Border */}
        <div className="relative mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-white/5 relative z-10 flex items-center justify-center bg-surface shadow-2xl"
          >
            {profile?.image ? (
              <img 
                src={profile.image} 
                alt={profile.name || 'Loading'} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <span className="text-4xl md:text-5xl font-serif font-black text-white tracking-tighter">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}<span className="text-brand-600">.</span>
              </span>
            )}
          </motion.div>

          {/* Progress Circle Outline */}
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray="100 100"
              className="text-brand-600"
              animate={{ strokeDashoffset: 100 - progress }}
              transition={{ ease: "linear" }}
            />
          </svg>
          
          {/* Subtle Glow */}
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-brand-600/20 blur-3xl rounded-full -z-10"
          />
        </div>

        {/* Branding & Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-serif font-black text-white tracking-tighter mb-2">
            Al-amin<span className="text-brand-600">.</span>
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Initializing Portfolio</span>
            <span className="text-[10px] font-mono text-brand-500">{progress}%</span>
          </div>
        </motion.div>

        {/* Minimal Progress Bar */}
        <div className="w-48 h-[1px] bg-white/5 mt-8 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>
    </div>
  );
};
