import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, isConfigured } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      profile: null,
      loading: true,
      updateProfile: async (newProfile) => {
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
        if (!isConfigured || !db) {
          set({ profile: defaultProfile, loading: false });
          return;
        }
        
        const isAdmin = window.location.pathname.startsWith('/admin');

        if (isAdmin) {
          try {
            const docRef = doc(db, 'settings', 'profile');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              set({ profile: docSnap.data() as Profile });
            } else {
              await setDoc(docRef, defaultProfile);
              set({ profile: defaultProfile });
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            set({ profile: defaultProfile });
          } finally {
            set({ loading: false });
          }
        } else {
          // Public Site: Stop loading instantly if we have cached profile
          if (get().profile) {
            set({ loading: false });
          }

          // Fetch from Gist (1 Firestore Read)
          try {
            const gistDoc = await getDoc(doc(db, 'settings', 'gist'));
            if (gistDoc.exists() && gistDoc.data().gistId) {
              const gistId = gistDoc.data().gistId;
              const res = await fetch(`https://gist.githubusercontent.com/raw/${gistId}/portfolio_data.json?t=${new Date().getTime()}`);
              if (res.ok) {
                const parsed = await res.json();
                if (parsed && parsed.profile) {
                     set({ profile: parsed.profile, loading: false });
                     return;
                  }
              }
            }
          } catch (e) {
            console.error("Error fetching profile from Gist:", e);
          }
          // Fallback
          set({ profile: defaultProfile, loading: false });
        }
      }
    }),
    {
      name: 'portfolio-profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
