import { useState, useEffect } from 'react'
import { SuperAdminSidebar } from '../../components/superadmin/SuperAdminSidebar'
import { SuperAdminTopbar } from '../../components/superadmin/SuperAdminTopbar'
import { SupportModeBanner } from '../../components/superadmin/SupportModeBanner'
import { PrivacyRestrictionModal } from '../../components/superadmin/PrivacyRestrictionModal'
import { CompaniesView } from '../../components/superadmin/views/CompaniesView'
import { SubscriptionsView } from '../../components/superadmin/views/SubscriptionsView'
import { PlansManagementView } from '../../components/superadmin/views/PlansManagementView'
import { AdminProfileView } from '../../components/superadmin/views/AdminProfileView'

// Telas de configuração acessadas via modo de suporte
import { MenuVitrineView } from '../../components/backoffice/menu/MenuVitrineView'
import { ScheduleView } from '../../components/backoffice/schedule/ScheduleView'
import { DeliveryView } from '../../components/backoffice/delivery/DeliveryView'
import { PaymentsView } from '../../components/backoffice/payments/PaymentsView'
import { StoreProfileView } from '../../components/backoffice/store/StoreProfileView'

import { useSuperAdminStore } from '../../store/useSuperAdminStore'

export function AdminPage() {
  const { activeTab, setActiveTab, supportMode, supportActiveTab } = useSuperAdminStore()

  // Sempre que acessar o painel do Super Admin, inicia na aba 'Empresas Vinculadas'
  useEffect(() => {
    setActiveTab('empresas')
  }, [setActiveTab])

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [restrictedArea, setRestrictedArea] = useState('kanban')

  const handleOpenPrivacyModal = (area) => {
    setRestrictedArea(area)
    setIsPrivacyModalOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F9FA]">
      {/* Banner de Modo de Suporte Ativo */}
      <SupportModeBanner />

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar do Super Admin */}
        <SuperAdminSidebar onOpenPrivacyModal={handleOpenPrivacyModal} />

        {/* Painel de Conteúdo Principal */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Topbar com Identidade Visual Backoffice */}
          <SuperAdminTopbar />

          {/* Área Dinâmica de Conteúdo */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F9FA]">
            {!supportMode ? (
              /* Visualização do Super Admin */
              <>
                {activeTab === 'empresas' && <CompaniesView />}
                {activeTab === 'assinaturas' && <SubscriptionsView />}
                {activeTab === 'planos' && <PlansManagementView />}
                {activeTab === 'perfil' && <AdminProfileView />}
              </>
            ) : (
              /* Modo Suporte Ativo (Configuração Lojista pelo Admin) */
              <>
                {supportActiveTab === 'cardapio' && <MenuVitrineView />}
                {supportActiveTab === 'horarios' && <ScheduleView />}
                {supportActiveTab === 'entregas' && <DeliveryView />}
                {supportActiveTab === 'pagamentos' && <PaymentsView />}
                {supportActiveTab === 'loja' && <StoreProfileView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Restrição de Privacidade (LGPD) */}
      <PrivacyRestrictionModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        restrictedArea={restrictedArea}
      />
    </div>
  )
}

