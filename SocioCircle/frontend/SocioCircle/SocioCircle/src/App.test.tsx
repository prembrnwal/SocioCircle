// Temporary test file to check if React is working
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test App - If you see this, React is working!</h1>
      <p>This is a minimal test to verify React can render.</p>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <TestApp />
    </StrictMode>
  )
}
