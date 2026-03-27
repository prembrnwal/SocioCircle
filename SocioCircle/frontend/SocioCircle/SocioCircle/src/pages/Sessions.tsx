import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoCalendarOutline, IoTimeOutline, IoTextOutline, IoMicOutline, IoArrowBack } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { ROUTES } from '../config/constants';
import { format, addHours } from 'date-fns';

export const Sessions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(
    format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
  );
  const [duration, setDuration] = useState('60');

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error('Group ID is missing');
      // Append seconds and timezone if backend requires it. ISO standard.
      const formattedStartTime = new Date(startTime).toISOString();
      return apiService.createSession(
        Number(groupId),
        title,
        description,
        formattedStartTime,
        Number(duration)
      );
    },
    onSuccess: () => {
      toast.success('Jam session scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['groupSessions', groupId] });
      navigate(ROUTES.GROUP_DETAIL.replace(':groupId', groupId!));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startTime || !duration) {
      toast.error('Please fill in all fields');
      return;
    }
    createSessionMutation.mutate();
  };

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <IoMicOutline className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a Community</h2>
        <p className="text-gray-500 mb-6">You need to select a community to schedule a jamming session.</p>
        <Button onClick={() => navigate(ROUTES.GROUPS)}>Browse Communities</Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Schedule a Jam
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Host a live audio event for your community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <IoMicOutline className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Details</h3>
              <p className="text-sm text-gray-500">What will you be jamming about?</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Event Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoTextOutline className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                  placeholder="e.g. Weekend Synth Jam"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white resize-none"
                placeholder="Describe what you plan to do... (e.g. 'Looking to jam over some lofi hip hop beats')"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Date & Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoCalendarOutline className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Duration (Minutes)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoTimeOutline className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <Button
              type="submit"
              isLoading={createSessionMutation.isPending}
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-xl shadow-violet-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Schedule Jam Session
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
