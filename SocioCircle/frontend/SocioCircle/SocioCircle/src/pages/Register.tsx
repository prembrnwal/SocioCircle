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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    bio: z.string().optional(),
    interests: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await apiService.register(registerData);
      
      const loginResponse = await apiService.login({
        userId: data.email,
        password: data.password,
      });
      
      setAuth(loginResponse.token, loginResponse.user);
      toast.success('Account created successfully!');
      navigate(ROUTES.FEED);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden py-10 px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 mb-2"
            >
              Sign Up
            </motion.h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Join the ultimate Jamming Community
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              {...register('name')}
              error={errors.name?.message}
              className="bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#121212] transition-colors"
            />

            <Input
              type="email"
              placeholder="Email address"
              {...register('email')}
              error={errors.email?.message}
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

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                className="bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#121212] transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to={ROUTES.LOGIN}
              className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
            >
              Already have an account? Log in.
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
