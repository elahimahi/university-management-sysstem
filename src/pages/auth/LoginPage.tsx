import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().refine((val) => ['student', 'faculty', 'admin'].includes(val), {
    message: 'Select a valid role',
  }),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, socialLogin, isLoading, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Robust redirection if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      let targetPath = '/student/dashboard';
      if (user.role === 'faculty') targetPath = '/faculty/dashboard';
      else if (user.role === 'admin') targetPath = '/admin/dashboard';
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'faculty',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
        role: data.role,
        rememberMe: data.rememberMe,
      };
      const response = await login(credentials);

      // Small delay to ensure state propagation
      setTimeout(() => {
        const userRole = response.user.role?.toLowerCase();
        let targetPath = '/student/dashboard';
        if (userRole === 'faculty') targetPath = '/faculty/dashboard';
        else if (userRole === 'admin') targetPath = '/admin/dashboard';
        else if (userRole === 'superadmin') targetPath = '/admin/dashboard';
        navigate(targetPath, { replace: true });
      }, 100);
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      // For demo/simplified flow, we'll simulate receiving a token from the provider
      const mockProviderToken = 'mock_provider_token';
      const response = await (socialLogin as any)(provider, mockProviderToken);

      // Robust redirection after social login
      setTimeout(() => {
        const userRole = response.user.role?.toLowerCase();
        let targetPath = '/student/dashboard';
        if (userRole === 'faculty') targetPath = '/faculty/dashboard';
        else if (userRole === 'admin') targetPath = '/admin/dashboard';
        navigate(targetPath, { replace: true });
      }, 100);
    } catch (error) {
      // Handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b18] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#FFB347]/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-md w-full z-10"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] p-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight">University Portal</h2>
            <p className="text-gray-400 mt-3 font-medium">Elevate your academic journey</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-sm text-white"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-sm text-white"
            >
              Facebook
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFB347]/50 transition-all"
                placeholder="Email address"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFB347]/50 transition-all"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[18px] text-gray-500 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <select
                {...register('role')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-[#FFB347]/50 transition-all appearance-none"
              >
                <option value="student" className="bg-[#050b18]">Sign in as Student</option>
                <option value="faculty" className="bg-[#050b18]">Sign in as Faculty</option>
                <option value="admin" className="bg-[#050b18]">Sign in as Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                <input type="checkbox" {...register('rememberMe')} className="rounded border-white/10 bg-white/5 text-[#FFB347]" />
                <span>Stay signed in</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-[#FFB347] font-bold">Forgot Access?</Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 bg-[#FFB347] hover:bg-[#ffc266] text-[#050b18] font-black rounded-xl shadow-[0_0_20px_rgba(255,179,71,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'SIGNING IN...' : 'SECURE SIGN IN'}
            </motion.button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-400 font-medium">
            Internal Access Only. <Link to="/register" className="text-white font-bold hover:text-[#FFB347] transition-colors ml-1">Request Account →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
