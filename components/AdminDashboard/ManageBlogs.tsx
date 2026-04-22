
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
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
import { Plus, Trash2, Edit2, Save, X, Loader2, BookOpen, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ImageUpload } from './ImageUpload';

export const ManageBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
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
        await addDoc(collection(db, 'blogs'), blogData);
      }
      setIsEditing(false);
      setCurrentBlog({});
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteDoc(doc(db, 'blogs', id));
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  const openEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Manage Blogs</h1>
          <p className="text-slate-500 dark:text-slate-400">Share your thoughts, articles, and latest updates.</p>
        </div>
        <button
          onClick={() => {
            setCurrentBlog({});
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
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm relative mb-8 overflow-hidden">
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-10"
                title="Close"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 relative z-10">
                {currentBlog.id ? 'Edit Blog Post' : 'Write New Blog Post'}
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Blog Title</label>
                  <input
                    required
                    value={currentBlog.title || ''}
                    onChange={e => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm text-lg font-bold"
                    placeholder="e.g. The Future of AI in Web Development"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Blog Feature Image</h3>
                    <ImageUpload
                      label=""
                      initialValue={currentBlog.image}
                      onUploadComplete={(url) => setCurrentBlog({ ...currentBlog, image: url })}
                      folder="blogs"
                      cropShape="rect"
                      aspectRatio={16/9}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Author Name</label>
                    <input
                      value={currentBlog.author || ''}
                      onChange={e => setCurrentBlog({ ...currentBlog, author: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                      placeholder="Enter Author Name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Content (Rich Text Editor)</label>
                  <div className="bg-white text-black rounded-2xl border border-slate-200 overflow-hidden min-h-[350px]">
                    <ReactQuill 
                      theme="snow"
                      value={currentBlog.content || ''}
                      onChange={(content) => setCurrentBlog({ ...currentBlog, content })}
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

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl border border-slate-200 dark:border-white/10" />
          ))
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen size={32} className="text-brand opacity-80" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No blog posts yet</p>
            <p className="text-slate-500 dark:text-slate-400">Click "New Post" to write your first article.</p>
          </div>
        ) : (
          blogs.map((blog, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={blog.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6 group hover:border-brand/40 hover:shadow-xl transition-all shadow-sm relative overflow-hidden"
            >
              <div className="w-full md:w-56 overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 group-hover:shadow-md transition-shadow">
                <div className="w-full h-full relative" style={{ paddingBottom: '70%' }}>
                   <img src={blog.image} alt={blog.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-md">
                    <Calendar size={14} className="text-brand" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-md">
                    <User size={14} className="text-brand" />
                    <span>{blog.author}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand transition-colors line-clamp-2">{blog.title}</h3>
                
                {/* Text stripping for preview */}
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed line-clamp-2">
                    {blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : ''}
                </p>
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
    </div>
  );
};
