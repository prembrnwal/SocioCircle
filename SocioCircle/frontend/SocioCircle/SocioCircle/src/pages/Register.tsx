import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAperture,
} from 'react-icons/io5';
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

const inputBase = 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#121212] transition-all pl-11 rounded-xl h-12';

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
      toast.success('Welcome to SocioCircle! 🎵');
      navigate(ROUTES.FEED);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden py-10 px-4">
      {/* ── Background blobs ── */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">

          {/* ── Logo & header ── */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                <IoAperture className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">SocioCircle</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Create your account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Join the ultimate jamming community 🎵
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <div className="absolute left-4 top-[14px] text-gray-400 z-10 pointer-events-none">
                <IoPersonOutline className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="Full Name"
                {...register('name')}
                error={errors.name?.message}
                className={inputBase}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute left-4 top-[14px] text-gray-400 z-10 pointer-events-none">
                <IoMailOutline className="w-5 h-5" />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                {...register('email')}
                error={errors.email?.message}
                className={inputBase}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute left-4 top-[14px] text-gray-400 z-10 pointer-events-none">
                <IoLockClosedOutline className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password')}
                error={errors.password?.message}
                className={`${inputBase} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[14px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="absolute left-4 top-[14px] text-gray-400 z-10 pointer-events-none">
                <IoLockClosedOutline className="w-5 h-5" />
              </div>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                className={`${inputBase} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[14px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                {showConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
              >
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
