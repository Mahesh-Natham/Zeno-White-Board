import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { updateUserDocument } from './userService';

export const createDefaultWorkspace = async (userId: string, email: string | null, displayName: string | null) => {
  if (!userId) return null;
  
  const workspaceId = uuidv4();
  
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await setDoc(workspaceRef, {
      id: workspaceId,
      name: `${displayName || 'My'}'s Workspace`,
      ownerId: userId,
      plan: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
      
    // Using a composite ID for membership makes it easier to query, but UUID works too.
    const memberId = uuidv4();
    const memberRef = doc(db, 'workspace_members', memberId);
    await setDoc(memberRef, {
      id: memberId,
      workspaceId: workspaceId,
      userId: userId,
      role: 'owner',
      joinedAt: serverTimestamp()
    });
    
    await updateUserDocument(userId, { defaultWorkspaceId: workspaceId });
    return workspaceId;
  } catch (error) {
    console.error('Error creating default workspace', error);
    throw error;
  }
};

export const getWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return null;
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
      
    if (workspaceSnap.exists()) {
      const data = workspaceSnap.data();
      return {
        id: data.id,
        name: data.name,
        logoURL: data.logoURL,
        ownerId: data.ownerId,
        plan: data.plan,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting workspace', error);
    throw error;
  }
};

export const updateWorkspace = async (workspaceId: string, data: any) => {
  if (!workspaceId) return;
  try {
    const updateData: any = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.logoURL !== undefined) updateData.logoURL = data.logoURL;
    if (data.plan !== undefined) updateData.plan = data.plan;

    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, updateData);
  } catch (error) {
    console.error('Error updating workspace', error);
    throw error;
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return;
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await deleteDoc(workspaceRef);
  } catch (error) {
    console.error('Error deleting workspace', error);
    throw error;
  }
};

export const getMembersListener = (workspaceId: string, callback: (members: any[]) => void) => {
  if (!workspaceId) return () => {};
  
  const q = query(collection(db, 'workspace_members'), where('workspaceId', '==', workspaceId));
  
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const memberPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      
      // Fetch user profile for each member
      const userRef = doc(db, 'users', data.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      
      return {
        id: data.userId, // use userId as the id for frontend maps
        userId: data.userId,
        role: data.role,
        joinedAt: data.joinedAt,
        email: userData?.email,
        displayName: userData?.displayName,
        photoURL: userData?.photoURL
      };
    });
    
    const members = await Promise.all(memberPromises);
    callback(members);
  });
  
  return unsubscribe;
};

export const removeMember = async (workspaceId: string, userId: string) => {
  if (!workspaceId || !userId) return;
  try {
    const q = query(
      collection(db, 'workspace_members'), 
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'workspace_members', docSnap.id));
    }
  } catch (error) {
    console.error('Error removing member', error);
    throw error;
  }
};

export const updateMemberRole = async (workspaceId: string, userId: string, role: string) => {
  if (!workspaceId || !userId || !role) return;
  try {
    const q = query(
      collection(db, 'workspace_members'), 
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, 'workspace_members', docSnap.id), { role });
    }
  } catch (error) {
    console.error('Error updating member role', error);
    throw error;
  }
};

// --- INVITE SYSTEM ---

export const createInviteLink = async (workspaceId: string, role: string) => {
  if (!workspaceId || !role) return null;
  
  const inviteId = uuidv4();
  
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    await setDoc(inviteRef, {
      id: inviteId,
      workspaceId: workspaceId,
      role,
      status: 'pending',
      createdAt: serverTimestamp()
    });
      
    return inviteId;
  } catch (error) {
    console.error('Error creating invite', error);
    throw error;
  }
};

export const acceptInviteLink = async (inviteId: string, user: any) => {
  if (!inviteId || !user || !user.uid) return null;
  
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    
    if (!inviteSnap.exists()) throw new Error('Invite not found');
    
    const inviteData = inviteSnap.data();
    if (inviteData.status !== 'pending') throw new Error('Invite is no longer valid');
    
    // Check if already a member
    const memberQ = query(
      collection(db, 'workspace_members'), 
      where('workspaceId', '==', inviteData.workspaceId),
      where('userId', '==', user.uid)
    );
    const memberSnap = await getDocs(memberQ);
    
    if (memberSnap.empty) {
      // Add user to workspace
      const memberId = uuidv4();
      await setDoc(doc(db, 'workspace_members', memberId), {
        id: memberId,
        workspaceId: inviteData.workspaceId,
        userId: user.uid,
        role: inviteData.role,
        joinedAt: serverTimestamp()
      });
    }
    
    // Invalidate invite
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedBy: user.uid,
      acceptedAt: serverTimestamp()
    });
      
    return inviteData.workspaceId;
  } catch (error) {
    console.error('Error accepting invite', error);
    throw error;
  }
};

export const getInvite = async (inviteId: string) => {
  if (!inviteId) return null;
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    
    if (inviteSnap.exists()) {
      const data = inviteSnap.data();
      return {
        id: data.id,
        workspaceId: data.workspaceId,
        role: data.role,
        status: data.status,
        createdAt: data.createdAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting invite', error);
    throw error;
  }
};
