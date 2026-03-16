// components/layout/Navbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { FiLogOut, FiWifi, FiWifiOff } from 'react-icons/fi';
import NotificationButton from '../NotificationButton';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const online = useNetworkStatus();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-[#12121A]/80 backdrop-blur-md border-b border-white/8">
      <div className="flex items-center gap-3">
        <NotificationButton />
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
          TaskFlow
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-[#12121A] border border-white/8 rounded-full text-xs ${
          online ? 'text-green-500' : 'text-red-500'
        }`}>
          {online ? <FiWifi /> : <FiWifiOff />}
          <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400 hidden md:inline">
          {user?.displayName || user?.email?.split('@')[0] || 'User'}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-white/8 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all"
        >
          <FiLogOut />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;