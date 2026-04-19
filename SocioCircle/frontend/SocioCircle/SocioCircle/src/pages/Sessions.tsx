import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoCalendarOutline, IoTimeOutline, IoTextOutline,
  IoMicOutline, IoArrowBack, IoMusicalNotesOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours } from 'date-fns';

import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { ROUTES } from '../config/constants';

const sessionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description is too long'),
  startTime: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Start time must be in the future',
  }),
  durationMinutes: z.coerce.number().min(15).max(300),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const fieldClass = (hasError: boolean) =>
  `w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border ${
    hasError ? 'border-red-500/60' : 'border-gray-200 dark:border-white/10'
  } rounded-xl focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 focus:bg-white dark:focus:bg-[#222] transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400`;

export const Sessions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGroupId = searchParams.get('groupId');
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || '');
  const queryClient = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      startTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
      durationMinutes: 60,
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      if (!selectedGroupId) throw new Error('Community is missing');
      const formattedStartTime = data.startTime.length === 16 ? data.startTime + ':00' : data.startTime;
      return apiService.createSession(Number(selectedGroupId), data.title, data.description, formattedStartTime, data.durationMinutes);
    },
    onSuccess: () => {
      toast.success('Jam session scheduled! 🎉');
      queryClient.invalidateQueries({ queryKey: ['groupSessions', selectedGroupId] });
      navigate(ROUTES.GROUP_DETAIL.replace(':groupId', selectedGroupId));
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const msg =
        typeof data === 'object' && data?.message ? data.message :
        typeof data === 'string' && data ? data : 'Failed to schedule session';
      toast.error(msg);
    },
  });

  const onSubmit = (data: SessionFormData) => createSessionMutation.mutate(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-12"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Schedule a Jam
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            Host a live audio event for your community
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-xl">

          {/* Section header */}
          <div className="flex items-center gap-3 mb-7 pb-6 border-b border-gray-100 dark:border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 flex items-center justify-center">
              <IoMicOutline className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">What will you be jamming about?</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Community selector */}
            {!initialGroupId && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Select Community
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoMusicalNotesOutline className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  </div>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 focus:bg-white dark:focus:bg-[#222] transition-all outline-none text-gray-900 dark:text-white appearance-none"
                    required
                  >
                    <option value="" disabled>Choose a community...</option>
                    {groups?.map((group) => (
                      <option key={group.id} value={group.id.toString()}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Event Title
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoTextOutline className={`h-5 w-5 transition-colors ${errors.title ? 'text-red-400' : 'text-gray-400 group-focus-within:text-violet-500'}`} />
                </div>
                <input
                  type="text"
                  {...register('title')}
                  className={fieldClass(!!errors.title)}
                  placeholder="e.g. Weekend Synth Jam 🎹"
                />
              </div>
              {errors.title && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border ${errors.description ? 'border-red-500/60' : 'border-gray-200 dark:border-white/10'} rounded-xl focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 focus:bg-white dark:focus:bg-[#222] transition-all outline-none text-gray-900 dark:text-white resize-none placeholder-gray-400`}
                placeholder="Describe what you plan to do... (e.g. 'Looking to jam over some lofi hip hop beats')"
              />
              {errors.description && <p className="mt-1.5 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Date & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Date & Time
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoCalendarOutline className={`h-5 w-5 transition-colors ${errors.startTime ? 'text-red-400' : 'text-gray-400 group-focus-within:text-violet-500'}`} />
                  </div>
                  <input
                    type="datetime-local"
                    {...register('startTime')}
                    className={fieldClass(!!errors.startTime)}
                  />
                </div>
                {errors.startTime && <p className="mt-1.5 text-sm text-red-500">{errors.startTime.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Duration
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoTimeOutline className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  </div>
                  <select
                    {...register('durationMinutes')}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 focus:bg-white dark:focus:bg-[#222] transition-all outline-none text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="90">1.5 Hours</option>
                    <option value="120">2 Hours</option>
                    <option value="180">3 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <Button
              type="submit"
              isLoading={createSessionMutation.isPending}
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-xl shadow-violet-500/25 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <IoCheckmarkCircle className="w-5 h-5 mr-2" />
              Schedule Jam Session
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
