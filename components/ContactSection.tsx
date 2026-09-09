import React from 'react';
import { Loader2, CheckCircle, X, Mail, MessageSquare, MapPin, Send, ArrowRight, Sparkles } from 'lucide-react';
import { Captcha } from './Captcha';
import { motion, AnimatePresence } from 'framer-motion';
import { useContactForm } from './hooks/useContactForm';
import { useProfileStore } from './stores/useProfileStore';

export const ContactSection: React.FC = () => {
  const { profile, loading } = useProfileStore();
  const {
    isSubmitting,
    isSuccess,
    errorMessage,
    setIsCaptchaValid,
    submitForm,
    closeSuccessMessage
  } = useContactForm();

  if (loading || !profile) {
    return null;
  }

  const whatsappNumber = profile.phone.replace(/\+/g, '').replace(/\s+/g, ''); 
  const whatsappMessage = encodeURIComponent("Hello, I visited your portfolio and would like to contact you.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="contact" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative overflow-visible">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="mb-14 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-xs uppercase tracking-widest mb-4">
          <Sparkles size={14} className="animate-spin-slow" />
          <span>Get In Touch</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight mb-4">
          Let's build your <br className="hidden sm:inline" />
          <span className="gradient-text">next big thing.</span>
        </h2>
        <p className="text-text-secondary dark:text-slate-300 font-normal text-base md:text-lg max-w-2xl leading-relaxed">
          I'm currently available for high-impact freelance projects, software automation, and scalable web/mobile app architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Info Cards Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Email Card */}
          <a 
            href={`mailto:${profile.email}`}
            className="group flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface/80 dark:bg-slate-900/60 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <Mail size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-0.5">Email Directly</span>
              <h4 className="text-base sm:text-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{profile.email}</h4>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                <span>Send message</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
          </a>

          {/* WhatsApp Card */}
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface/80 dark:bg-slate-900/60 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shrink-0">
              <MessageSquare size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">Instant Chat</span>
              <h4 className="text-base sm:text-lg font-bold text-on-surface truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{profile.phone}</h4>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                <span>Chat on WhatsApp</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
          </a>

          {/* Location Card */}
          <div className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface/80 dark:bg-slate-900/60 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <MapPin size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-0.5">HQ Location</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Remote Available</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-on-surface">{profile.locationText || 'Dhaka, Bangladesh'}</h4>
              <p className="text-xs text-text-secondary mt-0.5">Open to worldwide collaboration</p>
            </div>
          </div>

          {/* Map Embed (if exists) */}
          {profile.mapEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-surface-variant/30 dark:border-white/10 shadow-sm h-[180px]">
              <iframe
                src={profile.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          )}
        </div>

        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-secondary/30 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-700 pointer-events-none" />
          
          <form 
            onSubmit={submitForm} 
            className="relative bg-surface/90 dark:bg-slate-950/80 backdrop-blur-2xl p-7 sm:p-10 rounded-[2.5rem] border border-surface-variant/30 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Send a Message</h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">Have an inquiry or project proposal? Fill in the details below.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-1">Your Name *</label>
                <input 
                  name="name" 
                  required 
                  className="w-full text-sm sm:text-base bg-white dark:bg-slate-900/80 border border-surface-variant/40 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface placeholder:text-text-secondary/40 shadow-sm" 
                  placeholder="e.g. John Doe" 
                  type="text"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-1">Email Address *</label>
                <input 
                  name="email" 
                  required 
                  className="w-full text-sm sm:text-base bg-white dark:bg-slate-900/80 border border-surface-variant/40 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface placeholder:text-text-secondary/40 shadow-sm" 
                  placeholder="e.g. john@example.com" 
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-1">Phone Number</label>
                <input 
                  name="phone" 
                  className="w-full text-sm sm:text-base bg-white dark:bg-slate-900/80 border border-surface-variant/40 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface placeholder:text-text-secondary/40 shadow-sm" 
                  placeholder="e.g. +880 1700-000000" 
                  type="tel"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-1">Project Subject *</label>
                <input 
                  name="subject" 
                  required 
                  className="w-full text-sm sm:text-base bg-white dark:bg-slate-900/80 border border-surface-variant/40 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface placeholder:text-text-secondary/40 shadow-sm" 
                  placeholder="e.g. Full-Stack Web App Development" 
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-1.5 mb-6">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-1">Project Details / Message *</label>
              <textarea 
                name="message" 
                required 
                className="w-full text-sm sm:text-base bg-white dark:bg-slate-900/80 border border-surface-variant/40 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface placeholder:text-text-secondary/40 shadow-sm min-h-[120px] resize-y leading-relaxed" 
                placeholder="Briefly describe your vision, goals, or timeline..." 
                rows={4}
              />
            </div>

            {/* Human Verification Puzzle */}
            <div className="mb-6">
              <Captcha onValidate={setIsCaptchaValid} />
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm rounded-xl border border-red-500/20 flex items-center gap-2 mb-6">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <button 
              disabled={isSubmitting} 
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-bold text-base transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed" 
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Submitting Message...</span>
                </>
              ) : (
                <>
                  <span>Send Message Now</span>
                  <Send size={18} />
                </>
              )}
            </button>
            
            <p className="text-center text-text-secondary font-medium text-xs mt-4">
              Guaranteed privacy. Typically responding within 12–24 hours.
            </p>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[150] w-[90%] max-w-md"
          >
            <div className="w-full bg-emerald-600 p-5 rounded-2xl flex items-center shadow-2xl border border-white/20 text-white">
              <div className="mr-3 shrink-0">
                <CheckCircle size={28} />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold leading-tight">Message Delivered!</h4>
                <p className="text-xs opacity-90 mt-0.5">Thank you! Muhammad Al-amin will get back to you shortly.</p>
              </div>
              <button 
                type="button"
                onClick={closeSuccessMessage}
                className="ml-3 p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
