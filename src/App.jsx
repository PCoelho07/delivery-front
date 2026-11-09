import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Em produção inicial (Soft Launch), liberamos exclusivamente a Landing Page comercial.
// Rotas de login, painéis administrativos e cardápios de teste são redirecionadas com segurança para a Home.
const HomePage = lazy(() =>
  import('./pages/home/HomePage').then((m) => ({ default: m.HomePage }))
)

function PageFallback() {
  return (
    <div className="flex-1 w-full flex items-center justify-center bg-[#F8F9FA]">
      <div className="w-8 h-8 rounded-full border-3 border-[#FF5E1E]/20 border-t-[#FF5E1E] animate-spin" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <div className="h-dvh w-full flex flex-col overflow-hidden bg-[#F8F9FA]">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Landing Page Comercial do NumInstante */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />

              {/* Redirecionamento preventivo de todas as outras URLs (/login, /admin, etc.) para a Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
