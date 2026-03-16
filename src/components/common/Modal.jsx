// components/common/Modal.jsx
import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] ${sizes[size]} z-50`}>
        <div className="bg-[#12121A] border border-white/8 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
              <FiX />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;