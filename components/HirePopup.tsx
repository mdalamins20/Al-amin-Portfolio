
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, ShieldCheck } from 'lucide-react';

interface HirePopupProps {
  isVisible: boolean;
  onClose: () => void; // For the X button
  onCancel: () => void; // For the "Don't show again" button
}

export const HirePopup: React.FC<HirePopupProps> = ({ isVisible, onClose, onCancel }) => {
  const whatsappLink = `https://wa.me/8801778189644?text=Hello%20Al-amin!%20I%20visited%20your%20portfolio%20and%20I'm%20interested%20in%20hiring%20you%20for%20a%20project.`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
          className="fixed bottom-10 left-1/2 z-[60] w-[92%] max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/5 overflow-hidden relative">
            
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-500 to-brand-400"></div>

            {/* Close (X) Button - Temporary Dismiss */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-600 dark:hover:text-white rounded-full transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-8 md:p-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-600">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-black text-slate-900 dark:text-white leading-tight">
                    Project Discussion?
                  </h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open for new opportunities</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                Ready to take your business to the next level? I'm currently accepting premium projects. Let's build something world-class together!
              </p>

              <div className="flex flex-col space-y-3">
                {/* Hire Button - WhatsApp */}
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onCancel} // Dismiss permanently once they show interest
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-lg shadow-brand-600/20 group"
                >
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Hire Me Now</span>
                  <Send size={16} className="opacity-50" />
                </a>

                {/* Cancel Button - Permanent Dismiss */}
                <button 
                  onClick={onCancel}
                  className="w-full py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  No, I'm just looking
                </button>
              </div>
            </div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-[-1]" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
