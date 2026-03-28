import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoHeart, IoHeartOutline, IoArrowBack, IoChatbubbleOutline, IoShareSocialOutline, IoEllipsisHorizontal, IoTrashOutline } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { ROUTES } from '../config/constants';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  
  const [comment, setComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => apiService.getPost(Number(postId)),
    enabled: !!postId,
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => apiService.getComments(Number(postId)),
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => apiService.addComment(Number(postId!), content),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => apiService.deletePost(Number(postId!)),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      navigate(ROUTES.FEED);
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const handleLike = async () => {
    if (!post || isLiking) return;
    setIsLiking(true);
    try {
      if (post.hasLiked) {
        await apiService.unlikePost(post.id);
      } else {
        await apiService.likePost(post.id);
      }
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!post?.hasLiked) {
        handleLike();
      }
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
    setLastTap(now);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Spinner size="lg" className="text-violet-500 mb-4" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-gray-50 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-white/5">
          <IoChatbubbleOutline className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
        <p className="text-gray-500">This post may have been deleted or is unavailable.</p>
        <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
      </div>
    );
  }

  const isOwner = currentUser?.email === post.userEmail;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto px-0 sm:px-4 py-0 sm:py-6 pb-24 md:pb-6"
    >
      {/* Mobile Back Button */}
      <div className="sm:hidden px-4 py-3 sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl z-20 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-900 dark:text-white">
          <IoArrowBack className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-900 dark:text-white text-lg">Post</span>
      </div>

      <div className="bg-white dark:bg-[#121212] sm:border border-gray-100 dark:border-white/10 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[60vh] md:max-h-[85vh]">
        
        {/* Left Side - Image/Media (Only renders if media exists) */}
        {post.mediaUrls.length > 0 && (
          <div 
            className="md:w-[55%] lg:w-[60%] bg-[#0a0a0a] relative flex items-center justify-center border-r border-gray-100 dark:border-white/10 shrink-0"
            onDoubleClick={handleDoubleTap}
            style={{ minHeight: '300px' }}
          >
            <img
              src={post.mediaUrls[0]}
              alt={post.caption || 'Post image'}
              className="w-full h-full object-contain max-h-[70vh] md:max-h-full"
            />
            <AnimatePresence>
              {showHeartAnimation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl z-10"
                >
                  <IoHeart className="w-32 h-32 text-white drop-shadow-xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Right Side - Content & Comments */}
        <div className={`flex flex-col ${post.mediaUrls.length > 0 ? 'md:w-[45%] lg:w-[40%]' : 'w-full max-w-2xl mx-auto'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Link to={`${ROUTES.PROFILE}/${post.userEmail}`} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Avatar src={post.userProfilePicture} alt={post.userName} size="md" className="relative border-2 border-white dark:border-[#121212]" />
              </Link>
              <div className="flex flex-col">
                <Link to={`${ROUTES.PROFILE}/${post.userEmail}`} className="font-bold text-[0.95rem] text-gray-900 dark:text-white hover:opacity-80">
                  {post.userName}
                </Link>
                <p className="text-xs text-gray-500 sm:hidden">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IoEllipsisHorizontal className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showMenu && isOwner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        if (confirm('Are you sure you want to delete this post?')) {
                          deletePostMutation.mutate();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-2 text-red-500 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-semibold"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                      Delete Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comments Section (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/30 dark:bg-[#121212]/30 custom-scrollbar relative">
            
            {/* Original Caption / Author Comment */}
            {post.caption && (
              <div className="flex gap-3 mb-6">
                <Avatar src={post.userProfilePicture} alt={post.userName} size="sm" className="mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-[0.95rem] text-gray-900 dark:text-white mr-2 hover:opacity-80 cursor-pointer" onClick={() => navigate(`${ROUTES.PROFILE}/${post.userEmail}`)}>
                    {post.userName}
                  </span>
                  <span className="text-[0.95rem] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{post.caption}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="flex justify-center p-4">
                <Spinner className="text-violet-500" />
              </div>
            ) : comments?.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                <IoChatbubbleOutline className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No comments yet.</p>
                <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3 animate-fade-in group">
                  <Avatar src={comment.userProfilePicture} alt={comment.userName} size="sm" className="mt-1 flex-shrink-0" />
                  <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-3 rounded-tl-none border border-gray-100 dark:border-white/5 transition-colors group-hover:border-violet-500/20">
                    <span className="font-bold text-[0.9rem] text-gray-900 dark:text-white block mb-0.5">
                      {comment.userName}
                    </span>
                    <span className="text-[0.95rem] text-gray-800 dark:text-gray-200 leading-snug">{comment.content}</span>
                    <p className="text-[0.7rem] text-gray-500 dark:text-gray-400 mt-1.5 font-semibold uppercase tracking-wider">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {/* Added bottom padding to ensure final comments are not hidden by input */}
            <div className="h-6"></div>
          </div>

          {/* Bottom Actions & Input Area */}
          <div className="border-t border-gray-100 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl">
            {/* Quick Actions (Like, Comment, Share) */}
            <div className="p-3 sm:p-4 pb-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={handleLike} disabled={isLiking} className="transition-transform hover:scale-110 active:scale-95 group">
                    {post.hasLiked ? (
                      <IoHeart className="w-[28px] h-[28px] text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    ) : (
                      <IoHeartOutline className="w-[28px] h-[28px] text-gray-900 dark:text-white group-hover:text-gray-500" />
                    )}
                  </button>
                  <button className="transition-transform hover:scale-110 active:scale-95 group">
                    <IoChatbubbleOutline className="w-[26px] h-[26px] text-gray-900 dark:text-white group-hover:text-gray-500" />
                  </button>
                  <button className="transition-transform hover:scale-110 active:scale-95 group">
                    <IoShareSocialOutline className="w-[26px] h-[26px] text-gray-900 dark:text-white group-hover:text-gray-500 -mt-0.5" />
                  </button>
                </div>
              </div>
              {post.likeCount > 0 && (
                <p className="font-bold border-b border-transparent text-sm text-gray-900 dark:text-white -ml-0.5">
                  {post.likeCount.toLocaleString()} {post.likeCount === 1 ? 'like' : 'likes'}
                </p>
              )}
              <p className="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-widest hidden sm:block mt-1">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Comment Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) addCommentMutation.mutate(comment);
              }}
              className="p-3 sm:px-4 sm:pb-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-3 relative"
            >
              <Avatar src={currentUser?.profilePicture} alt="You" size="sm" className="hidden sm:block shrink-0 ring-2 ring-gray-100 dark:ring-white/10" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-full py-2.5 pl-4 pr-16 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!comment.trim() || addCommentMutation.isPending}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-bold rounded-full transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {addCommentMutation.isPending ? <Spinner className="w-4 h-4 text-white" /> : 'Post'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
