import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ServerPage from './pages/ServerPage.tsx'
import Sidebar from './components/Sidebar/Sidebar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <Routes>
          <Route index element={<ServerPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)
