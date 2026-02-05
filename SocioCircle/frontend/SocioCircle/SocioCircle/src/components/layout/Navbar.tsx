import { Link, useNavigate } from 'react-router-dom';
import { IoMoon, IoSunny, IoHome, IoAddCircleOutline } from 'react-icons/io5';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/constants';

export const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.FEED} className="text-2xl font-bold text-gray-900 dark:text-white">
            SocioCircle
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to={ROUTES.FEED}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              <IoHome className="w-6 h-6" />
            </Link>
            <button
              onClick={() => navigate(ROUTES.POST_CREATE)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              <IoAddCircleOutline className="w-6 h-6" />
            </button>
          <button
  onClick={toggleTheme}
  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
>
  {isDark ? <IoSunny className="w-6 h-6" /> : <IoMoon className="w-6 h-6" />}
</button>
            <Link
              to={user ? `${ROUTES.PROFILE}/${user.email}` : ROUTES.PROFILE}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              <Avatar src={user?.profilePicture} alt={user?.name || 'User'} size="sm" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Logout
            </button>
          </div>

          {/* Mobile Navigation - will be handled by BottomNav */}
        </div>
      </div>
    </nav>
  );
};
