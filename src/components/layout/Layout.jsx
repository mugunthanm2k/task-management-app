// components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SyncStatus from '../SyncStatus';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <Outlet />
      </main>
      <SyncStatus />
    </div>
  );
};

export default Layout;