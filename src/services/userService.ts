import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const createUserDocument = async (user: any, displayName: string, defaultWorkspaceId: string | null = null) => {
  if (!user) return null;
  
  try {
    const { email, uid } = user;
    
    // Check if user exists
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || user.displayName || 'Anonymous User',
        photoURL: user.photoURL || null,
        plan: 'free',
        defaultWorkspaceId: defaultWorkspaceId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return { id: uid };
  } catch (error) {
    console.error('Error creating user document', error);
    throw error;
  }
};

export const getUserDocument = async (uid: string) => {
  if (!uid) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
      
    if (userSnap.exists()) {
      const data = userSnap.data();
      return { 
        id: uid, 
        uid: uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        plan: data.plan,
        defaultWorkspaceId: data.defaultWorkspaceId
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user document', error);
    throw error;
  }
};

export const updateUserDocument = async (uid: string, data: any) => {
  if (!uid) return;
  
  try {
    const updateData: any = { updatedAt: serverTimestamp() };
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
    if (data.defaultWorkspaceId !== undefined) updateData.defaultWorkspaceId = data.defaultWorkspaceId;
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user document', error);
    throw error;
  }
};
