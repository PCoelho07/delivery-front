import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ViewSwitcherBar } from './components/layout/ViewSwitcherBar'
import { HomePage } from './pages/HomePage'
import { BusinessPage } from './pages/BusinessPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <div className="h-dvh w-full flex flex-col overflow-hidden bg-[#F8F9FA]">
        {/* Barra Superior de Alternância Rápida entre Backoffice (API Go) e Cardápio (Figma) */}
        <ViewSwitcherBar />

        <Routes>
          {/* Vitrine / Cardápio do Cliente (Figma) */}
          <Route path="/" element={<BusinessPage />} />
          <Route path="/:businessName" element={<BusinessPage />} />

          {/* Backoffice Interno (Conectado aos endpoints da API Go) */}
          <Route path="/admin" element={<HomePage />} />
          <Route path="/backoffice" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
