import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { IoArrowBack, IoPeopleOutline, IoCalendarOutline, IoMusicalNotesOutline, IoPlayCircleOutline, IoAdd } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { ROUTES } from '../config/constants';
import { format } from 'date-fns';

export const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: group,
    isLoading: isLoadingGroup,
  } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => apiService.getGroup(Number(groupId)),
    enabled: !!groupId,
  });

  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
  } = useInfiniteQuery({
    queryKey: ['groupSessions', groupId],
    queryFn: ({ pageParam }) => apiService.getGroupSessions(Number(groupId!), pageParam as string | undefined),
    enabled: !!groupId,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const joinGroupMutation = useMutation({
    mutationFn: () => apiService.joinGroup(Number(groupId!)),
    onSuccess: () => {
      toast.success('Welcome to the group!');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => apiService.leaveGroup(Number(groupId!)),
    onSuccess: () => {
      toast.success('Left group successfully.');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  if (isLoadingGroup) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" className="text-violet-500" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <IoMusicalNotesOutline className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Group Not Found</h2>
        <p className="text-gray-500">The community you're looking for doesn't exist.</p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.GROUPS)}>Back to Discovery</Button>
      </div>
    );
  }

  const sessions = sessionsData?.pages?.flatMap((page: any) => page.content) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12"
    >
      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600">
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-white/20 blur-3xl rounded-[100%] pointer-events-none" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
        {/* Group Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
                {group.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                {group.description}
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium rounded-xl inline-flex">
                <IoPeopleOutline className="w-5 h-5" />
                <span>{group.memberCount || 0} Members</span>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                onClick={() => joinGroupMutation.mutate()}
                isLoading={joinGroupMutation.isPending}
                className="flex-1 md:w-40 h-12 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-xl font-bold"
              >
                Join Group
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Sessions Section */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jamming Sessions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live and upcoming audio events</p>
            </div>
            <Button
              onClick={() => navigate(`${ROUTES.SESSIONS}?groupId=${groupId}`)}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-violet-500/25 whitespace-nowrap"
            >
              <IoAdd className="w-5 h-5 mr-2" />
              Schedule Session
            </Button>
          </div>

          {isLoadingSessions ? (
            <div className="flex justify-center py-10">
              <Spinner className="text-violet-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mb-6">
                <IoCalendarOutline className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Scheduled Sessions</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">Be the first to schedule a live jam session for this community.</p>
              <Button onClick={() => navigate(`${ROUTES.SESSIONS}?groupId=${groupId}`)} className="h-12 px-8 rounded-xl font-semibold">
                Start a Jam
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session: any, index: number) => {
                const isLive = session.status === 'LIVE';
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={session.id}
                    onClick={() => navigate(ROUTES.SESSION_DETAIL.replace(':id', session.id.toString()))}
                    className={`relative p-6 rounded-3xl border cursor-pointer transition-all ${
                      isLive 
                        ? 'bg-gradient-to-br from-violet-900/90 to-fuchsia-900/90 border-violet-500/50 shadow-lg shadow-violet-500/20 text-white'
                        : 'bg-white dark:bg-[#121212] border-gray-100 dark:border-white/5 hover:border-violet-500/30 dark:hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold line-clamp-1 pr-4 ${!isLive && 'text-gray-900 dark:text-white'}`}>
                        {session.title}
                      </h3>
                      <div className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
                        isLive ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                        session.status === 'UPCOMING' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' :
                        'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                      }`}>
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {session.status}
                      </div>
                    </div>
                    
                    <p className={`text-sm line-clamp-2 mb-6 ${isLive ? 'text-violet-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {session.description}
                    </p>
                    
                    <div className={`flex flex-col gap-2 text-sm font-medium ${isLive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className={`w-4 h-4 ${!isLive && 'text-gray-400'}`} />
                        <span>{format(new Date(session.startTime), 'EEEE, MMM dd • h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoPlayCircleOutline className={`w-4 h-4 ${!isLive && 'text-gray-400'}`} />
                        <span>{session.durationMinutes} min jam</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
