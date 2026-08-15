import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Activity, Users, Globe, MapPin, Monitor, Smartphone, Clock, X, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageVisit {
  page: string;
  timestamp: string;
}

interface VisitLog {
  id: string;
  ip: string;
  city: string;
  country: string;
  isp: string;
  device: string;
  sessionStart?: string;
  lastPageVisited: string;
  lastActive: string;
  history?: PageVisit[];
}

interface GroupedVisitor {
  ip: string;
  city: string;
  country: string;
  isp: string;
  device: string;
  totalSessions: number;
  totalPageViews: number;
  lastActive: string;
  sessions: VisitLog[];
}

const formatDuration = (start: string, end: string) => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} sec`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ${diffSec % 60} sec`;
  return `${Math.floor(diffMin / 60)} hr ${diffMin % 60} min`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
};

export const VisitorAnalytics: React.FC = () => {
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<GroupedVisitor | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'analytics'), orderBy('lastActive', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitLog[];
      setLogs(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const groupedLogs = useMemo(() => {
    const map = new Map<string, GroupedVisitor>();
    logs.forEach(log => {
      const existing = map.get(log.ip);
      if (!existing) {
        map.set(log.ip, {
          ip: log.ip,
          city: log.city,
          country: log.country,
          isp: log.isp,
          device: log.device,
          totalSessions: 1,
          totalPageViews: log.history ? log.history.length : 1,
          lastActive: log.lastActive,
          sessions: [log]
        });
      } else {
        existing.totalSessions += 1;
        existing.totalPageViews += log.history ? log.history.length : 1;
        existing.sessions.push(log);
        // Keep the most recent info
        if (new Date(log.lastActive) > new Date(existing.lastActive)) {
          existing.lastActive = log.lastActive;
          existing.city = log.city;
          existing.country = log.country;
          existing.isp = log.isp;
          existing.device = log.device;
        }
      }
    });
    
    // Sort by lastActive desc
    return Array.from(map.values()).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }, [logs]);

  const uniqueVisitors = groupedLogs.length;
  const desktopUsers = groupedLogs.filter(l => l.device === 'Desktop').length;
  const mobileUsers = groupedLogs.filter(l => l.device === 'Mobile').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysVisits = logs.filter(l => l.lastActive.startsWith(today)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Visitor Analytics</h1>
          <p className="text-on-surface-variant mt-2">Track real-time traffic, unique IPs, and page histories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Sessions</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{logs.length}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Unique IPs</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{uniqueVisitors}</h3>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visits Today</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{todaysVisits}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-lg flex flex-col justify-between"
        >
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Devices (By IP)</p>
          <div className="flex justify-between items-end flex-1">
            <div className="flex flex-col items-center">
              <Monitor size={24} className="text-slate-400 mb-2" />
              <span className="text-2xl font-black text-slate-900 dark:text-white">{desktopUsers}</span>
            </div>
            <div className="flex flex-col items-center">
              <Smartphone size={24} className="text-slate-400 mb-2" />
              <span className="text-2xl font-black text-slate-900 dark:text-white">{mobileUsers}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-surface rounded-3xl border border-outline-variant shadow-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-variant/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="text-brand" size={20} />
            Unique Visitors (Grouped by IP)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/30 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-outline-variant">IP & Location</th>
                <th className="p-4 font-bold border-b border-outline-variant hidden md:table-cell">ISP</th>
                <th className="p-4 font-bold border-b border-outline-variant text-center hidden md:table-cell">Sessions</th>
                <th className="p-4 font-bold border-b border-outline-variant text-center hidden sm:table-cell">Page Views</th>
                <th className="p-4 font-bold border-b border-outline-variant">Last Active</th>
                <th className="p-4 font-bold border-b border-outline-variant"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {groupedLogs.map((log) => (
                <tr 
                  key={log.ip} 
                  onClick={() => setSelectedVisitor(log)}
                  className="border-b border-outline-variant/50 hover:bg-surface-variant/20 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand font-bold">{log.ip}</span>
                        {log.device === 'Mobile' ? (
                          <Smartphone size={14} className="text-slate-400" title="Mobile" />
                        ) : (
                          <Monitor size={14} className="text-slate-400" title="Desktop" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} />
                        {log.city}, {log.country}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 truncate max-w-[150px] text-xs font-semibold hidden md:table-cell">{log.isp}</td>
                  <td className="p-4 text-center hidden md:table-cell">
                    <span className="bg-surface-variant text-on-surface px-2.5 py-1 rounded-lg font-bold text-xs border border-outline-variant">
                      {log.totalSessions}
                    </span>
                  </td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    <span className="bg-brand/10 text-brand px-2.5 py-1 rounded-lg font-bold text-xs border border-brand/20">
                      {log.totalPageViews}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs font-medium">
                    {formatDate(log.lastActive)}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-brand bg-surface-variant/50 hover:bg-brand/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {groupedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No visitor logs found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {createPortal(
        <AnimatePresence>
        {selectedVisitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisitor(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-surface rounded-3xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-variant/30 sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="font-mono text-brand bg-brand/10 px-3 py-1 rounded-lg border border-brand/20">
                      {selectedVisitor.ip}
                    </span>
                    History
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin size={14}/> {selectedVisitor.city}, {selectedVisitor.country}</span>
                    <span className="flex items-center gap-1.5"><Monitor size={14}/> {selectedVisitor.isp}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVisitor(null)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {selectedVisitor.sessions.map((session, index) => {
                  const sessionStart = session.sessionStart || (session.history && session.history.length > 0 ? session.history[0].timestamp : null);
                  const duration = sessionStart 
                    ? formatDuration(sessionStart, session.lastActive)
                    : 'Unknown';
                    
                  return (
                    <div key={session.id} className="bg-surface-variant/20 rounded-2xl border border-outline-variant overflow-hidden">
                      <div className="p-4 border-b border-outline-variant bg-surface-variant/40 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-brand text-white text-xs font-bold px-2 py-1 rounded-md">
                            Session #{selectedVisitor.sessions.length - index}
                          </span>
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {formatDate(sessionStart || session.lastActive)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-outline-variant">
                            <Clock size={14} className="text-brand"/> Duration: {duration}
                          </span>
                          <span className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-outline-variant">
                            {session.device === 'Mobile' ? <Smartphone size={14}/> : <Monitor size={14}/>}
                            {session.device}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                          <Hash size={14}/> Page Views
                        </h4>
                        
                        {session.history && session.history.length > 0 ? (
                          <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-outline-variant ml-2">
                            {session.history.map((visit, vIdx) => (
                              <div key={vIdx} className="relative flex items-center gap-4 pl-8">
                                <div className="absolute left-0 w-[24px] h-[24px] bg-surface rounded-full border-2 border-brand flex items-center justify-center z-10">
                                  <div className="w-2 h-2 bg-brand rounded-full"></div>
                                </div>
                                <div className="flex-1 bg-surface border border-outline-variant rounded-xl p-3 flex justify-between items-center shadow-sm">
                                  <span className="font-mono text-sm text-slate-700 dark:text-slate-200 bg-surface-variant/50 px-2 py-1 rounded-md border border-outline-variant/50">
                                    {visit.page}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    {new Date(visit.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500 italic px-2">
                            No detailed history available for this legacy session. Last page was: <span className="font-mono bg-surface-variant px-1 rounded">{session.lastPageVisited}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};
