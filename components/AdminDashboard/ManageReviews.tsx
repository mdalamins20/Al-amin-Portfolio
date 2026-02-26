
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
import { Trash2, CheckCircle, XCircle, MessageSquare, User, Clock } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-theme-text">Manage Reviews</h1>
        <p className="text-theme-dim mt-1">Approve or remove client testimonials</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-theme-card animate-pulse rounded-2xl border border-theme-border" />
          ))
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center bg-theme-card rounded-2xl border border-dashed border-theme-border">
            <p className="text-theme-dim">No reviews submitted yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              layout
              key={review.id}
              className={`
                bg-theme-card border rounded-2xl p-6 transition-all
                ${review.isApproved ? 'border-theme-border' : 'border-brand/30 bg-brand/[0.02]'}
              `}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-theme-bg border border-theme-border flex items-center justify-center text-brand">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-theme-text">{review.clientName}</h3>
                      <p className="text-sm text-theme-dim">{review.role}</p>
                    </div>
                    {!review.isApproved && (
                      <span className="ml-auto px-3 py-1 bg-brand/10 text-brand text-xs font-bold rounded-full uppercase tracking-wider">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <p className="text-theme-text italic">"{review.content}"</p>
                  {review.createdAt && (
                    <div className="mt-4 flex items-center gap-1 text-xs text-theme-dim">
                      <Clock size={12} />
                      <span>{new Date(review.createdAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                  <button
                    onClick={() => toggleApproval(review.id!, review.isApproved)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all
                      ${review.isApproved 
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                        : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'}
                    `}
                  >
                    {review.isApproved ? (
                      <>
                        <XCircle size={18} />
                        Unapprove
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
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl font-semibold transition-all"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
