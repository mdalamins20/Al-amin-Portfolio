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
    onAuthStateChanged(auth, async (user) => {
      if (user && user.uid !== 'RG2hfNJffGg0KGhBGMwJkVJAszw2') {
        // Unauthorized user, sign them out immediately
        await auth.signOut();
        set({ user: null, loading: false });
      } else {
        set({ user, loading: false });
      }
    });
  }
}));
