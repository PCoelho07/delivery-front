import { useState, useMemo, useRef } from 'react'
import {
  CircleDollarSign,
  DollarSign,
  ShoppingBag,
  Receipt,
  Clock,
  QrCode,
  CreditCard,
  Banknote,
  Bike,
  Store,
  Calendar,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../../lib/utils'

// Dados demonstrativos por período sincronizados com o modelo do backoffice_preview.html
const FINANCIAL_DATASETS = {
  today: {
    faturamento: 1940.0,
    pedidos: 24,
    ticket: 80.83,
    tempo: '32 min',
    periodLabel: 'hoje',
    payTotalCount: '24 pedidos',
    payments: {
      pix: { count: 16, percentage: '67%', total: 1320.0 },
      card: { count: 6, percentage: '25%', total: 480.0 },
      cash: { count: 2, percentage: '8%', total: 140.0 },
    },
    orderTypes: {
      delivery: { count: 19, percentage: '79%', total: 1550.0 },
      pickup: { count: 5, percentage: '21%', total: 390.0 },
    },
    tableDaysBadge: '1 dia selecionado',
    dailyRecords: [
      {
        date: 'Hoje (22/10)',
        orders: 24,
        total: 1940.0,
        ticket: 80.83,
        avgTime: '32 min',
        topPaymentName: 'PIX (68%)',
        topPaymentType: 'pix',
      },
    ],
  },
  week: {
    faturamento: 14850.0,
    pedidos: 186,
    ticket: 79.84,
    tempo: '35 min',
    periodLabel: 'nos últimos 7 dias',
    payTotalCount: '186 pedidos',
    payments: {
      pix: { count: 112, percentage: '60%', total: 8910.0 },
      card: { count: 58, percentage: '31%', total: 4740.0 },
      cash: { count: 16, percentage: '9%', total: 1200.0 },
    },
    orderTypes: {
      delivery: { count: 142, percentage: '76%', total: 11640.0 },
      pickup: { count: 44, percentage: '24%', total: 3210.0 },
    },
    tableDaysBadge: '5 dias com vendas',
    dailyRecords: [
      {
        date: 'Hoje (22/10)',
        orders: 24,
        total: 1940.0,
        ticket: 80.83,
        avgTime: '32 min',
        topPaymentName: 'PIX (68%)',
        topPaymentType: 'pix',
      },
      {
        date: 'Ontem (21/10)',
        orders: 38,
        total: 3020.0,
        ticket: 79.47,
        avgTime: '36 min',
        topPaymentName: 'PIX (60%)',
        topPaymentType: 'pix',
      },
      {
        date: '20/10/2026',
        orders: 31,
        total: 2480.0,
        ticket: 80.0,
        avgTime: '34 min',
        topPaymentName: 'Cartão (55%)',
        topPaymentType: 'card',
      },
      {
        date: '19/10/2026',
        orders: 45,
        total: 3650.0,
        ticket: 81.11,
        avgTime: '40 min',
        topPaymentName: 'PIX (64%)',
        topPaymentType: 'pix',
      },
      {
        date: '18/10/2026',
        orders: 48,
        total: 3760.0,
        ticket: 78.33,
        avgTime: '38 min',
        topPaymentName: 'PIX (58%)',
        topPaymentType: 'pix',
      },
    ],
  },
  month: {
    faturamento: 38420.0,
    pedidos: 482,
    ticket: 79.7,
    tempo: '36 min',
    periodLabel: 'neste mês',
    payTotalCount: '482 pedidos',
    payments: {
      pix: { count: 290, percentage: '60%', total: 23050.0 },
      card: { count: 154, percentage: '32%', total: 12280.0 },
      cash: { count: 38, percentage: '8%', total: 3090.0 },
    },
    orderTypes: {
      delivery: { count: 375, percentage: '78%', total: 29840.0 },
      pickup: { count: 107, percentage: '22%', total: 8580.0 },
    },
    tableDaysBadge: 'Mês de Outubro / 2026',
    dailyRecords: [
      {
        date: 'Hoje (22/10)',
        orders: 24,
        total: 1940.0,
        ticket: 80.83,
        avgTime: '32 min',
        topPaymentName: 'PIX (68%)',
        topPaymentType: 'pix',
      },
      {
        date: 'Ontem (21/10)',
        orders: 38,
        total: 3020.0,
        ticket: 79.47,
        avgTime: '36 min',
        topPaymentName: 'PIX (60%)',
        topPaymentType: 'pix',
      },
      {
        date: '20/10/2026',
        orders: 31,
        total: 2480.0,
        ticket: 80.0,
        avgTime: '34 min',
        topPaymentName: 'Cartão (55%)',
        topPaymentType: 'card',
      },
      {
        date: '19/10/2026',
        orders: 45,
        total: 3650.0,
        ticket: 81.11,
        avgTime: '40 min',
        topPaymentName: 'PIX (64%)',
        topPaymentType: 'pix',
      },
      {
        date: '18/10/2026',
        orders: 48,
        total: 3760.0,
        ticket: 78.33,
        avgTime: '38 min',
        topPaymentName: 'PIX (58%)',
        topPaymentType: 'pix',
      },
      {
        date: '17/10/2026',
        orders: 52,
        total: 4190.0,
        ticket: 80.57,
        avgTime: '37 min',
        topPaymentName: 'PIX (62%)',
        topPaymentType: 'pix',
      },
      {
        date: '16/10/2026',
        orders: 49,
        total: 3890.0,
        ticket: 79.38,
        avgTime: '35 min',
        topPaymentName: 'Cartão (52%)',
        topPaymentType: 'card',
      },
      {
        date: '15/10/2026',
        orders: 42,
        total: 3340.0,
        ticket: 79.52,
        avgTime: '34 min',
        topPaymentName: 'PIX (65%)',
        topPaymentType: 'pix',
      },
    ],
  },
}

export function FinancialView() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [dateBr, setDateBr] = useState('')
  const [isoDate, setIsoDate] = useState('')
  const hiddenDateRef = useRef(null)

  // Alterna o período rápido
  const handlePeriodChange = (periodKey) => {
    setSelectedPeriod(periodKey)
    setDateBr('')
    setIsoDate('')
    if (periodKey === 'today') {
      toast.info('Exibindo faturamento e pedidos de Hoje')
    } else if (periodKey === 'week') {
      toast.info('Exibindo faturamento dos Últimos 7 dias')
    } else {
      toast.info('Exibindo faturamento do Mês Atual')
    }
  }

  // Digitação manual com máscara brasileira (DD/MM/AAAA)
  const handleDateBrChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formatted = ''
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`
    } else {
      formatted = raw
    }
    setDateBr(formatted)

    if (raw.length === 8) {
      const d = raw.slice(0, 2)
      const m = raw.slice(2, 4)
      const y = raw.slice(4, 8)
      setIsoDate(`${y}-${m}-${d}`)
      toast.info(`Exibindo fechamento de ${formatted}`)
    } else {
      setIsoDate('')
    }
  }

  // Seleção através do calendário nativo (converte para DD/MM/AAAA)
  const handleNativePickerChange = (e) => {
    const val = e.target.value
    if (!val) return
    const parts = val.split('-')
    if (parts.length === 3) {
      const [y, m, d] = parts
      const formatted = `${d}/${m}/${y}`
      setDateBr(formatted)
      setIsoDate(val)
      toast.info(`Exibindo fechamento de ${formatted}`)
    }
  }

  // Abre o calendário gráfico ao clicar no ícone
  const handleOpenPicker = () => {
    try {
      if (hiddenDateRef.current) {
        if (typeof hiddenDateRef.current.showPicker === 'function') {
          hiddenDateRef.current.showPicker()
        } else {
          hiddenDateRef.current.focus()
        }
      }
    } catch {
      // Navegadores sem suporte a showPicker
    }
  }

  // Limpa o filtro de data específica e restaura o período
  const handleClearDate = () => {
    setDateBr('')
    setIsoDate('')
    setSelectedPeriod('month')
  }

  // Dados calculados para o período ativo
  const currentData = useMemo(() => {
    if (dateBr && dateBr.length === 10) {
      return {
        ...FINANCIAL_DATASETS.today,
        periodLabel: `em ${dateBr}`,
        tableDaysBadge: `Filtrado por: ${dateBr}`,
        dailyRecords: [
          {
            date: dateBr,
            orders: 24,
            total: 1940.0,
            ticket: 80.83,
            avgTime: '32 min',
            topPaymentName: 'PIX (68%)',
            topPaymentType: 'pix',
          },
        ],
      }
    }
    return FINANCIAL_DATASETS[selectedPeriod] || FINANCIAL_DATASETS.month
  }, [selectedPeriod, dateBr])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Topo com Filtros de Período */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <h2 className="text-base font-extrabold text-[#1A1D20]">
              Financeiro & Faturamento
            </h2>
          </div>
          <p className="text-xs text-[#6C757D] mt-1">
            Consolidado de faturamento, total de pedidos e ticket médio das
            vendas realizadas pelo aplicativo.
          </p>
        </div>

        {/* Filtros Rápidos & Seletor de Data */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#F8F9FA] p-1 rounded-xl border border-[#E9ECEF] flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePeriodChange('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !dateBr && selectedPeriod === 'today'
                  ? 'bg-[#FF5E1E] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !dateBr && selectedPeriod === 'week'
                  ? 'bg-[#FF5E1E] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !dateBr && selectedPeriod === 'month'
                  ? 'bg-[#FF5E1E] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              Este Mês
            </button>
          </div>

          {/* Seletor de Data no Formato Brasileiro (DD/MM/AAAA) */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-2.5 py-1.5 focus-within:border-[#FF5E1E] focus-within:bg-white transition-all shadow-2xs">
              <button
                type="button"
                onClick={handleOpenPicker}
                className="text-[#6C757D] hover:text-[#FF5E1E] mr-1.5 cursor-pointer transition-colors"
                title="Abrir calendário"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={dateBr}
                onChange={handleDateBrChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-24 text-xs text-[#1A1D20] font-semibold bg-transparent outline-none placeholder:text-[#ADB5BD] placeholder:font-normal"
              />
              {/* Input nativo oculto para abrir o calendário gráfico do sistema */}
              <input
                ref={hiddenDateRef}
                type="date"
                value={isoDate}
                onChange={handleNativePickerChange}
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            {dateBr && (
              <button
                type="button"
                onClick={handleClearDate}
                className="ml-1.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpar filtro de data"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Bruto */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-4.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D]">
              Faturamento Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1D20]">
            {formatCurrency(currentData.faturamento)}
          </div>
          <div className="text-[11px] text-[#6C757D] flex items-center gap-1">
            <span className="text-emerald-600 font-bold">● Vendas válidas</span>
            <span>{currentData.periodLabel}</span>
          </div>
        </div>

        {/* Card 2: Pedidos Concluídos */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-4.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D]">
              Pedidos Vendidos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1D20]">
            {currentData.pedidos}
          </div>
          <div className="text-[11px] text-[#6C757D]">
            Entregas e retiradas finalizadas
          </div>
        </div>

        {/* Card 3: Ticket Médio */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-4.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D]">
              Ticket Médio
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1D20]">
            {formatCurrency(currentData.ticket)}
          </div>
          <div className="text-[11px] text-[#6C757D]">
            Média de valor gasto por cliente
          </div>
        </div>

        {/* Card 4: Tempo Médio */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-4.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D]">
              Tempo Médio de Entrega
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1D20]">
            {currentData.tempo}
          </div>
          <div className="text-[11px] text-[#6C757D]">
            Do aceite do pedido até a entrega
          </div>
        </div>
      </div>

      {/* Distribuição: Métodos de Pagamento & Modalidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formas de Pagamento no Período */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              Formas de Pagamento
            </h3>
            <span className="text-[11px] font-bold text-[#6C757D]">
              {currentData.payTotalCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* PIX */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1D20] block">PIX</span>
                  <span className="text-[10px] text-[#6C757D]">
                    {currentData.payments.pix.count} pedidos (
                    {currentData.payments.pix.percentage})
                  </span>
                </div>
              </div>
              <span className="font-bold text-[#1A1D20]">
                {formatCurrency(currentData.payments.pix.total)}
              </span>
            </div>

            {/* Cartão */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1D20] block">
                    Cartão na Entrega / Maquininha
                  </span>
                  <span className="text-[10px] text-[#6C757D]">
                    {currentData.payments.card.count} pedidos (
                    {currentData.payments.card.percentage})
                  </span>
                </div>
              </div>
              <span className="font-bold text-[#1A1D20]">
                {formatCurrency(currentData.payments.card.total)}
              </span>
            </div>

            {/* Dinheiro */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1D20] block">
                    Dinheiro
                  </span>
                  <span className="text-[10px] text-[#6C757D]">
                    {currentData.payments.cash.count} pedidos (
                    {currentData.payments.cash.percentage})
                  </span>
                </div>
              </div>
              <span className="font-bold text-[#1A1D20]">
                {formatCurrency(currentData.payments.cash.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Tipo de Atendimento */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              Tipo de Pedido
            </h3>
            <span className="text-[11px] font-bold text-[#6C757D]">
              Entrega vs Balcão
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Delivery */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1D20] block">
                    Delivery (Entrega em Domicílio)
                  </span>
                  <span className="text-[10px] text-[#6C757D]">
                    {currentData.orderTypes.delivery.count} pedidos (
                    {currentData.orderTypes.delivery.percentage})
                  </span>
                </div>
              </div>
              <span className="font-bold text-[#1A1D20]">
                {formatCurrency(currentData.orderTypes.delivery.total)}
              </span>
            </div>

            {/* Retirada */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1D20] block">
                    Retirada no Balcão
                  </span>
                  <span className="text-[10px] text-[#6C757D]">
                    {currentData.orderTypes.pickup.count} pedidos (
                    {currentData.orderTypes.pickup.percentage})
                  </span>
                </div>
              </div>
              <span className="font-bold text-[#1A1D20]">
                {formatCurrency(currentData.orderTypes.pickup.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Consolidada por Dia / Histórico de Fechamento */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              Histórico de Vendas por Dia
            </h3>
            <p className="text-xs text-[#6C757D]">
              Detalhamento diário do faturamento e métricas operacionais.
            </p>
          </div>
          <div className="text-xs font-bold text-[#FF5E1E] bg-orange-50 px-3 py-1 rounded-xl border border-orange-200 shrink-0 self-start sm:self-auto">
            <span>{currentData.tableDaysBadge}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9ECEF] text-[#6C757D] font-bold">
                <th className="pb-3 pl-2">Data</th>
                <th className="pb-3 text-center">Pedidos</th>
                <th className="pb-3 text-right">Faturamento</th>
                <th className="pb-3 text-right">Ticket Médio</th>
                <th className="pb-3 text-center">Tempo Médio</th>
                <th className="pb-3 pr-2 text-right">Mais Usado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {currentData.dailyRecords.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3 pl-2 font-bold text-[#1A1D20]">
                    {row.date}
                  </td>
                  <td className="py-3 text-center font-semibold text-[#1A1D20]">
                    {row.orders}
                  </td>
                  <td className="py-3 text-right font-extrabold text-[#1A1D20]">
                    {formatCurrency(row.total)}
                  </td>
                  <td className="py-3 text-right font-semibold text-[#6C757D]">
                    {formatCurrency(row.ticket)}
                  </td>
                  <td className="py-3 text-center text-[#6C757D]">
                    {row.avgTime}
                  </td>
                  <td className="py-3 pr-2 text-right font-semibold">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        row.topPaymentType === 'pix'
                          ? 'text-emerald-700'
                          : row.topPaymentType === 'card'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {row.topPaymentType === 'pix' ? (
                        <QrCode className="w-3.5 h-3.5" />
                      ) : row.topPaymentType === 'card' ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : (
                        <Banknote className="w-3.5 h-3.5" />
                      )}
                      <span>{row.topPaymentName}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
