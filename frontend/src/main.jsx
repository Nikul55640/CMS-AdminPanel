import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { PageProvider } from './context/PageContext.jsx'
import AppRoutes from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
)
