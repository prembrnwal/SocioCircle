import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
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
        ? apiService.getFeed(pageParam, POST_PAGE_SIZE)
        : apiService.getFollowingFeed(pageParam, POST_PAGE_SIZE);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as number | undefined,
  });

  useEffect(() => {
    if (data) {
      const allPosts = data.pages.flatMap((page) => page.content);
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
    setFeedType(type);
    setPosts([]);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Feed Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => handleFeedTypeChange('all')}
          className={`pb-3 px-4 font-semibold transition-colors ${
            feedType === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => handleFeedTypeChange('following')}
          className={`pb-3 px-4 font-semibold transition-colors ${
            feedType === 'following'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Following
        </button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {feedType === 'following'
              ? "You're not following anyone yet. Start following users to see their posts here!"
              : 'No posts available. Be the first to post!'}
          </p>
        </div>
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              You're all caught up! 🎉
            </div>
          )}
        </>
      )}
    </div>
  );
};
