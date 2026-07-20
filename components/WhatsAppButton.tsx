import React from 'react';
import { motion } from 'framer-motion';

import { useLocation } from 'react-router-dom';

export const WhatsAppButton: React.FC = () => {
  const location = useLocation();

  // Do not render the button on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Replace leading 0 with country code for international format
  const phoneNumber = '+8801778189644';
  const message = 'Hello Al-amin! I visited your portfolio and would like to discuss a project.';
  
  const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-28 right-4 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-[#25D366]/40 transition-shadow duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none"></div>
      
      {/* WhatsApp SVG Icon */}
      <img 
        src="/whatsapp-business.png" 
        alt="WhatsApp" 
        className="w-10 h-10 md:w-11 md:h-11 relative z-10 drop-shadow-md"
      />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block">
        Chat with me
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
      </span>
    </motion.a>
  );
};
