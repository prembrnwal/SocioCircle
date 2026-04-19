import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  IoArrowBack, IoPeopleOutline, IoCalendarOutline, IoMusicalNotesOutline,
  IoPlayCircleOutline, IoAdd, IoWarningOutline, IoTrashOutline,
  IoBanOutline, IoPersonOutline,
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner, SessionCardSkeleton } from '../components/common/Loading';
import { SessionStatusBadge } from '../components/common/Badge';
import { ROUTES } from '../config/constants';
import { format } from 'date-fns';
import type { GroupMember } from '../types';

// ── Leave Confirmation Dialog ────────────────────────────────────────────────
const LeaveConfirmDialog = ({
  groupName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [nameInput, setNameInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const CONFIRM_PHRASE = 'leave this group';

  const isValid = nameInput === groupName && confirmInput === CONFIRM_PHRASE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative w-full max-w-md bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center shrink-0">
              <IoWarningOutline className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leave Group</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            This will remove you from <span className="font-semibold text-gray-700 dark:text-gray-200">"{groupName}"</span>.
            You can rejoin anytime, but you'll lose access to member-only sessions.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Field 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              To confirm, type{' '}
              <span className="font-bold text-gray-900 dark:text-white">"{groupName}"</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={groupName}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all"
            />
          </div>

          {/* Field 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              To confirm, type{' '}
              <span className="font-bold text-gray-900 dark:text-white">"{CONFIRM_PHRASE}"</span>
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all"
            />
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
            <IoWarningOutline className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              Leaving the group cannot be undone automatically. You will need to rejoin manually.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${
              isValid && !isLoading
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25'
                : 'bg-red-300 dark:bg-red-900/30 cursor-not-allowed opacity-60'
            }`}
          >
            {isLoading ? 'Leaving…' : 'Leave Group'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Delete Confirmation Dialog ───────────────────────────────────────────────
const DeleteConfirmDialog = ({
  groupName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [nameInput, setNameInput] = useState('');
  const isValid = nameInput === groupName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative w-full max-w-md bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center shrink-0">
              <IoTrashOutline className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Group</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            This will permanently delete <span className="font-semibold text-gray-700 dark:text-gray-200">"{groupName}"</span>{' '}
            and all its sessions and members. <span className="text-red-500 font-semibold">This cannot be undone.</span>
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Type <span className="font-bold text-gray-900 dark:text-white">"{groupName}"</span> to confirm
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={groupName}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all"
            />
          </div>

          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
            <IoWarningOutline className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              All members will be removed and all jamming sessions will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${
              isValid && !isLoading
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25'
                : 'bg-red-300 dark:bg-red-900/30 cursor-not-allowed opacity-60'
            }`}
          >
            {isLoading ? 'Deleting…' : 'Delete Group'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => apiService.getGroup(Number(groupId)),
    enabled: !!groupId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiService.getCurrentUser(),
  });


  const { data: isMember, refetch: refetchMembership } = useQuery({
    queryKey: ['groupMembership', groupId],
    queryFn: () => apiService.checkGroupMembership(Number(groupId)),
    enabled: !!groupId,
    retry: false,
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
      toast.success('🎵 Welcome to the group!');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembership', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to join group.';
      toast.error(message);
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => apiService.leaveGroup(Number(groupId!)),
    onSuccess: () => {
      toast.success('You have left the group.');
      setShowLeaveDialog(false);
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembership', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to leave group.';
      toast.error(message);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => apiService.deleteGroup(Number(groupId!)),
    onSuccess: () => {
      toast.success('Group deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate(ROUTES.GROUPS);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete group.';
      toast.error(message);
    },
  });

  const kickMemberMutation = useMutation({
    mutationFn: (memberEmail: string) => apiService.kickMember(Number(groupId!), memberEmail),
    onSuccess: () => {
      toast.success('Member removed from the group.');
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to kick member.';
      toast.error(message);
    },
  });

  // Must be declared here (before any early returns) to satisfy Rules of Hooks.
  // Uses optional chaining so it works safely before `group` is confirmed loaded.
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => apiService.getGroupMembers(Number(groupId!)),
    enabled:
      !!groupId &&
      !!currentUser?.email &&
      !!group?.createdBy?.email &&
      currentUser?.email === group?.createdBy?.email,
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

  const isCreator = currentUser?.email && group.createdBy?.email && currentUser.email === group.createdBy.email;

  return (
    <>
      <AnimatePresence>
        {showLeaveDialog && (
          <LeaveConfirmDialog
            groupName={group.name}
            onConfirm={() => leaveGroupMutation.mutate()}
            onCancel={() => setShowLeaveDialog(false)}
            isLoading={leaveGroupMutation.isPending}
          />
        )}
        {showDeleteDialog && (
          <DeleteConfirmDialog
            groupName={group.name}
            onConfirm={() => deleteGroupMutation.mutate()}
            onCancel={() => setShowDeleteDialog(false)}
            isLoading={deleteGroupMutation.isPending}
          />
        )}
      </AnimatePresence>

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

              {/* Join / Leave / Delete Buttons */}
              <div className="flex gap-3 w-full md:w-auto">
                {isCreator ? (
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2 flex-1 md:w-auto h-12 px-5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-sm transition-all active:scale-95"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                    Delete Group
                  </button>
                ) : isMember ? (
                  <button
                    onClick={() => setShowLeaveDialog(true)}
                    className="flex-1 md:w-40 h-12 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-sm transition-all active:scale-95"
                  >
                    Leave Group
                  </button>
                ) : (
                  <Button
                    onClick={() => joinGroupMutation.mutate()}
                    isLoading={joinGroupMutation.isPending}
                    className="flex-1 md:w-40 h-12 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-xl font-bold"
                  >
                    Join Group
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Members Panel — creator only */}
          {isCreator && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
                  <IoPeopleOutline className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Members</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{group.memberCount ?? 0} total · only you can see this</p>
                </div>
              </div>

              {isLoadingMembers ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
                        <div className="h-2 bg-gray-100 dark:bg-white/5 rounded w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !members || members.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <IoPersonOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No members yet. Share your group!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member: GroupMember) => (
                    <motion.div
                      key={member.email}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors group/member"
                    >
                      {/* Avatar */}
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 text-white font-bold text-base">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                        {member.bio && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{member.bio}</p>
                        )}
                      </div>

                      {/* Joined date */}
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Joined</p>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                        </p>
                      </div>

                      {/* Kick button */}
                      <button
                        onClick={() => kickMemberMutation.mutate(member.email)}
                        disabled={kickMemberMutation.isPending}
                        title={`Kick ${member.name}`}
                        className="ml-2 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover/member:opacity-100 active:scale-95"
                      >
                        <IoBanOutline className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Sessions Section */}
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jamming Sessions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live and upcoming audio events</p>
              </div>
              {isCreator && (
                <Button
                  onClick={() => navigate(`${ROUTES.SESSIONS}?groupId=${groupId}`)}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-violet-500/25 whitespace-nowrap"
                >
                  <IoAdd className="w-5 h-5 mr-2" />
                  Schedule Session
                </Button>
              )}
            </div>

            {isLoadingSessions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <SessionCardSkeleton key={i} />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mb-6">
                  <IoCalendarOutline className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Scheduled Sessions</h3>
                {isCreator ? (
                  <>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">Be the first to schedule a live jam session for this community.</p>
                    <Button onClick={() => navigate(`${ROUTES.SESSIONS}?groupId=${groupId}`)} className="h-12 px-8 rounded-xl font-semibold">
                      Start a Jam
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">There are no scheduled jam sessions yet. Check back later!</p>
                )}
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
                        <SessionStatusBadge status={session.status as 'LIVE' | 'UPCOMING' | 'ENDED'} />
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
    </>
  );
};
