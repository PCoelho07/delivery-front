import { useState, useMemo, useEffect } from 'react'
import {
  ClipboardList,
  ShoppingBag,
  DollarSign,
  Timer,
  Receipt,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  ChefHat,
  Bike,
  CheckCircle2,
  RotateCcw,
  Search,
  X,
  LayoutGrid,
  List,
  Store,
  Trash2,
  Radio,
  RefreshCw,
  Ban,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCustomerStore } from '../../../store/useCustomerStore'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { formatCurrency } from '../../../lib/utils'
import { playOrderChime } from '../../../utils/audio'
import { useOrdersWebSocket } from '../../../hooks/useOrdersWebSocket'
import { OrderCard } from './OrderCard'
import { OrdersTableView } from './OrdersTableView'
import { ThermalReceiptModal } from './ThermalReceiptModal'
import { CancelOrderModal } from './CancelOrderModal'

// Pedidos demonstrativos para alimentar o Kanban caso ainda não haja pedidos no store
const DEFAULT_DEMO_ORDERS = [
  {
    orderId: '#1042',
    status: 'aceito',
    createdAt: 'Hoje às 21:42',
    elapsedTime: 'há 4 min',
    deliveryMethod: 'delivery',
    customer: {
      name: 'Lucas Silva',
      phone: '(84) 99876-5432',
    },
    address: {
      street: 'Rua das Flores',
      number: '142',
      neighborhoodName: 'Centro',
      complement: 'Apt 201',
    },
    items: [
      {
        cartItemId: 'item-demo-1',
        name: 'Brasa Master Picanha',
        product: { name: 'Brasa Master Picanha' },
        quantity: 1,
        price: 38.9,
        totalPrice: 42.9,
        options: [
          { name: 'Ponto da carne', value: 'Ao ponto' },
          { name: 'Bacon Extra', value: '+R$ 4,00' },
        ],
        notes: 'Sem cebola crua por favor',
      },
    ],
    deliveryFee: 6.0,
    subtotal: 42.9,
    total: 48.9,
    paymentMethod: 'pix',
    pix: {
      key: '12.345.678/0001-90',
      beneficiary: 'Brasa Burger',
    },
  },
  {
    orderId: '#1041',
    status: 'preparo',
    createdAt: 'Hoje às 21:32',
    elapsedTime: 'há 14 min',
    deliveryMethod: 'pickup',
    customer: {
      name: 'Mariana Costa',
      phone: '(84) 99123-4567',
    },
    address: null,
    items: [
      {
        cartItemId: 'item-demo-2',
        name: 'Smash Bacon Duplo',
        product: { name: 'Smash Bacon Duplo' },
        quantity: 2,
        price: 28.9,
        totalPrice: 57.8,
        options: [{ name: 'Molho extra', value: 'Maionese da casa' }],
      },
    ],
    deliveryFee: 0,
    subtotal: 57.8,
    total: 57.8,
    paymentMethod: 'credit',
  },
  {
    orderId: '#1040',
    status: 'entrega',
    createdAt: 'Hoje às 21:15',
    elapsedTime: 'há 28 min',
    deliveryMethod: 'delivery',
    customer: {
      name: 'Carlos Eduardo',
      phone: '(84) 98765-4321',
    },
    address: {
      street: 'Av. Brasil',
      number: '500',
      neighborhoodName: 'Jardim América',
      complement: 'Bloco B',
    },
    items: [
      {
        cartItemId: 'item-demo-3',
        name: 'Combo Casal Smash',
        product: { name: 'Combo Casal Smash' },
        quantity: 1,
        price: 64.9,
        totalPrice: 64.9,
        options: [{ name: 'Refrigerante', value: 'Coca-Cola 1.5L' }],
      },
    ],
    deliveryFee: 7.5,
    subtotal: 64.9,
    total: 72.4,
    paymentMethod: 'money',
    changeFor: 100,
  },
  {
    orderId: '#1039',
    status: 'concluido',
    createdAt: 'Hoje às 20:45',
    elapsedTime: 'concluído',
    deliveryMethod: 'delivery',
    customer: {
      name: 'Fernanda Lima',
      phone: '(84) 99444-2211',
    },
    address: {
      street: 'Rua da Paz',
      number: '88',
      neighborhoodName: 'Centro',
    },
    items: [
      {
        cartItemId: 'item-demo-4',
        name: 'Smash Salada Burger',
        product: { name: 'Smash Salada Burger' },
        quantity: 1,
        price: 26.9,
        totalPrice: 26.9,
      },
    ],
    deliveryFee: 5.0,
    subtotal: 26.9,
    total: 31.9,
    paymentMethod: 'pix',
  },
]

