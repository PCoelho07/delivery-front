import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { CardapioPage } from './pages/cardapio/CardapioPage'
import { LojistaPage } from './pages/lojista/LojistaPage'
import { AdminPage } from './pages/admin/AdminPage'
import { LoginPage } from './pages/login/LoginPage'
import { HomePage } from './pages/home/HomePage'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <div className="h-dvh w-full flex flex-col overflow-hidden bg-[#F8F9FA]">
          <Routes>
            {/* Autenticação & Acesso ao Sistema */}
            <Route path="/login" element={<LoginPage />} />

            {/* 1. Home / Landing Page Comercial do NumInstante */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />

            {/* 2. Cardápio Digital (Cliente final - Rota Pública do Estabelecimento) */}
            <Route path="/:businessName" element={<CardapioPage />} />

            {/* 2. Backoffice do Estabelecimento (Lojista - Rotas Protegidas) */}
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

            {/* 3. Backoffice do Super Admin (Gestão SaaS - Exclusivo Super Admin) */}
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
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
