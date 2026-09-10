
import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { Blog } from '../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, BookOpen, Calendar, User, Sparkles } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ImageUpload } from './ImageUpload';
import { ConfirmationModal } from './ConfirmationModal';
import { generateFullBlogPost } from '../../utils/aiService';
import { compileAndSyncToGist } from '../../utils/syncService';

export const ManageBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({});
  const [formLoading, setFormLoading] = useState(false);
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
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Blog[];
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setFormLoading(true);
    try {
      const blogData = {
        ...currentBlog,
        date: currentBlog.date || new Date().toISOString().split('T')[0],
        author: currentBlog.author || 'Anonymous'
      };

      if (currentBlog.id) {
        const { id, ...data } = blogData;
        await updateDoc(doc(db, 'blogs', id), data);
      } else {
        const { id: _, ...newBlogData } = blogData;
        await addDoc(collection(db, 'blogs'), {
          ...newBlogData,
          id: Date.now().toString()
        });
      }
      setIsEditing(false);
      setCurrentBlog({});
      fetchBlogs();
      // Background Sync to Gist
      compileAndSyncToGist().catch(console.error);
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Blog post has been published successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving blog:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save blog post. Please try again.',
        type: 'danger'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    setModalConfig({
      isOpen: true,
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'blogs', id));
          fetchBlogs();
          // Background Sync to Gist
          compileAndSyncToGist().catch(console.error);
        } catch (error) {
          console.error('Error deleting blog:', error);
        }
      }
    });
  };

  const openEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsEditing(true);
  };

  const handleAIGenerateBlog = async () => {
    if (!currentBlog.title) {
      setModalConfig({
        isOpen: true,
        title: 'Topic Required',
        message: 'Please enter a topic in the Blog Title field first!',
        type: 'danger'
      });
      return;
    }
    setAiGenerating(true);
    try {
      const generated = await generateFullBlogPost(currentBlog.title);
      
      setCurrentBlog(prev => ({
        ...prev,
        title: generated.title,
        content: generated.content,
        seoTitle: generated.seoTitle || prev.seoTitle,
        metaDescription: generated.metaDescription || prev.metaDescription,
        keywords: generated.keywords || prev.keywords,
      }));
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        title: 'Generation Failed',
        message: err.message || 'Failed to generate blog.',
        type: 'danger'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Blogs</h1>
          </div>
          <p className="text-text-secondary text-sm font-medium pl-[52px]">Share your thoughts, articles, and latest updates.</p>
        </div>
        <button
          onClick={() => {
            setCurrentBlog({ author: 'Muhammad Al-amin' });
            setIsEditing(true);
          }}
          className="bg-brand hover:scale-105 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-transform shadow-lg shadow-brand/20 active:scale-95"
          disabled={isEditing}
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-2xl z-10"
            >
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-10"
                title="Close"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-on-surface mb-8 relative z-10">
                {currentBlog.id ? 'Edit Blog Post' : 'Write New Blog Post'}
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-on-surface-variant">Blog Title / Topic</label>
                    <button
                      type="button"
                      onClick={handleAIGenerateBlog}
                      disabled={aiGenerating}
                      className="text-xs flex items-center gap-1.5 bg-gradient-to-r from-brand/10 to-purple-500/10 text-brand px-3 py-1.5 rounded-lg hover:from-brand hover:to-purple-600 hover:text-white transition-all font-bold"
                    >
                      {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      AI Write Full Blog
                    </button>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={currentBlog.title || ''}
                    onChange={e => setCurrentBlog(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm text-lg font-bold resize-none"
                    placeholder="e.g. The Future of AI in Web Development"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-outline-variant shadow-sm">
                    <h3 className="font-bold text-on-surface mb-4">Blog Feature Image</h3>
                    <ImageUpload
                      label=""
                      initialValue={currentBlog.image}
                      onUploadComplete={(url) => setCurrentBlog(prev => ({ ...prev, image: url }))}
                      folder="blogs"
                      cropShape="rect"
                      aspectRatio={16/9}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">Author Name</label>
                    <input
                      value={currentBlog.author || ''}
                      onChange={e => setCurrentBlog(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                      placeholder="Enter Author Name"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-outline-variant mt-2">
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                    <Sparkles size={18} className="text-brand" /> 
                    SEO Metadata (Auto-generated)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface-variant">SEO Title</label>
                      <input
                        value={currentBlog.seoTitle || ''}
                        onChange={e => setCurrentBlog(prev => ({ ...prev, seoTitle: e.target.value }))}
                        className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                        placeholder="Optimized title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface-variant">Keywords</label>
                      <input
                        value={currentBlog.keywords || ''}
                        onChange={e => setCurrentBlog(prev => ({ ...prev, keywords: e.target.value }))}
                        className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                        placeholder="react, web dev, etc..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <label className="text-sm font-bold text-on-surface-variant">Meta Description</label>
                    <textarea
                      rows={2}
                      value={currentBlog.metaDescription || ''}
                      onChange={e => setCurrentBlog(prev => ({ ...prev, metaDescription: e.target.value }))}
                      className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all resize-none shadow-sm"
                      placeholder="Brief description for search engines..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Content (Rich Text Editor)</label>
                  <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden min-h-[350px]">
                    <ReactQuill 
                      theme="snow"
                      value={currentBlog.content || ''}
                      onChange={(content) => setCurrentBlog(prev => ({ ...prev, content }))}
                      className="h-[300px] border-none"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                          ['link', 'image', 'code-block'],
                          ['clean']
                        ],
                        clipboard: {
                          matchVisual: false,
                        }
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                        'list', 'indent',
                        'link', 'image', 'code-block', 'align'
                      ]}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-2xl text-on-surface-variant font-bold hover:bg-surface-variant transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-brand hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 min-w-[150px] shadow-lg shadow-brand/20"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Publish Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {!isConfigured ? (
          <div className="py-20 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200 dark:border-red-500/20 shadow-sm">
             <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Firebase Not Configured</p>
             <p className="text-on-surface-variant">Please check your .env file or firebase.ts configuration.</p>
          </div>
        ) : loading ? (
          <AdminPageLoader icon={BookOpen} color="text-emerald-500" bg="bg-emerald-500/10 border-emerald-500/20" label="Loading blogs..." />
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen size={32} className="text-brand opacity-80" />
            </div>
            <p className="text-xl font-bold text-on-surface mb-2">No blog posts yet</p>
            <p className="text-on-surface-variant">Click "New Post" to write your first article.</p>
          </div>
        ) : (
          blogs.map((blog, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={blog.id}
              className="bg-surface border border-outline-variant rounded-3xl p-6 flex flex-col md:flex-row gap-6 group hover:border-brand/40 hover:shadow-xl transition-all shadow-sm relative overflow-hidden"
            >
              <div className="w-full md:w-56 overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 group-hover:shadow-md transition-shadow relative">
                {/* Serial Number Badge */}
                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg font-bold text-sm border border-white/10 shadow-lg flex items-center justify-center">
                  #{blogs.length - i}
                </div>
                <div className="w-full h-full relative" style={{ paddingBottom: '70%' }}>
                   <img src={blog.image} alt={blog.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center flex-wrap gap-4 text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 whitespace-nowrap bg-surface-variant px-2.5 py-1 rounded-md">
                    <Calendar size={14} className="text-brand" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-variant px-2.5 py-1 rounded-md max-w-full">
                    <User size={14} className="text-brand shrink-0" />
                    <span className="truncate">{blog.author}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-0 group-hover:text-brand transition-colors line-clamp-2">{blog.title}</h3>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0 md:justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                <button
                  onClick={() => openEdit(blog)}
                  className="flex-1 md:flex-none p-3 text-slate-500 hover:text-brand hover:bg-brand/10 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Edit2 size={18} />
                  <span className="md:hidden">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(blog.id!)}
                  className="flex-1 md:flex-none p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Trash2 size={18} />
                  <span className="md:hidden">Delete</span>
                </button>
              </div>
            </motion.div>
          ))
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
