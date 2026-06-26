import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (boardId: string, file: File): Promise<string> => {
  if (!boardId || !file) throw new Error("Board ID and file are required");
  const ext = file.name.split('.').pop() || 'png';
  const filename = `${uuidv4()}.${ext}`;
  const storageRef = ref(storage, `boards/${boardId}/images/${filename}`);
  
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
