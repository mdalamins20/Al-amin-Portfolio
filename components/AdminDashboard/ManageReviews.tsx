
import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
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
import { logActivity } from '../../utils/activityLogger';
import { Star, Trash2, CheckCircle, XCircle, MessageSquare, AlertCircle, User, Clock, ShieldAlert, Search, Download } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { compileAndSyncToGist } from '../../utils/syncService';

export const ManageReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'success' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
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
    if (!db) return;
    try {
      await updateDoc(doc(db, 'reviews', id), {
        isApproved: !currentStatus
      });
      await logActivity('update', 'review', 'Review', `${!currentStatus ? 'Approved' : 'Unapproved'} review ID: ${id}`);
      fetchReviews();
      // Background Sync to Gist
      compileAndSyncToGist().catch(console.error);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleBulkDelete = () => {
    if (selectedForDelete.length === 0) return;
    
    setModalConfig({
      isOpen: true,
      title: 'Bulk Delete Reviews',
      message: `Are you sure you want to delete ${selectedForDelete.length} reviews? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const promises = selectedForDelete.map(id => deleteDoc(doc(db, 'reviews', id)));
          await Promise.all(promises);
          await logActivity('bulk_update', 'review', `${selectedForDelete.length} reviews`, `Bulk deleted ${selectedForDelete.length} reviews`);
          setSelectedForDelete([]);
          fetchReviews();
          compileAndSyncToGist().catch(console.error);
        } catch (error) {
          console.error('Error deleting reviews:', error);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    setModalConfig({
      isOpen: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'reviews', id));
          await logActivity('delete', 'review', 'Review', `Deleted review ID: ${id}`);
          fetchReviews();
          // Background Sync to Gist
          compileAndSyncToGist().catch(console.error);
        } catch (error) {
          console.error('Error deleting review:', error);
        }
      }
    });
  };

  const handleExportCSV = () => {
    if (reviews.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Client Name,Role,Rating,Status,Date\n";
    
    reviews.forEach(r => {
      const date = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : '';
      const status = r.isApproved ? 'Approved' : 'Pending';
      csvContent += `"${r.clientName}","${r.role}",${r.rating || 5},${status},${date}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reviews_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <MessageSquare size={20} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Reviews</h1>
        </div>
        <p className="text-text-secondary text-sm font-medium pl-[52px]">Moderate client testimonials before they appear on your site.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-3xl border border-outline-variant shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-variant/30 border border-outline-variant rounded-xl py-2.5 pl-10 pr-4 text-on-surface focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedForDelete.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors border border-red-500/20 flex"
            >
              <Trash2 size={18} /> Delete Selected ({selectedForDelete.length})
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-surface-variant/30 hover:bg-surface-variant/50 text-on-surface rounded-xl font-medium transition-colors border border-outline-variant flex"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!isConfigured ? (
          <div className="py-20 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200 dark:border-red-500/20 shadow-sm">
             <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Firebase Not Configured</p>
             <p className="text-on-surface-variant">Please check your .env file or firebase.ts configuration.</p>
          </div>
        ) : loading ? (
          <AdminPageLoader icon={MessageSquare} color="text-amber-500" bg="bg-amber-500/10 border-amber-500/20" label="Loading reviews..." />
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center bg-surface-variant/50 rounded-3xl border border-dashed border-outline-variant shadow-sm">
             <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageSquare size={32} className="text-primary opacity-80" />
            </div>
            <p className="text-xl font-bold text-on-surface mb-2">No reviews submitted yet.</p>
            <p className="text-on-surface-variant">When clients submit a review, it will appear here for approval.</p>
          </div>
        ) : reviews.filter(r => r.clientName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className="py-20 text-center bg-surface-variant/50 rounded-3xl border border-dashed border-outline-variant shadow-sm">
            <p className="text-on-surface-variant">No reviews match your search.</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.filter(r => r.clientName.toLowerCase().includes(searchQuery.toLowerCase())).map((review, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                key={review.id}
                className={`
                  bg-surface border rounded-3xl p-6 md:p-8 transition-all shadow-sm
                  ${review.isApproved ? 'border-outline-variant' : 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10'}
                `}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <input 
                        type="checkbox"
                        checked={selectedForDelete.includes(review.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedForDelete([...selectedForDelete, review.id]);
                          else setSelectedForDelete(selectedForDelete.filter(id => id !== review.id));
                        }}
                        className="w-5 h-5 cursor-pointer accent-brand"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-surface-variant border border-outline-variant shadow-inner flex items-center justify-center text-primary">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-on-surface">{review.clientName}</h3>
                        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{review.role}</p>
                        <div className="flex space-x-1 mt-1.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <Star key={s} size={14} fill={s < (review.rating || 5) ? "currentColor" : "none"} className={s < (review.rating || 5) ? "text-amber-400" : "text-outline-variant"} />
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
                    
                    <div className="bg-surface-variant/60 rounded-2xl p-4 border border-outline-variant relative mt-4">
                      <p className="text-on-surface-variant italic text-base leading-relaxed relative z-10">"{review.content}"</p>
                    </div>

                    {review.createdAt && (
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant pl-2">
                        <Clock size={14} />
                        <span>{new Date(review.createdAt.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex lg:flex-col gap-3 shrink-0 lg:w-48 pt-2 mt-4 lg:mt-0 lg:border-l border-outline-variant lg:pl-6">
                    <button
                      onClick={() => toggleApproval(review.id!, review.isApproved)}
                      className={`
                        flex-1 flex items-center justify-center lg:justify-start gap-2 px-4 py-3 rounded-xl font-bold transition-all
                        ${review.isApproved 
                          ? 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant/30' 
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

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};
