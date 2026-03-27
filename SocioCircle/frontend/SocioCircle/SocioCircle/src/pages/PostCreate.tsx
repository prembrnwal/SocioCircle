import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IoClose, IoImageOutline, IoArrowBack, IoAddOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { ROUTES } from '../config/constants';

export const PostCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [caption]);

  const createPostMutation = useMutation({
    mutationFn: () => apiService.createPost({ caption, files: selectedFiles }),
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(ROUTES.FEED);
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 10) {
      toast.warning('You can only upload up to 10 images');
      return;
    }

    const newFiles = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(newFiles);

    // Create previews sequentially using Promises to guarantee order
    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then((newPreviewUrls) => {
      setPreviews((prev) => [...prev, ...newPreviewUrls].slice(0, 10));
    });
    
    // Reset file input so same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    createPostMutation.mutate();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 md:pb-12 pt-4 sm:pt-8"
    >
      <div className="max-w-xl mx-auto px-4 sm:px-0">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">New Post</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#121212] rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-white/5 shadow-xl backdrop-blur-xl">
            
            {/* Image Preview / Upload Grid */}
            <div className="mb-6">
              {previews.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square sm:aspect-video rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 dark:hover:border-violet-500 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IoImageOutline className="w-8 h-8 text-violet-500 dark:text-violet-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Choose Photos</p>
                  <p className="text-sm text-gray-500 mt-1">Up to 10 images</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <AnimatePresence>
                    {previews.map((preview, index) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        key={preview}
                        className={`relative group rounded-xl overflow-hidden bg-black ${index === 0 ? 'col-span-3 aspect-square sm:aspect-[4/3]' : 'aspect-square'}`}
                      >
                        <img
                          src={preview}
                          alt={`Upload preview ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <IoClose className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                    
                    {previews.length > 0 && previews.length < 10 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer hover:border-violet-500 transition-colors group"
                      >
                        <IoAddOutline className="w-8 h-8 text-gray-400 group-hover:text-violet-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Caption Input */}
            <div className="relative border-b border-t border-gray-100 dark:border-white/5 py-4">
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={500}
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none overflow-hidden min-h-[40px] text-[1.05rem]"
              />
              <span className={`text-xs font-medium absolute right-2 bottom-2 ${caption.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                {caption.length}/500
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="submit"
                isLoading={createPostMutation.isPending}
                disabled={selectedFiles.length === 0}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg shadow-lg shadow-violet-500/25 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Share Post
              </Button>
            </div>
            
          </div>
        </form>
      </div>
    </motion.div>
  );
};
