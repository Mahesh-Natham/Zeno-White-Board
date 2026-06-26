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
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export const createBoard = async (workspaceId: string, userId: string, title?: string, projectId?: string, templateData?: any) => {
  try {
    const boardId = uuidv4();
    const boardRef = doc(db, 'boards', boardId);
    
    await setDoc(boardRef, {
      id: boardId,
      title: title || 'Untitled Board',
      workspaceId: workspaceId,
      projectId: projectId || null,
      ownerId: userId,
      collaborators: {
        [userId]: 'owner'
      },
      isPublic: false,
      thumbnailUrl: null,
      isDeleted: false,
      isStarred: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      elementCount: 0,
      ...(templateData ? { template: templateData.template } : {})
    });

    return boardId;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

export const getBoardsListener = (workspaceId: string, callback: (boards: any[]) => void) => {
  const q = query(
    collection(db, 'boards'), 
    where('workspaceId', '==', workspaceId)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const boards = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      };
    });
    
    // Sort client-side to avoid needing a Firestore composite index
    boards.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    callback(boards);
  }, (error) => {
    console.error("Error listening to boards:", error);
    callback([]); // Return empty array on error so UI stops loading
  });
  
  return unsubscribe;
};

export const updateBoard = async (boardId: string, data: any) => {
  try {
    const updateData: any = { updatedAt: serverTimestamp() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.elementCount !== undefined) updateData.elementCount = data.elementCount;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.collaborators !== undefined) updateData.collaborators = data.collaborators;
    if (data.isDeleted !== undefined) updateData.isDeleted = data.isDeleted;
    if (data.isStarred !== undefined) updateData.isStarred = data.isStarred;

    const boardRef = doc(db, 'boards', boardId);
    await updateDoc(boardRef, updateData);
  } catch (error) {
    console.error('Error updating board:', error);
    throw error;
  }
};

export const softDeleteBoard = async (boardId: string) => {
  return updateBoard(boardId, { isDeleted: true });
};

export const restoreBoard = async (boardId: string) => {
  return updateBoard(boardId, { isDeleted: false });
};

export const toggleStarBoard = async (boardId: string, currentStarredStatus: boolean) => {
  return updateBoard(boardId, { isStarred: !currentStarredStatus });
};

export const deleteBoard = async (boardId: string) => {
  try {
    const boardRef = doc(db, 'boards', boardId);
    await deleteDoc(boardRef);
  } catch (error) {
    console.error('Error deleting board:', error);
    throw error;
  }
};

export const duplicateBoard = async (boardId: string, userId: string) => {
  try {
    const boardRef = doc(db, 'boards', boardId);
    const originalSnap = await getDoc(boardRef);

    if (!originalSnap.exists()) {
      throw new Error('Original board not found');
    }
    
    const originalData = originalSnap.data();
    const newBoardId = uuidv4();
    const newBoardRef = doc(db, 'boards', newBoardId);
    
    await setDoc(newBoardRef, {
      ...originalData,
      id: newBoardId,
      title: `Copy of ${originalData.title}`,
      ownerId: userId,
      collaborators: {
        [userId]: 'owner'
      },
      isDeleted: false,
      isStarred: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return newBoardId;
  } catch (error) {
    console.error('Error duplicating board:', error);
    throw error;
  }
};

export const getBoard = async (boardId: string) => {
  try {
    const boardRef = doc(db, 'boards', boardId);
    const boardSnap = await getDoc(boardRef);

    if (boardSnap.exists()) {
      const data = boardSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching board:", error);
    throw error;
  }
};

export const updateBoardPermissions = async (boardId: string, isPublic: boolean, collaboratorsMap: Record<string, string>) => {
  try {
    const boardRef = doc(db, 'boards', boardId);
    await updateDoc(boardRef, {
      isPublic,
      collaborators: collaboratorsMap,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating board permissions:", error);
    throw error;
  }
};
