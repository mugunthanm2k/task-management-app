// Updated useTasks.js with offline sync
import { useState, useEffect, useCallback } from 'react';
import { createTask, getTasks, deleteTask, updateTask } from '../services/taskService';
import { useOfflineSync } from './useOfflineSync';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const { addToSyncQueue } = useOfflineSync();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const addTask = useCallback(async (task) => {
    const tempId = `temp-${Date.now()}`;
    const newTask = { id: tempId, ...task, completed: false };
    
    setTasks(prev => [...prev, newTask]);
    
    try {
      // Add to sync queue
      await addToSyncQueue('CREATE', null, task);
      
      // If online, this will sync immediately
      // If offline, it's queued for later
      toast.success('Task added!');
    } catch (error) {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      toast.error('Failed to add task');
    }
  }, [addToSyncQueue]);

  const updateTaskById = useCallback(async (id, data) => {
    const oldTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    
    try {
      await addToSyncQueue('UPDATE', id, data);
      toast.success('Task updated!');
    } catch (error) {
      setTasks(oldTasks);
      toast.error('Failed to update task');
    }
  }, [tasks, addToSyncQueue]);

  const removeTask = useCallback(async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      await addToSyncQueue('DELETE', id, null);
      toast.success('Task deleted!');
    } catch (error) {
      setTasks(prev => [...prev, taskToDelete]);
      toast.error('Failed to delete task');
    }
  }, [tasks, addToSyncQueue]);

  const toggleTask = useCallback((task) => {
    updateTaskById(task.id, { completed: !task.completed });
  }, [updateTaskById]);

  return { tasks, addTask, removeTask, toggleTask, updateTask: updateTaskById };
};