// pages/LoginPage.jsx
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useState } from 'react';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const messages = {
        'auth/user-not-found': 'Invalid email or password',
        'auth/wrong-password': 'Invalid email or password',
        'auth/too-many-requests': 'Too many attempts. Try again later.'
      };
      toast.error(messages[error.code] || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900/20 to-black">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-gray-500 mt-2">Sign in to your workspace</p>
        </div>

        <div className="flex gap-2 bg-[#0A0A0F] p-1 rounded-xl mb-8">
          <div className="flex-1 text-center py-2 px-4 bg-purple-600 rounded-lg font-medium">Sign In</div>
          <Link to="/signup" className="flex-1 text-center py-2 px-4 text-gray-400 hover:text-white">Sign Up</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            icon={FiMail}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
            })}
          />

          <div className="relative">
            <Input
              label="Password"
              icon={FiLock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-400"
            >
              {showPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>

          <Button type="submit" icon={FiLogIn} loading={isSubmitting} className="w-full mt-4">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/signup" className="text-purple-400 hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;