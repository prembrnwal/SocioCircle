import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoHeart, IoHeartOutline, IoArrowBack } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Button, Input } from '../components/common';
import { Spinner } from '../components/common/Loading';
import { ROUTES } from '../config/constants';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [comment, setComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const {
    data: post,
    isLoading,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => apiService.getPost(Number(postId)),
    enabled: !!postId,
  });

  const {
    data: comments,
    isLoading: isLoadingComments,
  } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <IoArrowBack className="w-6 h-6" />
        Back
      </button>

      <div className="card overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2 bg-black flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
            <img
              src={post.mediaUrls[0]}
              alt={post.caption || 'Post'}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Content */}
          <div className="md:w-1/2 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
              <Avatar
                src={post.userProfilePicture}
                alt={post.userName}
                size="md"
                className="cursor-pointer"
                onClick={() => navigate(`${ROUTES.PROFILE}/${post.userEmail}`)}
              />
              <div className="flex-1">
                <button
                  onClick={() => navigate(`${ROUTES.PROFILE}/${post.userEmail}`)}
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  {post.userName}
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Caption */}
              <div className="flex gap-3">
                <Avatar src={post.userProfilePicture} alt={post.userName} size="sm" />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white mr-2">
                    {post.userName}
                  </span>
                  <span className="text-gray-900 dark:text-white">{post.caption}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Comments List */}
              {isLoadingComments ? (
                <Spinner />
              ) : (
                comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar
                      src={comment.userProfilePicture}
                      alt={comment.userName}
                      size="sm"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 dark:text-white mr-2">
                        {comment.userName}
                      </span>
                      <span className="text-gray-900 dark:text-white">{comment.content}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  {post.hasLiked ? (
                    <IoHeart className="w-7 h-7 text-red-500" />
                  ) : (
                    <IoHeartOutline className="w-7 h-7 text-gray-900 dark:text-white" />
                  )}
                </button>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                </p>
              </div>

              {/* Add Comment */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (comment.trim()) {
                    addCommentMutation.mutate(comment);
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!comment.trim() || addCommentMutation.isPending}
                  variant="primary"
                >
                  Post
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
