import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
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

  const {
    data: user,
    isLoading,
  } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiService.getCurrentUser(),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Profile
      </h1>

      {/* Profile Picture */}
      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <Avatar src={profilePicture} alt={user?.name || 'User'} size="xl" />
          <div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadPictureMutation.isPending}
            >
              {uploadPictureMutation.isPending ? 'Uploading...' : 'Change Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Profile Information
        </h2>
        <form
          onSubmit={handleSubmitProfile((data) => updateProfileMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="Name"
            {...registerProfile('name')}
            error={profileErrors.name?.message}
          />
          <Textarea
            label="Bio"
            {...registerProfile('bio')}
            error={profileErrors.bio?.message}
            maxLength={150}
          />
          <Input
            label="Interests"
            placeholder="e.g., Jazz, Rock, Classical"
            {...registerProfile('interests')}
            error={profileErrors.interests?.message}
          />
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={updateProfileMutation.isPending}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Change Password
        </h2>
        <form
          onSubmit={handleSubmitPassword((data) =>
            changePasswordMutation.mutate({
              currentPassword: data.currentPassword,
              newPassword: data.newPassword,
            })
          )}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            {...registerPassword('currentPassword')}
            error={passwordErrors.currentPassword?.message}
          />
          <Input
            label="New Password"
            type="password"
            {...registerPassword('newPassword')}
            error={passwordErrors.newPassword?.message}
          />
          <Input
            label="Confirm New Password"
            type="password"
            {...registerPassword('confirmPassword')}
            error={passwordErrors.confirmPassword?.message}
          />
          <Button
            type="submit"
            isLoading={changePasswordMutation.isPending}
            variant="outline"
            className="w-full"
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};
