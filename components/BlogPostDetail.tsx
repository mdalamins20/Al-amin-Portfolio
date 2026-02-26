
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { db, isConfigured } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Blog } from '../types';
import { Layout } from './Layout';
import { SectionWrapper } from './SectionWrapper';
import ReactMarkdown from 'react-markdown';

export const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id || !isConfigured || !db) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'blogs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ ...docSnap.data(), id: docSnap.id } as Blog);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <Layout onViewCV={() => {}}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-brand" size={48} />
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout onViewCV={() => {}}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <BookOpen size={64} className="text-theme-dim mb-6 opacity-20" />
          <h1 className="text-3xl font-bold text-theme-text mb-4">Article Not Found</h1>
          <p className="text-theme-dim mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="bg-brand text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onViewCV={() => {}}>
      <div className="pt-32 pb-20">
        <SectionWrapper id="blog-post">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-theme-dim hover:text-brand transition-colors mb-12 font-bold text-sm"
          >
            <ArrowLeft size={16} />
            Back to all articles
          </Link>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 text-[10px] font-bold text-theme-dim uppercase tracking-widest mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand" />
                  <span>{blog.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-brand" />
                  <span>{blog.author}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-theme-text mb-8 leading-tight">
                {blog.title}
              </h1>
              <div className="aspect-video rounded-[3rem] overflow-hidden border border-theme-border mb-12">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none markdown-body"
            >
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </motion.div>
          </div>
        </SectionWrapper>
      </div>
    </Layout>
  );
};
