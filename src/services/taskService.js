import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';

const taskCollection = collection(db, 'tasks');

export const createTask = async (data) => {
  try {
    // Validate required fields
    if (!data || !data.title) {
      throw new Error('Task title is required');
    }

    // Prepare task data
    const taskData = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dueDate: data.dueDate || null
    };

    // Add to Firestore
    const docRef = await addDoc(taskCollection, taskData);
    
    // Return the created task with real ID
    return {
      id: docRef.id,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTasks = async () => {
  try {
    // Query with ordering
    const q = query(taskCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Task',
        description: data.description || '',
        completed: data.completed || false,
        dueDate: data.dueDate || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return []; // Return empty array on error
  }
};

export const updateTask = async (id, data) => {
  try {
    // Validate ID
    if (!id) {
      throw new Error('Task ID is required for update');
    }

    // Check if this is a temporary ID
    if (id.startsWith('temp-')) {
      console.log('Skipping update for temporary ID:', id);
      return { id, ...data, _skipped: true };
    }

    const ref = doc(db, 'tasks', id);
    
    // Prepare update data (remove undefined values)
    const updateData = {
      updatedAt: serverTimestamp()
    };

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || '';
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    // Perform update
    await updateDoc(ref, updateData);
    
    return { id, ...updateData };
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Enhance error with more context
    if (error.code === 'not-found') {
      throw new Error(`Task with ID ${id} not found in Firestore`);
    }
    
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    // Validate ID
    if (!id) {
      throw new Error('Task ID is required for deletion');
    }

    // Check if this is a temporary ID
    if (id.startsWith('temp-')) {
      console.log('Skipping delete for temporary ID:', id);
      return { id, _skipped: true };
    }

    const ref = doc(db, 'tasks', id);
    await deleteDoc(ref);
    
    return { id, deleted: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    
    // Enhance error with more context
    if (error.code === 'not-found') {
      throw new Error(`Task with ID ${id} not found in Firestore`);
    }
    
    throw error;
  }
};

// Batch operations for better performance
export const batchUpdateTasks = async (updates) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      if (id && !id.startsWith('temp-')) {
        const ref = doc(db, 'tasks', id);
        batch.update(ref, { ...data, updatedAt: serverTimestamp() });
      }
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};
