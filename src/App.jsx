import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ViewSwitcherBar } from './components/layout/ViewSwitcherBar'
import { HomePage } from './pages/HomePage'
import { BusinessPage } from './pages/BusinessPage'
import { BackofficePage } from './pages/BackofficePage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <div className="h-dvh w-full flex flex-col overflow-hidden bg-[#F8F9FA]">
        {/* Barra Superior de Alternância Rápida entre Backoffice e Cardápio */}
        <ViewSwitcherBar />

        <Routes>
          {/* Vitrine / Cardápio do Cliente (Figma) */}
          <Route path="/" element={<BusinessPage />} />
          <Route path="/:businessName" element={<BusinessPage />} />

          {/* Backoffice do Estabelecimento */}
          <Route path="/admin" element={<BackofficePage />} />
          <Route path="/backoffice" element={<BackofficePage />} />

          {/* Cadastro & Gestão de Empresas (Integrado com API Go) */}
          <Route path="/empresas" element={<HomePage />} />
          <Route path="/cadastro-empresas" element={<HomePage />} />
          <Route path="/admin/api-health" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
