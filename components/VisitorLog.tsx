import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
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
          const res = await fetch('https://ipwho.is/');
          if (res.ok) {
            ipData = await res.json();
            if (ipData.success) {
              sessionStorage.setItem('ip_data', JSON.stringify(ipData));
            }
          }
        }

        // 2. Device Detection
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        // 3. Push to Firebase
        const sessionRef = doc(db, 'analytics', visitId);
        const timestamp = new Date().toISOString();
        const pageVisit = { page: location.pathname, timestamp };

        await setDoc(sessionRef, {
          ip: ipData?.ip || 'Unknown',
          city: ipData?.city || 'Unknown',
          country: (ipData?.country || ipData?.country_name) || 'Unknown',
          isp: (ipData?.connection?.org || ipData?.org) || 'Unknown',
          device: isMobile ? 'Mobile' : 'Desktop',
          lastActive: timestamp,
          lastPageVisited: location.pathname,
          history: arrayUnion(pageVisit)
        }, { merge: true });

      } catch (error) {
        console.log('Adblocker might have blocked tracking or network error occurred.');
      }
    };
    // Delay execution to avoid blocking the main thread (improves TBT/TTI)
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => trackVisitor());
    } else {
      setTimeout(trackVisitor, 2000);
    }
  }, [location.pathname]);

  return null;
};
