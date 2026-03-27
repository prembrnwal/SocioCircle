import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoArrowBack, IoPeopleOutline, IoPlayOutline, IoRadioOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { Avatar } from '../components/common/Avatar';
import { ROUTES } from '../config/constants';

export const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20">
            <IoRadioOutline className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-2">Live Audio Room</h2>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse delay-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse delay-150" />
          </div>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors z-20"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Jam Session Waiting Room
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
            You're about to enter the live chat. Grab your instrument setup, test your mic, and jump right in!
          </p>
          
          <Button 
            onClick={() => joinSessionMutation.mutate()}
            isLoading={joinSessionMutation.isPending}
            className="w-full sm:w-auto px-12 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-xl shadow-violet-500/25 transition-transform transform hover:scale-105"
          >
            <IoPlayOutline className="w-6 h-6 mr-2" />
            Join Live Session
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6 px-2">
            <IoPeopleOutline className="w-6 h-6 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Participants in Room</h3>
            <span className="ml-2 px-2.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-sm font-semibold">
              {participants.length}
            </span>
          </div>

          {isLoadingParticipants ? (
            <div className="flex justify-center py-12">
              <Spinner className="text-violet-500" />
            </div>
          ) : participants.length === 0 ? (
            <div className="bg-white/50 dark:bg-[#1a1a1a]/50 rounded-2xl p-8 text-center border border-gray-100 dark:border-white/5 border-dashed">
              <p className="text-gray-500">No participants yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={participant.id}
                  className="flex items-center gap-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-violet-500/30 transition-colors"
                >
                  <div className="relative">
                    <Avatar src={participant.userProfilePicture} alt={participant.userName} size="md" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {participant.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {participant.role || 'Member'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
