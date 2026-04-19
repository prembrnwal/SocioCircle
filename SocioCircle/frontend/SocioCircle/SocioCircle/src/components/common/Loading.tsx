import React from 'react';
import { motion } from 'framer-motion';

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-[3px]',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-200 dark:border-white/10 border-t-violet-600 dark:border-t-violet-400 animate-spin`}
      />
    </div>
  );
};

// ── Skeleton Base ─────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-gray-200 dark:bg-white/[0.06] rounded-xl ${className}`}
      style={style}
    />
  );
};

// ── Post Card Skeleton ────────────────────────────────────────────────────────
export const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#121212] border-b sm:border border-gray-100 dark:border-white/5 sm:rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-10 rounded-lg" />
      </div>
      {/* Image */}
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: '4/5', maxHeight: 500 }} />
      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-20 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-3/4 rounded-lg" />
      </div>
    </div>
  );
};

// ── Group Card Skeleton ───────────────────────────────────────────────────────
export const GroupCardSkeleton = () => (
  <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-4">
    <Skeleton className="h-6 w-3/4 rounded-lg" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-3.5 w-full rounded-lg" />
      <Skeleton className="h-3.5 w-5/6 rounded-lg" />
      <Skeleton className="h-3.5 w-2/3 rounded-lg" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
  </div>
);

// ── Session Card Skeleton ─────────────────────────────────────────────────────
export const SessionCardSkeleton = () => (
  <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-6 w-2/3 rounded-lg" />
      <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-full rounded-lg" />
      <Skeleton className="h-3.5 w-4/5 rounded-lg" />
    </div>
    <div className="space-y-2 pt-2">
      <Skeleton className="h-3.5 w-40 rounded-lg" />
      <Skeleton className="h-3.5 w-24 rounded-lg" />
    </div>
  </div>
);

// ── Profile Card Skeleton ─────────────────────────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-[#121212] sm:rounded-3xl border-b sm:border border-gray-100 dark:border-white/5 mb-6 overflow-hidden">
    <Skeleton className="h-36 sm:h-52 w-full rounded-none" />
    <div className="px-5 sm:px-8 pb-6 -mt-14 sm:-mt-16">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5">
        <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#121212]" />
        <div className="flex-1 space-y-2 sm:mb-3">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded-lg mb-2" />
      <Skeleton className="h-4 w-3/4 rounded-lg mb-4" />
      <div className="flex gap-2 mb-5">
        {[1,2,3].map(i => <Skeleton key={i} className="h-6 w-16 rounded-full" />)}
      </div>
      <div className="flex pt-5 border-t border-gray-100 dark:border-white/10 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="flex-1 text-center space-y-1">
            <Skeleton className="h-6 w-10 rounded-lg mx-auto" />
            <Skeleton className="h-3 w-14 rounded-lg mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
