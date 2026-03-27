import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoHeart, IoHeartOutline, IoChatbubbleOutline, IoShareSocialOutline, IoEllipsisHorizontal, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    const previousLikeCount = likeCount;
    const previousHasLiked = hasLiked;

    setLikeCount(previousHasLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    setHasLiked(!previousHasLiked);

    try {
      if (previousHasLiked) {
        await apiService.unlikePost(post.id);
      } else {
        await apiService.likePost(post.id);
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
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
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
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
      className="bg-white dark:bg-[#121212] border-b sm:border border-gray-100 dark:border-white/5 sm:rounded-3xl mb-8 overflow-hidden shadow-sm backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link to={`${ROUTES.PROFILE}/${post.userEmail}`} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar
              src={post.userProfilePicture}
              alt={post.userName}
              size="md"
              className="relative border-2 border-white dark:border-[#121212] cursor-pointer"
            />
          </Link>
          <div className="flex flex-col">
            <Link
              to={`${ROUTES.PROFILE}/${post.userEmail}`}
              className="font-bold text-[0.95rem] text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
            >
              {post.userName}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
          </span>
          <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <IoEllipsisHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div
          className="relative w-full bg-[#1a1a1a] sm:px-0 cursor-pointer overflow-hidden flex items-center justify-center"
          onDoubleClick={handleDoubleTap}
          style={{ aspectRatio: '4 / 5', maxHeight: '600px' }}
        >
          <img
            src={post.mediaUrls[currentImageIndex]}
            alt={post.caption || 'Post image'}
            className="w-full h-full object-cover"
          />
          
          <AnimatePresence>
            {showHeartAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl"
              >
                <IoHeart className="w-24 h-24 text-white drop-shadow-xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {post.mediaUrls.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange('prev');
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2 transition-all shadow-lg hidden sm:block"
                >
                  <IoChevronBack className="w-5 h-5" />
                </button>
              )}
              {currentImageIndex < post.mediaUrls.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange('next');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2 transition-all shadow-lg hidden sm:block"
                >
                  <IoChevronForward className="w-5 h-5" />
                </button>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 bg-black/20 backdrop-blur-md rounded-full">
                {post.mediaUrls.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'w-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="transition-transform hover:scale-110 active:scale-90"
            >
              {hasLiked ? (
                <IoHeart className="w-[28px] h-[28px] text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
              ) : (
                <IoHeartOutline className="w-[28px] h-[28px] text-gray-900 dark:text-white" />
              )}
            </button>
            <button
              onClick={() => navigate(`${ROUTES.POST_DETAIL.replace(':postId', post.id.toString())}`)}
              className="transition-transform hover:scale-110 active:scale-90"
            >
              <IoChatbubbleOutline className="w-[26px] h-[26px] text-gray-900 dark:text-white" />
            </button>
            <button className="transition-transform hover:scale-110 active:scale-90">
              <IoShareSocialOutline className="w-[26px] h-[26px] text-gray-900 dark:text-white -mt-0.5" />
            </button>
          </div>
        </div>

        {/* Likes Count */}
        {likeCount > 0 && (
          <p className="font-bold text-sm text-gray-900 dark:text-white mb-2 ml-0.5">
            {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-[0.95rem] leading-[1.4] mb-2">
            <Link
              to={`${ROUTES.PROFILE}/${post.userEmail}`}
              className="font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity mr-2"
            >
              {post.userName}
            </Link>
            <span className="text-gray-800 dark:text-gray-100">{post.caption}</span>
          </div>
        )}

        {/* Comments Link */}
        {post.commentCount > 0 && (
          <button
            onClick={() => navigate(`${ROUTES.POST_DETAIL.replace(':postId', post.id.toString())}`)}
            className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            View all {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
          </button>
        )}
      </div>
    </motion.article>
  );
};
