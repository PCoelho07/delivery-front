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
  CalendarDays,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../../lib/utils'
import { CustomSelect } from '../../common/CustomSelect'

// Opções organizadas do seletor customizado de períodos
const MONTH_SELECT_OPTIONS = [
  { value: 'last_6_months', label: '📊 Últimos 6 Meses (Consolidado)' },
  {
    group: 'Filtrar Mês a Mês',
    items: [
      { value: 'month', label: 'Outubro / 2026 (Mês Atual)' },
      { value: 'm-09', label: 'Setembro / 2026' },
      { value: 'm-08', label: 'Agosto / 2026' },
      { value: 'm-07', label: 'Julho / 2026' },
      { value: 'm-06', label: 'Junho / 2026' },
      { value: 'm-05', label: 'Maio / 2026' },
      { value: 'm-04', label: 'Abril / 2026' },
      { value: 'm-03', label: 'Março / 2026' },
      { value: 'm-02', label: 'Fevereiro / 2026' },
      { value: 'm-01', label: 'Janeiro / 2026' },
    ],
  },
]

// Rótulos amigáveis para feedback de seleção
const PERIOD_LABELS = {
  today: 'Hoje',
  week: 'Últimos 7 dias',
  month: 'Outubro / 2026 (Mês Atual)',
  last_6_months: 'Últimos 6 Meses (Consolidado)',
  'm-09': 'Setembro / 2026',
  'm-08': 'Agosto / 2026',
  'm-07': 'Julho / 2026',
  'm-06': 'Junho / 2026',
  'm-05': 'Maio / 2026',
  'm-04': 'Abril / 2026',
  'm-03': 'Março / 2026',
  'm-02': 'Fevereiro / 2026',
  'm-01': 'Janeiro / 2026',
}

const ZERO_PAYMENTS = {
  pix: { count: 0, percentage: '0%', total: 0 },
  card: { count: 0, percentage: '0%', total: 0 },
  cash: { count: 0, percentage: '0%', total: 0 },
}

const ZERO_ORDER_TYPES = {
  delivery: { count: 0, percentage: '0%', total: 0 },
  pickup: { count: 0, percentage: '0%', total: 0 },
}

function createZeroDataset(periodLabel, tableDaysBadge) {
  return {
    faturamento: 0,
    pedidos: 0,
    ticket: 0,
    tempo: '0 min',
    periodLabel,
    payTotalCount: '0 pedidos',
    payments: ZERO_PAYMENTS,
    orderTypes: ZERO_ORDER_TYPES,
    tableDaysBadge,
    dailyRecords: [],
  }
}

// Dados zerados por período e mês a mês
const FINANCIAL_DATASETS = {
  today: createZeroDataset('hoje', 'Hoje'),
  week: createZeroDataset('nos últimos 7 dias', 'Últimos 7 dias'),
  month: createZeroDataset('neste mês (Outubro)', 'Mês de Outubro / 2026'),
  last_6_months: createZeroDataset(
    'nos últimos 6 meses (Maio a Outubro)',
    'Consolidado Últimos 6 Meses (Maio a Outubro / 2026)'
  ),
  'm-09': createZeroDataset('em Setembro / 2026', 'Mês de Setembro / 2026'),
  'm-08': createZeroDataset('em Agosto / 2026', 'Mês de Agosto / 2026'),
  'm-07': createZeroDataset('em Julho / 2026', 'Mês de Julho / 2026'),
  'm-06': createZeroDataset('em Junho / 2026', 'Mês de Junho / 2026'),
  'm-05': createZeroDataset('em Maio / 2026', 'Mês de Maio / 2026'),
  'm-04': createZeroDataset('em Abril / 2026', 'Mês de Abril / 2026'),
  'm-03': createZeroDataset('em Março / 2026', 'Mês de Março / 2026'),
  'm-02': createZeroDataset('em Fevereiro / 2026', 'Mês de Fevereiro / 2026'),
  'm-01': createZeroDataset('em Janeiro / 2026', 'Mês de Janeiro / 2026'),
}

