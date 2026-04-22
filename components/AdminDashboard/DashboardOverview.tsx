
import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Loader2, Briefcase, Code, BookOpen, MessageSquare, ExternalLink, Plus, Sparkles, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '0', color: 'from-blue-500 to-cyan-400', icon: Briefcase, collection: 'projects', link: '/admin-dashboard/projects' },
    { label: 'Skills Listed', value: '0', color: 'from-purple-500 to-pink-500', icon: Code, collection: 'skills', link: '/admin-dashboard/skills' },
    { label: 'Blog Posts', value: '0', color: 'from-emerald-400 to-teal-500', icon: BookOpen, collection: 'blogs', link: '/admin-dashboard/blogs' },
    { label: 'Reviews', value: '0', color: 'from-amber-400 to-orange-500', icon: MessageSquare, collection: 'reviews', link: '/admin-dashboard/reviews' },
  ]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchStats = async () => {
      if (!isConfigured || !db) {
        setLoading(false);
        return;
      }

      try {
        const updatedStats = await Promise.all(
          stats.map(async (stat) => {
            const coll = collection(db, stat.collection);
            const snapshot = await getCountFromServer(coll);
            return { ...stat, value: snapshot.data().count.toString() };
          })
        );
        setStats(updatedStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-brand rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full mix-blend-screen filter blur-[60px] opacity-40" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
            <Sparkles size={16} className="text-amber-300" />
            <span>AI Studio Engine is running</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {greeting}, Admin!
          </h1>
          <p className="text-slate-300 max-w-xl text-lg leading-relaxed">
            Here's what's happening with your portfolio today. You have {stats[3].value} total reviews and {stats[0].value} active projects.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/admin-dashboard/projects" className="bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Plus size={18} />
              New Project
            </Link>
            <Link to="/admin-dashboard/blogs" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border border-white/10">
              <BookOpen size={18} />
              Write Post
            </Link>
          </div>
        </div>
      </motion.div>

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
            <motion.div key={i} variants={itemVariants}>
              <Link to={stat.link} className="block group">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-3xl transition-all duration-300 hover:shadow-xl dark:hover:shadow-brand/5 hover:border-brand/40 relative overflow-hidden h-full">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[50px] opacity-10 group-hover:opacity-30 transition-opacity duration-500`} />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <Icon size={24} />
                    </div>
                    <ExternalLink size={18} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white group-hover:scale-105 origin-left transition-transform duration-300">{stat.value}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Status / Recent Activity Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Activity className="text-brand" />
              System Status
            </h3>
            <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              All Systems Operational
            </span>
          </div>

          <div className="space-y-6">
            <div className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand/30 transition-colors">
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Last Login</p>
                  <p className="text-sm text-slate-500">Just now from AI Studio Preview</p>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-400">Current Session</div>
            </div>

            <div className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand/30 transition-colors">
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Review System Automated</p>
                  <p className="text-sm text-slate-500">Star ratings activated globally</p>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-400">Recently Updated</div>
            </div>
            
             <div className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand/30 transition-colors">
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">UI Rendering Optimized</p>
                  <p className="text-sm text-slate-500">Hardware acceleration applied to all media</p>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-400">Latest Patch</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Tasks</h3>
          <div className="space-y-4">
            <Link to="/admin-dashboard/profile" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand transition-colors">Update Profile Data</span>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-brand transition-colors" />
            </Link>
             <Link to="/admin-dashboard/reviews" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand transition-colors">Moderate Reviews</span>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-brand transition-colors" />
            </Link>
             <Link to="/admin-dashboard/projects" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand transition-colors">Manage Portfolio</span>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-brand transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
