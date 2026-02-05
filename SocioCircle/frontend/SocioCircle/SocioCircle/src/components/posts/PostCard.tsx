import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoHeart, IoHeartOutline, IoChatbubbleOutline, IoShareSocialOutline } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import type { Post } from '../../types';
import { Avatar } from '../common/Avatar';
import { apiService } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../../config/constants';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    const previousLikeCount = likeCount;
    const previousHasLiked = hasLiked;

    // Optimistic update
    setLikeCount(previousHasLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    setHasLiked(!previousHasLiked);

    try {
      if (previousHasLiked) {
        await apiService.unlikePost(post.id);
      } else {
        await apiService.likePost(post.id);
      }
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      // Revert on error
      setLikeCount(previousLikeCount);
      setHasLiked(previousHasLiked);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!hasLiked) {
        handleLike({ stopPropagation: () => {} } as React.MouseEvent);
      }
    }
    setLastTap(now);
  };

  const handleImageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : post.mediaUrls.length - 1));
    } else {
      setCurrentImageIndex((prev) => (prev < post.mediaUrls.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link to={`${ROUTES.PROFILE}/${post.userEmail}`}>
          <Avatar
            src={post.userProfilePicture}
            alt={post.userName}
            size="md"
            className="cursor-pointer"
          />
        </Link>
        <div className="flex-1">
          <Link
            to={`${ROUTES.PROFILE}/${post.userEmail}`}
            className="font-semibold text-gray-900 dark:text-white hover:underline"
          >
            {post.userName}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div
          className="relative w-full bg-black"
          onDoubleClick={handleDoubleTap}
          style={{ aspectRatio: '1 / 1' }}
        >
          <img
            src={post.mediaUrls[currentImageIndex]}
            alt={post.caption || 'Post image'}
            className="w-full h-full object-contain"
          />
          
          {post.mediaUrls.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange('prev');
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange('next');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              >
                →
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {post.mediaUrls.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all ${
                      index === currentImageIndex ? 'w-6 bg-white' : 'w-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            {hasLiked ? (
              <IoHeart className="w-7 h-7 text-red-500" />
            ) : (
              <IoHeartOutline className="w-7 h-7 text-gray-900 dark:text-white" />
            )}
          </button>
          <button
            onClick={() => navigate(`${ROUTES.POST_DETAIL.replace(':postId', post.id.toString())}`)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <IoChatbubbleOutline className="w-7 h-7 text-gray-900 dark:text-white" />
          </button>
          <button className="transition-transform hover:scale-110 active:scale-95">
            <IoShareSocialOutline className="w-7 h-7 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <p className="font-semibold text-gray-900 dark:text-white">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <div>
            <Link
              to={`${ROUTES.PROFILE}/${post.userEmail}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline mr-2"
            >
              {post.userName}
            </Link>
            <span className="text-gray-900 dark:text-white">{post.caption}</span>
          </div>
        )}

        {/* View comments */}
        {post.commentCount > 0 && (
          <button
            onClick={() => navigate(`${ROUTES.POST_DETAIL.replace(':postId', post.id.toString())}`)}
            className="text-gray-500 dark:text-gray-400 text-sm hover:underline"
          >
            View all {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
          </button>
        )}
      </div>
    </motion.article>
  );
};
