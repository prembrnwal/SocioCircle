import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoMoon, IoSunny, IoHomeOutline, IoHome, IoAddCircleOutline, IoAddCircle, IoCompassOutline, IoCompass, IoLogOutOutline } from 'react-icons/io5';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/constants';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path !== ROUTES.FEED && location.pathname.startsWith(path));
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to={ROUTES.FEED} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-xl font-serif italic">J</span>
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 tracking-tight hidden sm:block">
              Jamming
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {[ 
              { path: ROUTES.FEED, iconOutlined: IoHomeOutline, iconFilled: IoHome },
              { path: ROUTES.GROUPS, iconOutlined: IoCompassOutline, iconFilled: IoCompass },
              { path: ROUTES.POST_CREATE, iconOutlined: IoAddCircleOutline, iconFilled: IoAddCircle }
            ].map((item, idx) => {
              const active = isActive(item.path);
              const Icon = active ? item.iconFilled : item.iconOutlined;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="relative p-3 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                >
                  <Icon className={`w-[26px] h-[26px] ${active ? 'text-violet-600 dark:text-white' : ''}`} />
                  {active && (
                    <motion.div layoutId="navbar-indicator" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-white" />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-2" />

            <button
              onClick={toggleTheme}
              className="p-3 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"
            >
              {isDark ? <IoSunny className="w-6 h-6" /> : <IoMoon className="w-6 h-6 outline-none" />}
            </button>

            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-white/10">
                <Link
                  to={`${ROUTES.PROFILE}/${user.email}`}
                  className="p-1 rounded-full border-2 border-transparent hover:border-violet-500 transition-colors"
                >
                  <Avatar src={user.profilePicture} alt={user.name || 'User'} size="sm" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors group"
                  title="Logout"
                >
                  <IoLogOutOutline className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
