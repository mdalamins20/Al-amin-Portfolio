import React from 'react';
import { Loader2, CheckCircle, X } from 'lucide-react';
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

  const whatsappNumber = profile.phone.replace(/\+/g, ''); 
  const whatsappMessage = encodeURIComponent("Hello, I visited your portfolio and would like to contact you.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="contact" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative">
      <div className="mb-stack-lg text-center md:text-left">
        <span className="font-label-bold text-label-bold text-primary tracking-widest uppercase mb-4 block">GET IN TOUCH</span>
        <h1 className="font-display-xl-mobile md:font-headline-lg text-display-xl-mobile md:text-headline-lg mb-6 text-on-surface">
          Let's build your <br/><span className="gradient-text">next big thing.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl">
          I'm currently available for freelance work. If you have a project that needs some creative injection, I'd love to discuss it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card p-8 rounded-xl flex items-start gap-6 group">
            <div className="w-14 h-14 bg-primary-container/20 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-3xl">mail</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline-md text-[20px] mb-1 text-on-surface">Email</h3>
              <p className="text-text-secondary mb-2 break-all">{profile.email}</p>
              <a className="text-primary font-label-bold text-label-bold flex items-center gap-1 group-hover:gap-2 transition-all" href={`mailto:${profile.email}`}>
                Send a mail <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          <div className="glass-card p-8 rounded-xl flex items-start gap-6 group">
            <div className="w-14 h-14 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-3xl">chat</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline-md text-[20px] mb-1 text-on-surface">WhatsApp</h3>
              <p className="text-text-secondary mb-2 break-words">{profile.phone}</p>
              <a className="text-secondary font-label-bold text-label-bold flex items-center gap-1 group-hover:gap-2 transition-all" href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Chat now <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          <div className="glass-card p-8 rounded-xl flex items-start gap-6 group">
            <div className="w-14 h-14 bg-tertiary/20 rounded-lg flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-3xl">location_on</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline-md text-[20px] mb-1 text-on-surface">Location</h3>
              <p className="text-text-secondary mb-2 break-words">{profile.locationText || 'Dhaka, Bangladesh'}</p>
              <p className="text-tertiary text-xs bg-tertiary/10 inline-block px-2 py-1 rounded">Available for Remote</p>
            </div>
          </div>

          {profile.mapEmbedUrl && (
            <div className="glass-card p-2 rounded-xl group relative overflow-hidden h-[200px]">
              <iframe
                src={profile.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.5rem' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              ></iframe>
            </div>
          )}
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-tertiary/30 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <form onSubmit={submitForm} className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden bg-surface-deep/30 dark:bg-surface-deep/10 backdrop-blur-md">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
              <h2 className="font-headline-md text-headline-md mb-8 text-on-surface">Send a Message</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Name</label>
                  <input name="name" required className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium placeholder:text-text-secondary/50 text-slate-900 dark:text-white" placeholder="Enter Your Name" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Email</label>
                  <input name="email" required className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium placeholder:text-text-secondary/50 text-slate-900 dark:text-white" placeholder="Enter Your Email" type="email"/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Phone</label>
                  <input name="phone" className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium placeholder:text-text-secondary/50 text-slate-900 dark:text-white" placeholder="Enter Your Phone Number" type="tel"/>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Subject</label>
                  <input name="subject" required className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium placeholder:text-text-secondary/50 text-slate-900 dark:text-white" placeholder="Enter Subject" type="text"/>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Message</label>
                <textarea name="message" required className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium placeholder:text-text-secondary/50 text-slate-900 dark:text-white min-h-[140px] resize-y leading-relaxed" placeholder="Write your message here..." rows={5}></textarea>
              </div>

              <div className="mb-8">
                <Captcha onValidate={setIsCaptchaValid} />
              </div>

              {errorMessage && (
                  <div className="p-4 bg-error-container/20 text-error text-sm rounded-lg border border-error/50 flex items-center justify-center mb-6">
                      <span className="mr-2">⚠️</span> {errorMessage}
                  </div>
              )}

              <button disabled={isSubmitting} className="w-full bg-primary-container text-white py-4 rounded-lg font-headline-md text-[18px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-primary-container/30 disabled:opacity-70" type="submit">
                {isSubmitting ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        Send Message
                        <span className="material-symbols-outlined">send</span>
                    </>
                )}
              </button>
              
              <p className="text-center text-text-secondary font-medium text-sm mt-6">
                I usually respond within 12-24 hours.
              </p>
            </div>
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
              <div className="w-full bg-[#00c87b] p-6 rounded-2xl flex items-center relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,200,123,0.5)] border border-white/20">
                  <div className="mr-4 flex-shrink-0 text-white">
                     <CheckCircle size={32} />
                  </div>
                  <div className="flex-1 text-white">
                     <h4 className="text-xl font-bold leading-tight mb-1">Successfully sent!</h4>
                     <p className="text-sm opacity-90">Your message has been sent successfully.</p>
                  </div>
                  <button 
                      type="button"
                      onClick={closeSuccessMessage}
                      className="ml-4 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
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
