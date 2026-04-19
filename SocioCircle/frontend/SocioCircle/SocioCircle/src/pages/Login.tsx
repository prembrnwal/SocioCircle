import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoLogoFacebook,
  IoAperture
} from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { Button, Input } from '../components/common';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../config/constants';

const loginSchema = z.object({
  userId: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(data);
      setAuth(response.token, response.user);
      toast.success('Login successful!');
      navigate(ROUTES.FEED);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                <IoAperture className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">SocioCircle</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Log in to your Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Welcome back! Select method to log in:
            </p>
          </div>

          {/* Social Logins */}
          <div className="flex gap-4 mb-6">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 h-11 px-4 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FcGoogle className="w-5 h-5" />
              Google
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 h-11 px-4 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200">
              <IoLogoFacebook className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">or continue with email</span>
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-[14px] text-gray-400 z-10 pointer-events-none">
                <IoMailOutline className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="Email"
                {...register('userId')}
                error={errors.userId?.message}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#121212] transition-all pl-11 rounded-xl h-12"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-[14px] text-gray-400 z-10 pointer-events-none">
                <IoLockClosedOutline className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password')}
                error={errors.password?.message}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#121212] transition-all pl-11 pr-12 rounded-xl h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[14px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 pb-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-violet-500 transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <svg className="w-3 h-3 text-white peer-checked:text-violet-500 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                    <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
            >
              Log in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
