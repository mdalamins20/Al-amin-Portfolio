import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  ArrowLeft, Heart, Facebook, Linkedin, Twitter, 
  Send, MessageSquare, Share2, Bookmark, Clock, Check, Calendar, Loader2
} from 'lucide-react';
import { db, isConfigured } from '../firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion, collection, addDoc, serverTimestamp, getDocs, limit, query, where } from 'firebase/firestore';
import { Blog, BlogComment } from '../types';
import { Layout } from './Layout';
import { SEO } from './SEO';
import { useProfileStore } from './stores/useProfileStore';
import { useDataStore } from './stores/useDataStore';
import { showAlert } from './stores/useDialogStore';

const stripHtmlAndTruncate = (html: string, maxLength: number) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// -------------------------------------------------------------
// HELPER COMPONENTS
// -------------------------------------------------------------

const NewsletterCard = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!db || !isConfigured) return;

    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email.trim(),
        subscribedAt: serverTimestamp(),
        source: 'blog_sidebar'
      });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className="bg-theme-card rounded-xl p-8 text-left shadow-lg mb-12 border border-theme-border mt-10">
        <div className="text-brand mb-4">
          <Send size={24} />
        </div>
        <h4 className="font-bold text-xl mb-2 text-white">Stay ahead of the Vibe.</h4>
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          Get weekly insights into the future of software engineering, system architecture, and tech leadership delivered to your inbox.
        </p>
        {success ? (
          <div className="flex items-center gap-2 text-brand font-bold bg-brand/10 p-4 rounded-xl">
            <Check size={20} /> Successfully subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3 relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address" 
              className="w-full bg-theme-bg text-theme-text border border-theme-border rounded-xl px-5 py-3.5 text-base outline-none focus:border-brand transition-colors"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-bold py-3.5 rounded-xl text-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe Here'}
            </button>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </form>
        )}
      </div>
    );
  }

  // Desktop Newsletter
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-8 text-center shadow-sm">
      <div className="text-brand mb-4 flex justify-center">
        {success ? <Check size={28} /> : <Send size={28} className="transform -rotate-12" />}
      </div>
      <h4 className="font-bold text-lg mb-2 text-theme-text">
        {success ? 'Thank You!' : 'Subscribe to Newsletter'}
      </h4>
      <p className="text-sm text-theme-dim mb-6 leading-relaxed">
        {success ? 'You are successfully subscribed.' : 'Get the latest articles and tutorials directly in your inbox.'}
      </p>
      
      {!success && (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address" 
            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-base outline-none focus:border-brand"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white font-bold py-3 rounded-xl text-sm hover:bg-brand-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
};

const AuthorCard = ({ author, isMobile = false }: { author: string, isMobile?: boolean }) => {
  const { profile } = useProfileStore();
  const profileImage = profile?.image;

  if (isMobile) {
    return (
      <div className="flex flex-col items-center text-center p-8 bg-theme-bg/50 border border-theme-border rounded-2xl mb-12">
        {profileImage ? (
          <img src={profileImage} alt={author} className="w-20 h-20 rounded-xl object-cover mb-4 shadow-sm" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
            {author.charAt(0)}
          </div>
        )}
        <h3 className="font-bold text-lg text-theme-text mb-1">{author}</h3>
        <p className="text-sm text-theme-dim mb-4 leading-relaxed">
          {profile?.tagline || 'Digital Solution Architect specializing in modern enterprise systems and software engineering.'}
        </p>
        <div className="flex gap-4 text-brand">
          <a href="#" className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center hover:bg-brand hover:text-white transition-colors"><Bookmark size={14} /></a>
          <a href="#" className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center hover:bg-brand hover:text-white transition-colors"><Twitter size={14} /></a>
          <a href="#" className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center hover:bg-brand hover:text-white transition-colors"><Linkedin size={14} /></a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
      {profileImage ? (
        <img src={profileImage} alt={author} className="w-16 h-16 rounded-xl object-cover mb-4 shadow-sm border-2 border-brand/20" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xl mb-4">
          {author.charAt(0)}
        </div>
      )}
      <h3 className="font-bold text-theme-text mb-1">{author}</h3>
      <div className="text-xs text-theme-dim mb-6 leading-relaxed">
        {profile?.tagline || 'Digital Solution Architect specializing in modern enterprise systems and software engineering.'}
      </div>
      <button 
        onClick={() => { window.location.href = '/'; }}
        className="w-full py-2 border border-brand/30 text-brand font-bold text-sm rounded-xl hover:bg-brand/5 transition-colors"
      >
        View Profile
      </button>
    </div>
  );
};

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------

export const BlogPostDetail: React.FC = () => {
  const { profile } = useProfileStore();
  const { blogs } = useDataStore();
  const { id } = useParams<{ id: string }>();
  
  const initialBlog = blogs.find(b => b.id === id) || null;
  const [blog, setBlog] = useState<Blog | null>(initialBlog);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlog = async () => {
      if (!isConfigured) return;
      try {
        const blogDoc = await getDoc(doc(db, 'blogs', id!));
        if (blogDoc.exists()) {
          const blogData = { id: blogDoc.id, ...blogDoc.data() } as Blog;
          setBlog(blogData);
          
          if (!localStorage.getItem(`viewed_${id}`)) {
            await updateDoc(doc(db, 'blogs', id!), { views: increment(1) });
            localStorage.setItem(`viewed_${id}`, 'true');
          }

          const hasLikedLocal = localStorage.getItem(`liked_${id}`);
          if (hasLikedLocal) setHasLiked(true);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  useEffect(() => {
    // Fetch live related blogs from Firestore
    const fetchRelated = async () => {
      if (!isConfigured) return;
      try {
        const q = query(collection(db, 'blogs'), limit(4));
        const snapshot = await getDocs(q);
        const blogs: Blog[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== id) {
            blogs.push({ id: doc.id, ...doc.data() } as Blog);
          }
        });
        setRelatedBlogs(blogs.slice(0, 3));
      } catch (err) {
        console.error("Error fetching related blogs", err);
      }
    };
    fetchRelated();
  }, [id]);

  const handleLike = async () => {
    if (!blog || hasLiked || isLiking || !isConfigured) return;
    setIsLiking(true);
    try {
      await updateDoc(doc(db, 'blogs', blog.id), { likes: increment(1) });
      setBlog({ ...blog, likes: (blog.likes || 0) + 1 });
      setHasLiked(true);
      localStorage.setItem(`liked_${blog.id}`, 'true');
    } catch (error) {
      console.error("Error liking blog:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showAlert('Success', 'Link copied to clipboard!', 'success');
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !blog || !isConfigured) return;
    
    setIsSubmittingComment(true);
    const newComment: BlogComment = {
      id: Date.now().toString(),
      name: commentName.trim(),
      text: commentText.trim(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    try {
      await updateDoc(doc(db, 'blogs', blog.id), { comments: arrayUnion(newComment) });
      setBlog({ ...blog, comments: [...(blog.comments || []), newComment] });
      setCommentName('');
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!blog) return null;

  const estimatedReadingTime = Math.max(1, Math.ceil((blog.content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200));

  return (
    <Layout onViewCV={() => {}} hideNavigation>
      <SEO 
        title={blog.seoTitle || blog.title}
        description={blog.metaDescription || stripHtmlAndTruncate(blog.content, 160)}
        keywords={blog.keywords}
        image={blog.image}
        type="article"
        schemaType="article"
        datePublished={new Date(blog.date || Date.now()).toISOString()}
        author={blog.author}
        url={`https://alamins20.ami.bd/blog/${blog.id}`}
      />

      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand origin-left z-50"
        style={{ scaleX }}
      />

      {/* --------------------------------------------------- */}
      {/* DESKTOP & MOBILE HERO */}
      {/* --------------------------------------------------- */}
      <div className="w-full pt-4 md:pt-10 mb-8 md:mb-12 max-w-[1200px] mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-theme-dim hover:text-brand font-bold text-[11px] tracking-widest uppercase mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to articles
        </Link>

        {/* Hero Image */}
        <div className="w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-theme-card mb-8 shadow-sm border border-theme-border/50">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        <div className="w-full">
          {/* Desktop Meta Data */}
          <div className="hidden md:flex items-center gap-4 mb-6 text-xs font-bold text-theme-dim uppercase tracking-wide">
            <span className="bg-brand text-white px-3 py-1 rounded">Technology</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {estimatedReadingTime} min read</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {blog.date}</span>
            <span className="text-[#6B21A8] capitalize tracking-normal ml-auto text-sm">By {blog.author}</span>
          </div>

          {/* Mobile Meta Data */}
          <div className="md:hidden flex items-center gap-3 mb-4 text-[11px] font-bold uppercase tracking-widest">
            <span className="bg-brand text-white px-3 py-1 rounded-full">Technology</span>
            <span className="text-theme-dim">•</span>
            <span className="text-theme-dim">{estimatedReadingTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] md:text-[44px] lg:text-[52px] font-serif font-black text-theme-text leading-[1.3] md:leading-[1.1] mb-6 md:mb-8">
            {blog.title}
          </h1>

          {/* Mobile Author Info */}
          <div className="md:hidden flex items-center gap-3 mb-8 border-b border-theme-border pb-6">
            {profile?.image ? (
              <img src={profile?.image} alt={blog.author} className="w-10 h-10 rounded-full object-cover border border-brand/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                {blog.author.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-sm text-theme-text">{blog.author}</div>
              <div className="text-xs text-theme-dim uppercase tracking-widest mt-0.5">{blog.date}</div>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/* MAIN TWO-COLUMN LAYOUT */}
      {/* --------------------------------------------------- */}
      <div className="max-w-[1200px] mx-auto pb-24 md:pb-32 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: Content (70%) */}
        <div className="w-full lg:w-[70%] min-w-0">
          
          {/* Reading Area */}
          <div className="w-full max-w-full overflow-x-hidden">
            <article 
              className="prose prose-lg dark:prose-invert max-w-none font-bengali blog-content text-[15px] md:text-[17px] leading-[1.8] md:leading-[2] text-theme-text/90 whitespace-pre-wrap"

              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Mobile Only: Interaction Bar Inline */}
          <div className="md:hidden flex items-center justify-between border-y border-theme-border py-4 my-10">
            <div className="flex items-center gap-6">
              <button onClick={handleLike} className={`flex items-center gap-1.5 font-bold ${hasLiked ? 'text-brand' : 'text-theme-dim hover:text-theme-text'}`}>
                <Heart size={20} className={hasLiked ? 'fill-current' : ''} />
                <span className="text-sm">{blog.likes || 0}</span>
              </button>
              <a href="#comments" className="flex items-center gap-1.5 font-bold text-theme-dim hover:text-theme-text">
                <MessageSquare size={20} />
                <span className="text-sm">{blog.comments?.length || 0}</span>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={handleShare} className="text-theme-dim hover:text-theme-text"><Share2 size={20} /></button>
              <button className="text-theme-dim hover:text-theme-text"><Bookmark size={20} /></button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-10 md:mb-16 mt-8 md:mt-0">
            <span className="px-4 py-1.5 bg-theme-bg border border-theme-border rounded text-xs font-bold text-theme-dim hover:text-brand cursor-pointer">#Machine Learning</span>
            <span className="px-4 py-1.5 bg-theme-bg border border-theme-border rounded text-xs font-bold text-theme-dim hover:text-brand cursor-pointer">#Web Development</span>
            <span className="px-4 py-1.5 bg-theme-bg border border-theme-border rounded text-xs font-bold text-theme-dim hover:text-brand cursor-pointer">#Future of Tech</span>
          </div>

          {/* Desktop Only: Interaction Bar */}
          <div className="hidden md:flex items-center gap-6 border-y border-theme-border py-6 my-12">
            <button 
              onClick={handleLike}
              disabled={hasLiked || isLiking}
              className={`flex items-center gap-2 px-6 py-2.5 border rounded-lg font-bold transition-all ${hasLiked ? 'border-brand text-brand bg-brand/5' : 'border-theme-border text-theme-dim hover:border-brand hover:text-brand'}`}
            >
              <Heart size={18} className={hasLiked ? 'fill-current' : ''} /> 
              {blog.likes || 0} Likes
            </button>

            <div className="flex items-center gap-3 ml-auto text-theme-dim">
              <span className="text-sm font-bold mr-2">Share ({blog.shares || 0})</span>
              <a onClick={handleShare} className="w-9 h-9 rounded border border-theme-border flex items-center justify-center hover:bg-theme-border transition-colors cursor-pointer"><Facebook size={14} /></a>
              <a onClick={handleShare} className="w-9 h-9 rounded border border-theme-border flex items-center justify-center hover:bg-theme-border transition-colors cursor-pointer"><Twitter size={14} /></a>
              <a onClick={handleShare} className="w-9 h-9 rounded border border-theme-border flex items-center justify-center hover:bg-theme-border transition-colors cursor-pointer"><Share2 size={14} /></a>
            </div>
          </div>

          {/* Mobile Only: Author & Newsletter */}
          <div className="lg:hidden">
            <AuthorCard author={blog.author} isMobile={true} />
            <NewsletterCard isMobile={true} />
          </div>

          {/* Comments Section */}
          <div id="comments" className="bg-theme-bg md:bg-theme-card border border-transparent md:border-theme-border rounded-xl p-0 md:p-8">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">Comments <span className="text-brand">{blog.comments?.length || 0}</span></h3>
            
            <form onSubmit={submitComment} className="mb-10">
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your Name" 
                  className="w-full bg-theme-bg md:bg-theme-bg border border-theme-border rounded p-3 text-base outline-none focus:border-brand"
                  required
                />
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts?" 
                  className="w-full bg-theme-bg md:bg-theme-bg border border-theme-border rounded p-3 text-base min-h-[100px] outline-none focus:border-brand resize-y"
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubmittingComment}
                  className="self-end bg-brand text-white font-bold px-8 py-2.5 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmittingComment ? 'Posting...' : 'Respond'}
                </button>
              </div>
            </form>

            <div className="space-y-8">
              {blog.comments && blog.comments.length > 0 ? (
                <>
                  {blog.comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-theme-border flex items-center justify-center font-bold text-theme-text shrink-0">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-theme-text">{comment.name}</h4>
                          <span className="text-[10px] text-theme-dim font-bold uppercase">{comment.date}</span>
                        </div>
                        <p className="text-theme-text/80 text-sm leading-relaxed mb-2 font-bengali">{comment.text}</p>
                        <button className="text-brand text-xs font-bold uppercase tracking-widest hover:underline">Reply</button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 border border-theme-border rounded text-xs font-bold uppercase tracking-widest text-theme-dim hover:bg-theme-card transition-colors mt-4">
                    Load More Comments
                  </button>
                </>
              ) : (
                <div className="text-center py-8 border border-theme-border/50 rounded-xl">
                  <MessageSquare className="mx-auto text-theme-dim opacity-20 mb-3" size={24} />
                  <p className="text-theme-dim text-sm font-medium">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar (30%) - Desktop Only */}
        <aside className="hidden lg:flex w-[30%] shrink-0 sticky top-24 flex-col gap-8">
          <AuthorCard author={blog.author} />
          <NewsletterCard />
        </aside>
      </div>

      {/* --------------------------------------------------- */}
      {/* RELATED POSTS */}
      {/* --------------------------------------------------- */}
      {relatedBlogs.length > 0 && (
        <div className="bg-theme-bg border-t border-theme-border pt-16 pb-24">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl font-bold text-theme-text">Related Posts</h3>
              <Link to="/blog" className="text-brand text-sm font-bold">View all</Link>
            </div>
            
            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-3 gap-8">
              {relatedBlogs.map(post => (
                <Link to={`/blog/${post.id}`} key={post.id} className="group block">
                  <div className="aspect-video rounded-xl overflow-hidden bg-theme-card mb-4 border border-theme-border/50">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="text-xs text-theme-dim font-bold uppercase tracking-widest mb-2">{post.date}</div>
                  <h3 className="font-bold text-lg text-theme-text group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>

            {/* Mobile: Vertical List */}
            <div className="md:hidden flex flex-col gap-6">
              {relatedBlogs.map(post => (
                <Link to={`/blog/${post.id}`} key={post.id} className="flex gap-4 items-center group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-theme-card border border-theme-border/50 shrink-0">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-[#6B21A8] font-bold uppercase tracking-widest mb-1">Architecture</div>
                    <h3 className="font-bold text-theme-text group-hover:text-brand transition-colors line-clamp-2 leading-tight mb-1 text-sm font-bengali">
                      {post.title}
                    </h3>
                    <div className="text-[10px] text-theme-dim uppercase">{post.date} • 10 min read</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .blog-content h2 { font-size: 1.5rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; color: var(--text-primary); }
        .blog-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--text-primary); }
        .blog-content p { margin-bottom: 1.5rem; color: var(--text-primary); opacity: 0.9; }
        .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content strong { color: var(--text-primary); font-weight: 700; }
        .blog-content pre { 
          background: #111116 !important; 
          border-radius: 0.5rem; 
          padding: 1.5rem; 
          overflow-x: auto; 
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .blog-content code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; color: #e5e5e5; }
        .blog-content p > code { background: rgba(128,128,128,0.1); padding: 0.2em 0.4em; border-radius: 0.25rem; color: var(--accent); }
        @media (max-width: 768px) {
          .blog-content pre { padding: 1rem; border-radius: 0.5rem; font-size: 0.8rem; }
        }
      `}} />
    </Layout>
  );
};
