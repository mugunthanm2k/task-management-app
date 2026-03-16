// components/tasks/TaskList.jsx
import Card from '../common/Card';
import TaskCard from './TaskCard';
import { FiInbox } from 'react-icons/fi';

const TaskList = ({ tasks, onToggle, onEdit, onDelete }) => {
  if (!tasks.length) {
    return (
      <Card className="text-center py-16">
        <FiInbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No tasks yet</p>
        <p className="text-sm text-gray-600">Click "Add New Task" to create your first task</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400">Tasks</h3>
        <span className="text-sm text-gray-500">{tasks.length}</span>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </Card>
  );
};

export default TaskList;