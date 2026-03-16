// pages/Dashboard.jsx
import { useState, useMemo } from 'react';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';
import DeleteConfirmationModal from '../components/tasks/DeleteConfirmationModal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useTasks } from '../hooks/useTasks';
import { FiPlus, FiSearch, FiCalendar } from 'react-icons/fi';

const Dashboard = () => {
  const { tasks, addTask, removeTask, toggleTask, updateTask } = useTasks();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Safe task filtering with null checks
  const stats = useMemo(() => {
    const safeTasks = tasks || [];
    const total = safeTasks.length;
    const completed = safeTasks.filter(t => t && t.completed === true).length;
    return { 
      total, 
      completed, 
      pending: total - completed, 
      progress: total ? (completed / total) * 100 : 0 
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const safeTasks = tasks || [];
    return safeTasks
      .filter(task => task && task.title) // Filter out invalid tasks
      .filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed === true;
        return true;
      })
      .filter(task => 
        (task.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (task.description?.toLowerCase() || '').includes(search.toLowerCase())
      );
  }, [tasks, filter, search]);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await removeTask(taskToDelete.id);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleModalSubmit = async (data) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}</h2>
        <p className="text-gray-500 flex items-center gap-2 mt-1"><FiCalendar /> {today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'TOTAL', value: stats.total, color: 'text-purple-400' },
          { label: 'DONE', value: stats.completed, color: 'text-green-500' },
          { label: 'PENDING', value: stats.pending, color: 'text-yellow-500' }
        ].map(stat => (
          <Card key={stat.label} className="p-5" hover>
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall progress</span>
          <span className="text-green-500 font-semibold">{Math.round(stats.progress)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" 
               style={{ width: `${stats.progress}%` }} />
        </div>
      </Card>

      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#12121A] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:shadow-glow transition-all"
        />
      </div>

      <div className="flex gap-2 bg-[#12121A] p-1 rounded-xl mb-6">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-4 rounded-lg capitalize transition-all ${
              filter === f ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-4 items-start">
        <Card className="sticky top-17 z-10">
          <h3 className="text-lg font-semibold mb-4 pb-3 border-b border-white/8">Create New Task</h3>
          <Button onClick={() => setModalOpen(true)} icon={FiPlus} className="w-full">
            Add New Task
          </Button>
          <p className="text-xs text-gray-600 text-center mt-3">
            Click to create a new task with title, description, and due date
          </p>
        </Card>

        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTask}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleModalSubmit}
        task={editingTask}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />
    </div>
  );
};

export default Dashboard;