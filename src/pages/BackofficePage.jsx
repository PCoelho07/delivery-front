import { BackofficeSidebar } from '../components/backoffice/BackofficeSidebar'
import { BackofficeTopbar } from '../components/backoffice/BackofficeTopbar'
import { MenuVitrineView } from '../components/backoffice/menu/MenuVitrineView'
import { TemplatesView } from '../components/backoffice/templates/TemplatesView'
import { ScheduleView } from '../components/backoffice/schedule/ScheduleView'
import { DeliveryView } from '../components/backoffice/delivery/DeliveryView'
import { PaymentsView } from '../components/backoffice/payments/PaymentsView'
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

          {activeTab === 'pedidos' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-xs">
                <h3 className="font-extrabold text-base text-[#1A1D20]">📋 Gestor de Pedidos em Tempo Real</h3>
                <p className="text-xs text-[#6C757D] mt-1">
                  Aqui ficará o Kanban visual com colunas de Novos, Em Preparo, Saiu para Entrega e Concluídos com impressão de comanda.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'horarios' && <ScheduleView />}

          {activeTab === 'entregas' && <DeliveryView />}

          {activeTab === 'pagamentos' && <PaymentsView />}

          {activeTab === 'loja' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-xs">
                <h3 className="font-extrabold text-base text-[#1A1D20]">⚙️ Dados do Restaurante</h3>
                <p className="text-xs text-[#6C757D] mt-1">
                  Aqui ficarão os campos de nome da loja, telefone, WhatsApp de pedidos, Instagram e pedido mínimo.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

