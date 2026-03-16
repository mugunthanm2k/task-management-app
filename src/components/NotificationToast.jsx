// components/NotificationToast.jsx
import toast from 'react-hot-toast';

export const showNotificationToast = (payload) => {
  toast.custom(
    (t) => (
      <div className={`bg-[#12121A] border border-white/8 rounded-lg shadow-lg p-4 max-w-sm ${
        t.visible ? 'animate-slide-in' : ''
      }`}>
        <h4 className="font-semibold text-white">{payload.notification?.title || 'New Notification'}</h4>
        <p className="text-sm text-gray-400 mt-1">{payload.notification?.body}</p>
        {payload.data?.taskId && (
          <button 
            onClick={() => {
              window.location.href = `/task/${payload.data.taskId}`;
              toast.dismiss(t.id);
            }}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300"
          >
            View Task →
          </button>
        )}
      </div>
    ),
    { duration: 5000 }
  );
};