import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Loader2, Briefcase, BookOpen, MessageSquare, ExternalLink, Plus, Sparkles, Activity, Clock, ArrowRight, Users, Mail, Send, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project } from '../../types';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
}

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '0', color: 'from-blue-500 to-cyan-400', icon: Briefcase, collection: 'projects', link: '/admin-dashboard/projects' },
    { label: 'Blog Posts', value: '0', color: 'from-emerald-400 to-teal-500', icon: BookOpen, collection: 'blogs', link: '/admin-dashboard/blogs' },
    { label: 'Subscribers', value: '0', color: 'from-purple-500 to-pink-500', icon: Users, collection: 'subscribers', link: '/admin-dashboard/subscribers' },
    { label: 'Reviews', value: '0', color: 'from-amber-400 to-orange-500', icon: MessageSquare, collection: 'reviews', link: '/admin-dashboard/reviews' },
  ]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchData = async () => {
      if (!isConfigured || !db) {
        setLoading(false);
        return;
      }

      try {
        // Fetch stats
        const updatedStats = await Promise.all(
          stats.map(async (stat) => {
            const coll = collection(db, stat.collection);
            const snapshot = await getCountFromServer(coll);
            return { ...stat, value: snapshot.data().count.toString() };
          })
        );
        setStats(updatedStats);

        // Fetch recent projects
        const projQ = query(collection(db, 'projects'), orderBy('id', 'desc'), limit(3));
        const projSnapshot = await getDocs(projQ);
        setRecentProjects(projSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Project[]);

        // Fetch recent subscribers
        const subQ = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'), limit(4));
        const subSnapshot = await getDocs(subQ);
        setRecentSubscribers(subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subscriber[]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (ts: any) => {
    if (!ts || !ts.toDate) return 'Just now';
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            {greeting}, <span className="text-brand">Admin!</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full text-brand text-sm font-bold shadow-sm">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={itemVariants} className="h-full">
              <Link to={stat.link} className="block h-full group">
                <div className="bg-surface border border-outline-variant p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:border-brand/40 relative overflow-hidden h-full flex flex-col">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[50px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}/20`}>
                      <Icon size={24} />
                    </div>
                    <ExternalLink size={18} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-brand transition-all" />
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-4xl md:text-5xl font-black text-on-surface group-hover:scale-105 group-hover:text-brand origin-left transition-transform duration-300">{stat.value}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Recent Projects */}
          <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
                <Briefcase className="text-brand" size={20} />
                Recent Projects
              </h3>
              <Link to="/admin-dashboard/projects" className="text-sm font-bold text-brand hover:text-brand-700 flex items-center gap-1 transition-colors bg-brand/10 px-3 py-1.5 rounded-full hover:bg-brand/20">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project, idx) => (
                  <div key={project.id || idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-outline-variant hover:border-brand/30 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                        {project.image ? (
                          <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <Briefcase size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface line-clamp-1 group-hover:text-brand transition-colors">{project.title}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-1">ID: {project.id}</p>
                      </div>
                    </div>
                    <Link to="/admin-dashboard/projects" className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:shadow-md border border-outline-variant transition-all shrink-0">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">No recent projects.</div>
              )}
            </div>
          </div>

          {/* Recent Subscribers */}
          <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
                <Users className="text-brand" size={20} />
                Newest Subscribers
              </h3>
              <Link to="/admin-dashboard/subscribers" className="text-sm font-bold text-brand hover:text-brand-700 flex items-center gap-1 transition-colors bg-brand/10 px-3 py-1.5 rounded-full hover:bg-brand/20">
                Manage <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentSubscribers.length > 0 ? (
                recentSubscribers.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-outline-variant">
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-on-surface truncate">{sub.email}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(sub.subscribedAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-slate-400">No subscribers yet.</div>
              )}
            </div>
          </div>

        </motion.div>

        {/* Right Column: Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <Sparkles className="text-brand" size={20} />
              Quick Actions
            </h3>
            
            <div className="space-y-4">
              <Link 
                to="/admin-dashboard/blogs" 
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-brand to-purple-600 text-white hover:shadow-lg hover:shadow-brand/20 transition-all hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <Plus size={20} />
                </div>
                <div>
                  <p className="font-bold">Write Blog Post</p>
                  <p className="text-xs text-white/80">Publish a new article</p>
                </div>
              </Link>

              <Link 
                to="/admin-dashboard/subscribers" 
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant hover:border-brand/40 text-on-surface transition-all group hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Send size={20} />
                </div>
                <div>
                  <p className="font-bold group-hover:text-brand transition-colors">Broadcast Email</p>
                  <p className="text-xs text-on-surface-variant">Send a newsletter</p>
                </div>
              </Link>

              <Link 
                to="/admin-dashboard/projects" 
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant hover:border-brand/40 text-on-surface transition-all group hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-bold group-hover:text-brand transition-colors">Add Project</p>
                  <p className="text-xs text-on-surface-variant">Upload new work</p>
                </div>
              </Link>

              <Link 
                to="/admin-dashboard/reviews" 
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant hover:border-brand/40 text-on-surface transition-all group hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <p className="font-bold group-hover:text-brand transition-colors">Moderate Reviews</p>
                  <p className="text-xs text-on-surface-variant">Approve or reject</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 border border-green-500/20">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Last login</p>
                <p className="text-xs text-on-surface-variant font-medium">Just now, this session</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
