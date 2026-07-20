
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Defensive check: Ensure API key exists and isn't a placeholder string
const isConfigured = !!firebaseConfig.apiKey && 
                   firebaseConfig.apiKey !== 'undefined' && 
                   firebaseConfig.apiKey.length > 10;

let app;
if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const auth = (isConfigured && app) ? getAuth(app) : null as any;
export const db = (isConfigured && app) ? getFirestore(app) : null as any;
export const storage = (isConfigured && app) ? getStorage(app) : null as any;

// Initialize Analytics if supported
export const analytics = (isConfigured && app) ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export { isConfigured };
