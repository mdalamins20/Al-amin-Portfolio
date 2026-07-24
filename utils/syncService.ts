import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { syncToGist } from './githubService';

export const compileAndSyncToGist = async (): Promise<void> => {
  if (!db) return;

  try {
    // 1. Compile all data
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    const projects = projectsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const skillsSnapshot = await getDocs(collection(db, 'skills'));
    const skills = skillsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const blogsSnapshot = await getDocs(collection(db, 'blogs'));
    const blogs = blogsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const experiencesSnapshot = await getDocs(collection(db, 'experiences'));
    const experiences = experiencesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const reviews = reviewsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const profileSnapshot = await getDoc(doc(db, 'settings', 'profile'));
    const profile = profileSnapshot.exists() ? profileSnapshot.data() : null;

    const fullData = {
      projects,
      skills,
      blogs,
      experiences,
      reviews,
      profile,
      lastUpdated: new Date().toISOString()
    };

    // 2. Get existing Gist ID from Firestore
    const gistDocRef = doc(db, 'settings', 'gist');
    const gistDoc = await getDoc(gistDocRef);
    const existingGistId = gistDoc.exists() ? gistDoc.data().gistId : undefined;

    // 3. Sync to Github
    const newGistId = await syncToGist(fullData, existingGistId);

    // 4. Save new Gist ID to Firestore if it changed (or was just created)
    if (newGistId && newGistId !== existingGistId) {
      await setDoc(gistDocRef, { gistId: newGistId }, { merge: true });
    }
    
    console.log('Successfully synced data to GitHub Gist:', newGistId);
  } catch (error) {
    console.error('Error compiling and syncing to Gist:', error);
    // We don't want to break the UI if sync fails, but we should throw or log it
    throw error;
  }
};
