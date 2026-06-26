import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  currentUser: User | null;
  userProfile: any | null; // TODO: Define Profile type
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: any | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  userProfile: null,
  isLoading: true,
  
  setUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  clearUser: () => set({ currentUser: null, userProfile: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useAuthStore;
