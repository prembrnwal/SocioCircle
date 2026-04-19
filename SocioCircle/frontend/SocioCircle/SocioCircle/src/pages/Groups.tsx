import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoAdd, IoPeopleOutline, IoSearchOutline, IoFlashOutline, IoMusicalNotesOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { GroupCardSkeleton } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '../config/constants';

const groupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type GroupFormData = z.infer<typeof groupSchema>;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } },
};

export const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupFormData>({ resolver: zodResolver(groupSchema) });

  const createGroupMutation = useMutation({
    mutationFn: (data: GroupFormData) => apiService.createGroup(data.name, data.description),
    onSuccess: () => {
      toast.success('Community created! 🎶');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create group';
      toast.error(message);
    },
  });

  const filteredGroups = groups?.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 sm:p-12 shadow-2xl shadow-violet-500/20"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <IoMusicalNotesOutline className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold flex items-center gap-3">
                  Discover
                  <IoFlashOutline className="text-yellow-300 w-10 h-10" />
                </h1>
              </div>
              <p className="text-violet-100 text-lg max-w-xl leading-relaxed">
                Find your tribe. Join live jamming sessions, collaborate with musicians across the globe,
                and share your passion for music.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full md:w-auto !bg-white !text-violet-700 hover:!bg-gray-50 h-12 px-8 rounded-2xl font-bold shadow-xl transition-transform active:scale-95 shrink-0"
            >
              <IoAdd className="w-5 h-5 mr-1.5" />
              Start a Group
            </Button>
          </div>
        </motion.div>

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="relative w-full sm:max-w-md"
        >
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm placeholder-gray-400"
          />
        </motion.div>

        {/* ── Groups Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <GroupCardSkeleton key={i} />)}
          </div>
        ) : filteredGroups?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <IoPeopleOutline className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Groups Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              No communities match your search. Why not start one?
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl px-8 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
              Create a Community
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredGroups?.map((group) => (
                <motion.div
                  variants={itemVariants}
                  layoutId={`group-${group.id}`}
                  key={group.id}
                  onClick={() => navigate(ROUTES.GROUP_DETAIL.replace(':groupId', group.id.toString()))}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-3xl hover:shadow-xl hover:shadow-violet-500/10 transition-shadow cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl" />

                  {/* Member count badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-xl border border-gray-100 dark:border-white/5">
                    <IoPeopleOutline className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{group.memberCount || 0}</span>
                  </div>

                  <div className="flex-1 pr-16">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1 mb-3">
                      {group.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Explore →
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Create Group Modal ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); reset(); }}
        title="Start a New Community"
      >
        <form onSubmit={handleSubmit((data) => createGroupMutation.mutate(data))} className="space-y-5 py-2">
          <Input
            label="Community Name"
            placeholder="e.g. Jazz Fusion Lovers"
            {...register('name')}
            error={errors.name?.message}
            className="bg-gray-50 dark:bg-[#1a1a1a] border-transparent focus:bg-white dark:focus:bg-[#222] rounded-xl"
          />
          <Textarea
            label="Description & Mission"
            placeholder="What is this group about? What kind of jams will you host?"
            {...register('description')}
            error={errors.description?.message}
            className="bg-gray-50 dark:bg-[#1a1a1a] border-transparent focus:bg-white dark:focus:bg-[#222] rounded-xl min-h-[100px]"
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsCreateModalOpen(false); reset(); }}
              className="flex-1 h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createGroupMutation.isPending}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-500/25"
            >
              Create Community
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
