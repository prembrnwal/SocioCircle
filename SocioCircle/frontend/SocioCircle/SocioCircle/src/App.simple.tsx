// Simplified App for debugging - replace App.tsx with this temporarily
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple test component
const TestPage = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#0095F6', fontSize: '32px', marginBottom: '20px' }}>
        SocioCircle - Test Page
      </h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        If you see this, React is working! The app can render.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Next Steps:</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>If you see this page, the basic setup is working</li>
          <li>Check browser console (F12) for any errors</li>
          <li>Try navigating to /login or /register</li>
        </ol>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#fff' }}>
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/*" element={<Navigate to="/test" replace />} />
          </Routes>
          <ToastContainer position="top-right" />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
