import { create } from 'zustand';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  init: () => {
    if (!auth) {
      set({ loading: false });
      return;
    }
    let unsubscribeSession: any = null;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user, loading: false });
        
        // Listen to active session
        const sessionId = localStorage.getItem('adminSessionId');
        if (sessionId) {
          import('firebase/firestore').then(({ doc, onSnapshot }) => {
            import('../../firebase').then(({ db }) => {
              unsubscribeSession = onSnapshot(doc(db, 'admin_sessions', sessionId), async (snapshot) => {
                if (snapshot.exists()) {
                  const data = snapshot.data();
                  if (data.isActive === false) {
                    console.warn("Session remotely terminated");
                    localStorage.removeItem('adminSessionId');
                    await auth.signOut();
                  } else {
                    // Update last active
                    const { updateDoc } = require('firebase/firestore');
                    try {
                       updateDoc(doc(db, 'admin_sessions', sessionId), { lastActive: new Date().toISOString() }).catch(() => {});
                    } catch(e) {}
                  }
                }
              });
            });
          });
        }
      } else {
        if (unsubscribeSession) {
          unsubscribeSession();
        }
        set({ user: null, loading: false });
      }
    });
  }
}));
