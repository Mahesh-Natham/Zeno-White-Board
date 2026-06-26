import { useCallback } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import useAuthStore from '../store/authStore';
import { getUserDocument } from '../services/userService';
import toast from 'react-hot-toast';

export default function useAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  const subscribeToAuth = useCallback(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Map to expected format
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setUser(user as any);
        
        try {
          const profile = await getUserDocument(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        clearUser();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setUserProfile, clearUser, setLoading]);

  return { subscribeToAuth };
}
