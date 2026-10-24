import { BackofficeSidebar } from '../../components/backoffice/BackofficeSidebar'
import { BackofficeTopbar } from '../../components/backoffice/BackofficeTopbar'
import { MenuVitrineView } from '../../components/backoffice/menu/MenuVitrineView'
import { ScheduleView } from '../../components/backoffice/schedule/ScheduleView'
import { DeliveryView } from '../../components/backoffice/delivery/DeliveryView'
import { PaymentsView } from '../../components/backoffice/payments/PaymentsView'
import { OrdersView } from '../../components/backoffice/orders/OrdersView'
import { FinancialView } from '../../components/backoffice/financial/FinancialView'
import { StoreProfileView } from '../../components/backoffice/store/StoreProfileView'
import { useStoreAdmin } from '../../store/useStoreAdmin'

export function LojistaPage() {
  const { activeTab } = useStoreAdmin()

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#F8F9FA]">
      {/* Sidebar Lateral */}
      <BackofficeSidebar />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar com Controles Globais */}
        <BackofficeTopbar />

        {/* Área de Trabalho Dinâmica da Aba Selecionada */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F9FA]">
          {(activeTab === 'cardapio' || activeTab === 'templates') && <MenuVitrineView />}

          {activeTab === 'pedidos' && <OrdersView />}

          {activeTab === 'financeiro' && <FinancialView />}

          {activeTab === 'horarios' && <ScheduleView />}

          {activeTab === 'entregas' && <DeliveryView />}

          {activeTab === 'pagamentos' && <PaymentsView />}

          {activeTab === 'loja' && <StoreProfileView />}
        </div>
      </main>
    </div>
  )
}

