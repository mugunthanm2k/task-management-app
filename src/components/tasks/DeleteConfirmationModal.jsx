
import { useEffect } from 'react';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task" size="sm">
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-2xl">
          <FiAlertTriangle />
        </div>
        
        <p className="text-lg mb-2">
          Are you sure you want to delete <strong className="text-red-500">"{taskTitle}"</strong>?
        </p>
        <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" icon={FiTrash2} onClick={handleConfirm} className="flex-1">
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;