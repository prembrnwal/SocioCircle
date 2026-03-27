import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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
        <div className="backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 mb-2"
            >
              Jamming
            </motion.h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Log in to join the community
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="text"
              placeholder="Email or Username"
              {...register('userId')}
              error={errors.userId?.message}
              className="bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#121212] transition-colors"
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password')}
                error={errors.password?.message}
                className="bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#121212] transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
            >
              Log in
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
            <span className="font-medium">OR</span>
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
          </div>

          <div className="mt-6 text-center">
            <Link 
              to={ROUTES.REGISTER}
              className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
            >
              Can't sign in? Create an account.
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
