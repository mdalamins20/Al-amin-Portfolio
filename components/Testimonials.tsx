import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useDataStore } from './stores/useDataStore';
import { motion } from 'framer-motion';
import { Star, Loader2, Send } from 'lucide-react';
import { Captcha } from './Captcha';

const ReviewForm = () => {
  const [formData, setFormData] = useState({ clientName: '', role: '', content: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  if (!isConfigured) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    if (!db) return;
    e.preventDefault();
    setErrorMessage(null);

    if (!isCaptchaValid) {
      setErrorMessage("Please complete the Human Verification correctly.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        isApproved: false,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ clientName: '', role: '', content: '', rating: 5 });
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-section-padding max-w-3xl mx-auto text-center">
        <div className="glass-card p-8 md:p-12 rounded-3xl bg-green-500/10 border-green-500/20">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={32} fill="currentColor" />
          </div>
          <h4 className="text-2xl font-bold text-on-surface mb-2">Thank You!</h4>
          <p className="text-text-secondary">Your review has been submitted and is pending approval.</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 text-primary font-bold hover:underline">
            Submit another review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-section-padding max-w-3xl mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-tertiary/30 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] relative border border-white/20 dark:border-white/5 shadow-2xl">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-label-bold uppercase tracking-widest mb-4">Leave a Review</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">Share Your Experience</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Your Name</label>
              <input
                required
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium"
                placeholder="Enter Your Name"
              />
            </div>
            <div>
              <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Your Role / Company</label>
              <input
                required
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium"
                placeholder="e.g. CEO, Developer, Freelancer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest mb-2">Your Feedback</label>
            <textarea
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-base bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium min-h-[140px] resize-y leading-relaxed"
              placeholder="Tell us about your experience working with Al-amin..."
              rows={4}
            />
          </div>

          <Captcha onValidate={setIsCaptchaValid} />

          {errorMessage && (
             <div className="p-4 bg-error-container/20 text-error text-sm rounded-lg border border-error/50 flex items-center justify-center">
                 <span className="mr-2">⚠️</span> {errorMessage}
             </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-4 border-t border-outline-variant/20">
            <p className="text-xs font-label-bold text-text-secondary uppercase tracking-widest">Rate Your Experience</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= (hoveredRating || formData.rating)
                        ? 'text-primary fill-primary'
                        : 'text-surface-variant'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs mt-4 py-4 bg-primary-container text-white rounded-xl font-label-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Testimonials: React.FC = () => {
  const { testimonials, loading } = useDataStore();
  const approvedReviews = testimonials.filter(r => r.isApproved === true);

  return (
    <section id="testimonials" className="py-section-padding bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Trusted by <span className="gradient-text">Industry Leaders.</span></h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
            {approvedReviews.length === 0 ? (
              <div className="col-span-1 md:col-span-2 text-center py-10 glass-card rounded-3xl">
                <p className="text-text-secondary italic">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              approvedReviews.map((t, i) => (
                <motion.div 
                  key={t.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-10 rounded-3xl relative"
                >
                  <span className="material-symbols-outlined text-6xl absolute top-6 right-8 text-on-surface/10 dark:text-white/10">format_quote</span>
                  
                  <div className="flex space-x-1 mb-6">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={16} fill={s < (t.rating || 5) ? "currentColor" : "none"} className={`w-4 h-4 ${s < (t.rating || 5) ? (i % 2 === 0 ? 'text-primary' : 'text-secondary') : 'text-surface-variant'}`} />
                    ))}
                  </div>

                  <p className="font-body-lg text-body-lg text-on-surface italic relative z-10 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                    "{t.content}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-8 pt-8 border-t border-outline-variant/10">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center font-display text-2xl font-bold uppercase ${i % 2 === 0 ? 'border-primary/20 bg-primary/10 text-primary dark:text-primary-300' : 'border-secondary/20 bg-secondary/10 text-secondary dark:text-secondary-300'}`}>
                      {t.clientName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold text-on-surface">{t.clientName}</p>
                      <p className="text-text-secondary text-sm">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        <ReviewForm />
      </div>
    </section>
  );
};
