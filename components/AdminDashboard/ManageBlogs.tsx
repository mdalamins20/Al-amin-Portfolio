
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
        author: currentBlog.author || 'Muhammad Al-amin'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text">Manage Blogs</h1>
          <p className="text-theme-dim mt-1">Share your thoughts and updates</p>
        </div>
        <button
          onClick={() => {
            setCurrentBlog({});
            setIsEditing(true);
          }}
          className="bg-brand hover:bg-brand-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-brand/20"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-theme-card border border-theme-border rounded-2xl p-8 shadow-xl"
          >
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Blog Title</label>
                <input
                  required
                  value={currentBlog.title || ''}
                  onChange={e => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. The Future of AI in Web Development"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Blog Feature Image"
                  initialValue={currentBlog.image}
                  onUploadComplete={(url) => setCurrentBlog({ ...currentBlog, image: url })}
                  folder="blogs"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-text">Author Name</label>
                  <input
                    value={currentBlog.author || 'Muhammad Al-amin'}
                    onChange={e => setCurrentBlog({ ...currentBlog, author: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Content (Rich Text Editor)</label>
                <div className="bg-white text-black rounded-xl overflow-hidden min-h-[350px]">
                  <ReactQuill 
                    theme="snow"
                    value={currentBlog.content || ''}
                    onChange={(content) => setCurrentBlog({ ...currentBlog, content })}
                    className="h-[300px]"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link', 'image', 'code-block'],
                        ['clean']
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-theme-border rounded-xl text-theme-text hover:bg-theme-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-brand hover:bg-brand-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Publish Post
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-theme-card animate-pulse rounded-2xl border border-theme-border" />
          ))
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center bg-theme-card rounded-2xl border border-dashed border-theme-border">
            <p className="text-theme-dim">No blog posts found. Write your first post!</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <motion.div
              layout
              key={blog.id}
              className="bg-theme-card border border-theme-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 group hover:border-brand/50 transition-all"
            >
              <div className="w-full md:w-48 h-32 bg-theme-bg rounded-xl overflow-hidden shrink-0">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 text-xs text-theme-dim mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{blog.author}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-theme-text mb-2 group-hover:text-brand transition-colors">{blog.title}</h3>
                <p className="text-theme-dim text-sm line-clamp-2">{blog.content}</p>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => openEdit(blog)}
                  className="p-3 text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(blog.id!)}
                  className="p-3 text-red-600 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
