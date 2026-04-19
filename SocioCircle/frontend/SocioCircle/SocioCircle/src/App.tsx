import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useThemeStore } from './stores/themeStore';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { ROUTES } from './config/constants';
import { lazy, Suspense } from 'react';
import { Spinner } from './components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';

// ── Lazy load pages ───────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Feed = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit').then(m => ({ default: m.ProfileEdit })));
const PostDetail = lazy(() => import('./pages/PostDetail').then(m => ({ default: m.PostDetail })));
const PostCreate = lazy(() => import('./pages/PostCreate').then(m => ({ default: m.PostCreate })));
const Groups = lazy(() => import('./pages/Groups').then(m => ({ default: m.Groups })));
const GroupDetail = lazy(() => import('./pages/GroupDetail').then(m => ({ default: m.GroupDetail })));
const Sessions = lazy(() => import('./pages/Sessions').then(m => ({ default: m.Sessions })));
const SessionDetail = lazy(() => import('./pages/SessionDetail').then(m => ({ default: m.SessionDetail })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// ── React Query client ────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Full-screen spinner fallback ──────────────────────────────────────────────
const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
    <Spinner size="lg" className="text-violet-500" />
  </div>
);

// ── Page transition variants ──────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.4, 0.25, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] } },
};

// ── Animated Routes (inner) ───────────────────────────────────────────────────
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1"
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path={ROUTES.FEED} element={<Feed />} />
            <Route path={`${ROUTES.PROFILE}/:email?`} element={<Profile />} />
            <Route path={ROUTES.PROFILE_EDIT} element={<ProfileEdit />} />
            <Route path={ROUTES.POST_CREATE} element={<PostCreate />} />
            <Route path={`${ROUTES.POST_DETAIL}`} element={<PostDetail />} />
            <Route path={ROUTES.GROUPS} element={<Groups />} />
            <Route path={`${ROUTES.GROUP_DETAIL}`} element={<GroupDetail />} />
            <Route path={ROUTES.SESSIONS} element={<Sessions />} />
            <Route path={`${ROUTES.SESSION_DETAIL}`} element={<SessionDetail />} />
            <Route path={`${ROUTES.CHAT}`} element={<Chat />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
            <Route path="/" element={<Navigate to={ROUTES.FEED} replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('theme-storage');
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme);
            setTheme(parsed?.state?.isDark || false);
          } catch {
            setTheme(false);
          }
        } else {
          try {
            setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
          } catch {
            setTheme(false);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      setTheme(false);
    }
  }, [setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={`min-h-screen bg-white dark:bg-black ${isDark ? 'dark' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <Suspense fallback={<PageFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                <Suspense fallback={<PageFallback />}>
                  <Register />
                </Suspense>
              }
            />

            {/* Protected routes with Navbar + AnimatePresence */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
                    <Navbar />
                    <AnimatedRoutes />
                    <BottomNav />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDark ? 'dark' : 'light'}
            toastClassName="!rounded-2xl !font-semibold !text-sm !shadow-xl"
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
