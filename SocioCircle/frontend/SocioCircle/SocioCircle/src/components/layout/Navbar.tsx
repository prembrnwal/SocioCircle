import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  IoMoon, IoSunny,
  IoHomeOutline, IoHome,
  IoAddCircleOutline, IoAddCircle,
  IoCompassOutline, IoCompass,
  IoLogOutOutline,
  IoChatbubbleOutline, IoChatbubble,
  IoNotificationsOutline, IoNotifications,
  IoSettingsOutline, IoSettings,
  IoAperture,
} from 'react-icons/io5';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/constants';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

const navLinks = [
  { path: ROUTES.FEED,          labelShort: 'Home',       iconOutlined: IoHomeOutline,           iconFilled: IoHome },
  { path: ROUTES.GROUPS,        labelShort: 'Explore',    iconOutlined: IoCompassOutline,        iconFilled: IoCompass },
  { path: ROUTES.POST_CREATE,   labelShort: 'Create',     iconOutlined: IoAddCircleOutline,      iconFilled: IoAddCircle },
  { path: ROUTES.SESSIONS,      labelShort: 'Jams',       iconOutlined: IoChatbubbleOutline,     iconFilled: IoChatbubble },
  { path: ROUTES.NOTIFICATIONS, labelShort: 'Alerts',     iconOutlined: IoNotificationsOutline,  iconFilled: IoNotifications },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = useThemeStore();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate(ROUTES.LOGIN);
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== ROUTES.FEED && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5 transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── Logo ── */}
          <Link to={ROUTES.FEED} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
              <IoAperture className="text-white w-5 h-5" />
            </div>
            <span className="text-[1.35rem] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 tracking-tight hidden sm:block">
              SocioCircle
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const Icon = active ? item.iconFilled : item.iconOutlined;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'text-violet-600 dark:text-white bg-violet-50 dark:bg-white/5'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-[22px] h-[22px] shrink-0" />
                  <span className="hidden lg:block">{item.labelShort}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-violet-600 dark:bg-violet-400"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-2" />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all duration-200"
            >
              <motion.div
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {isDark ? <IoSunny className="w-[22px] h-[22px]" /> : <IoMoon className="w-[22px] h-[22px]" />}
              </motion.div>
            </button>

            {/* Settings */}
            <Link
              to={ROUTES.SETTINGS}
              className={`p-2.5 rounded-2xl transition-all duration-200 ${
                isActive(ROUTES.SETTINGS)
                  ? 'text-violet-600 dark:text-white bg-violet-50 dark:bg-white/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              aria-label="Settings"
            >
              {isActive(ROUTES.SETTINGS) ? <IoSettings className="w-[22px] h-[22px]" /> : <IoSettingsOutline className="w-[22px] h-[22px]" />}
            </Link>

            {/* Profile + Logout */}
            {user && (
              <div className="flex items-center gap-1.5 ml-1.5 pl-2 border-l border-gray-200 dark:border-white/10">
                <Link
                  to={`${ROUTES.PROFILE}/${user.email}`}
                  className="p-1 rounded-full border-2 border-transparent hover:border-violet-500 transition-all duration-200"
                >
                  <Avatar src={user.profilePicture} alt={user.name || 'User'} size="sm" />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-200 group"
                >
                  <IoLogOutOutline className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile: theme + avatar ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-white rounded-xl transition-colors"
            >
              {isDark ? <IoSunny className="w-5 h-5" /> : <IoMoon className="w-5 h-5" />}
            </button>
            {user && (
              <Link
                to={`${ROUTES.PROFILE}/${user.email}`}
                className="p-0.5 rounded-full border-2 border-transparent hover:border-violet-500 transition-colors"
              >
                <Avatar src={user.profilePicture} alt={user.name || 'User'} size="sm" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
