
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { db, isConfigured } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Blog } from '../types';
import { Layout } from './Layout';
import { SectionWrapper } from './SectionWrapper';
import { Link } from 'react-router-dom';

export const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!isConfigured || !db) {
        setLoading(false);
        return;
      }
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

    fetchBlogs();
  }, []);

  return (
    <Layout onViewCV={() => {}}>
      <div className="pt-32 pb-20">
        <SectionWrapper id="blog-header">
          <div className="text-center mb-20">
            <h2 className="text-brand font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3">Insights & Thoughts</h2>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-theme-text">
              The Digital <span className="text-brand">Journal.</span>
            </h1>
            <p className="text-theme-dim mt-6 max-w-2xl mx-auto">Sharing my experiences, tutorials, and thoughts on the future of technology and design.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand" size={48} />
              <p className="text-theme-dim font-medium">Loading articles...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-theme-card rounded-[3rem] border border-dashed border-theme-border">
              <BookOpen size={48} className="mx-auto text-theme-dim mb-4 opacity-20" />
              <p className="text-theme-dim">No articles published yet. Stay tuned!</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 text-brand font-bold hover:underline">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-theme-card border border-theme-border rounded-[2.5rem] overflow-hidden hover:border-brand/50 transition-all duration-500 flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-theme-dim uppercase tracking-widest mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-brand" />
                        <span>{blog.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-brand" />
                        <span>{blog.author}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-theme-text mb-4 group-hover:text-brand transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-theme-dim text-sm line-clamp-3 mb-6 flex-1">
                      {blog.content}
                    </p>
                    <Link 
                      to={`/blog/${blog.id}`}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-theme-text group-hover:text-brand transition-colors"
                    >
                      Read Article
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </SectionWrapper>
      </div>
    </Layout>
  );
};
