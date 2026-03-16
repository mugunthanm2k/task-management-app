// components/tasks/TaskCard.jsx
import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import Card from '../common/Card';
import Button from '../common/Button';

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  // Safely access task properties with defaults
  const safeTask = {
    id: task?.id,
    title: task?.title || 'Untitled Task',
    description: task?.description || '',
    completed: task?.completed || false,
    dueDate: task?.dueDate || null
  };

  return (
    <Card className={`${safeTask.completed ? 'opacity-70' : ''}`}>
      <div className="flex gap-4">
        <label className="relative w-5 h-5 flex-shrink-0 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={safeTask.completed}
            onChange={() => onToggle(safeTask)}
            className="absolute opacity-0 w-0 h-0"
          />
          <span className={`absolute inset-0 border-2 rounded transition-all ${
            safeTask.completed 
              ? 'bg-purple-600 border-purple-600 after:absolute after:left-1.5 after:top-0.5 after:w-1.5 after:h-3 after:border-r-2 after:border-b-2 after:border-white after:rotate-45' 
              : 'bg-[#1C1C28] border-white/16 hover:border-purple-600'
          }`} />
        </label>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate ${safeTask.completed ? 'line-through text-gray-500' : ''}`}>
            {safeTask.title}
          </h4>
          {safeTask.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{safeTask.description}</p>
          )}
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {safeTask.dueDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-500">
                <FiCalendar />
                {new Date(safeTask.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-white/8">
        <Button 
          variant="secondary" 
          size="sm" 
          icon={FiEdit2} 
          onClick={() => onEdit(safeTask)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          icon={FiTrash2} 
          onClick={() => onDelete(safeTask)}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default TaskCard;