export function FinancialView() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [dateBr, setDateBr] = useState('')
  const [isoDate, setIsoDate] = useState('')
  const hiddenDateRef = useRef(null)

  // Alterna o período rápido (Hoje, 7 dias)
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

  // Alterna pelo dropdown de Últimos 6 Meses ou Mês a Mês
  const handleDropdownChange = (valOrEvent) => {
    const val =
      typeof valOrEvent === 'string'
        ? valOrEvent
        : valOrEvent?.target?.value
    if (!val) return
    setSelectedPeriod(val)
    setDateBr('')
    setIsoDate('')
    const label = PERIOD_LABELS[val] || val
    toast.info(`Exibindo fechamento de ${label}`)
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
      return createZeroDataset(`em ${dateBr}`, `Filtrado por: ${dateBr}`)
    }
    return FINANCIAL_DATASETS[selectedPeriod] || FINANCIAL_DATASETS.month
  }, [selectedPeriod, dateBr])

  const isMonthDropdownActive =
    !dateBr && !['today', 'week'].includes(selectedPeriod)

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

        {/* Filtros Rápidos, Dropdown de Meses & Seletor de Data */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5">
          {/* Botões Rápidos (Hoje, 7 dias) */}
          <div className="grid grid-cols-2 sm:flex bg-[#F8F9FA] p-1 rounded-xl border border-[#E9ECEF] gap-1">
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
          </div>

          {/* Dropdown Customizado: Últimos 6 Meses ou Mês a Mês */}
          <div className="w-full sm:w-64">
            <CustomSelect
              value={isMonthDropdownActive ? selectedPeriod : ''}
              onChange={handleDropdownChange}
              options={MONTH_SELECT_OPTIONS}
              placeholder="Filtrar por Mês / 6 Meses"
              icon={<CalendarDays className="w-4 h-4 text-[#FF5E1E]" />}
              variant={isMonthDropdownActive ? 'orange' : 'default'}
              triggerClassName={
                isMonthDropdownActive
                  ? 'bg-orange-50/80 border-[#FF5E1E] text-[#FF5E1E]'
                  : 'bg-[#F8F9FA]'
              }
            />
          </div>

          {/* Seletor de Data no Formato Brasileiro (DD/MM/AAAA) */}
          <div className="relative flex items-center w-full sm:w-auto">
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-2.5 py-1.5 focus-within:border-[#FF5E1E] focus-within:bg-white transition-all shadow-2xs">
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
              Histórico de Vendas por Período
            </h3>
            <p className="text-xs text-[#6C757D]">
              Detalhamento de faturamento e métricas operacionais para o filtro selecionado.
            </p>
          </div>
          <div className="text-xs font-bold text-[#FF5E1E] bg-orange-50 px-3 py-1 rounded-xl border border-orange-200 shrink-0 self-start sm:self-auto">
            <span>{currentData.tableDaysBadge}</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[640px] text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#E9ECEF] text-[#6C757D] font-bold">
                <th className="pb-3 pl-2 pr-4">
                  {selectedPeriod === 'last_6_months' && !dateBr
                    ? 'Mês / Período'
                    : 'Data'}
                </th>
                <th className="pb-3 px-3 text-center">Pedidos</th>
                <th className="pb-3 px-3 text-right">Faturamento</th>
                <th className="pb-3 px-3 text-right">Ticket Médio</th>
                <th className="pb-3 px-3 text-center">Tempo Médio</th>
                <th className="pb-3 pl-3 pr-2 text-right">Mais Usado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {currentData.dailyRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-xs text-[#6C757D]"
                  >
                    Nenhuma venda registrada neste período.
                  </td>
                </tr>
              ) : (
                currentData.dailyRecords.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 pl-2 pr-4 font-bold text-[#1A1D20]">
                      {row.date}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-[#1A1D20]">
                      {row.orders}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-[#1A1D20]">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#6C757D]">
                      {formatCurrency(row.ticket)}
                    </td>
                    <td className="py-3 px-3 text-center text-[#6C757D]">
                      {row.avgTime}
                    </td>
                    <td className="py-3 pl-3 pr-2 text-right font-semibold">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
