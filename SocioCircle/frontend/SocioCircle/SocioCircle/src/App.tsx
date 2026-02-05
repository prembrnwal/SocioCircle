import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useThemeStore } from './stores/themeStore';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { ROUTES } from './config/constants';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';
import { Spinner } from './components/common/Loading';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme from storage - handle SSR safely
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('theme-storage');
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme);
            const savedIsDark = parsed?.state?.isDark || false;
            setTheme(savedIsDark);
          } catch {
            setTheme(false);
          }
        } else {
          // Check system preference
          try {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark);
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
        <div className="min-h-screen bg-white dark:bg-black">
          <Routes>
            {/* Public routes */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>}>
                  <Login />
                </Suspense>
              } 
            />
            <Route 
              path={ROUTES.REGISTER} 
              element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>}>
                  <Register />
                </Suspense>
              } 
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <Spinner size="lg" />
                      </div>
                    }
                  >
                    <Routes>
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
                      <Route path="/" element={<Navigate to={ROUTES.FEED} replace />} />
                    </Routes>
                  </Suspense>
                  <BottomNav />
                </ProtectedRoute>
              }
            />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
