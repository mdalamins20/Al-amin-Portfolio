import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '../../types';
import { USER_INFO, ABOUT_ME, STRATEGIC_ABOUT, SOCIAL_LINKS, STATS, SERVICES, PROCESS } from '../../constants';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (newProfile: Profile) => Promise<void>;
  init: () => void;
}

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
  process: PROCESS,
  githubReposCount: "14",
  githubTotalStars: "120",
  githubTotalForks: "35",
  githubTotalContributions: "1,250+"
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      loading: false,
      updateProfile: async (newProfile) => {
        const { db } = await import('../../firebase');
        const { doc, setDoc } = await import('firebase/firestore');
        if (!db) return;
        try {
          await setDoc(doc(db, 'settings', 'profile'), newProfile);
          set({ profile: newProfile });
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },
      init: async () => {
        const isAdmin = window.location.pathname.startsWith('/admin');
        
        const fetchFreshData = async () => {
          try {
            const { isConfigured, db } = await import('../../firebase');
            if (!isConfigured || !db) return;
            const { doc, getDoc, setDoc, onSnapshot } = await import('firebase/firestore');
            
            const docRef = doc(db, 'settings', 'profile');
            
            // Listen for real-time updates for everyone
            onSnapshot(docRef, async (docSnap) => {
              if (docSnap.exists()) {
                set({ profile: docSnap.data() as Profile });
              } else if (isAdmin) {
                // Only initialize default if admin and it doesn't exist
                await setDoc(docRef, defaultProfile);
              }
            });
          } catch (e) {
            console.error('Background fetch failed', e);
          }
        };

        fetchFreshData();
      }
    }),
    {
      name: 'portfolio-profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
