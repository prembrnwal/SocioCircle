import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoAdd, IoPeopleOutline, IoSearchOutline, IoFlashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Loading';
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

// Motion variants for grid staggering
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: groups,
    isLoading,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: GroupFormData) => apiService.createGroup(data.name, data.description),
    onSuccess: () => {
      toast.success('Group created successfully!');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create group');
    },
  });

  const filteredGroups = groups?.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 flex items-center gap-3">
                Discover <IoFlashOutline className="text-yellow-400" />
              </h1>
              <p className="text-violet-100 text-lg max-w-xl">
                Find your tribe. Join live jamming sessions, collaborate with musicians across the globe, and share your passion.
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full md:w-auto bg-white text-violet-600 hover:bg-gray-50 h-12 px-8 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
              >
                <IoAdd className="w-6 h-6 mr-2" />
                Start a Group
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8">
          <div className="relative w-full sm:max-w-md">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white transition-shadow shadow-sm"
            />
          </div>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-3xl">
                <Skeleton className="h-6 w-3/4 mb-4 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2 rounded-lg" />
                <Skeleton className="h-4 w-2/3 mb-6 rounded-lg" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredGroups?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 mt-8"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <IoPeopleOutline className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Groups Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Looks like there aren't any communities matching your search. Why not create one?
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl px-8 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-500">
              Create a Community
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
          >
            <AnimatePresence>
              {filteredGroups?.map((group) => (
                <motion.div
                  variants={itemVariants}
                  layoutId={`group-${group.id}`}
                  key={group.id}
                  onClick={() => navigate(ROUTES.GROUP_DETAIL.replace(':groupId', group.id.toString()))}
                  className="group relative bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-3xl hover:shadow-xl hover:shadow-violet-500/5 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
                >
                  {/* Subtle top gradient on hover */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                        {group.name}
                      </h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                      <IoPeopleOutline className="w-4 h-4 text-violet-500" />
                      <span>{group.memberCount || 0}</span>
                    </div>
                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform flex items-center">
                      Explore &rarr;
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        title="Start a New Community"
      >
        <form
          onSubmit={handleSubmit((data) => createGroupMutation.mutate(data))}
          className="space-y-5 py-2"
        >
          <Input
            label="Community Name"
            placeholder="e.g. Jazz Fusion Lovers"
            {...register('name')}
            error={errors.name?.message}
            className="bg-gray-50 dark:bg-[#121212] border-transparent focus:bg-white dark:focus:bg-[#1a1a1a]"
          />
          <Textarea
            label="Description & Rules"
            placeholder="What is this group about?"
            {...register('description')}
            error={errors.description?.message}
            className="bg-gray-50 dark:bg-[#121212] border-transparent focus:bg-white dark:focus:bg-[#1a1a1a]"
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                reset();
              }}
              className="flex-1 h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createGroupMutation.isPending}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
            >
              Create Community
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
