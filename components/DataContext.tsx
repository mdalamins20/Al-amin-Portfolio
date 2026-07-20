import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Project, Tool, Experience, Review, Blog } from '../types';
import { PROJECTS, TOOLS, EXPERIENCE, TESTIMONIALS } from '../constants';

interface DataContextType {
  projects: Project[];
  skills: Tool[];
  experiences: Experience[];
  testimonials: Review[];
  blogs: Blog[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Tool[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let pendingSources = 5;

    const checkLoaded = () => {
      pendingSources--;
      if (pendingSources <= 0 && isMounted) {
        setLoading(false);
      }
    };

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (isMounted) {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        checkLoaded();
      }
    });

    const unsubSkills = onSnapshot(query(collection(db, 'skills'), orderBy('name', 'asc')), (snapshot) => {
      if (isMounted) {
        setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool)));
        checkLoaded();
      }
    });

    const unsubExperience = onSnapshot(collection(db, 'experiences'), (snapshot) => {
      if (isMounted) {
        setExperiences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience)));
        checkLoaded();
      }
    });

    const unsubTestimonials = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (isMounted) {
        setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        checkLoaded();
      }
    });

    const unsubBlogs = onSnapshot(query(collection(db, 'blogs'), orderBy('date', 'desc')), (snapshot) => {
      if (isMounted) {
        setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog)));
        checkLoaded();
      }
    });

    return () => {
      isMounted = false;
      unsubProjects();
      unsubSkills();
      unsubExperience();
      unsubTestimonials();
      unsubBlogs();
    };
  }, []);

  return (
    <DataContext.Provider value={{ projects, skills, experiences, testimonials, blogs, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
