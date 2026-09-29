import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { ActivityLog } from '../../types';
import { AdminPageLoader } from './AdminPageLoader';
import { ClipboardList, PlusCircle, Pencil, Trash2, Layers, Clock } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <PlusCircle size={18} className="text-emerald-500" />;
      case 'update': return <Pencil size={18} className="text-blue-500" />;
      case 'delete': return <Trash2 size={18} className="text-red-500" />;
      case 'bulk_update': return <Layers size={18} className="text-purple-500" />;
      default: return <ClipboardList size={18} className="text-brand" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create': return 'Created';
      case 'update': return 'Updated';
      case 'delete': return 'Deleted';
      case 'bulk_update': return 'Bulk Updated';
      default: return 'Modified';
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'blog': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'profile': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
      case 'skill': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'tool': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'review': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'system': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return <AdminPageLoader icon={ClipboardList} label="Loading activity logs..." color="text-teal-500" bg="bg-teal-500/10 border-teal-500/20" />;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
          <ClipboardList className="text-teal-500" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-on-surface">Activity Logs</h1>
          <p className="text-on-surface-variant font-medium mt-1">Track administrative actions across your portfolio</p>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-3xl p-6 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
            <p className="text-lg text-on-surface-variant">No activity logs found.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-surface-variant shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  {getActionIcon(log.action)}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface border border-outline-variant p-4 rounded-2xl shadow-sm hover:border-brand/40 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${getEntityTypeColor(log.entityType)}`}>
                      {log.entityType}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                      <Clock size={12} />
                      {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                  <h3 className="font-bold text-on-surface text-lg">
                    {getActionText(log.action)} <span className="text-brand">"{log.entityName}"</span>
                  </h3>
                  {log.details && (
                    <p className="text-sm text-on-surface-variant mt-2 bg-surface-variant/50 p-2 rounded-lg border border-outline-variant/50">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
