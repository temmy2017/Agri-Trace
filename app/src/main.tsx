import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'
import { AppProvider } from './contexts/AppContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </AppProvider>
)
