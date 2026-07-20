import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, isConfigured } from '../firebase';

export const VisitorLog: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisitor = async () => {
      // If Firebase is not configured, we shouldn't attempt tracking
      if (!isConfigured || !db) return;

      try {
        // Only run once per session (if needed) or per page visit.
        // The user wants it to update on page change. We will use session storage to keep the visit ID same, 
        // but update the last page or just log a new page view. For simplicity, we'll follow their snippet exactly:
        // but it's better to store a persistent ID in session storage to track the same user.
        
        let visitId = sessionStorage.getItem('visit_id');
        if (!visitId) {
          visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('visit_id', visitId);
        }

        // 1. IP & Location data
        // For performance, maybe we shouldn't fetch IP on EVERY route change if we already have it.
        // Let's cache it in session storage.
        let ipData = JSON.parse(sessionStorage.getItem('ip_data') || 'null');
        
        if (!ipData) {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            ipData = await res.json();
            sessionStorage.setItem('ip_data', JSON.stringify(ipData));
          }
        }

        // 2. Device Detection
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        // 3. Push to Firebase
        // We will log each page visit as an array or just update the current document for this session
        await setDoc(doc(db, 'analytics', visitId), {
          ip: ipData?.ip || 'Unknown',
          city: ipData?.city || 'Unknown',
          country: ipData?.country_name || 'Unknown',
          isp: ipData?.org || 'Unknown',
          device: isMobile ? 'Mobile' : 'Desktop',
          lastPageVisited: location.pathname,
          lastActive: new Date().toISOString(),
          // Don't overwrite entry time if it already exists
        }, { merge: true });

      } catch (error) {
        console.log('Adblocker might have blocked tracking or network error occurred.');
      }
    };
    
    trackVisitor();
  }, [location.pathname]);

  return null;
};
