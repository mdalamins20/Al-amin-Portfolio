import React, { useEffect, useState } from 'react';
import { db, isConfigured } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { SEO } from './SEO';
import { useProfile } from './ProfileContext';
import { Project, Skill } from '../types';

export const DynamicSEO: React.FC = () => {
  const { profile } = useProfile();
  const [projectKeywords, setProjectKeywords] = useState<string>('');
  const [skillKeywords, setSkillKeywords] = useState<string>('');

  useEffect(() => {
    const fetchDynamicData = async () => {
      if (!isConfigured || !db) return;
      try {
        // Fetch Projects
        const projectsSnapshot = await getDocs(query(collection(db, 'projects')));
        const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);
        const pNames = projects.map(p => p.title).join(', ');
        
        // Fetch Skills
        const skillsSnapshot = await getDocs(query(collection(db, 'skills')));
        const skills = skillsSnapshot.docs.map(doc => doc.data() as Skill);
        const sNames = skills.map(s => s.name).join(', ');

        setProjectKeywords(pNames);
        setSkillKeywords(sNames);
      } catch (error) {
        console.error('Error fetching data for SEO:', error);
      }
    };

    fetchDynamicData();
  }, []);

  const name = profile?.name || 'Muhammad Al-amin';
  const role = profile?.role || 'Digital Solutions Architect';
  const description = profile?.aboutMe?.substring(0, 150) || 'I build highly scalable, fast, and secure web applications.';
  
  const allKeywords = [
    name,
    role,
    'Developer',
    'Portfolio',
    projectKeywords,
    skillKeywords
  ].filter(Boolean).join(', ');

  return (
    <SEO 
      title={`${name} | ${role}`}
      description={description}
      keywords={allKeywords}
      image={profile?.image}
    />
  );
};
