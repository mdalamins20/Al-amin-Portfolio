import React from 'react';
import { motion } from 'framer-motion';
import { useDataStore } from './stores/useDataStore';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';

export const RecentBlogs: React.FC = () => {
  const { blogs, loading } = useDataStore();
  const navigate = useNavigate();

  const stripHtmlAndTruncate = (html: string, maxLength: number) => {
    if (!html) return '';
    try {
      const plainText = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
      return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
    } catch {
      return '';
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    return colors[index % colors.length];
  };

  // Show only 3 recent blogs
  const recentBlogs = blogs.slice(0, 3);

  return (
    <section id="blog" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-stack-lg gap-4">
        <div>
          <span className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4 block">Latest Articles</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">The <span className="gradient-text">Journal.</span></h2>
          <p className="text-text-secondary font-body-lg max-w-xl mt-4">Thoughts, tutorials, and insights on the future of tech and design.</p>
        </div>
        <button 
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-primary font-label-bold hover:gap-3 transition-all whitespace-nowrap self-start md:self-end"
        >
          See All Articles <ArrowRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary">No articles published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {recentBlogs.map((blog, idx) => (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              key={blog.id} 
              className="group cursor-pointer glass-card rounded-2xl shadow-sm overflow-hidden border border-transparent hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full" 
              onClick={() => navigate(`/blog/${blog.id}`)}
            >
              <div className="w-full aspect-video overflow-hidden bg-surface-variant/20">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span style={{ color: getCategoryColor(idx) }} className="font-bold text-[10px] uppercase tracking-widest mb-3 block">
                  {(blog as any).category || 'Technology'}
                </span>
                <h3 className="text-xl font-serif font-bold text-on-surface mb-6 leading-snug group-hover:text-primary transition-colors break-words">
                  {blog.title}
                </h3>
                <div className="mt-auto text-xs font-bold text-text-secondary/70 flex items-center gap-2">
                  <Calendar size={12}/> {blog.date}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center md:hidden">
         <button 
           onClick={() => navigate('/blog')}
           className="px-8 py-3 bg-primary-container text-white rounded-lg font-label-bold w-full hover:scale-[1.02] transition-transform"
         >
           Explore All Articles
         </button>
      </div>
    </section>
  );
};
