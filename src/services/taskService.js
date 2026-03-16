// services/taskService.js
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const taskCollection = collection(db, 'tasks');

export const createTask = async (data) => {
  try {
    const taskData = {
      title: data.title || 'Untitled Task',
      description: data.description || '',
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dueDate: data.dueDate || null // Store as string or null
    };
    
    const docRef = await addDoc(taskCollection, taskData);
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
    const snapshot = await getDocs(taskCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Task',
        description: data.description || '',
        completed: data.completed || false,
        dueDate: data.dueDate || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const updateTask = async (id, data) => {
  try {
    const ref = doc(db, 'tasks', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    await updateDoc(ref, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const ref = doc(db, 'tasks', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};