import { CircleDollarSign } from 'lucide-react'
import { BackofficeSidebar } from '../components/backoffice/BackofficeSidebar'
import { BackofficeTopbar } from '../components/backoffice/BackofficeTopbar'
import { MenuVitrineView } from '../components/backoffice/menu/MenuVitrineView'
import { TemplatesView } from '../components/backoffice/templates/TemplatesView'
import { ScheduleView } from '../components/backoffice/schedule/ScheduleView'
import { DeliveryView } from '../components/backoffice/delivery/DeliveryView'
import { PaymentsView } from '../components/backoffice/payments/PaymentsView'
import { OrdersView } from '../components/backoffice/orders/OrdersView'
import { StoreProfileView } from '../components/backoffice/store/StoreProfileView'
import { useStoreAdmin } from '../store/useStoreAdmin'

export function BackofficePage() {
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
          {activeTab === 'cardapio' && <MenuVitrineView />}

          {activeTab === 'templates' && <TemplatesView />}

          {activeTab === 'pedidos' && <OrdersView />}

          {activeTab === 'financeiro' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
                    <CircleDollarSign className="w-5 h-5 text-[#FF5E1E]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#1A1D20]">Financeiro & Faturamento</h3>
                    <p className="text-xs text-[#6C757D]">
                      Protótipo funcional ativo no arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#FF5E1E] font-semibold">public/backoffice_preview.html</code> para alinhamento e aprovação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'horarios' && <ScheduleView />}

          {activeTab === 'entregas' && <DeliveryView />}

          {activeTab === 'pagamentos' && <PaymentsView />}

          {activeTab === 'loja' && <StoreProfileView />}
        </div>
      </main>
    </div>
  )
}

