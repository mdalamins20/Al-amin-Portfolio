import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Loader2, Briefcase, Code, BookOpen, MessageSquare, ExternalLink, Plus, Sparkles, Activity, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project } from '../../types';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '0', color: 'from-blue-500 to-cyan-400', icon: Briefcase, collection: 'projects', link: '/admin-dashboard/projects' },
    { label: 'Skills Listed', value: '0', color: 'from-purple-500 to-pink-500', icon: Code, collection: 'skills', link: '/admin-dashboard/skills' },
    { label: 'Blog Posts', value: '0', color: 'from-emerald-400 to-teal-500', icon: BookOpen, collection: 'blogs', link: '/admin-dashboard/blogs' },
    { label: 'Reviews', value: '0', color: 'from-amber-400 to-orange-500', icon: MessageSquare, collection: 'reviews', link: '/admin-dashboard/reviews' },
  ]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

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
        const q = query(collection(db, 'projects'), orderBy('id', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Project[];
        setRecentProjects(projectsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        className="relative overflow-hidden rounded-3xl bg-surface border border-outline-variant p-8 md:p-12 shadow-sm"
      >
        <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-brand rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-30 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] opacity-20 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-variant border border-outline-variant text-sm font-bold text-brand mb-6 shadow-sm">
            <Sparkles size={16} />
            <span>AI Studio Engine Operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-on-surface">
            {greeting}, Admin!
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed font-medium">
            Here's what's happening with your portfolio today. You have {stats[3].value} total reviews and {stats[0].value} active projects.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/admin-dashboard/projects" className="bg-brand text-white hover:bg-brand-700 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand/20 hover:-translate-y-0.5 active:scale-95">
              <Plus size={18} />
              New Project
            </Link>
            <Link to="/admin-dashboard/blogs" className="bg-surface-variant hover:bg-surface-container-high text-on-surface flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border border-outline-variant hover:-translate-y-0.5 active:scale-95 shadow-sm">
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

      {/* Recent Activity & Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-surface border border-outline-variant rounded-3xl p-8 shadow-sm flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
              <Activity className="text-brand" />
              Recent Projects
            </h3>
            <Link to="/admin-dashboard/projects" className="text-sm font-bold text-brand hover:text-brand-700 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {recentProjects.length > 0 ? (
              recentProjects.map((project, idx) => (
                <div key={project.id || idx} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-surface-variant border border-outline-variant hover:border-brand/40 transition-colors shadow-sm">
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-outline-variant flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {project.image ? (
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Briefcase size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface line-clamp-1 group-hover:text-brand transition-colors">{project.title}</p>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {project.techStack?.slice(0, 2).map((tech, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link to="/admin-dashboard/projects" className="text-sm font-bold text-slate-400 group-hover:text-brand transition-colors flex items-center gap-1 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant shadow-sm w-fit self-start md:self-auto">
                    Edit <ExternalLink size={14} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-on-surface-variant font-medium">No recent projects found.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface border border-outline-variant rounded-3xl p-8 shadow-sm flex flex-col h-full"
        >
          <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <Sparkles className="text-brand" size={20} />
            Quick Tasks
          </h3>
          <div className="space-y-4 flex-1">
            <Link to="/admin-dashboard/profile" className="flex items-center justify-between p-4 rounded-2xl bg-surface-variant border border-outline-variant hover:border-brand/40 group transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <span className="font-bold text-on-surface group-hover:text-brand transition-colors">Update Profile</span>
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:scale-110 transition-all border border-outline-variant">
                 <ArrowRight size={14} />
              </div>
            </Link>
             <Link to="/admin-dashboard/reviews" className="flex items-center justify-between p-4 rounded-2xl bg-surface-variant border border-outline-variant hover:border-brand/40 group transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <span className="font-bold text-on-surface group-hover:text-brand transition-colors">Moderate Reviews</span>
               <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:scale-110 transition-all border border-outline-variant">
                 <ArrowRight size={14} />
              </div>
            </Link>
             <Link to="/admin-dashboard/skills" className="flex items-center justify-between p-4 rounded-2xl bg-surface-variant border border-outline-variant hover:border-brand/40 group transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <span className="font-bold text-on-surface group-hover:text-brand transition-colors">Add New Skill</span>
               <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:scale-110 transition-all border border-outline-variant">
                 <ArrowRight size={14} />
              </div>
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-outline-variant">
            <div className="flex items-center gap-3">
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
