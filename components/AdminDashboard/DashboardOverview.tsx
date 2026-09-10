
import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
  Loader2, Briefcase, BookOpen, MessageSquare, ExternalLink, Plus, Sparkles, Clock,
  ArrowRight, Users, Mail, Send, CheckSquare, TrendingUp, Globe, Shield,
  BarChart2, Zap, Star, Eye, Activity, Code2, Award, Cpu, Wifi, Bell,
  FileText, Image, Video, GitBranch, Heart, Target, Layers, Settings,
  ChevronRight, Package, Database, CheckCircle, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project, Blog } from '../../types';

interface Subscriber { id: string; email: string; subscribedAt: any; }
interface DashStat {
  label: string; value: string; sublabel: string; trend: string; trendUp: boolean;
  color: string; bgColor: string; icon: any; link: string;
}

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashStat[]>([
    { label: 'Total Projects', value: '0', sublabel: 'In portfolio', trend: '+2 this month', trendUp: true, color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20', icon: Briefcase, link: '/admin-dashboard/projects' },
    { label: 'Blog Posts', value: '0', sublabel: 'Published', trend: '+1 this week', trendUp: true, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20', icon: BookOpen, link: '/admin-dashboard/blogs' },
    { label: 'Subscribers', value: '0', sublabel: 'Newsletter', trend: 'Growing', trendUp: true, color: 'text-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/20', icon: Users, link: '/admin-dashboard/subscribers' },
    { label: 'Reviews', value: '0', sublabel: 'Client feedback', trend: 'Pending', trendUp: false, color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20', icon: MessageSquare, link: '/admin-dashboard/reviews' },
    { label: 'Skills', value: '0', sublabel: 'Tech stack', trend: 'Up to date', trendUp: true, color: 'text-pink-500', bgColor: 'bg-pink-500/10 border-pink-500/20', icon: Code2, link: '/admin-dashboard/skills' },
    { label: 'Experience', value: '0', sublabel: 'Work history', trend: 'Active', trendUp: true, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10 border-cyan-500/20', icon: Award, link: '/admin-dashboard/experience' },
  ]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchData = async () => {
      if (!isConfigured || !db) { setLoading(false); return; }
      try {
        const collections = ['projects', 'blogs', 'subscribers', 'reviews', 'skills', 'experiences'];
        const counts = await Promise.all(collections.map(c => getCountFromServer(collection(db, c))));
        
        setStats(prev => prev.map((s, i) => ({
          ...s, value: counts[i].data().count.toString()
        })));

        const [projSnap, subSnap, blogSnap, revSnap] = await Promise.all([
          getDocs(query(collection(db, 'projects'), orderBy('id', 'desc'), limit(3))),
          getDocs(query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'), limit(4))),
          getDocs(query(collection(db, 'blogs'), orderBy('date', 'desc'), limit(3))),
          getDocs(collection(db, 'reviews')),
        ]);

        setRecentProjects(projSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Project[]);
        setRecentSubscribers(subSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Subscriber[]);
        setRecentBlogs(blogSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Blog[]);
        setPendingReviews(revSnap.docs.filter(d => !d.data().isApproved).length);

      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'Just now';
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDateFull = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BarChart2 size={20} className="text-primary animate-pulse" />
        </div>
      </div>
      <p className="text-on-surface-variant text-sm font-medium animate-pulse">Loading dashboard...</p>
    </div>
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const systemInfo = [
    { icon: Globe, label: 'Site Status', value: 'Live & Online', color: 'text-emerald-500', dot: 'bg-emerald-500' },
    { icon: Shield, label: 'Security', value: 'Protected', color: 'text-blue-500', dot: 'bg-blue-500' },
    { icon: Cpu, label: 'Performance', value: '98 / 100', color: 'text-purple-500', dot: 'bg-purple-500' },
    { icon: Database, label: 'Firebase', value: 'Connected', color: 'text-orange-500', dot: 'bg-orange-500' },
  ];

  const quickLinks = [
    { to: '/admin-dashboard/blogs', icon: Plus, label: 'New Blog Post', sub: 'Publish an article', color: 'bg-primary', text: 'text-white', shadow: 'shadow-primary/25' },
    { to: '/admin-dashboard/projects', icon: Briefcase, label: 'Add Project', sub: 'Showcase new work', color: 'bg-surface-variant/50 border border-outline-variant', text: 'text-on-surface', shadow: '', accent: 'text-blue-500', iconBg: 'bg-blue-500/10 border-blue-500/20' },
    { to: '/admin-dashboard/subscribers', icon: Send, label: 'Broadcast Email', sub: 'Send newsletter', color: 'bg-surface-variant/50 border border-outline-variant', text: 'text-on-surface', shadow: '', accent: 'text-purple-500', iconBg: 'bg-purple-500/10 border-purple-500/20' },
    { to: '/admin-dashboard/reviews', icon: CheckSquare, label: 'Moderate Reviews', sub: `${pendingReviews} pending approval`, color: 'bg-surface-variant/50 border border-outline-variant', text: 'text-on-surface', shadow: '', accent: 'text-amber-500', iconBg: 'bg-amber-500/10 border-amber-500/20' },
    { to: '/admin-dashboard/skills', icon: Code2, label: 'Manage Skills', sub: 'Update tech stack', color: 'bg-surface-variant/50 border border-outline-variant', text: 'text-on-surface', shadow: '', accent: 'text-pink-500', iconBg: 'bg-pink-500/10 border-pink-500/20' },
    { to: '/admin-dashboard/experience', icon: Award, label: 'Add Experience', sub: 'Work history', color: 'bg-surface-variant/50 border border-outline-variant', text: 'text-on-surface', shadow: '', accent: 'text-cyan-500', iconBg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Hero Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 md:p-8 overflow-hidden shadow-sm"
      >
        {/* Background gradient orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">
                {greeting}, <span className="text-primary">Sir!</span> 👋
              </h1>
              <p className="text-on-surface-variant font-medium text-sm mt-1">
                {formatDateFull(currentTime)} · {formatTime(currentTime)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>
            {pendingReviews > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
                <Bell size={12} />
                {pendingReviews} Pending Review{pendingReviews > 1 ? 's' : ''}
              </div>
            )}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
            >
              <Eye size={12} /> View Site
            </Link>
          </div>
        </div>

        {/* Mini stat bar */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/50">
          {[
            { icon: Package, label: 'Total Content', value: `${stats.reduce((a, s) => a + parseInt(s.value || '0'), 0)} items` },
            { icon: Target, label: 'Portfolio Reach', value: 'Global' },
            { icon: Heart, label: 'Client Satisfaction', value: '100%' },
            { icon: Zap, label: 'Site Speed', value: 'Optimized' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <item.icon size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-black text-on-surface">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Stats Grid (6 cards) ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Link to={stat.link} className="block group">
                <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:scale-[1.02] relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl rounded-full bg-primary pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} border flex items-center justify-center ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                    <ExternalLink size={13} className="text-on-surface-variant opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                  </div>

                  <p className="text-3xl font-black text-on-surface group-hover:text-primary transition-colors duration-300">{stat.value}</p>
                  <p className="text-xs font-bold text-on-surface-variant mt-1 uppercase tracking-wider">{stat.label}</p>
                  
                  <div className={`flex items-center gap-1 mt-3 text-[10px] font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <TrendingUp size={10} className={stat.trendUp ? '' : 'rotate-180'} />
                    {stat.trend}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Main 3-column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left (col-span-2) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Recent Projects */}
          <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Briefcase size={16} className="text-blue-500" />
                </div>
                Recent Projects
              </h3>
              <Link to="/admin-dashboard/projects" className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1 bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? recentProjects.map((project, idx) => (
                <div key={project.id || idx} className="group flex items-center justify-between p-4 rounded-2xl bg-surface-variant/20 border border-outline-variant hover:border-primary/30 transition-all hover:shadow-md hover:bg-surface-variant/40">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                      {project.image ? (
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Image size={20} className="text-on-surface-variant" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{project.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">
                          {(project as any).category || 'Project'}
                        </span>
                        {project.link && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link to="/admin-dashboard/projects" className="w-8 h-8 rounded-xl bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary/40 transition-all shrink-0 ml-3 hover:shadow-md">
                    <ExternalLink size={14} />
                  </Link>
                </div>
              )) : (
                <div className="text-center py-10 text-on-surface-variant text-sm flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-variant/50 flex items-center justify-center">
                    <Briefcase size={24} className="text-on-surface-variant/50" />
                  </div>
                  No recent projects. <Link to="/admin-dashboard/projects" className="text-primary font-bold hover:underline">Add one!</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Blogs */}
          <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileText size={16} className="text-emerald-500" />
                </div>
                Latest Blog Posts
              </h3>
              <Link to="/admin-dashboard/blogs" className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1 bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentBlogs.length > 0 ? recentBlogs.map((blog, idx) => (
                <div key={blog.id || idx} className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-variant/20 border border-outline-variant hover:border-primary/30 transition-all hover:shadow-md hover:bg-surface-variant/40">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-outline-variant overflow-hidden shrink-0">
                    {(blog as any).image ? (
                      <img src={(blog as any).image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={18} className="text-on-surface-variant" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{blog.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1">
                        <Clock size={10} /> {(blog as any).date || 'No date'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1">
                        <Users size={10} /> {(blog as any).author || 'Author'}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary/40 transition-all shrink-0">
                    <ChevronRight size={14} />
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-on-surface-variant text-sm flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-variant/50 flex items-center justify-center">
                    <BookOpen size={24} className="text-on-surface-variant/50" />
                  </div>
                  No blog posts yet. <Link to="/admin-dashboard/blogs" className="text-primary font-bold hover:underline">Write one!</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Subscribers */}
          <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Users size={16} className="text-purple-500" />
                </div>
                Newest Subscribers
              </h3>
              <Link to="/admin-dashboard/subscribers" className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1 bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all">
                Manage <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentSubscribers.length > 0 ? recentSubscribers.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-variant/20 border border-outline-variant hover:border-purple-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20 font-black text-sm">
                    {sub.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-on-surface truncate">{sub.email}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {formatDate(sub.subscribedAt)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-6 text-on-surface-variant text-sm">No subscribers yet.</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap size={15} className="text-primary" />
              </div>
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <Link
                  key={i}
                  to={link.to}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl ${link.color} ${link.shadow ? `shadow-lg ${link.shadow}` : ''} hover:scale-[1.02] active:scale-95 transition-all group`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-white/20 backdrop-blur-sm' : `${link.iconBg} border`}`}>
                    <link.icon size={16} className={i === 0 ? 'text-white' : link.accent} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${link.text} ${i !== 0 ? 'group-hover:text-primary transition-colors' : ''}`}>{link.label}</p>
                    <p className={`text-[11px] ${i === 0 ? 'text-white/80' : 'text-on-surface-variant'}`}>{link.sub}</p>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 ${i === 0 ? 'text-white/60' : 'text-on-surface-variant opacity-0 group-hover:opacity-100'} transition-all`} />
                </Link>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Activity size={15} className="text-emerald-500" />
              </div>
              System Health
            </h3>
            <div className="space-y-3">
              {systemInfo.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-variant/20 border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                      <item.icon size={14} className={item.color} />
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
                    <span className={`text-xs font-black ${item.color}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Overview Card */}
          <div className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Layers size={15} className="text-cyan-500" />
              </div>
              Portfolio Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Projects', value: stats[0].value, max: 20, color: 'bg-blue-500', icon: Briefcase },
                { label: 'Blogs', value: stats[1].value, max: 20, color: 'bg-emerald-500', icon: BookOpen },
                { label: 'Skills', value: stats[4].value, max: 30, color: 'bg-pink-500', icon: Code2 },
                { label: 'Reviews', value: stats[3].value, max: 20, color: 'bg-amber-500', icon: Star },
              ].map((item, i) => {
                const pct = Math.min((parseInt(item.value) / item.max) * 100, 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <item.icon size={12} className="text-on-surface-variant" />
                        <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                      </div>
                      <span className="text-xs font-black text-on-surface">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Tools quick links */}
            <div className="mt-5 pt-5 border-t border-outline-variant space-y-2">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Admin Tools</p>
              {[
                { to: '/admin-dashboard/analytics', icon: BarChart2, label: 'Visitor Analytics', color: 'text-blue-500' },
                { to: '/admin-dashboard/sessions', icon: Shield, label: 'Active Sessions', color: 'text-emerald-500' },
                { to: '/admin-dashboard/profile', icon: Settings, label: 'Profile Settings', color: 'text-purple-500' },
              ].map((item, i) => (
                <Link key={i} to={item.to} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-variant/40 transition-colors group">
                  <item.icon size={14} className={item.color} />
                  <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{item.label}</span>
                  <ChevronRight size={12} className="ml-auto text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20">
                <GitBranch size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-on-surface">Admin Session</p>
                <p className="text-xs text-on-surface-variant">Currently active</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: CheckCircle, label: 'Status', value: 'Logged In', color: 'text-emerald-500' },
                { icon: Clock, label: 'Time', value: formatTime(currentTime), color: 'text-blue-500' },
                { icon: Wifi, label: 'Connection', value: 'Secure', color: 'text-purple-500' },
                { icon: AlertCircle, label: 'Alerts', value: pendingReviews > 0 ? `${pendingReviews} new` : 'None', color: pendingReviews > 0 ? 'text-amber-500' : 'text-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-surface/50 rounded-xl border border-outline-variant/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon size={11} className={item.color} />
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className={`text-xs font-black ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
