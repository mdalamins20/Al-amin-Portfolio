import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isConfigured } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import * as OTPAuth from 'otpauth';

const getLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    }
  });
};

export const useAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // We store the location locally to avoid fetching again after 2FA
  const [sessionDataCache, setSessionDataCache] = useState<any>(null);

  const fetchSessionData = async () => {
    let latitude = 0;
    let longitude = 0;
    try {
      const position = await getLocation();
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (locError: any) {
      console.warn('Location access denied or failed.', locError);
      if (locError instanceof Error && locError.message === "Geolocation is not supported by your browser") {
        throw new Error("Your browser does not support location services. Please use a modern browser.");
      }
      
      // Handle specific GeolocationPositionError codes
      if (locError && locError.code !== undefined) {
        switch(locError.code) {
          case 1: // PERMISSION_DENIED
            throw new Error("Location permission denied. You MUST allow location access in your browser settings to log in to the admin panel.");
          case 2: // POSITION_UNAVAILABLE
            throw new Error("Location unavailable. Please ensure your device's OS-level Location Services are turned ON (e.g. Windows Settings -> Privacy -> Location).");
          case 3: // TIMEOUT
            throw new Error("Location request timed out. Please check your internet connection and try again.");
          default:
            throw new Error("Failed to get location. Location access is strictly required for admin login.");
        }
      }
      throw new Error("Location access is strictly required for security reasons. Please enable it.");
    }
    
    let ip = "Unknown IP";
    let isp = "Unknown ISP";
    let locationString = "Unknown Location";
    
    // Fetch IP (Reliable fallback)
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        ip = ipData.ip || ip;
      }
    } catch (e) {
      console.error("IP fetch failed");
    }

    // Fetch ISP info using ipwhois (Reliable HTTPS free API)
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        ip = data.ip || ip;
        isp = data.connection?.isp || data.connection?.org || isp;
      }
    } catch (e) {
      console.error("ISP fetch failed", e);
    }
    
    // Reverse geocoding for EXACT address (Street, Suburb, City)
    let mapLink = '';
    if (latitude !== 0 && longitude !== 0) {
      mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          // Use the full detailed display name for exact location
          locationString = geoData.display_name || locationString;
        }
      } catch (e) {
        console.error("Nominatim Reverse geocoding failed", e);
        // Fallback to bigdatacloud if nominatim is blocked
        try {
          const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            const city = bdcData.city || bdcData.locality || '';
            const state = bdcData.principalSubdivision || '';
            const country = bdcData.countryName || '';
            locationString = [city, state, country].filter(Boolean).join(', ') || locationString;
          }
        } catch (err) {}
      }
    }

    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    let deviceName = "Desktop Device";
    
    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    
    if (ua.indexOf("Win") > -1) { os = "Windows"; deviceName = "Windows PC"; }
    else if (ua.indexOf("Mac") > -1) { os = "MacOS"; deviceName = "Mac"; }
    else if (ua.indexOf("Linux") > -1) { os = "Linux"; deviceName = "Linux PC"; }
    else if (ua.indexOf("Android") > -1) { 
      os = "Android"; 
      const match = ua.match(/Android.*?; (.*?) Build/);
      deviceName = match ? match[1] : "Android Mobile";
    }
    else if (ua.indexOf("like Mac") > -1) {
      os = "iOS";
      if (ua.indexOf("iPhone") > -1) deviceName = "iPhone";
      else if (ua.indexOf("iPad") > -1) deviceName = "iPad";
      else deviceName = "iOS Device";
    }

    return {
      ip,
      isp,
      exactLocation: locationString,
      mapLink,
      coordinates: { lat: latitude, lng: longitude },
      deviceName,
      browser,
      os,
      isMobile: /Mobile|Android|iP(hone|od|ad)/i.test(ua)
    };
  };

  const createSessionAndRedirect = async (cacheData: any) => {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      
      const safeData = cacheData || {
        ip: "Unknown IP",
        isp: "Unknown ISP",
        exactLocation: "Unknown Location",
        deviceName: "Unknown Device",
        browser: "Unknown Browser",
        os: "Unknown OS",
        isMobile: false
      };
      
      await setDoc(doc(db, 'admin_sessions', sessionId), {
        sessionId,
        ...safeData,
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isActive: true
      });

      localStorage.setItem('adminSessionId', sessionId);
      import('../stores/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().startSessionListener(sessionId);
      });
    } catch (e: any) {
      console.warn("Failed to create admin session record in Firestore, but proceeding with local session.", e);
      // We proceed anyway to prevent the user from being completely locked out
      localStorage.setItem('adminSessionId', sessionId);
      import('../stores/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().startSessionListener(sessionId);
      });
    }
    
    navigate('/admin-dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || !auth) {
      setError('Firebase is not configured. Please set your environment variables.');
      return;
    }
    
    if (email.toLowerCase() !== 'mdalaminkhalifa2002@gmail.com') {
      setError('You are not authorized to access this admin panel.');
      return;
    }

    setError('');
    setLoading(true);
    localStorage.removeItem('adminSessionId'); // Clear any stale session before starting flow

    try {
      // 1. Fetch Location and Device Data (Enforce location permission)
      let cacheData;
      try {
        cacheData = await fetchSessionData();
        setSessionDataCache(cacheData);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // 2. Authenticate with Email & Password
      await signInWithEmailAndPassword(auth, email, password);
      
      // 3. Check 2FA Status
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      const securityDoc = await getDoc(doc(db, 'settings', 'security'));
      
      if (securityDoc.exists() && securityDoc.data().is2FAEnabled && securityDoc.data().totpSecret) {
        // 2FA is enabled
        setTotpSecret(securityDoc.data().totpSecret);
        setRequires2FA(true);
        setLoading(false);
        return; // Pause here and wait for 2FA code
      } else {
        // No 2FA, proceed to session creation
        await createSessionAndRedirect(cacheData);
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials in Firebase Console.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No admin account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message || 'An error occurred during login.');
      }
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (!totpSecret) throw new Error("Missing TOTP secret");
      
      const totp = new OTPAuth.TOTP({
        issuer: 'Admin Portfolio',
        label: 'Admin',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(totpSecret)
      });

      const delta = totp.validate({ token: totpCode, window: 1 });

      if (delta === null) {
        setError('Invalid 2-step verification code.');
        setLoading(false);
        return;
      }

      // Code is valid, complete login
      await createSessionAndRedirect(sessionDataCache);
    } catch (err) {
      setError('An error occurred while verifying the code.');
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
    requires2FA,
    totpCode,
    setTotpCode,
    handleVerify2FA
  };
};
