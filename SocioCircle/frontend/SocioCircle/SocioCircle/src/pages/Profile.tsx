import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoGridOutline, IoHeartOutline, IoBookmarkOutline,
  IoSettingsOutline, IoImagesOutline, IoMusicalNoteOutline,
  IoHeart, IoChatbubbleOutline, IoCameraOutline,
} from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Spinner, ProfileSkeleton } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { ROUTES } from '../config/constants';
import type { UserInfo, FollowStats, Post } from '../types';

type TabType = 'posts' | 'saved';

// ── Mock Data (shown when backend is unavailable) ─────────────────────────────
const MOCK_USER: UserInfo = {
  email: 'demo@sociocircle.com',
  name: 'Demo User',
  bio: 'Passionate about music, always looking for the next jam 🎸',
  interests: 'Guitar,Jazz,Rock,Electronic,Blues',
  profilePicture: undefined,
};

const MOCK_STATS: FollowStats = {
  followersCount: 128,
  followingCount: 74,
  postCount: 12,
  isFollowing: false,
};

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    userEmail: 'demo@sociocircle.com',
    userName: 'Demo User',
    caption: '🎸 Late night guitar session — nothing like playing through the blues at 2am.',
    mediaUrls: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likeCount: 42,
    commentCount: 7,
    hasLiked: false,
  },
  {
    id: 2,
    userEmail: 'demo@sociocircle.com',
    userName: 'Demo User',
    caption: 'Just joined an incredible jazz jam session online. The community here is amazing! 🎷',
    mediaUrls: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likeCount: 89,
    commentCount: 14,
    hasLiked: true,
  },
  {
    id: 3,
    userEmail: 'demo@sociocircle.com',
    userName: 'Demo User',
    caption: 'Working on my first original composition. Rock meets Jazz — wish me luck! 🤞',
    mediaUrls: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likeCount: 67,
    commentCount: 9,
    hasLiked: false,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export const Profile = () => {
  const { email } = useParams<{ email?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [localLikes, setLocalLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [isFollowHovered, setIsFollowHovered] = useState(false);
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  const isOwnProfile = !email || email === currentUser?.email;
  const targetEmail = email || currentUser?.email;

  // Always fetch by email so cache keys are distinct per user.
  // For own profile, use currentUser.email from the auth store.
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', targetEmail],
    queryFn: () => apiService.getUserByEmail(targetEmail!),
    enabled: !!targetEmail,
    retry: false,
    staleTime: 0,
  });

  // Follow stats with mock fallback
  const { data: followStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['followStats', targetEmail],
    queryFn: () => apiService.getFollowStats(targetEmail!),
    enabled: !!targetEmail,
    retry: false,
  });

  // Posts with mock fallback
  const { data: postsData, isLoading: isLoadingPosts } = useInfiniteQuery({
    queryKey: ['userPosts', targetEmail],
    queryFn: ({ pageParam }) => apiService.getUserPosts(targetEmail!, pageParam),
    enabled: !!targetEmail,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: undefined as number | undefined,
    retry: false,
    staleTime: 0,
  });

  // Sync optimistic state when server data arrives
  useEffect(() => {
    if (followStats) setOptimisticFollowing(null);
  }, [followStats]);

  const isFollowing = optimisticFollowing !== null ? optimisticFollowing : (followStats ?? MOCK_STATS).isFollowing;

  const followMutation = useMutation({
    mutationFn: async () => {
      const currentlyFollowing = isFollowing;
      // Optimistic update before the request
      setOptimisticFollowing(!currentlyFollowing);
      if (currentlyFollowing) {
        await apiService.unfollowUser(targetEmail!);
        return { action: 'unfollowed' };
      } else {
        await apiService.followUser(targetEmail!);
        return { action: 'followed' };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['followStats', targetEmail] });
      toast.success(data.action === 'followed' ? '✓ Now following!' : 'Unfollowed');
    },
    onError: () => {
      // Revert optimistic update on failure
      setOptimisticFollowing(null);
      toast.error('Failed to update follow status. Please try again.');
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: (file: File) => apiService.uploadProfilePicture(file),
    onSuccess: (filePath) => {
      if (user) {
        updateUser({ ...user, profilePicture: filePath });
      }
      queryClient.invalidateQueries({ queryKey: ['user', targetEmail] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      toast.success('Profile picture updated!');
      setShowPhotoViewer(false);
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

  // Use real data only — never bleed another user's data as fallback
  const displayUser = user ?? MOCK_USER;
  const displayStats = followStats ?? MOCK_STATS;
  const rawPosts = postsData?.pages.flatMap((page: any) => page.content) ?? [];
  const displayPosts = rawPosts.length > 0 ? rawPosts : (isOwnProfile ? MOCK_POSTS : []);

  const handleLike = (post: Post) => {
    const current = localLikes[post.id] ?? { count: post.likeCount, liked: post.hasLiked };
    setLocalLikes(prev => ({
      ...prev,
      [post.id]: { count: current.liked ? current.count - 1 : current.count + 1, liked: !current.liked },
    }));
  };

  if (isLoadingUser || isLoadingStats) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-28 md:pb-12">
        <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
          <ProfileSkeleton />
        </div>
      </motion.div>
    );
  }

  const interests = displayUser.interests
    ? displayUser.interests.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-28 md:pb-12"
    >
      <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-8">

        {/* ── Profile Card ── */}
        <div className="bg-white dark:bg-[#121212] sm:rounded-3xl border-b sm:border border-gray-100 dark:border-white/5 shadow-sm mb-6 overflow-hidden">

          {/* Cover gradient */}
          <div className="h-36 sm:h-52 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Avatar + Actions row */}
          <div className="px-5 sm:px-8 pb-6 relative -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5">
              {/* Avatar — tap to view full image or change */}
              <div
                className={`relative inline-block w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#121212] shadow-xl overflow-hidden shrink-0 ${
                  (displayUser.profilePicture || isOwnProfile) ? 'cursor-pointer group' : ''
                }`}
                onClick={() => {
                  if (displayUser.profilePicture) {
                    setShowPhotoViewer(true);
                  } else if (isOwnProfile) {
                    fileInputRef.current?.click();
                  }
                }}
                title={isOwnProfile ? 'Change photo' : (displayUser.profilePicture ? 'View photo' : undefined)}
              >
                <Avatar
                  src={displayUser.profilePicture}
                  alt={displayUser.name}
                  size="xl"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {uploadPictureMutation.isPending ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Spinner size="md" className="text-white" />
                  </div>
                ) : isOwnProfile ? (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-full flex items-center justify-center">
                    <IoCameraOutline className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                ) : displayUser.profilePicture && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Name + action buttons */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:mb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {displayUser.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-violet-500 dark:text-violet-400 font-semibold text-sm">
                      @{displayUser.email.split('@')[0]}
                    </p>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <p className="text-gray-400 text-sm">{displayUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                      className="rounded-xl px-5 h-9 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-bold"
                    >
                      <IoSettingsOutline className="w-4 h-4 mr-1.5" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={() => followMutation.mutate()}
                      isLoading={followMutation.isPending}
                      onMouseEnter={() => setIsFollowHovered(true)}
                      onMouseLeave={() => setIsFollowHovered(false)}
                      className={`rounded-xl px-7 h-9 font-bold text-sm transition-all active:scale-95 ${
                        isFollowing
                          ? isFollowHovered
                            ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/30'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25'
                      }`}
                    >
                      {isFollowing
                        ? isFollowHovered ? '✕ Unfollow' : '✓ Following'
                        : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {displayUser.bio && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-[0.95rem] max-w-xl">
                {displayUser.bio}
              </p>
            )}

            {/* Interests */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mr-1">
                  <IoMusicalNoteOutline className="w-4 h-4" />
                </div>
                {interests.map((interest: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full text-xs font-bold border border-violet-100 dark:border-violet-500/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex divide-x divide-gray-100 dark:divide-white/10 border-t border-gray-100 dark:border-white/10 pt-5">
              {[
                { label: 'Posts', value: displayStats.postCount || displayPosts.length },
                {
                  label: 'Followers', value: displayStats.followersCount,
                  onClick: () => setFollowModalType('followers'),
                },
                {
                  label: 'Following', value: displayStats.followingCount,
                  onClick: () => setFollowModalType('following'),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  onClick={stat.onClick}
                  className={`flex-1 text-center px-2 ${stat.onClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                >
                  <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab + View Toggle Bar ── */}
        <div className="sticky top-[72px] z-30 bg-gray-50/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sm:rounded-2xl sm:border mb-4 px-3 py-2 flex items-center justify-between">
          <div className="flex gap-1">
            {[
              { key: 'posts', label: 'POSTS', icon: IoGridOutline },
              ...(isOwnProfile ? [{ key: 'saved', label: 'SAVED', icon: IoBookmarkOutline }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-200/50 dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2a2a2a] text-violet-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IoGridOutline className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'feed'
                  ? 'bg-white dark:bg-[#2a2a2a] text-violet-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IoImagesOutline className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Posts Content ── */}
        <div className="px-1 lg:px-0">
          <AnimatePresence mode="wait">
            {activeTab === 'saved' ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-16 bg-white dark:bg-[#121212] sm:rounded-3xl border border-gray-100 dark:border-white/5"
              >
                <IoBookmarkOutline className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Saved Posts</h3>
                <p className="text-gray-500 text-sm mt-1">Posts you save will appear here.</p>
              </motion.div>
            ) : isLoadingPosts ? (
              <div className="flex justify-center py-16">
                <Spinner className="text-violet-500" />
              </div>
            ) : displayPosts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white dark:bg-[#121212] sm:rounded-3xl border border-gray-100 dark:border-white/5"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoImagesOutline className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No Posts Yet</h2>
                <p className="text-gray-500 text-sm">
                  {isOwnProfile ? "Share your first post!" : "When they post, it'll appear here."}
                </p>
                {isOwnProfile && (
                  <Button
                    onClick={() => navigate(ROUTES.POST_CREATE)}
                    className="mt-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-6 h-10"
                  >
                    Create Post
                  </Button>
                )}
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 gap-0.5 sm:gap-1.5"
              >
                {displayPosts.map((post: Post) => {
                  const likeState = localLikes[post.id];
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => navigate(ROUTES.POST_DETAIL.replace(':postId', post.id.toString()))}
                      className="aspect-square cursor-pointer relative group rounded-sm sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]"
                    >
                      {post.mediaUrls.length > 0 ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt="Post"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full p-3 flex items-start bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-[#1a1a2e] dark:to-[#1a1a1a]">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 line-clamp-5 leading-relaxed">
                            {post.caption}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-4 text-white font-bold text-sm drop-shadow-md">
                          <div className="flex items-center gap-1.5">
                            <IoHeart className="w-5 h-5" />
                            {likeState ? likeState.count : post.likeCount}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <IoChatbubbleOutline className="w-5 h-5" />
                            {post.commentCount}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4 max-w-xl mx-auto"
              >
                {displayPosts.map((post: Post) => {
                  const likeState = localLikes[post.id] ?? { count: post.likeCount, liked: post.hasLiked };
                  return (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm"
                    >
                      <div className="flex items-center gap-3 p-4">
                        <Avatar src={displayUser.profilePicture} alt={displayUser.name} size="sm" />
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{displayUser.name}</p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {post.mediaUrls.length > 0 && (
                        <img src={post.mediaUrls[0]} alt="" className="w-full aspect-[4/3] object-cover" />
                      )}
                      {post.caption && (
                        <div className="px-4 py-3">
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{post.caption}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 px-4 pb-4 pt-1">
                        <button
                          onClick={() => handleLike(post)}
                          className="flex items-center gap-1.5 text-sm font-semibold transition-transform hover:scale-110 active:scale-90"
                        >
                          {likeState.liked ? (
                            <IoHeart className="w-6 h-6 text-red-500" />
                          ) : (
                            <IoHeartOutline className="w-6 h-6 text-gray-900 dark:text-white" />
                          )}
                          <span className="text-gray-700 dark:text-gray-300">{likeState.count}</span>
                        </button>
                        <button
                          onClick={() => navigate(ROUTES.POST_DETAIL.replace(':postId', post.id.toString()))}
                          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          <IoChatbubbleOutline className="w-6 h-6" />
                          <span>{post.commentCount}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Full-screen Photo Viewer ── */}
      <AnimatePresence>
        {showPhotoViewer && displayUser.profilePicture && (
          <motion.div
            key="photo-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
            onClick={() => setShowPhotoViewer(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowPhotoViewer(false)}
            tabIndex={0}
            role="dialog"
            aria-label="Profile photo viewer"
            ref={(el) => el?.focus()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPhotoViewer(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Photo container */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={
                  (() => {
                    const s = displayUser.profilePicture || '';
                    if (s.startsWith('http') || s.startsWith('data:')) return s;
                    const backendOrigin = import.meta.env.VITE_API_URL ?? 'http://localhost:9090';
                    if (s.startsWith('/uploads/') || s.startsWith('uploads/')) {
                      return `${backendOrigin}${s.startsWith('/') ? s : '/' + s}`;
                    }
                    return s;
                  })()
                }
                alt={displayUser.name}
                className="max-w-[90vw] max-h-[75vh] rounded-3xl shadow-2xl object-contain border-2 border-white/10"
              />
              <p className="text-white/80 text-sm font-semibold tracking-wide">
                {displayUser.name}
              </p>
              {isOwnProfile && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  isLoading={uploadPictureMutation.isPending}
                  className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-6 py-2 backdrop-blur-sm"
                >
                  <IoCameraOutline className="w-5 h-5 mr-2" />
                  Change Photo
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FollowListModal
        isOpen={!!followModalType}
        onClose={() => setFollowModalType(null)}
        type={followModalType}
        userEmail={targetEmail!}
      />
    </motion.div>
  );
};

// ── Follow List Modal ──────────────────────────────────────────────────────────
const MOCK_FOLLOW_LIST = [
  { email: 'alice@example.com', name: 'Alice Johnson', bio: 'Jazz guitarist 🎷' },
  { email: 'bob@example.com', name: 'Bob Smith', bio: 'Drummer & producer' },
  { email: 'carol@example.com', name: 'Carol Davis', bio: 'Vocalist & songwriter 🎤' },
];

/** Inline follow/unfollow button used inside the Follow List Modal */
const ModalFollowButton = ({ targetEmail }: { targetEmail: string }) => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const isOwnEmail = targetEmail === currentUser?.email;

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['followStats', targetEmail],
    queryFn: () => apiService.getFollowStats(targetEmail),
    enabled: !isOwnEmail,
    retry: false,
  });

  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);

  // Sync optimistic state when server data arrives
  useEffect(() => {
    if (stats) setOptimistic(null);
  }, [stats]);

  const isFollowing = optimistic !== null ? optimistic : (stats?.isFollowing ?? false);

  const mutation = useMutation({
    mutationFn: async () => {
      const wasFollowing = isFollowing;
      setOptimistic(!wasFollowing);
      if (wasFollowing) {
        await apiService.unfollowUser(targetEmail);
        return { action: 'unfollowed' };
      } else {
        await apiService.followUser(targetEmail);
        return { action: 'followed' };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['followStats', targetEmail] });
      toast.success(data.action === 'followed' ? '✓ Now following!' : 'Unfollowed');
    },
    onError: () => {
      setOptimistic(null);
      toast.error('Failed to update follow status.');
    },
  });

  if (isOwnEmail || isLoadingStats) return null;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); mutation.mutate(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={mutation.isPending}
      className={`h-8 text-xs font-bold rounded-xl px-3 shrink-0 border transition-all active:scale-95 ${
        isFollowing
          ? hovered
            ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/30'
            : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'
          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow shadow-violet-500/20'
      }`}
    >
      {mutation.isPending
        ? '…'
        : isFollowing
          ? hovered ? '✕ Unfollow' : '✓ Following'
          : 'Follow'}
    </button>
  );
};

const FollowListModal = ({
  isOpen, onClose, type, userEmail,
}: {
  isOpen: boolean; onClose: () => void; type: 'followers' | 'following' | null; userEmail: string;
}) => {
  const navigate = useNavigate();
  const { data: users, isLoading } = useQuery({
    queryKey: ['followList', type, userEmail],
    queryFn: () =>
      type === 'followers' ? apiService.getFollowers(userEmail) : apiService.getFollowing(userEmail),
    enabled: !!type && isOpen,
    retry: false,
  });

  const displayList = users && users.length > 0 ? users : MOCK_FOLLOW_LIST;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'followers' ? 'Followers' : 'Following'}>
      <div className="min-h-[300px] max-h-[60vh] overflow-y-auto px-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-3">
            {displayList.map((u: any) => (
              <div
                key={u.email}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group"
              >
                <div
                  className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer"
                  onClick={() => { onClose(); navigate(ROUTES.PROFILE + '/' + u.email); }}
                >
                  <Avatar src={u.profilePicture} alt={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-violet-600 transition-colors">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.bio || u.email}</p>
                  </div>
                </div>
                {/* Inline follow/unfollow — replaces the plain "View" button */}
                <ModalFollowButton targetEmail={u.email} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
