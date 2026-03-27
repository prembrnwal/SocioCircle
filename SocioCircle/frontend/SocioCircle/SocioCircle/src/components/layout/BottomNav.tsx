import { useNavigate, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoHome, IoAddCircleOutline, IoAddCircle, IoChatbubbleOutline, IoChatbubble, IoCompassOutline, IoCompass } from 'react-icons/io5';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/constants';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

type NavItemType = {
  path: string;
  isAvatar?: boolean;
  iconOutlined?: IconType;
  iconFilled?: IconType;
};

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) => {
    if (path === ROUTES.PROFILE || path === `${ROUTES.PROFILE}/${user?.email}`) {
      return location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };

  const navItems: NavItemType[] = [
    { iconOutlined: IoHomeOutline, iconFilled: IoHome, path: ROUTES.FEED },
    { iconOutlined: IoCompassOutline, iconFilled: IoCompass, path: ROUTES.GROUPS },
    { iconOutlined: IoAddCircleOutline, iconFilled: IoAddCircle, path: ROUTES.POST_CREATE },
    { iconOutlined: IoChatbubbleOutline, iconFilled: IoChatbubble, path: ROUTES.SESSIONS },
    { path: user ? `${ROUTES.PROFILE}/${user.email}` : ROUTES.PROFILE, isAvatar: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-safe">
      <div className="flex items-center justify-around h-[68px] px-2 mb-2 sm:mb-0">
        {navItems.map((item, idx) => {
          const active = isActive(item.path);
          
          if (item.isAvatar) {
            return (
              <button
                key="profile"
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center flex-1 h-full relative"
              >
                <div className={`rounded-full p-[2px] transition-all ${active ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-500 scale-105' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                  <Avatar src={user?.profilePicture} alt={user?.name || 'User'} size="sm" className="border-2 border-white dark:border-[#0a0a0a]" />
                </div>
                {active && (
                  <motion.div layoutId="bottom-nav-indicator" className="absolute -bottom-1 w-1 h-1 rounded-full bg-violet-500" />
                )}
              </button>
            );
          }

          const Icon = active ? item.iconFilled : item.iconOutlined;
          
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-center flex-1 h-full relative transition-all ${
                active ? 'text-violet-600 dark:text-white scale-110' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-7 h-7" />}
              {active && (
                <motion.div layoutId="bottom-nav-indicator" className="absolute bottom-2 w-1 h-1 rounded-full bg-violet-600 dark:bg-white border-none" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
