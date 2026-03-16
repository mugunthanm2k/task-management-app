// components/tasks/TaskModal.jsx
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { FiType, FiAlignLeft, FiCalendar } from 'react-icons/fi';

const TaskModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { 
      title: '', 
      description: '', 
      dueDate: '' 
    }
  });

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Reset form with task data when task changes or modal opens
  useEffect(() => {
    if (task) {
      setValue('title', task.title || '');
      setValue('description', task.description || '');
      setValue('dueDate', formatDateForInput(task.dueDate));
    } else {
      reset({ title: '', description: '', dueDate: '' });
    }
  }, [task, setValue, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset({ title: '', description: '', dueDate: '' });
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      dueDate: data.dueDate || null
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={task ? 'Edit Task' : 'Add New Task'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-4">
        <Input
          label="Title"
          icon={FiType}
          placeholder="Enter task title"
          error={errors.title?.message}
          {...register('title', { 
            required: 'Title is required',
            minLength: { value: 3, message: 'Minimum 3 characters' }
          })}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <FiAlignLeft /> Description
          </label>
          <textarea
            placeholder="Enter task description (optional)"
            className="w-full bg-[#0A0A0F] border border-white/8 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:shadow-glow min-h-[100px] resize-y"
            {...register('description')}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <FiCalendar /> Due Date (optional)
          </label>
          <input
            type="date"
            className="w-full bg-[#0A0A0F] border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:shadow-glow [color-scheme:dark]"
            {...register('dueDate')}
          />
          <p className="text-xs text-gray-600 mt-1">Click the calendar icon to select date</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {task ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;