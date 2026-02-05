import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { IoGridOutline, IoBookmarkOutline, IoPersonOutline } from 'react-icons/io5';
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
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const isOwnProfile = !email || email === currentUser?.email;

  const {
    data: user,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ['user', email || currentUser?.email],
    queryFn: () => {
      if (isOwnProfile) {
        return apiService.getCurrentUser();
      }
      return apiService.getUserByEmail(email!);
    },
    enabled: !!currentUser,
  });

  const {
    data: followStats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['followStats', email || currentUser?.email],
    queryFn: () => {
      if (isOwnProfile) {
        return apiService.getFollowStats(currentUser!.email);
      }
      return apiService.getFollowStats(email!);
    },
    enabled: !!user && !!currentUser,
  });

  const {
    data: postsData,
    isLoading: isLoadingPosts,
  } = useInfiniteQuery({
    queryKey: ['userPosts', email || currentUser?.email],
    queryFn: ({ pageParam }) => {
      const targetEmail = email || currentUser?.email;
      return apiService.getUserPosts(targetEmail!, pageParam);
    },
    enabled: !!user,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as number | undefined,
  });

  const posts = postsData?.pages.flatMap((page) => page.content) || [];

  if (isLoadingUser || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar src={user.profilePicture} alt={user.name} size="xl" />
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={followStats?.isFollowing ? 'secondary' : 'primary'}
                  onClick={async () => {
                    try {
                      if (followStats?.isFollowing) {
                        await apiService.unfollowUser(email!);
                      } else {
                        await apiService.followUser(email!);
                      }
                      // Invalidate queries
                      window.location.reload();
                    } catch (error) {
                      console.error('Failed to follow/unfollow');
                    }
                  }}
                >
                  {followStats?.isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <Link
                to={`${ROUTES.PROFILE}/${user.email}/posts`}
                className="hover:underline"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {posts.length}
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">posts</span>
              </Link>
              <Link
                to={`${ROUTES.FOLLOWERS.replace(':email', user.email)}`}
                className="hover:underline"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {followStats?.followersCount || 0}
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">followers</span>
              </Link>
              <Link
                to={`${ROUTES.FOLLOWING.replace(':email', user.email)}`}
                className="hover:underline"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {followStats?.followingCount || 0}
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">following</span>
              </Link>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-900 dark:text-white mb-2">{user.bio}</p>
            )}

            {/* Interests */}
            {user.interests && (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.interests.split(',').map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 pb-3 px-1 font-semibold transition-colors ${
            activeTab === 'posts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <IoGridOutline className="w-5 h-5" />
          POSTS
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 pb-3 px-1 font-semibold transition-colors ${
              activeTab === 'saved'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <IoBookmarkOutline className="w-5 h-5" />
            SAVED
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {isLoadingPosts ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <IoPersonOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`${ROUTES.POST_DETAIL.replace(':postId', post.id.toString())}`)}
              className="aspect-square cursor-pointer relative group"
            >
              <img
                src={post.mediaUrls[0]}
                alt={post.caption || 'Post'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-4 text-white">
                  <span className="font-semibold">{post.likeCount}</span>
                  <span className="font-semibold">{post.commentCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
