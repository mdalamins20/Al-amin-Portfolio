
import React, { useState, useEffect } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { Quote, Star, Loader2, Send, User, Briefcase, MessageSquare } from 'lucide-react';
import { db, isConfigured } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Review } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS as FALLBACK_TESTIMONIALS } from '../constants';

const ReviewForm = () => {
  const [formData, setFormData] = useState({ clientName: '', role: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isConfigured) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    if (!db) return;
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        isApproved: false,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ clientName: '', role: '', content: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center max-w-2xl mx-auto mt-12"
      >
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} fill="currentColor" />
        </div>
        <h4 className="text-2xl font-bold text-theme-text mb-2">Thank You!</h4>
        <p className="text-theme-dim">Your review has been submitted and is pending approval. It will be visible once reviewed by the admin.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-brand font-bold hover:underline"
        >
          Submit another review
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mt-20 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-theme-text mb-2">Share Your Experience</h3>
        <p className="text-theme-dim">Your feedback helps me improve and helps others trust my work.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-theme-card border border-theme-border p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-theme-text flex items-center gap-2">
              <User size={14} className="text-brand" />
              Your Name
            </label>
            <input
              required
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Briefcase size={14} className="text-brand" />
              Your Role / Company
            </label>
            <input
              required
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
              placeholder="CEO, TechCorp"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-theme-text flex items-center gap-2">
            <MessageSquare size={14} className="text-brand" />
            Your Feedback
          </label>
          <textarea
            required
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[120px]"
            placeholder="Tell us about your experience working with Alamin..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-brand/20"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          Submit Review
        </button>
      </form>
    </div>
  );
};

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isConfigured || !db) {
        setReviews([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch all reviews and filter/sort in memory to avoid index requirement
        const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id
          }))
          .filter((review: any) => review.isApproved === true) as Review[];
        
        if (reviewsData.length > 0) {
          setReviews(reviewsData);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <SectionWrapper id="testimonials" className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-sm mb-3">
            Testimonials
        </h2>
        <h3 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white">
          Trusted by Industry Leaders
        </h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand" size={48} />
          <p className="text-theme-dim font-medium">Loading testimonials...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {reviews.length === 0 ? (
            <div className="md:col-span-2 text-center py-10 bg-theme-card rounded-3xl border border-dashed border-theme-border">
              <p className="text-theme-dim italic">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((t, i) => (
              <motion.div 
                key={t.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900/50 p-10 shadow-lg rounded-2xl border border-slate-100 dark:border-slate-800 relative"
              >
                <div className="flex space-x-1 mb-6 text-amber-500">
                    {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} fill="currentColor" />
                    ))}
                </div>

                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 italic mb-8 leading-relaxed">
                  "{t.content}"
                </p>
                
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold font-serif text-xl mr-4 uppercase">
                        {t.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.clientName}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.role}</p>
                    </div>
                </div>

                <Quote className="absolute top-8 right-8 w-10 h-10 text-brand-100 dark:text-brand-900/20" />
              </motion.div>
            ))
          )}
        </div>
      )}

      <ReviewForm />
    </SectionWrapper>
  );
};
