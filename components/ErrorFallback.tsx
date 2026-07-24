import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg p-6 text-theme-text">
      <div className="max-w-md w-full bg-theme-card border border-theme-border rounded-2xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-on-surface">Oops! Something went wrong</h1>
        <p className="text-text-secondary mb-6 text-sm">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32">
            <p className="text-red-500 font-mono text-xs whitespace-pre-wrap">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        )}

        <button
          onClick={resetErrorBoundary}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 group"
        >
          <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          Try Again
        </button>
      </div>
    </div>
  );
};
