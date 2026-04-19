import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'live' | 'upcoming' | 'ended';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
  primary:  'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300',
  success:  'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
  warning:  'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  danger:   'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  live:     'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]',
  upcoming: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300',
  ended:    'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px] rounded-lg',
  md: 'px-2.5 py-1 text-xs rounded-xl',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}: BadgeProps) => {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 font-bold ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {children}
    </motion.span>
  );
};

/** Convenience component for session status badges */
export const SessionStatusBadge = ({ status }: { status: 'LIVE' | 'UPCOMING' | 'ENDED' }) => {
  const map: Record<string, BadgeVariant> = {
    LIVE: 'live',
    UPCOMING: 'upcoming',
    ENDED: 'ended',
  };
  return (
    <Badge variant={map[status] ?? 'default'} pulse={status === 'LIVE'}>
      {status}
    </Badge>
  );
};
