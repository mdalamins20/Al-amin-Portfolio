
import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Loader2, Briefcase, Code, BookOpen, MessageSquare } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '0', color: 'bg-blue-500', icon: Briefcase, collection: 'projects' },
    { label: 'Skills Listed', value: '0', color: 'bg-purple-500', icon: Code, collection: 'skills' },
    { label: 'Blog Posts', value: '0', color: 'bg-emerald-500', icon: BookOpen, collection: 'blogs' },
    { label: 'Pending Reviews', value: '0', color: 'bg-amber-500', icon: MessageSquare, collection: 'reviews' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-text">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-theme-card border border-theme-border p-6 rounded-2xl group hover:border-brand/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 text-theme-text`}>
                  <Icon size={24} className="text-current" />
                </div>
              </div>
              <p className="text-theme-dim text-sm font-medium uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-bold text-theme-text mt-2">{stat.value}</p>
              <div className={`h-1 w-12 ${stat.color} rounded-full mt-4 group-hover:w-full transition-all duration-500`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
