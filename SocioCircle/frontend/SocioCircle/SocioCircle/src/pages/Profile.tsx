import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoGridOutline, IoHeartOutline, IoBookmarkOutline, IoPersonOutline, IoSettingsOutline, IoImagesOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { ROUTES } from '../config/constants';
import { PostCard } from '../components/posts/PostCard';
import { useState } from 'react';

type TabType = 'posts' | 'saved';

export const Profile = () => {
  const { email } = useParams<{ email?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  
  const isOwnProfile = !email || email === currentUser?.email;
  const targetEmail = email || currentUser?.email;

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', targetEmail],
    queryFn: () => (isOwnProfile ? apiService.getCurrentUser() : apiService.getUserByEmail(targetEmail!)),
    enabled: !!targetEmail,
  });

  const { data: followStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['followStats', targetEmail],
    queryFn: () => apiService.getFollowStats(targetEmail!),
    enabled: !!user && !!targetEmail,
  });

  const { data: postsData, isLoading: isLoadingPosts } = useInfiniteQuery({
    queryKey: ['userPosts', targetEmail],
    queryFn: ({ pageParam }) => apiService.getUserPosts(targetEmail!, pageParam),
    enabled: !!user,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: undefined as number | undefined,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (followStats?.isFollowing) {
        return apiService.unfollowUser(targetEmail!);
      } else {
        return apiService.followUser(targetEmail!);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStats', targetEmail] });
    },
    onError: () => {
      toast.error('Failed to update follow status');
    }
  });

  const posts = postsData?.pages.flatMap((page: any) => page.content) || [];

  if (isLoadingUser || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-violet-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24 px-4">
        <IoPersonOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
        <p className="text-gray-500">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12"
    >
      <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#121212] sm:rounded-3xl border-b sm:border border-gray-100 dark:border-white/5 shadow-sm mb-8 overflow-hidden backdrop-blur-xl">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-violet-600 to-fuchsia-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="px-6 pb-8 relative -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-6">
              <div className="relative inline-block w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-[#121212] bg-white dark:bg-[#1a1a1a] shadow-lg overflow-hidden shrink-0">
                <Avatar 
                  src={user.profilePicture} 
                  alt={user.name} 
                  size="xl" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0 sm:mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {user.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">@{user.email.split('@')[0]}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                      className="rounded-xl px-6 h-10 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <IoSettingsOutline className="w-5 h-5 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={() => followMutation.mutate()}
                      isLoading={followMutation.isPending}
                      className={`rounded-xl px-8 h-10 font-bold transition-transform active:scale-95 ${
                        followStats?.isFollowing
                          ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg'
                      }`}
                    >
                      {followStats?.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Bio & Interests */}
            <div className="space-y-4 max-w-2xl">
              {user.bio && (
                  <p className="text-[1.05rem] text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    {user.bio}
                  </p>
              )}
              
              {user.interests && (
                <div className="flex flex-wrap gap-2">
                  {user.interests.split(',').map((interest: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold border border-violet-100 dark:border-violet-500/10"
                    >
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex divide-x divide-gray-100 dark:divide-white/10 border-t border-gray-100 dark:border-white/10 mt-8 pt-6">
              {[
                { label: 'Posts', value: followStats?.postCount || 0 },
                { label: 'Followers', value: followStats?.followersCount || 0, to: ROUTES.FOLLOWERS.replace(':email', user.email) },
                { label: 'Following', value: followStats?.followingCount || 0, to: ROUTES.FOLLOWING.replace(':email', user.email) }
              ].map((stat, i) => (
                stat.to ? (
                  <Link key={i} to={stat.to} className="flex-1 text-center hover:opacity-75 transition-opacity px-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
                    <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                  </Link>
                ) : (
                  <div key={i} className="flex-1 text-center px-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
                    <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Tab & View Toggle */}
        <div className="sticky top-[72px] z-30 bg-gray-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sm:rounded-2xl sm:border sm:mx-0 mx-0 mt-4 px-4 py-2 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'posts'
                  ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IoGridOutline className="w-5 h-5" />
              POSTS
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <IoBookmarkOutline className="w-5 h-5" />
                SAVED
              </button>
            )}
          </div>

          <div className="flex gap-1 bg-gray-200/50 dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IoGridOutline className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'feed'
                  ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IoImagesOutline className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 px-1 lg:px-0">
          {isLoadingPosts ? (
            <div className="flex justify-center py-20">
              <Spinner className="text-violet-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-[#121212] sm:rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-white/5">
                <IoImagesOutline className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Posts Yet</h2>
              <p className="text-gray-500">When they post, it will appear here.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  onClick={() => navigate(ROUTES.POST_DETAIL.replace(':postId', post.id.toString()))}
                  className="aspect-square cursor-pointer relative group rounded-md sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]"
                >
                  {post.mediaUrls.length > 0 ? (
                    <img
                      src={post.mediaUrls[0]}
                      alt="Post"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center text-center">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 font-serif line-clamp-4">
                        {post.caption}
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-5 text-white font-bold text-lg drop-shadow-md">
                      <div className="flex items-center gap-1.5"><IoHeartOutline className="w-6 h-6"/> {post.likeCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col max-w-xl mx-auto">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
