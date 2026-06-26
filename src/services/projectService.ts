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
  serverTimestamp 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export const createProject = async (workspaceId: string, userId: string, name: string, color?: string) => {
  try {
    const projectId = uuidv4();
    const projectRef = doc(db, 'projects', projectId);
    
    await setDoc(projectRef, {
      id: projectId,
      name: name || 'Untitled Project',
      workspaceId: workspaceId,
      ownerId: userId,
      color: color || '#6366f1', // Default brand color
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return projectId;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getProjectsListener = (workspaceId: string, callback: (projects: Project[]) => void) => {
  const q = query(
    collection(db, 'projects'), 
    where('workspaceId', '==', workspaceId)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      } as Project;
    });
    
    // Sort client-side by updated at
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    callback(projects);
  }, (error) => {
    console.error("Error listening to projects:", error);
    callback([]);
  });
  
  return unsubscribe;
};

export const updateProject = async (projectId: string, data: Partial<Project>) => {
  try {
    const updateData: any = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;

    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, updateData);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};
