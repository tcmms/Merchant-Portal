import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FlockProvider } from '@tcmms/flock-ds'
import { DevToolsProvider } from './features/dev-tools'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlockProvider theme="ops">
      {import.meta.env.DEV ? (
        <DevToolsProvider>
          <App />
        </DevToolsProvider>
      ) : (
        <App />
      )}
    </FlockProvider>
  </StrictMode>,
)
