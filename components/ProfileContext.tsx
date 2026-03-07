
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Profile } from '../types';
import { USER_INFO, ABOUT_ME, STRATEGIC_ABOUT, SOCIAL_LINKS, STATS, SERVICES, PROCESS } from '../constants';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (newProfile: Profile) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultProfile: Profile = {
    ...USER_INFO,
    aboutMe: ABOUT_ME,
    ...STRATEGIC_ABOUT,
    socialLinks: SOCIAL_LINKS.map(link => ({
      name: link.name,
      url: link.url,
      iconName: link.name.toLowerCase()
    })),
    stats: STATS,
    services: SERVICES.map(s => ({
      ...s,
      iconName: s.title.toLowerCase().replace(/\s+/g, '-')
    })),
    process: PROCESS
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isConfigured || !db) {
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'settings', 'profile');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as Profile);
        } else {
          // Initialize with default data if not exists in Firestore
          await setDoc(docRef, defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(defaultProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (newProfile: Profile) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'profile'), newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
