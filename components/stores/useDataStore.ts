import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Tool, Experience, Review, Blog } from '../../types';

interface DataState {
  projects: Project[];
  skills: Tool[];
  experiences: Experience[];
  testimonials: Review[];
  blogs: Blog[];
  loading: boolean;
  init: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => {
      let isMounted = false;
      return {
        projects: [],
        skills: [],
        experiences: [],
        testimonials: [],
        blogs: [],
        loading: false,
        init: async () => {
          if (isMounted) return; 
          isMounted = true;
          
          const isAdmin = window.location.pathname.startsWith('/admin');

          const fetchFreshData = async () => {
            try {
              const { db, isConfigured } = await import('../../firebase');
              if (!isConfigured || !db) return;
              
              const { collection, onSnapshot, query, orderBy, doc, getDoc } = await import('firebase/firestore');

              // Fetch real-time data for everyone
              onSnapshot(collection(db, 'projects'), (snapshot) => {
                set({ projects: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project)) });
              });

              onSnapshot(query(collection(db, 'skills'), orderBy('name', 'asc')), (snapshot) => {
                set({ skills: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Tool)) });
              });

              onSnapshot(collection(db, 'experiences'), (snapshot) => {
                set({ experiences: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Experience)) });
              });

              onSnapshot(collection(db, 'reviews'), (snapshot) => {
                set({ testimonials: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review)) });
              });

              onSnapshot(query(collection(db, 'blogs'), orderBy('date', 'desc')), (snapshot) => {
                set({ blogs: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Blog)) });
              });
            } catch (e) {
              console.error('Background data fetch failed', e);
            }
          };

          fetchFreshData();
        }
      };
    },
    {
      name: 'portfolio-data-storage',
      partialize: (state) => ({ 
        projects: state.projects,
        skills: state.skills,
        experiences: state.experiences,
        testimonials: state.testimonials,
        blogs: state.blogs,
      }),
    }
  )
);
