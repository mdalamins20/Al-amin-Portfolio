import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useDialogStore } from './stores/useDialogStore';
import { createPortal } from 'react-dom';

export const CustomDialog: React.FC = () => {
  const { isOpen, options, confirm, cancel } = useDialogStore();

  if (typeof document === 'undefined') return null;

  const getIcon = () => {
    switch (options.variant) {
      case 'danger': return <AlertTriangle className="text-red-500" size={28} />;
      case 'success': return <CheckCircle className="text-green-500" size={28} />;
      default: return <Info className="text-brand" size={28} />;
    }
  };

  const getButtonClass = () => {
    switch (options.variant) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'success': return 'bg-green-500 hover:bg-green-600 text-white';
      default: return 'bg-brand hover:bg-brand-700 text-white';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-surface rounded-3xl border border-outline-variant shadow-2xl overflow-hidden p-6 text-center flex flex-col items-center"
          >
            <div className={`p-4 rounded-full mb-4 ${
              options.variant === 'danger' ? 'bg-red-500/10' :
              options.variant === 'success' ? 'bg-green-500/10' : 'bg-brand/10'
            }`}>
              {getIcon()}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {options.title}
            </h3>
            
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              {options.message}
            </p>

            <div className="flex items-center justify-center gap-3 w-full">
              {options.type === 'confirm' && (
                <button
                  onClick={cancel}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-surface-variant/50 hover:bg-surface-variant transition-colors"
                >
                  {options.cancelText}
                </button>
              )}
              <button
                onClick={confirm}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${getButtonClass()}`}
              >
                {options.confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
