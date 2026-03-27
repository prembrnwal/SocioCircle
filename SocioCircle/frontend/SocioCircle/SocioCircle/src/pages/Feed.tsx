import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PostCard } from '../components/posts/PostCard';
import { PostSkeleton } from '../components/common/Loading';
import { apiService } from '../services/api';
import type { Post } from '../types';
import { POST_PAGE_SIZE } from '../config/constants';

type FeedType = 'all' | 'following';

export const Feed = () => {
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', 'feed', feedType],
    queryFn: ({ pageParam }) => {
      return feedType === 'all'
        ? apiService.getFeed(pageParam as number | undefined, POST_PAGE_SIZE)
        : apiService.getFollowingFeed(pageParam as number | undefined, POST_PAGE_SIZE);
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: undefined as number | undefined,
  });

  useEffect(() => {
    if (data) {
      const allPosts = data.pages.flatMap((page: any) => page.content);
      setPosts(allPosts);
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFeedTypeChange = (type: FeedType) => {
    if (feedType !== type) {
      setFeedType(type);
      setPosts([]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12"
    >
      <div className="max-w-xl mx-auto px-0 sm:px-4 py-6">
        {/* Feed Tabs - Glassmorphic Sticky Header */}
        <div className="sticky top-[72px] z-30 mb-8 px-4 sm:px-0">
          <div className="flex bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-1.5 rounded-2xl shadow-sm">
            {[
              { id: 'all', label: 'For You' },
              { id: 'following', label: 'Following' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFeedTypeChange(tab.id as FeedType)}
                className={`flex-1 relative py-2.5 text-sm font-bold rounded-xl transition-colors ${
                  feedType === tab.id
                    ? 'text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {feedType === tab.id && (
                  <motion.div
                    layoutId="feedTabBubble"
                    className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Content */}
        <div className="space-y-6">
          {isLoading && posts.length === 0 ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl mx-4 sm:mx-0 shadow-sm"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📭</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No posts yet</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {feedType === 'following'
                  ? "You aren't following anyone yet, or they haven't posted."
                  : 'Be the first to share something with the community!'}
              </p>
            </motion.div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-4" />
              
              {isFetchingNextPage && (
                <div className="py-4">
                  <PostSkeleton />
                </div>
              )}
              
              {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-10">
                  <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium rounded-full text-sm">
                    You're all caught up! 🎉
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
