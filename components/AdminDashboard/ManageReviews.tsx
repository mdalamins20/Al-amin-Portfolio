
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { Review } from '../../types';
import { Trash2, CheckCircle, XCircle, MessageSquare, User, Clock, Star, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManageReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Review[];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', id), {
        isApproved: !currentStatus
      });
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Manage Reviews</h1>
        <p className="text-slate-500 dark:text-slate-400">Moderate client testimonials before they appear on your site.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl border border-slate-200 dark:border-white/10" />
          ))
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
             <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageSquare size={32} className="text-brand opacity-80" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reviews submitted yet.</p>
            <p className="text-slate-500 dark:text-slate-400">When clients submit a review, it will appear here for approval.</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                key={review.id}
                className={`
                  bg-white dark:bg-slate-900 border rounded-3xl p-6 md:p-8 transition-all shadow-sm
                  ${review.isApproved ? 'border-slate-200 dark:border-white/10' : 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10'}
                `}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner flex items-center justify-center text-brand">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{review.clientName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{review.role}</p>
                        <div className="flex space-x-1 mt-1.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <Star key={s} size={14} fill={s < (review.rating || 5) ? "currentColor" : "none"} className={s < (review.rating || 5) ? "text-amber-400" : "text-slate-200 dark:text-slate-700"} />
                            ))}
                        </div>
                      </div>
                      {!review.isApproved && (
                        <span className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider border border-amber-200/50 dark:border-amber-500/20">
                          <ShieldAlert size={14} />
                          Pending Approval
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 relative mt-4">
                      <p className="text-slate-600 dark:text-slate-300 italic text-base leading-relaxed relative z-10">"{review.content}"</p>
                    </div>

                    {review.createdAt && (
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 pl-2">
                        <Clock size={14} />
                        <span>{new Date(review.createdAt.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex lg:flex-col gap-3 shrink-0 lg:w-48 pt-2 mt-4 lg:mt-0 lg:border-l border-slate-100 dark:border-white/5 lg:pl-6">
                    <button
                      onClick={() => toggleApproval(review.id!, review.isApproved)}
                      className={`
                        flex-1 flex items-center justify-center lg:justify-start gap-2 px-4 py-3 rounded-xl font-bold transition-all
                        ${review.isApproved 
                          ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10' 
                          : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 shadow-lg shadow-green-500/10'}
                      `}
                    >
                      {review.isApproved ? (
                        <>
                          <XCircle size={18} />
                          Hide on site
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id!)}
                      className="flex-1 flex items-center justify-center lg:justify-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl font-bold transition-all"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
