
import React, { useState, useEffect } from 'react';
import { Copy, Check, Send, Loader2, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from './ProfileContext';

export const ContactSection: React.FC = () => {
  const { profile, loading } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-hide success toast after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (loading || !profile) {
    return null;
  }

  // WhatsApp Link Construction
  const whatsappNumber = profile.phone.replace(/\+/g, ''); 
  const whatsappMessage = encodeURIComponent("Hello, I visited your portfolio and would like to contact you.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/mnjjabjz", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSuccess(true);
        form.reset(); // Clear the form fields
      } else {
        const data = await response.json();
        if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
           setErrorMessage(data["errors"].map((error: any) => error["message"]).join(", "));
        } else {
           setErrorMessage("Oops! There was a problem submitting your form. Please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Oops! There was a network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 px-6 bg-slate-50 dark:bg-[#0b1121] transition-colors duration-500 relative">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Column: Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-sm mb-4">
               Get in Touch
            </h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
               Let's build your <br/> next big thing.
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 max-w-md leading-relaxed">
               I’m currently available for freelance work. If you have a project that needs some creative injection, I'd love to discuss it.
            </p>

            <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                    <a 
                      href={`mailto:${profile.email}`} 
                      className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                          alt="Gmail" 
                          className="w-8 h-8 object-contain"
                        />
                    </a>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Email</p>
                        <div className="flex items-center gap-3">
                             <a href={`mailto:${profile.email}`} className="text-lg md:text-xl font-medium text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors break-all">
                                 {profile.email}
                             </a>
                             <button 
                                onClick={handleCopy} 
                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-md transition-all relative flex-shrink-0"
                                title="Copy Email"
                             >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                             </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-5 group">
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                          alt="WhatsApp" 
                          className="w-8 h-8 object-contain"
                        />
                    </a>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">WhatsApp</p>
                        <a 
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg md:text-xl font-medium text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                        >
                           {profile.phone}
                        </a>
                    </div>
                </div>

                <div className="flex items-start gap-5 group">
                    <a 
                      href="https://maps.google.com/?q=Dhaka,Bangladesh" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" 
                          alt="Google Maps" 
                          className="w-8 h-8 object-contain"
                        />
                    </a>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Location</p>
                        <a 
                          href="https://maps.google.com/?q=Dhaka,Bangladesh" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg md:text-xl font-medium text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                           Dhaka, Bangladesh
                        </a>
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Right Column: Form Area */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-blue-500"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send a Message</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                            placeholder="Type your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                            placeholder="Type your email"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                            placeholder="Type your phone number"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                        <input 
                            type="text" 
                            id="subject" 
                            name="subject" 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                            placeholder="Type your subject"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                    <textarea 
                        id="message" 
                        name="message" 
                        required
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y min-h-[120px]"
                        placeholder="Type your message..."
                    />
                </div>

                {errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-center">
                        <span className="mr-2">⚠️</span> {errorMessage}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <span>Send Message</span>
                            <Send size={20} />
                        </>
                    )}
                </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* SUCCESS TOAST POPUP (Bottom Center) */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
              className="fixed bottom-10 left-1/2 z-[150] w-[90%] max-w-md"
          >
              <div className="w-full bg-[#00c87b] p-6 rounded-2xl flex items-center relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,200,123,0.5)] border border-white/20">
                  {/* Status Icon */}
                  <div className="mr-4 flex-shrink-0 text-white">
                     <CheckCircle size={32} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-white">
                     <h4 className="text-xl font-bold leading-tight mb-1">Successfully sent!</h4>
                     <p className="text-sm opacity-90">Your message has been sent successfully.</p>
                  </div>

                  {/* Dismiss Button */}
                  <button 
                      onClick={() => setIsSuccess(false)}
                      className="ml-4 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      aria-label="Dismiss"
                  >
                     <X size={20} />
                  </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
