// pages/SignupPage.jsx
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

const SignupPage = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ mode: 'onBlur' });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const userCredential = await signup(data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      toast.success('Account created successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password must be at least 6 characters',
        'auth/invalid-email': 'Invalid email address'
      };
      toast.error(messages[error.code] || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900/20 to-black">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-gray-500 mt-2">Create your workspace</p>
        </div>

        <div className="flex gap-2 bg-[#0A0A0F] p-1 rounded-xl mb-8">
          <Link to="/" className="flex-1 text-center py-2 px-4 text-gray-400 hover:text-white">Sign In</Link>
          <div className="flex-1 text-center py-2 px-4 bg-purple-600 rounded-lg font-medium">Sign Up</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            icon={FiUser}
            placeholder="Jane Smith"
            error={errors.name?.message}
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
              pattern: { value: /^[a-zA-Z\s]*$/, message: 'Letters only' }
            })}
          />

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
              placeholder="Min 6 characters"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
                pattern: { 
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                  message: 'Must contain letter and number'
                }
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

          <div className="relative">
            <Input
              label="Confirm Password"
              icon={FiLock}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-400"
            >
              {showConfirmPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 accent-purple-600"
              {...register('terms', { required: 'You must accept terms' })}
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              I agree to the <Link to="/terms" className="text-purple-400 hover:underline">Terms</Link>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-red-500">{errors.terms.message}</p>}

          <Button type="submit" icon={FiArrowRight} loading={isSubmitting} className="w-full mt-4">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/" className="text-purple-400 hover:underline">Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default SignupPage;
