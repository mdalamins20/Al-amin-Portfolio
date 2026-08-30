import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="animate-spin text-brand-500 relative z-10" size={48} />
      </div>
      <p className="text-sm font-mono text-slate-500 uppercase tracking-widest animate-pulse">
        Loading Content...
      </p>
    </div>
  );
};
