import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { createUserDocument } from './userService';
import { createDefaultWorkspace } from './workspaceService';
import toast from 'react-hot-toast';

const handleAuthError = (error: any) => {
  let message = error.message || 'An authentication error occurred';
  if (error.code === 'auth/email-already-in-use') message = 'This email is already registered';
  if (error.code === 'auth/invalid-credential') message = 'Invalid email or password';
  if (error.code === 'auth/popup-closed-by-user') message = 'Google sign in was cancelled';
  
  toast.error(message);
  throw error;
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    toast.success('Logged in successfully');
    return userCredential.user;
  } catch (error) {
    handleAuthError(error);
  }
};

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the profile with display name
    await updateProfile(user, { displayName });
    
    // Create database records
    await createUserDocument(user, displayName);
    await createDefaultWorkspace(user.uid, user.email || '', displayName);
    
    toast.success('Account created successfully');
    return user;
  } catch (error) {
    handleAuthError(error);
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // The user document creation for new Google users will be handled by a hook or auth listener
    // or we can check if it's their first time. For now we will return the user.
    return user;
  } catch (error) {
    handleAuthError(error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    toast.success('Logged out successfully');
  } catch (error) {
    toast.error('Failed to log out');
    console.error(error);
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent');
  } catch (error) {
    handleAuthError(error);
  }
};
