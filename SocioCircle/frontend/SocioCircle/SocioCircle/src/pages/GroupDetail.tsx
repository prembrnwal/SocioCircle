import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoArrowBack, IoPeopleOutline, IoCalendarOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
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
  } = useQuery({
    queryKey: ['groupSessions', groupId],
    queryFn: ({ pageParam }) => apiService.getGroupSessions(Number(groupId!), pageParam),
    enabled: !!groupId,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const joinGroupMutation = useMutation({
    mutationFn: () => apiService.joinGroup(Number(groupId!)),
    onSuccess: () => {
      toast.success('Joined group successfully!');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => apiService.leaveGroup(Number(groupId!)),
    onSuccess: () => {
      toast.success('Left group successfully!');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  if (isLoadingGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Group not found</p>
      </div>
    );
  }

  const sessions = sessionsData?.pages.flatMap((page) => page.content) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <IoArrowBack className="w-6 h-6" />
        Back
      </button>

      {/* Group Header */}
      <div className="card p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {group.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {group.description}
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <IoPeopleOutline className="w-5 h-5" />
            <span>{group.memberCount || 0} members</span>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              // Handle join/leave
            }}
          >
            Join Group
          </Button>
        </div>
      </div>

      {/* Sessions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Jamming Sessions
          </h2>
          <Button
            onClick={() => navigate(`${ROUTES.SESSIONS}?groupId=${groupId}`)}
          >
            Create Session
          </Button>
        </div>

        {isLoadingSessions ? (
          <Spinner />
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 card">
            <IoCalendarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No sessions yet</p>
            <Button onClick={() => navigate(`${ROUTES.SESSIONS}?groupId=${groupId}`)}>
              Create First Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`${ROUTES.SESSION_DETAIL.replace(':id', session.id.toString())}`)}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {session.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {session.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {format(new Date(session.startTime), 'MMM dd, yyyy h:mm a')}
                  </span>
                  <span>•</span>
                  <span>{session.durationMinutes} minutes</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded ${
                    session.status === 'LIVE' ? 'bg-red-500 text-white' :
                    session.status === 'UPCOMING' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
