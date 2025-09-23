import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { CmsProvider } from './context/CmsContext.jsx'
import AppRoutes from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
)
