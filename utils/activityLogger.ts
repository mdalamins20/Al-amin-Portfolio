import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ActivityLog } from '../types';

export const logActivity = async (
  action: ActivityLog['action'],
  entityType: ActivityLog['entityType'],
  entityName: string,
  details?: string
) => {
  if (!db) return;
  try {
    await addDoc(collection(db, 'activityLogs'), {
      action,
      entityType,
      entityName,
      details: details || '',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};