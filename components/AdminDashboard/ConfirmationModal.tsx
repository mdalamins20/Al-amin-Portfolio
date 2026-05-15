
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const isAlert = !onConfirm;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        >
          {/* Header/Icon */}
          <div className="p-8 pb-4 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              type === 'danger' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' :
              type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
              'bg-brand/5 dark:bg-brand/10 text-brand'
            }`}>
              {type === 'danger' ? <AlertCircle size={40} /> : 
               type === 'success' ? <CheckCircle2 size={40} /> : 
               <AlertCircle size={40} />}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{message}</p>
          </div>

          {/* Footer Buttons */}
          <div className="p-8 pt-4 flex flex-col sm:flex-row gap-3">
            {!isAlert && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all order-2 sm:order-1"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 rounded-2xl text-white font-bold transition-all shadow-lg order-1 sm:order-2 ${
                type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                'bg-brand hover:scale-[1.02] shadow-brand/20'
              }`}
            >
              {isAlert ? 'Got it' : confirmText}
            </button>
          </div>

          {/* Close Icon (Optional) */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
