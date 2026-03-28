import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { IoArrowBack, IoPeopleOutline, IoPlayOutline, IoRadioOutline, IoPersonAddOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { ROUTES } from '../config/constants';
import type { Participant } from '../types';

export const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Load participants using InfiniteQuery
  const {
    data: participantsData,
    isLoading: isLoadingParticipants,
  } = useInfiniteQuery({
    queryKey: ['sessionParticipants', id],
    queryFn: ({ pageParam }) => apiService.getSessionParticipants(Number(id!), pageParam as string | undefined),
    enabled: !!id,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const participants = participantsData?.pages?.flatMap((page: any) => page.content) || [];

  const joinSessionMutation = useMutation({
    mutationFn: async () => {
      await apiService.joinSession(Number(id!));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionParticipants', id] });
      // Navigate to actual live chat room
      navigate(ROUTES.CHAT.replace(':sessionId', id!));
    },
    onError: (error: any) => {
      // If error is already joined or something, just navigate anyway
      if (error?.response?.status === 400 && error.response.data?.message?.includes('already')) {
        navigate(ROUTES.CHAT.replace(':sessionId', id!));
      } else {
        toast.error(error.response?.data?.message || 'Failed to join session');
      }
    },
  });

  const { data: followStats, isLoading: isLoadingFollowStats } = useQuery({
    queryKey: ['followStats', selectedParticipant?.userEmail],
    queryFn: () => apiService.getFollowStats(selectedParticipant!.userEmail),
    enabled: !!selectedParticipant,
  });

  const followMutation = useMutation({
    mutationFn: () => {
      if (!selectedParticipant) throw new Error();
      if (followStats?.isFollowing) {
        return apiService.unfollowUser(selectedParticipant.userEmail);
      }
      return apiService.followUser(selectedParticipant.userEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStats', selectedParticipant?.userEmail] });
    },
    onError: () => toast.error('Failed to update follow status')
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12"
    >
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-tr from-violet-900 to-fuchsia-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        
        {/* Pulsating background circles */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-48 h-48 bg-fuchsia-500 rounded-full blur-3xl opacity-30 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 bg-violet-600 rounded-full blur-3xl opacity-40 mix-blend-screen pointer-events-none" 
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-xl shadow-fuchsia-500/20">
            <IoRadioOutline className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-2 drop-shadow-md">Live Audio Room</h2>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite] shadow-lg shadow-red-500" />
            <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite] delay-100 shadow-lg shadow-red-500" />
            <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite] delay-200 shadow-lg shadow-red-500" />
          </div>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all hover:scale-105 z-20"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Jam Session Waiting Room
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
            You're about to enter the live chat. Grab your instrument setup, test your mic, and jump right in!
          </p>
          
          <Button 
            onClick={() => joinSessionMutation.mutate()}
            isLoading={joinSessionMutation.isPending}
            className="w-full sm:w-auto px-12 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-xl shadow-violet-500/25 transition-transform transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <IoPlayOutline className="w-6 h-6 mr-2" />
            Join Live Session
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <IoPeopleOutline className="w-6 h-6 text-violet-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Participants in Room</h3>
            </div>
            <span className="px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg text-sm font-bold shadow-sm">
              {participants.length} Active
            </span>
          </div>

          {isLoadingParticipants ? (
            <div className="flex justify-center py-12">
              <Spinner className="text-violet-500" />
            </div>
          ) : participants.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-10 text-center border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                 <IoPeopleOutline className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No participants yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  key={participant.id}
                  onClick={() => setSelectedParticipant(participant)}
                  className="flex items-center gap-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-md shadow-gray-100/50 dark:shadow-none hover:border-violet-500/50 cursor-pointer overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                  <div className="relative">
                    <Avatar src={participant.userProfilePicture} alt={participant.userName} size="md" className="ring-2 ring-gray-50 dark:ring-[#121212]" />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0 z-10">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {participant.userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                      Joined Room
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedParticipant && (
          <Modal
            isOpen={!!selectedParticipant}
            onClose={() => setSelectedParticipant(null)}
            title="Participant Profile"
          >
            <div className="flex flex-col items-center mt-4">
              <Avatar 
                src={selectedParticipant.userProfilePicture} 
                alt={selectedParticipant.userName} 
                size="lg" 
                className="w-24 h-24 shadow-xl ring-4 ring-gray-50 dark:ring-[#1a1a1a]" 
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{selectedParticipant.userName}</h3>
              <p className="text-gray-500 mb-6">{selectedParticipant.userEmail}</p>

              {isLoadingFollowStats ? (
                <Spinner className="mb-4" />
              ) : (
                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">{followStats?.followersCount || 0}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">{followStats?.followingCount || 0}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Following</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => followMutation.mutate()}
                isLoading={followMutation.isPending}
                className={`w-full h-12 rounded-xl border ${followStats?.isFollowing ? 'bg-white dark:bg-[#121212] text-gray-900 dark:text-white border-gray-300 dark:border-white/20' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent text-white'} flex items-center justify-center`}
              >
                {!followStats?.isFollowing && <IoPersonAddOutline className="w-5 h-5 mr-2" />}
                {followStats?.isFollowing ? 'Following' : 'Follow User'}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
