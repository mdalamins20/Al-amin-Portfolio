import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Globe, Search, RefreshCw, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { logActivity } from '../../utils/activityLogger';
import { motion } from 'framer-motion';

interface SEOItem {
  id: string;
  type: 'project' | 'blog';
  title: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
}

export const ManageSEO: React.FC = () => {
  const [items, setItems] = useState<SEOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsSnap, blogsSnap] = await Promise.all([
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'blogs'))
      ]);

      const projectsData = projectsSnap.docs.map(doc => ({
        id: doc.id,
        type: 'project' as const,
        title: doc.data().title || '',
        seoTitle: doc.data().seoTitle || '',
        metaDescription: doc.data().metaDescription || '',
        keywords: doc.data().keywords || ''
      }));

      const blogsData = blogsSnap.docs.map(doc => ({
        id: doc.id,
        type: 'blog' as const,
        title: doc.data().title || '',
        seoTitle: doc.data().seoTitle || '',
        metaDescription: doc.data().metaDescription || '',
        keywords: doc.data().keywords || ''
      }));

      setItems([...projectsData, ...blogsData]);
    } catch (err) {
      console.error("Error fetching SEO data:", err);
      showAlert('error', 'Failed to fetch SEO data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => setAlertInfo({ show: false, type: 'success', message: '' }), 3000);
  };

  const handleUpdate = (id: string, field: keyof SEOItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const saveItem = async (item: SEOItem) => {
    setSavingId(item.id);
    try {
      const collectionName = item.type === 'project' ? 'projects' : 'blogs';
      await updateDoc(doc(db, collectionName, item.id), {
        seoTitle: item.seoTitle,
        metaDescription: item.metaDescription,
        keywords: item.keywords
      });
      
      await logActivity(
        'update',
        'seo',
        `SEO: ${item.title}`,
        `Updated SEO metadata for ${item.type}`
      );
      
      showAlert('success', 'SEO settings saved successfully!');
    } catch (error) {
      console.error("Error saving SEO:", error);
      showAlert('error', 'Failed to save SEO settings.');
    } finally {
      setSavingId(null);
    }
  };

  const getScoreColor = (item: SEOItem) => {
    let score = 0;
    if (item.seoTitle && item.seoTitle.length > 10) score += 1;
    if (item.metaDescription && item.metaDescription.length > 50) score += 1;
    if (item.keywords && item.keywords.length > 5) score += 1;

    if (score === 3) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score === 2) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getScoreText = (item: SEOItem) => {
    let score = 0;
    if (item.seoTitle && item.seoTitle.length > 10) score += 1;
    if (item.metaDescription && item.metaDescription.length > 50) score += 1;
    if (item.keywords && item.keywords.length > 5) score += 1;

    if (score === 3) return 'Optimized';
    if (score === 2) return 'Needs Work';
    return 'Poor';
  };

  if (loading) return <AdminPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
            <Search className="text-primary" />
            SEO Manager
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Centrally manage search engine optimization meta tags across your entire portfolio.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-surface-variant/50 hover:bg-surface-variant text-on-surface rounded-xl border border-outline-variant transition-colors text-sm font-bold"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {alertInfo.show && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            alertInfo.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}
        >
          {alertInfo.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{alertInfo.message}</p>
        </motion.div>
      )}

      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/30 border-b border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-4">Content Title</th>
                <th className="p-4">SEO Details</th>
                <th className="p-4 w-32 text-center">Status</th>
                <th className="p-4 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-variant/10 transition-colors">
                  <td className="p-4 align-top">
                    <p className="font-bold text-on-surface text-sm mb-1">{item.title}</p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      item.type === 'project' 
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 align-top space-y-3 min-w-[300px]">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">SEO Title</label>
                      <input
                        value={item.seoTitle}
                        onChange={e => handleUpdate(item.id, 'seoTitle', e.target.value)}
                        className="w-full text-sm px-3 py-1.5 bg-surface-variant/30 border border-outline-variant rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
                        placeholder="Optimized title..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Keywords</label>
                      <input
                        value={item.keywords}
                        onChange={e => handleUpdate(item.id, 'keywords', e.target.value)}
                        className="w-full text-sm px-3 py-1.5 bg-surface-variant/30 border border-outline-variant rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
                        placeholder="Comma separated keywords..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Meta Description</label>
                      <textarea
                        rows={2}
                        value={item.metaDescription}
                        onChange={e => handleUpdate(item.id, 'metaDescription', e.target.value)}
                        className="w-full text-sm px-3 py-1.5 bg-surface-variant/30 border border-outline-variant rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all resize-none"
                        placeholder="Brief description for search engines..."
                      />
                    </div>
                  </td>
                  <td className="p-4 align-top text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${getScoreColor(item)}`}>
                      <Globe size={14} />
                      {getScoreText(item)}
                    </div>
                  </td>
                  <td className="p-4 align-top text-center">
                    <button
                      onClick={() => saveItem(item)}
                      disabled={savingId === item.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors w-full"
                    >
                      {savingId === item.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Save size={14} />
                          Save
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    <Search size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-sm">No content found to optimize.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
