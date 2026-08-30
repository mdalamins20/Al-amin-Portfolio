import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => void;
  startSessionListener: (sessionId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  let unsubscribeSession: any = null;

  return {
    user: null,
    loading: true,
    startSessionListener: (sessionId: string) => {
      if (unsubscribeSession) {
        unsubscribeSession();
      }
      import('firebase/firestore').then(({ doc, onSnapshot }) => {
        import('../../firebase').then(({ db }) => {
          unsubscribeSession = onSnapshot(doc(db, 'admin_sessions', sessionId), async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.isActive === false) {
                console.warn("Session remotely terminated");
                localStorage.removeItem('adminSessionId');
                const { auth } = await import('../../firebase');
                if (auth) await auth.signOut();
              } else {
                // Update last active
                const { updateDoc } = require('firebase/firestore');
                try {
                  updateDoc(doc(db, 'admin_sessions', sessionId), { lastActive: new Date().toISOString() }).catch(() => {});
                } catch(e) {}
              }
            } else {
              // Document was deleted
              console.warn("Session record deleted");
              localStorage.removeItem('adminSessionId');
              const { auth } = await import('../../firebase');
              if (auth) await auth.signOut();
            }
          });
        });
      });
    },
    init: async () => {
      const { auth } = await import('../../firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      
      if (!auth) {
        set({ loading: false });
        return;
      }

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          set({ user, loading: false });
          
          // Listen to active session if it exists on load
          const sessionId = localStorage.getItem('adminSessionId');
          if (sessionId) {
            useAuthStore.getState().startSessionListener(sessionId);
          }
        } else {
          if (unsubscribeSession) {
            unsubscribeSession();
            unsubscribeSession = null;
          }
          set({ user: null, loading: false });
        }
      });
    }
  };
});
