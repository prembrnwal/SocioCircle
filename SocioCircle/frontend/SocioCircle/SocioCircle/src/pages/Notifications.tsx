import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoHeartOutline, IoHeart, IoChatbubbleOutline, IoPersonAddOutline,
  IoMusicalNotesOutline, IoCheckmarkDoneOutline, IoNotificationsOutline,
  IoArrowBack, IoTrashOutline,
} from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../components/common/Avatar';
import { Skeleton } from '../components/common/Loading';

type NotificationType = 'like' | 'comment' | 'follow' | 'session' | 'mention';

interface Notification {
  id: number;
  type: NotificationType;
  actorName: string;
  actorAvatar?: string;
  actorEmail: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

// ── Mock data (replace with real API when available) ──────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1, type: 'like', actorName: 'Alex Rivera', actorEmail: 'alex@demo.com',
    message: 'liked your post',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), read: false,
  },
  {
    id: 2, type: 'follow', actorName: 'Mia Chen', actorEmail: 'mia@demo.com',
    message: 'started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 23), read: false,
  },
  {
    id: 3, type: 'comment', actorName: 'Jordan Taylor', actorEmail: 'jordan@demo.com',
    message: 'commented on your post: "This is fire! 🔥"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false,
  },
  {
    id: 4, type: 'session', actorName: 'Jazz Fusion Lovers', actorEmail: 'group@demo.com',
    message: 'has a live jam session starting now!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), read: true,
  },
  {
    id: 5, type: 'like', actorName: 'Sam Park', actorEmail: 'sam@demo.com',
    message: 'liked your post',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true,
  },
  {
    id: 6, type: 'mention', actorName: 'Dana White', actorEmail: 'dana@demo.com',
    message: 'mentioned you in a comment',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), read: true,
  },
  {
    id: 7, type: 'follow', actorName: 'Chris Evans', actorEmail: 'chris@demo.com',
    message: 'started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true,
  },
];

const getNotifIcon = (type: NotificationType) => {
  switch (type) {
    case 'like':    return { Icon: IoHeart, color: 'text-red-500',    bg: 'bg-red-50    dark:bg-red-500/10' };
    case 'comment': return { Icon: IoChatbubbleOutline, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' };
    case 'follow':  return { Icon: IoPersonAddOutline, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' };
    case 'session': return { Icon: IoMusicalNotesOutline, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' };
    case 'mention': return { Icon: IoHeartOutline, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
    default:        return { Icon: IoNotificationsOutline, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-white/10' };
  }
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
const NotificationSkeleton = () => (
  <div className="flex items-start gap-4 p-4">
    <Skeleton className="w-12 h-12 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4 rounded-lg" />
      <Skeleton className="h-3 w-1/2 rounded-lg" />
    </div>
    <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading] = useState(false); // Replace with real API later

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismiss = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-28 md:pb-12"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white text-xs font-extrabold shadow-md shadow-violet-500/30"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Stay updated on your community activity
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              <IoCheckmarkDoneOutline className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </motion.div>

        {/* ── Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-1 rounded-2xl shadow-sm mb-6"
        >
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 relative py-2 text-sm font-bold rounded-xl transition-colors capitalize ${
                filter === f ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {filter === f && (
                <motion.div
                  layoutId="notifTabBg"
                  className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl shadow-md shadow-violet-500/25"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Notification List ── */}
        <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {[...Array(6)].map((_, i) => <NotificationSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center px-4"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <IoNotificationsOutline className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">All caught up!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filter === 'unread' ? 'No unread notifications.' : 'You have no notifications yet.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100 dark:divide-white/5"
            >
              <AnimatePresence>
                {filtered.map((notif) => {
                  const { Icon, color, bg } = getNotifIcon(notif.type);
                  return (
                    <motion.div
                      key={notif.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      onClick={() => markRead(notif.id)}
                      className={`relative flex items-start gap-4 p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${
                        !notif.read ? 'bg-violet-50/40 dark:bg-violet-900/5' : ''
                      }`}
                    >
                      {/* Unread indicator */}
                      {!notif.read && (
                        <motion.span
                          layoutId={`dot-${notif.id}`}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500"
                        />
                      )}

                      {/* Avatar with icon badge */}
                      <div className="relative shrink-0">
                        <Avatar
                          src={notif.actorAvatar}
                          alt={notif.actorName}
                          size="md"
                          className="w-12 h-12 ring-2 ring-gray-100 dark:ring-white/5"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${bg} flex items-center justify-center border-2 border-white dark:border-[#121212]`}>
                          <Icon className={`w-3 h-3 ${color}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {notif.actorName}
                          </span>{' '}
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                          {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                        </p>
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        aria-label="Dismiss notification"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {filtered.length > 0 && !isLoading && (
          <p className="text-center text-xs text-gray-400 mt-6 font-medium">
            Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </motion.div>
  );
};
