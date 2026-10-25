import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { CardapioPage } from './pages/cardapio/CardapioPage'
import { LojistaPage } from './pages/lojista/LojistaPage'
import { AdminPage } from './pages/admin/AdminPage'
import { LoginPage } from './pages/login/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <div className="h-dvh w-full flex flex-col overflow-hidden bg-[#F8F9FA]">
        <Routes>
          {/* Autenticação & Acesso ao Sistema */}
          <Route path="/login" element={<LoginPage />} />

          {/* 1. Cardápio Digital (Cliente final) */}
          <Route path="/" element={<CardapioPage />} />
          <Route path="/:businessName" element={<CardapioPage />} />

          {/* 2. Backoffice do Estabelecimento (Lojista) */}
          <Route path="/admin" element={<LojistaPage />} />
          <Route path="/lojista" element={<LojistaPage />} />
          <Route path="/backoffice" element={<LojistaPage />} />

          {/* 3. Backoffice do Super Admin (Gestão da Plataforma SaaS + Cadastro de Empresas API) */}
          <Route path="/superadmin" element={<AdminPage />} />
          <Route path="/admin-saas" element={<AdminPage />} />
          <Route path="/empresas" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
