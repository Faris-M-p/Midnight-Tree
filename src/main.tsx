/**
 * =============================================================================
 * FILE: src/main.tsx
 * ROLE: Application entry point
 * =============================================================================
 * This is the first TypeScript file the browser loads.
 * It mounts the root React component (`App`) into the HTML element `#root`
 * defined in index.html.
 *
 * You normally do not change this file often.
 * =============================================================================
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppToaster } from './components/AppToaster'
import { GlobalLoader } from './components/ui/GlobalLoader'
import { applyThemeById, readStoredThemeId, ThemeProvider } from './theme'

applyThemeById(readStoredThemeId())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <GlobalLoader />
      <AppToaster />
    </ThemeProvider>
  </StrictMode>,
)