export function OrdersView() {
  const storeOrders = useCustomerStore((state) => state.orders)
  const updateStoreOrderStatus = useCustomerStore((state) => state.updateOrderStatus)
  const setStoreOrders = useCustomerStore((state) => state.setOrders)
  const clearStoreOrders = useCustomerStore((state) => state.clearOrders)

  // Sincronização multi-abas em tempo real via storage event
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'delivery-customer-cache-v1') {
        useCustomerStore.persist.rehydrate()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Modos de visualização: 'kanban' | 'list'
  const [viewMode, setViewMode] = useState('kanban')

  // Filtro de busca textual (#ID, nome do cliente ou item)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtro por modalidade: 'all' | 'delivery' | 'pickup'
  const [deliveryFilter, setDeliveryFilter] = useState('all')

  // Controle de compactação da coluna de Concluídos (para suportar dezenas de pedidos sem poluição)
  const [completedCompact, setCompletedCompact] = useState(true)

  // Controle de som de novo pedido
  const { soundEnabled, toggleSound } = useStoreAdmin()

  // Pedido selecionado para impressão de comanda térmica
  const [orderToPrint, setOrderToPrint] = useState(null)

  // Pedido selecionado para cancelamento / recusa
  const [orderToCancel, setOrderToCancel] = useState(null)

  // Conexão WebSocket Nativa com o backend em Go
  const {
    status: wsStatus,
    isConnected: isWsConnected,
    isReconnecting: isWsReconnecting,
    reconnect: reconnectWs,
    updateOrderStatus: sendWsStatusUpdate,
    simulateIncomingMessage,
  } = useOrdersWebSocket()

  // Todos os pedidos registrados
  const allOrders = storeOrders

  // Métricas do Topo (sempre calculadas sobre o total do dia)
  const metrics = useMemo(() => {
    const totalCount = allOrders.length
    const totalRevenue = allOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0)
    const ticketMedio = totalCount > 0 ? totalRevenue / totalCount : 0

    return {
      count: totalCount,
      revenue: totalRevenue,
      ticket: ticketMedio,
      kitchenTime: '18 min',
    }
  }, [allOrders])

  // Pedidos Filtrados por busca e modalidade
  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      // Filtro por modalidade e status
      if (deliveryFilter === 'delivery' && o.deliveryMethod !== 'delivery') return false
      if (deliveryFilter === 'pickup' && o.deliveryMethod !== 'pickup') return false
      if (deliveryFilter === 'canceled' && o.status !== 'cancelado' && o.status !== 'recusado') return false
      if (deliveryFilter !== 'canceled' && (o.status === 'cancelado' || o.status === 'recusado')) return false

      // Filtro de busca textual
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const matchId = (o.orderId || '').toLowerCase().includes(query)
      const matchName = (o.customer?.name || '').toLowerCase().includes(query)
      const matchPhone = (o.customer?.phone || '').includes(query)
      const matchItem = (o.items || []).some((it) => (it.name || it.product?.name || '').toLowerCase().includes(query))
      const matchNeighborhood = (o.address?.neighborhoodName || '').toLowerCase().includes(query)

      return matchId || matchName || matchPhone || matchItem || matchNeighborhood
    })
  }, [allOrders, searchQuery, deliveryFilter])

  // Colunas do Kanban (alimentadas com os pedidos filtrados)
  const newOrders = filteredOrders.filter((o) => o.status === 'aceito' || o.status === 'novo')
  const inPrepOrders = filteredOrders.filter((o) => o.status === 'preparo')
  const inDeliveryOrders = filteredOrders.filter((o) => o.status === 'entrega')
  const completedOrders = filteredOrders.filter((o) => o.status === 'concluido')
  const canceledOrders = allOrders.filter((o) => o.status === 'cancelado' || o.status === 'recusado')

  // Avançar Status
  const handleAdvance = (orderId, nextStatus) => {
    updateStoreOrderStatus(orderId, nextStatus)
    sendWsStatusUpdate(orderId, nextStatus)

    const targetOrder = allOrders.find((o) => o.orderId === orderId)
    const isPickup = targetOrder?.deliveryMethod === 'pickup'

    const messages = {
      preparo: 'Pedido enviado para a Cozinha!',
      entrega: isPickup ? 'Pedido pronto para retirada no balcão!' : 'Pedido saiu para Entrega!',
      concluido: isPickup ? 'Pedido retirado e finalizado com sucesso!' : 'Pedido entregue e concluído com sucesso!',
    }
    toast.success(messages[nextStatus] || 'Status atualizado com sucesso!')
  }

  // Voltar Status
  const handleRewind = (orderId, prevStatus) => {
    updateStoreOrderStatus(orderId, prevStatus)
    sendWsStatusUpdate(orderId, prevStatus)
    toast.info('Status retrocedido.')
  }

  // Cancelar / Recusar Pedido
  const handleCancelOrder = (orderId, reason, note) => {
    updateStoreOrderStatus(orderId, 'cancelado', {
      cancellationReason: reason,
      cancellationNote: note,
      canceledAt: new Date().toISOString(),
    })
    sendWsStatusUpdate(orderId, 'cancelado')
    const cleanId = String(orderId).replace(/^#/, '')
    toast.error(`Pedido #${cleanId} recusado/cancelado.`, {
      description: `Motivo: ${reason}`,
    })
  }

  // Alternar Som de Notificação
  const handleToggleSound = () => {
    toggleSound()
    if (!soundEnabled) {

      playOrderChime()
      toast.info('Alerta sonoro ativado (som de teste reproduzido).')
    } else {
      toast.info('Alerta sonoro silenciado.')
    }
  }

  // Simular Novo Pedido (Dispara via pipeline do WebSocket)
  const handleSimulateOrder = () => {
    const randomId = `#${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR')
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const simulated = {
      orderId: randomId,
      status: 'aceito',
      createdAt: `${dateStr} às ${timeStr}`,
      elapsedTime: `${dateStr} às ${timeStr}`,
      deliveryMethod: Math.random() > 0.3 ? 'delivery' : 'pickup',
      customer: {
        name: 'Cliente ' + randomId,
        phone: '(84) 99999-8888',
      },
      address: {
        street: 'Rua Principal',
        number: '10',
        neighborhoodName: 'Centro',
      },
      items: [
        {
          cartItemId: `sim-${Date.now()}`,
          name: 'Brasa Master Picanha',
          product: { name: 'Brasa Master Picanha' },
          quantity: 1,
          price: 34.9,
          totalPrice: 34.9,
          options: [{ name: 'Bacon', value: 'Extra (+R$ 4,00)' }],
        },
      ],
      deliveryFee: 5.0,
      subtotal: 38.9,
      total: 43.9,
      paymentMethod: 'pix',
      pix: {
        key: '12.345.678/0001-90',
        beneficiary: 'Brasa Burger',
      },
    }

    // Processa pelo simulador de mensagem do WebSocket
    simulateIncomingMessage('ORDER_CREATED', simulated)
  }

  // Restaurar Pedidos de Demonstração
  const handleResetDemo = () => {
    setStoreOrders(DEFAULT_DEMO_ORDERS)
    toast.info('Kanban restaurado com os pedidos de demonstração.')
  }

  // Limpar Todos os Pedidos (Zerar fila e testes)
  const handleClearOrders = () => {
    clearStoreOrders()
    toast.success('Todos os pedidos de teste foram removidos!')
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-extrabold text-[#1A1D20] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#FF5E1E]" />
              <span>Gestor de Pedidos em Tempo Real</span>
            </h2>

            {/* Status do WebSocket Nativo Go */}
            {isWsConnected ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                title="Conexão WebSocket ativa em tempo real com o backend Go"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Go WS Conectado</span>
              </span>
            ) : isWsReconnecting || wsStatus === 'CONNECTING' ? (
              <button
                type="button"
                onClick={reconnectWs}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Aguardando servidor Go (:8080/ws/orders). Clique para reconectar."
              >
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-600" />
                <span>Conectando Go WS...</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={reconnectWs}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Servidor Go offline. Clique para reconectar."
              >
                <Radio className="w-2.5 h-2.5 text-slate-400" />
                <span>Go WS Offline</span>
              </button>
            )}
          </div>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Acompanhe a fila de produção, avance etapas do pedido e imprima comandas térmicas para a cozinha.
          </p>
        </div>

        {/* Ações do Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Alternador de Visualização: Kanban vs Lista */}
          <div className="bg-[#F8F9FA] p-1 rounded-xl border border-[#E9ECEF] flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#FF5E1E] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#FF5E1E] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Compacta</span>
            </button>
          </div>

          {/* Som de Alerta */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-orange-50 border-orange-200 text-[#FF5E1E] hover:bg-orange-100'
                : 'bg-slate-50 border-[#E9ECEF] text-[#6C757D] hover:bg-slate-100'
            }`}
            title={soundEnabled ? 'Som ativado' : 'Som desativado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Alerta Ativo' : 'Mudo'}</span>
          </button>

          {/* Zerar Pedidos */}
          <button
            type="button"
            onClick={handleClearOrders}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Apagar todos os pedidos de teste"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span className="hidden md:inline">Zerar Pedidos</span>
          </button>

          {/* Restaurar Demonstração */}
          <button
            type="button"
            onClick={handleResetDemo}
            className="p-2.5 rounded-xl border border-[#E9ECEF] bg-white hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Recarregar exemplos"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Resetar</span>
          </button>

          {/* Simular Pedido */}
          <button
            type="button"
            onClick={handleSimulateOrder}
            className="px-4 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Simular Pedido</span>
          </button>
        </div>
      </div>

      {/* 4 Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pedidos Hoje */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Pedidos Hoje</p>
            <h3 className="text-2xl font-black text-[#1A1D20] mt-0.5">{metrics.count}</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">● Operação ativa</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#FF5E1E]" />
          </div>
        </div>

        {/* Card 2: Faturamento Estimado */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Faturamento Estimado</p>
            <h3 className="text-2xl font-black text-[#1A1D20] mt-0.5">
              {formatCurrency(metrics.revenue)}
            </h3>
            <p className="text-[11px] text-[#6C757D] mt-0.5">Vendas acumuladas hoje</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Tempo Médio Cozinha */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Tempo Médio Cozinha</p>
            <h3 className="text-2xl font-black text-[#1A1D20] mt-0.5">{metrics.kitchenTime}</h3>
            <p className="text-[11px] text-blue-600 font-bold mt-0.5">Preparo dentro da meta</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Timer className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Ticket Médio</p>
            <h3 className="text-2xl font-black text-[#1A1D20] mt-0.5">
              {formatCurrency(metrics.ticket)}
            </h3>
            <p className="text-[11px] text-[#6C757D] mt-0.5">Média por pedido</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca Rápida (Essencial para dias com 50+ pedidos) */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Campo de Busca Rápida */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por #nº pedido, cliente, item ou bairro..."
            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl pl-9 pr-8 py-2 text-xs text-[#1A1D20] font-semibold outline-none transition-all placeholder:text-[#9CA3AF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 rounded-full hover:bg-slate-200 text-[#6C757D] absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros por Modalidade & Contagem */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-[#E9ECEF]">
            <button
              type="button"
              onClick={() => setDeliveryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deliveryFilter === 'all'
                  ? 'bg-white text-[#1A1D20] shadow-2xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              Todos ({allOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setDeliveryFilter('delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                deliveryFilter === 'delivery'
                  ? 'bg-white text-[#FF5E1E] shadow-2xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Entrega</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryFilter('pickup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                deliveryFilter === 'pickup'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Balcão</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryFilter('canceled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                deliveryFilter === 'canceled'
                  ? 'bg-white text-rose-600 shadow-2xs font-extrabold'
                  : 'text-[#6C757D] hover:text-rose-600'
              }`}
            >
              <Ban className="w-3 h-3 text-rose-500" />
              <span>Cancelados ({canceledOrders.length})</span>
            </button>
          </div>

          {searchQuery && (
            <span className="text-[11px] font-bold text-[#FF5E1E] bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'encontrado' : 'encontrados'}
            </span>
          )}
        </div>
      </div>

      {/* RENDERIZAÇÃO: MODO KANBAN VS MODO LISTA VS CANCELADOS */}
      {deliveryFilter === 'canceled' ? (
        <div className="bg-white rounded-2xl border border-rose-200/90 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-rose-950 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                <span>Histórico de Pedidos Recusados & Cancelados</span>
              </h3>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Pedidos cancelados pela loja ou pelo cliente com motivo registrado.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {canceledOrders.length} {canceledOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {canceledOrders.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-2">
              <Ban className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-[#1A1D20]">Nenhum pedido cancelado</p>
              <p className="text-[11px] text-[#6C757D]">
                Os pedidos recusados ou cancelados com motivo aparecerão nesta listagem.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {canceledOrders.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  onPrint={setOrderToPrint}
                />
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <OrdersTableView
          orders={filteredOrders}
          onAdvance={handleAdvance}
          onPrint={setOrderToPrint}
        />
      ) : (
        /* 4 Colunas do Kanban com Rolagem Independente por Coluna */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
          {/* Coluna 1: Novos Pedidos */}
          <div className="flex flex-col bg-amber-50/40 rounded-2xl p-3 border border-amber-200/90 max-h-[calc(100vh-320px)] min-h-[460px] overflow-hidden">
            {/* Cabeçalho Fixo da Coluna */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-amber-200/60 shrink-0">
              <span className="font-extrabold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Novos Pedidos</span>
              </span>
              <span className="bg-amber-200 text-amber-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                {newOrders.length}
              </span>
            </div>

            {/* Lista com Scroll Interno Independente */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pt-3 pr-1 scrollbar-thin">
              {newOrders.length === 0 ? (
                <div className="bg-white/80 rounded-xl p-8 text-center border border-dashed border-amber-200">
                  <p className="text-xs text-[#6C757D]">Nenhum pedido pendente</p>
                </div>
              ) : (
                newOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onAdvance={handleAdvance}
                    onPrint={setOrderToPrint}
                    onCancel={setOrderToCancel}
                  />
                ))
              )}
            </div>
          </div>

          {/* Coluna 2: Em Preparo (Cozinha) */}
          <div className="flex flex-col bg-blue-50/40 rounded-2xl p-3 border border-blue-200/90 max-h-[calc(100vh-320px)] min-h-[460px] overflow-hidden">
            {/* Cabeçalho Fixo da Coluna */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-blue-200/60 shrink-0">
              <span className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                <span>Em Preparo</span>
              </span>
              <span className="bg-blue-200 text-blue-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                {inPrepOrders.length}
              </span>
            </div>

            {/* Lista com Scroll Interno Independente */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pt-3 pr-1 scrollbar-thin">
              {inPrepOrders.length === 0 ? (
                <div className="bg-white/80 rounded-xl p-8 text-center border border-dashed border-blue-200">
                  <p className="text-xs text-[#6C757D]">Cozinha livre</p>
                </div>
              ) : (
                inPrepOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onAdvance={handleAdvance}
                    onRewind={handleRewind}
                    onPrint={setOrderToPrint}
                    onCancel={setOrderToCancel}
                  />
                ))
              )}
            </div>
          </div>

          {/* Coluna 3: Pronto / Em Rota */}
          <div className="flex flex-col bg-purple-50/40 rounded-2xl p-3 border border-purple-200/90 max-h-[calc(100vh-320px)] min-h-[460px] overflow-hidden">
            {/* Cabeçalho Fixo da Coluna */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-purple-200/60 shrink-0">
              <span className="font-extrabold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="flex items-center gap-1 text-purple-600 shrink-0">
                  <Bike className="w-3.5 h-3.5" title="Entrega" />
                  <Store className="w-3.5 h-3.5" title="Retirada" />
                </div>
                <span>Pronto / Em Rota</span>
              </span>
              <span className="bg-purple-200 text-purple-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                {inDeliveryOrders.length}
              </span>
            </div>

            {/* Lista com Scroll Interno Independente */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pt-3 pr-1 scrollbar-thin">
              {inDeliveryOrders.length === 0 ? (
                <div className="bg-white/80 rounded-xl p-8 text-center border border-dashed border-purple-200">
                  <p className="text-xs text-[#6C757D]">Nenhum pedido pronto ou em rota</p>
                </div>
              ) : (
                inDeliveryOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onAdvance={handleAdvance}
                    onRewind={handleRewind}
                    onPrint={setOrderToPrint}
                    onCancel={setOrderToCancel}
                  />
                ))
              )}
            </div>
          </div>

          {/* Coluna 4: Concluídos (com Visual Compacto para economizar espaço com dezenas de pedidos) */}
          <div className="flex flex-col bg-emerald-50/40 rounded-2xl p-3 border border-emerald-200/90 max-h-[calc(100vh-320px)] min-h-[460px] overflow-hidden">
            {/* Cabeçalho Fixo da Coluna com Botão de Compactar */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-emerald-200/60 shrink-0">
              <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Concluídos</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCompletedCompact(!completedCompact)}
                  className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Alternar entre visual compacto e detalhado"
                >
                  {completedCompact ? 'Modo Compacto' : 'Modo Completo'}
                </button>
                <span className="bg-emerald-200 text-emerald-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {completedOrders.length}
                </span>
              </div>
            </div>

            {/* Lista com Scroll Interno Independente */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pt-3 pr-1 scrollbar-thin">
              {completedOrders.length === 0 ? (
                <div className="bg-white/80 rounded-xl p-8 text-center border border-dashed border-emerald-200">
                  <p className="text-xs text-[#6C757D]">Nenhum pedido finalizado</p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    compact={completedCompact}
                    onRewind={handleRewind}
                    onPrint={setOrderToPrint}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão Térmica 80mm */}
      {orderToPrint && (
        <ThermalReceiptModal
          order={orderToPrint}
          onClose={() => setOrderToPrint(null)}
        />
      )}

      {/* Modal de Recusa / Cancelamento com Motivo */}
      {orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          onClose={() => setOrderToCancel(null)}
          onConfirmCancel={handleCancelOrder}
        />
      )}
    </div>
  )
}
