import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoHomeOutline, IoHome,
  IoAddCircleOutline, IoAddCircle,
  IoChatbubbleOutline, IoChatbubble,
  IoCompassOutline, IoCompass,
  IoPersonOutline, IoPerson,
  IoNotificationsOutline, IoNotifications,
} from 'react-icons/io5';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/constants';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

type NavItem = {
  path: string;
  label: string;
  isAvatar?: boolean;
  iconOutlined?: IconType;
  iconFilled?: IconType;
};

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string): boolean => {
    if (path.startsWith('/profile')) return location.pathname.startsWith('/profile');
    if (path === ROUTES.FEED)  return location.pathname === ROUTES.FEED || location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems: NavItem[] = [
    { path: ROUTES.FEED,           label: 'Home',    iconOutlined: IoHomeOutline,          iconFilled: IoHome },
    { path: ROUTES.GROUPS,         label: 'Explore', iconOutlined: IoCompassOutline,       iconFilled: IoCompass },
    { path: ROUTES.POST_CREATE,    label: 'Create',  iconOutlined: IoAddCircleOutline,     iconFilled: IoAddCircle },
    { path: ROUTES.SESSIONS,       label: 'Jams',    iconOutlined: IoChatbubbleOutline,    iconFilled: IoChatbubble },
    { path: ROUTES.NOTIFICATIONS,  label: 'Alerts',  iconOutlined: IoNotificationsOutline, iconFilled: IoNotifications },
    {
      path: user ? `${ROUTES.PROFILE}/${user.email}` : ROUTES.PROFILE,
      label: 'Profile',
      isAvatar: true,
      iconOutlined: IoPersonOutline,
      iconFilled: IoPerson,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Frosted background */}
      <div className="bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-gray-200/60 dark:border-white/5">
        <div className="flex items-center justify-around h-[60px] px-1 pb-safe">
          {navItems.map((item) => {
            const active = isActive(item.path);

            if (item.isAvatar) {
              return (
                <button
                  key="profile"
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
                  aria-label="Profile"
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      active
                        ? 'p-[2.5px] bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-md shadow-violet-500/30'
                        : 'p-[2.5px] bg-transparent'
                    }`}
                  >
                    <div className="rounded-full bg-white dark:bg-[#0a0a0a]" style={{ padding: '1.5px' }}>
                      <Avatar
                        src={user?.profilePicture}
                        alt={user?.name || 'User'}
                        size="sm"
                        className="w-[24px] h-[24px]"
                      />
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold tracking-wide transition-colors ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            const Icon = active ? item.iconFilled! : item.iconOutlined!;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative group"
                aria-label={item.label}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`flex items-center justify-center rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-violet-600 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-[24px] h-[24px]" />
                </motion.div>
                <span className={`text-[9px] font-bold tracking-wide transition-colors ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {item.label}
                </span>

                {/* Active dot */}
                {active && (
                  <motion.span
                    layoutId="bottom-dot"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600 dark:bg-violet-400"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
