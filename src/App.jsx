// App.jsx
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        className: 'bg-[#12121A] text-white border border-white/8 rounded-lg shadow-lg',
        duration: 3000
      }} />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;