import { useState, useEffect, useCallback, useRef } from 'react';
import { getTasks } from '../services/taskService';
import { useOfflineSync } from './useOfflineSync';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToSyncQueue } = useOfflineSync();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadTasks();

    return () => {
      mounted.current = false;
    };
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      if (mounted.current) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      if (mounted.current) {
        toast.error('Failed to load tasks');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const addTask = useCallback(async (task) => {
    // Generate a temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create optimistic task
    const newTask = {
      id: tempId,
      ...task,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _optimistic: true // Mark as optimistic
    };

    // Update UI optimistically
    setTasks(prev => [...prev, newTask]);

    try {
      // Add to sync queue with temp ID
      await addToSyncQueue('CREATE', tempId, task);
      
      toast.success('Task added!', {
        duration: 2000,
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });

      // Return tempId for potential rollback
      return tempId;

    } catch (error) {
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
      
      toast.error('Failed to add task', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
      
      throw error;
    }
  }, [addToSyncQueue]);

  const updateTaskById = useCallback(async (id, data) => {
    // Store previous state for rollback
    const previousTasks = [...tasks];

    // Update optimistically
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    ));

    try {
      await addToSyncQueue('UPDATE', id, data);
      
      toast.success('Task updated!', {
        duration: 2000,
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });

    } catch (error) {
      // Rollback on error
      setTasks(previousTasks);
      
      toast.error('Failed to update task', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
      
      throw error;
    }
  }, [tasks, addToSyncQueue]);

  const removeTask = useCallback(async (id) => {
    // Store task for potential rollback
    const taskToDelete = tasks.find(t => t.id === id);
    const previousTasks = [...tasks];

    // Update optimistically
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await addToSyncQueue('DELETE', id, null);
      
      toast.success('Task deleted!', {
        duration: 2000,
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });

    } catch (error) {
      // Rollback on error
      setTasks(previousTasks);
      
      toast.error('Failed to delete task', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
      
      throw error;
    }
  }, [tasks, addToSyncQueue]);

  const toggleTask = useCallback((task) => {
    updateTaskById(task.id, { completed: !task.completed });
  }, [updateTaskById]);

  return {
    tasks,
    loading,
    addTask,
    removeTask,
    toggleTask,
    updateTask: updateTaskById,
    refreshTasks: loadTasks
  };
};
