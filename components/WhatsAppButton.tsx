import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, Send, CheckCheck } from 'lucide-react';
import { useProfileStore } from './stores/useProfileStore';

export const WhatsAppButton: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useProfileStore();

  // Do not render the button on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Replace leading 0 with country code for international format
  const phoneNumber = '+8801778189644';
  
  const customMessages = [
    "Hi Al-amin, I have a project to discuss.",
    "Hello, what are your pricing plans?",
    "Hi, I need a custom website.",
    "I need consultation for my business.",
    "Just wanted to say hello!"
  ];

  const handleSendMessage = (msg: string) => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-4 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:bg-[#22bf5b] transition-all duration-300 group"
        aria-label="Chat on WhatsApp"
      >
        {!isOpen && <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none"></div>}
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={28} className="drop-shadow-sm" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src="/whatsapp-business.webp" 
                alt="WhatsApp" 
                className="w-9 h-9 md:w-10 md:h-10 relative z-10 drop-shadow-md"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block font-medium shadow-md">
            Chat with me
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
          </span>
        )}
      </motion.button>

      {/* WhatsApp Chat Popup Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-[180px] right-4 md:bottom-[110px] md:right-8 z-50 w-[320px] md:w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-[#075e54] text-white p-4 flex items-center gap-3">
              <div className="relative">
                {profile?.image ? (
                  <img src={profile.image} alt="Al-amin" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl border-2 border-white/20">
                    A
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#075e54]"></div>
              </div>
              <div>
                <h3 className="font-bold text-[15px] leading-tight text-white/95">Al-amin</h3>
                <p className="text-xs text-white/70">Typically replies instantly</p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="bg-[#efeae2] dark:bg-[#1a222c] p-4 h-[300px] overflow-y-auto flex flex-col gap-3 relative"
                 style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundBlendMode: 'overlay' }}>
              
              {/* Initial Greeting Bubble */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm self-start max-w-[85%] border border-slate-100 dark:border-slate-700/50"
              >
                <p className="text-[13px] md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  Hi there! 👋<br/><br/>How can I help you today? Choose an option below to start chatting.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block text-right">Just now</span>
              </motion.div>

              {/* Quick Reply Options */}
              <div className="flex flex-col gap-2 mt-2">
                {customMessages.map((msg, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    onClick={() => handleSendMessage(msg)}
                    className="bg-[#d9fdd3] dark:bg-[#005c4b] p-3 rounded-2xl rounded-tr-sm shadow-sm self-end max-w-[90%] text-left hover:bg-[#cbfac4] dark:hover:bg-[#006e5a] transition-colors group cursor-pointer border border-[#c3f6bb] dark:border-[#005c4b]/80"
                  >
                    <p className="text-[13px] md:text-sm text-[#111b21] dark:text-[#e9edef] font-medium leading-snug">
                      {msg}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-[#667781] dark:text-white/60">Tap to send</span>
                      <Send size={10} className="text-[#667781] dark:text-white/60" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#f0f2f5] dark:bg-slate-800 flex items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-medium tracking-wide flex items-center gap-1.5">
                <CheckCheck size={14} className="text-[#53bdeb]" /> End-to-end encrypted
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
