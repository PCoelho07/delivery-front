import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Lazy loading das páginas para reduzir o bundle inicial e acelerar o carregamento (SEO & Core Web Vitals)
const HomePage = lazy(() =>
  import('./pages/home/HomePage').then((m) => ({ default: m.HomePage }))
)
const CardapioPage = lazy(() =>
  import('./pages/cardapio/CardapioPage').then((m) => ({ default: m.CardapioPage }))
)
const LojistaPage = lazy(() =>
  import('./pages/lojista/LojistaPage').then((m) => ({ default: m.LojistaPage }))
)
const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage }))
)
const LoginPage = lazy(() =>
  import('./pages/login/LoginPage').then((m) => ({ default: m.LoginPage }))
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
              {/* Autenticação & Acesso ao Sistema */}
              <Route path="/login" element={<LoginPage />} />

              {/* 1. Home / Landing Page Comercial do NumInstante */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />

              {/* 2. Cardápio Digital (Cliente final - Rota Pública do Estabelecimento) */}
              <Route path="/:businessName" element={<CardapioPage />} />

              {/* 3. Backoffice do Estabelecimento (Lojista - Rotas Protegidas) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="merchant">
                    <LojistaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lojista"
                element={
                  <ProtectedRoute requiredRole="merchant">
                    <LojistaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/backoffice"
                element={
                  <ProtectedRoute requiredRole="merchant">
                    <LojistaPage />
                  </ProtectedRoute>
                }
              />

              {/* 4. Backoffice do Super Admin (Gestão SaaS - Exclusivo Super Admin) */}
              <Route
                path="/superadmin"
                element={
                  <ProtectedRoute requiredRole="superadmin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-saas"
                element={
                  <ProtectedRoute requiredRole="superadmin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/empresas"
                element={
                  <ProtectedRoute requiredRole="superadmin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
