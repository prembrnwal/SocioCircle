import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { IoArrowBack, IoCameraOutline, IoSettingsOutline, IoLockClosedOutline } from 'react-icons/io5';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button, Input, Textarea } from '../components/common';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Loading';
import { ROUTES } from '../config/constants';
import { useState, useRef } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(150, 'Bio must be less than 150 characters').optional(),
  interests: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | undefined>(
    currentUser?.profilePicture
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiService.getCurrentUser(),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      interests: user?.interests || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully!');
      navigate(`${ROUTES.PROFILE}/${updatedUser.email}`);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      resetPassword();
    },
    onError: () => {
      toast.error('Failed to change password');
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: (file: File) => apiService.uploadProfilePicture(file),
    onSuccess: (filePath) => {
      setProfilePicture(filePath);
      if (user) {
        updateUser({ ...user, profilePicture: filePath });
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile picture updated!');
    },
    onError: () => {
      toast.error('Failed to upload profile picture');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPictureMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-violet-500" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12 pt-4 sm:pt-8"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Profile</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        <div className="space-y-6">
          
          {/* Section: Profile Picture */}
          <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl backdrop-blur-xl text-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
              Profile Picture
            </h2>
            <div className="flex flex-col items-center justify-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar 
                  src={profilePicture} 
                  alt={user?.name || 'User'} 
                  size="xl" 
                  className="w-32 h-32 text-4xl mb-4 border-4 border-gray-50 dark:border-white/5 shadow-lg group-hover:opacity-80 transition-opacity" 
                />
                {uploadPictureMutation.isPending ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full w-32 h-32 mb-4 mx-auto">
                    <Spinner size="md" className="text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-32 h-32 mb-4 mx-auto">
                    <IoCameraOutline className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPictureMutation.isPending}
                className="mt-2 rounded-xl text-sm font-semibold"
              >
                Change Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </section>

          {/* Section: Profile Info */}
          <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
              <IoSettingsOutline className="w-5 h-5 text-violet-500" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Public Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmitProfile((data) => updateProfileMutation.mutate(data))} className="space-y-5">
              <Input
                label="Name"
                placeholder="Jane Doe"
                {...registerProfile('name')}
                error={profileErrors.name?.message}
                className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl"
              />
              <Textarea
                label="Bio"
                placeholder="Write something about yourself..."
                {...registerProfile('bio')}
                error={profileErrors.bio?.message}
                maxLength={150}
                className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl min-h-[120px]"
              />
              <Input
                label="Interests"
                placeholder="e.g., Jazz, Rock, Classical"
                {...registerProfile('interests')}
                error={profileErrors.interests?.message}
                className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl"
              />
              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-xl font-bold h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={updateProfileMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl shadow-lg font-bold h-12 active:scale-95 transition-transform"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          {/* Section: Change Password */}
          <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
              <IoLockClosedOutline className="w-5 h-5 text-violet-500" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Change Password
              </h2>
            </div>

            <form onSubmit={handleSubmitPassword((data) => changePasswordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword }))} className="space-y-5">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                {...registerPassword('currentPassword')}
                error={passwordErrors.currentPassword?.message}
                className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                {...registerPassword('newPassword')}
                error={passwordErrors.newPassword?.message}
                className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                {...registerPassword('confirmPassword')}
                error={passwordErrors.confirmPassword?.message}
                className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl"
              />
              <div className="pt-4">
                <Button
                  type="submit"
                  isLoading={changePasswordMutation.isPending}
                  className="w-full bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white dark:text-white rounded-xl font-bold h-12 active:scale-[0.98] transition-all"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </motion.div>
  );
};
