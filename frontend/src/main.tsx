import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ServerPage from './pages/ServerPage.tsx'
import Sidebar from './components/Sidebar/Sidebar.tsx'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
          <Toaster />
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
