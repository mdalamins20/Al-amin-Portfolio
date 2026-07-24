import { create } from 'zustand';
import { db, isConfigured } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
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

export const useDataStore = create<DataState>((set) => {
  let isMounted = false;
  return {
    projects: [],
    skills: [],
    experiences: [],
    testimonials: [],
    blogs: [],
    loading: true,
    init: () => {
      if (isMounted) return; 
      isMounted = true;
      if (!isConfigured || !db) {
        set({ loading: false });
        return;
      }

      const isAdmin = window.location.pathname.startsWith('/admin');

      if (isAdmin) {
        let pendingSources = 5;
        const checkLoaded = () => {
          pendingSources--;
          if (pendingSources <= 0) {
            set({ loading: false });
          }
        };

        onSnapshot(collection(db, 'projects'), (snapshot) => {
          set({ projects: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)) });
          checkLoaded();
        });

        onSnapshot(query(collection(db, 'skills'), orderBy('name', 'asc')), (snapshot) => {
          set({ skills: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool)) });
          checkLoaded();
        });

        onSnapshot(collection(db, 'experiences'), (snapshot) => {
          set({ experiences: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience)) });
          checkLoaded();
        });

        onSnapshot(collection(db, 'reviews'), (snapshot) => {
          set({ testimonials: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)) });
          checkLoaded();
        });

        onSnapshot(query(collection(db, 'blogs'), orderBy('date', 'desc')), (snapshot) => {
          set({ blogs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog)) });
          checkLoaded();
        });
      } else {
        // Public Site: Fetch from Gist (1 Firestore Read)
        const fetchFromGist = async () => {
          try {
            const gistDoc = await getDoc(doc(db, 'settings', 'gist'));
            if (gistDoc.exists() && gistDoc.data().gistId) {
              const gistId = gistDoc.data().gistId;
              const res = await fetch(`https://gist.githubusercontent.com/raw/${gistId}/portfolio_data.json?t=${new Date().getTime()}`);
              if (res.ok) {
                const parsed = await res.json();
                if (parsed) {
                  
                  // Sort skills by name asc
                  const skills = (parsed.skills || []).sort((a: any, b: any) => a.name.localeCompare(b.name));
                  // Sort blogs by date desc
                  const blogs = (parsed.blogs || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                  
                  set({
                    projects: parsed.projects || [],
                    skills: skills,
                    blogs: blogs,
                    experiences: parsed.experiences || [],
                    testimonials: parsed.reviews || [],
                    loading: false
                  });
                }
              }
            }
          } catch (e) {
            console.error("Error fetching from Gist:", e);
          }
          // Fallback if no gist found or error
          set({ loading: false });
        };
        
        fetchFromGist();
      }
    }
  };
});
