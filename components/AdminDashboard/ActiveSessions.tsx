import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { Shield, Monitor, Smartphone, Globe, LogOut, Clock, Activity, MapPin, Wifi } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { logActivity } from '../../utils/activityLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { TwoFactorSetup } from './TwoFactorSetup';

interface AdminSession {
  sessionId: string;
  ip: string;
  isp?: string;
  exactLocation?: string;
  mapLink?: string;
  coordinates?: { lat: number, lng: number };
  deviceName?: string;
  browser: string;
  os: string;
  isMobile: boolean;
  loginTime: string;
  lastActive: string;
  isActive: boolean;
}

import { showConfirm, showAlert } from '../stores/useDialogStore';

export const ActiveSessions: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const currentSessionId = localStorage.getItem('adminSessionId');

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, 'admin_sessions'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as AdminSession[];
      
      // Sort by lastActive (descending)
      data.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
      
      setSessions(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogoutSession = async (sessionId: string) => {
    let confirmed = false;
    
    if (sessionId === currentSessionId) {
      confirmed = await showConfirm(
        "Logout Current Session?",
        "Are you sure you want to log out your current session? You will be logged out immediately."
      );
    } else {
      confirmed = await showConfirm(
        "Logout Device?",
        "Are you sure you want to forcefully log out this device?"
      );
    }
    
    if (!confirmed) return;
    
    try {
      await updateDoc(doc(db, 'admin_sessions', sessionId), {
        isActive: false
      });
      await logActivity('delete', 'session', 'Session', `Terminated session ID: ${sessionId}`);
    } catch (e) {
      console.error("Failed to logout session", e);
      showAlert("Error", "Failed to logout the session.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  if (loading) {
    return <AdminPageLoader icon={Shield} color="text-red-500" bg="bg-red-500/10 border-red-500/20" label="Loading sessions..." />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Shield size={20} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Active Admin Sessions</h1>
        </div>
        <p className="text-text-secondary text-sm font-medium pl-[52px]">Monitor all devices currently logged into the admin panel and remotely log them out if suspicious.</p>
      </div>

      <div className="bg-surface rounded-3xl border border-outline-variant shadow-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-variant/30 flex justify-between items-center">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Activity className="text-brand" size={20} />
            Logged In Devices ({sessions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-outline-variant/50">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-surface-variant/10 ${session.sessionId === currentSessionId ? 'bg-brand/5 border-l-4 border-l-brand' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${session.isMobile ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {session.isMobile ? <Smartphone size={24} /> : <Monitor size={24} />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-on-surface text-lg">
                        {session.deviceName || `${session.os} Device`}
                      </h4>
                      {session.sessionId === currentSessionId && (
                        <span className="bg-brand text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          Current Device
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm font-semibold text-on-surface-variant mb-3">
                      {session.os} • {session.browser}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm font-medium text-on-surface-variant">
                      <div className="flex items-start gap-1.5 col-span-1 md:col-span-2">
                        <MapPin size={14} className="text-brand/80 mt-0.5 flex-shrink-0" />
                        {session.mapLink ? (
                          <a 
                            href={session.mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-on-surface-variant hover:text-primary hover:underline transition-colors"
                            title="Click to view on Google Maps"
                          >
                            {session.exactLocation || "Location unavailable"}
                          </a>
                        ) : (
                          <span className="text-on-surface-variant">
                            {session.exactLocation || "Location unavailable"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wifi size={14} className="text-brand/80" />
                        <span className="truncate max-w-[200px]" title={session.isp || "ISP unknown"}>
                          {session.isp || "ISP unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} />
                        <span className="font-mono text-brand/80">{session.ip}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Last Active: {formatDate(session.lastActive)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Started: {formatDate(session.loginTime)}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleLogoutSession(session.sessionId)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout Device
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {sessions.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              No active sessions found.
            </div>
          )}
        </div>
      </div>
      
      <TwoFactorSetup />
    </div>
  );
};
