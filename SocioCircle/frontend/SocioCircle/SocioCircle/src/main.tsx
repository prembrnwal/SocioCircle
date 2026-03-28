import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Polyfill Node-style `global` for libraries (like some WebSocket clients)
// that expect it to exist in the browser environment.
if (typeof (globalThis as any).global === 'undefined') {
  ; (globalThis as any).global = globalThis
}

// ── DEV-ONLY: seed a fake logged-in user so the app works without a backend ──
if (import.meta.env.DEV) {
  const AUTH_KEY = 'auth-storage';
  try {
    const existing = localStorage.getItem(AUTH_KEY);
    const alreadyAuthed = existing && JSON.parse(existing)?.state?.isAuthenticated;
    if (!alreadyAuthed) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        state: {
          token: 'dev-mock-token',
          isAuthenticated: true,
          user: {
            email: 'demo@sociocircle.com',
            name: 'Demo User',
            bio: 'Passionate about music, always looking for the next jam 🎸',
            interests: 'Guitar,Jazz,Rock,Electronic,Blues',
            profilePicture: undefined,
          },
        },
        version: 0,
      }));
      localStorage.setItem('auth_token', 'dev-mock-token');
    }
  } catch (_) { /* ignore */ }
}
// ─────────────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
