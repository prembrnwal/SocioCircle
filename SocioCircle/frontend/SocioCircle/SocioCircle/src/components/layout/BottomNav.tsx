import { useNavigate, useLocation } from 'react-router-dom';
import { IoHome, IoAddCircleOutline, IoChatbubbleOutline, IoPersonOutline } from 'react-icons/io5';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/constants';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) => {
    if (path === ROUTES.PROFILE) {
      return location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };

  const navItems = [
    { icon: IoHome, path: ROUTES.FEED, label: 'Home' },
    { icon: IoAddCircleOutline, path: ROUTES.POST_CREATE, label: 'Create' },
    { icon: IoChatbubbleOutline, path: '/chat', label: 'Chat' },
    { icon: IoPersonOutline, path: user ? `${ROUTES.PROFILE}/${user.email}` : ROUTES.PROFILE, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          if (item.path === user ? `${ROUTES.PROFILE}/${user.email}` : ROUTES.PROFILE) {
            return (
              <button
                key={item.label}
                onClick={() => navigate(user ? `${ROUTES.PROFILE}/${user.email}` : ROUTES.PROFILE)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 ${
                  active ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Avatar src={user?.profilePicture} alt={user?.name || 'User'} size="sm" />
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 ${
                active ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
