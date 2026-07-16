
import React from 'react';
import { motion } from 'framer-motion';

const BRANDS = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "OpenAI", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" }
];

export const MarqueeBanner: React.FC = () => {
  return (
    <div className="py-24 bg-white dark:bg-deep-950 overflow-hidden border-y border-slate-100 dark:border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-center">
        <div className="inline-flex items-center space-x-3 bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-full border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></div>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
            Engineering Standards Trusted by Global Leaders
          </span>
        </div>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden group">
        <motion.div 
          animate={{ x: [0, -2800] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex items-center space-x-32 pr-32"
        >
          {/* Double the array multiple times for a massive seamless loop */}
          {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
            <div key={i} className="flex items-center space-x-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-none">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-14 md:h-24 w-auto object-contain dark:invert transition-all transform group-hover:scale-105"
              />
              <span className="text-4xl md:text-7xl font-serif font-bold text-slate-900 dark:text-white tracking-tighter opacity-10">
                /
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Side Fades for smooth entry/exit - wider for larger logos */}
      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-white dark:from-deep-950 to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-white dark:from-deep-950 to-transparent z-10"></div>
    </div>
  );
};
