import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { IoFlashOutline } from 'react-icons/io5';
import { PostCard } from '../components/posts/PostCard';
import { PostSkeleton } from '../components/common/Loading';
import { apiService } from '../services/api';
import type { Post } from '../types';
import { POST_PAGE_SIZE } from '../config/constants';

type FeedType = 'all' | 'following';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};

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
    queryFn: ({ pageParam }) =>
      feedType === 'all'
        ? apiService.getFeed(pageParam as number | undefined, POST_PAGE_SIZE)
        : apiService.getFollowingFeed(pageParam as number | undefined, POST_PAGE_SIZE),
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
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
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

        {/* ── Feed Tabs ── */}
        <div className="sticky top-[68px] z-30 mb-6 px-4 sm:px-0">
          <div className="flex bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-1.5 rounded-2xl shadow-sm">
            {[
              { id: 'all',       label: 'For You',   icon: IoFlashOutline },
              { id: 'following', label: 'Following' },
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
                    className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl shadow-md shadow-violet-500/25"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab.id === 'all' && <IoFlashOutline className="w-4 h-4" />}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Posts ── */}
        <div className="space-y-0 sm:space-y-6">
          {isLoading && posts.length === 0 ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 px-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl mx-4 sm:mx-0 shadow-sm"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📭</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No posts yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {feedType === 'following'
                    ? "You aren't following anyone yet, or they haven't posted."
                    : 'Be the first to share something with the community!'}
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-0 sm:space-y-6"
              >
                {posts.map((post) => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-4" />

              {isFetchingNextPage && (
                <div className="py-4">
                  <PostSkeleton />
                </div>
              )}

              {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-10">
                  <span className="inline-block px-5 py-2.5 bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 font-semibold rounded-2xl text-sm border border-gray-100 dark:border-white/5 shadow-sm">
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
