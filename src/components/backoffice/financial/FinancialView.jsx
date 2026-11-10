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
  Sparkles,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../../lib/utils'
import { CustomSelect } from '../../common/CustomSelect'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { calculateCompanyPlanUsage } from '../../../utils/planRules'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/**
 * Converte qualquer formato de data de cadastro em um objeto Date válido.
 * Fallback: Janeiro do ano corrente se a data for inválida ou não informada.
 */
function parseStoreStartDate(rawDate) {
  if (!rawDate) {
    const fallback = new Date()
    return new Date(fallback.getFullYear(), 0, 1)
  }
  if (rawDate instanceof Date && !isNaN(rawDate)) {
    return rawDate
  }
  if (typeof rawDate === 'number') {
    const d = new Date(rawDate)
    return isNaN(d) ? new Date(new Date().getFullYear(), 0, 1) : d
  }
  if (typeof rawDate === 'string') {
    const brMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (brMatch) {
      const [, d, m, y] = brMatch
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10))
    }
    const parsed = new Date(rawDate)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }
  return new Date(new Date().getFullYear(), 0, 1)
}

/**
 * Gera dinamicamente a lista de meses disponíveis desde a data de cadastro
 * até o mês corrente (new Date()). Garante que novos meses sejam liberados
 * automaticamente na virada do mês, e meses anteriores ao cadastro nunca apareçam.
 */
function generateAvailableMonths(startDate, currentDate = new Date()) {
  const start = parseStoreStartDate(startDate)
  const current =
    currentDate instanceof Date && !isNaN(currentDate) ? currentDate : new Date()

  const startYear = start.getFullYear()
  const startMonth = start.getMonth()

  const currentYear = current.getFullYear()
  const currentMonth = current.getMonth()

  const months = []
  let y = currentYear
  let m = currentMonth

  while (y > startYear || (y === startYear && m >= startMonth)) {
    const isCurrent = y === currentYear && m === currentMonth
    const monthName = MONTH_NAMES[m]
    // Identificador 'month' preservado para o mês atual garantindo retrocompatibilidade
    const key = isCurrent ? 'month' : `m-${y}-${String(m + 1).padStart(2, '0')}`
    const label = isCurrent
      ? `${monthName} / ${y} (Mês Atual)`
      : `${monthName} / ${y}`

    months.push({
      value: key,
      label,
      year: y,
      monthIndex: m,
      monthName,
      isCurrent,
    })

    m--
    if (m < 0) {
      m = 11
      y--
    }
  }

  if (months.length === 0) {
    months.push({
      value: 'month',
      label: `${MONTH_NAMES[currentMonth]} / ${currentYear} (Mês Atual)`,
      year: currentYear,
      monthIndex: currentMonth,
      monthName: MONTH_NAMES[currentMonth],
      isCurrent: true,
    })
  }

  return months
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

export function FinancialView() {
  const storeInfo = useStoreAdmin((state) => state.storeInfo)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [dateBr, setDateBr] = useState('')
  const [isoDate, setIsoDate] = useState('')
  const hiddenDateRef = useRef(null)

  // Meses dinâmicos baseados no cadastro do lojista e na data atual
  const availableMonths = useMemo(() => {
    return generateAvailableMonths(storeInfo?.createdAt || storeInfo?.created_at)
  }, [storeInfo?.createdAt, storeInfo?.created_at])

  // Total de meses disponíveis no histórico do lojista
  const totalMonths = availableMonths.length
  const consolidatedCount = Math.min(6, totalMonths)

  // Rótulo da predefinição sem ícone de gráfico
  const consolidatedLabel =
    consolidatedCount < 6
      ? consolidatedCount === 1
        ? 'Mês Atual (Consolidado)'
        : `Últimos ${consolidatedCount} Meses (Consolidado)`
      : 'Últimos 6 Meses (Consolidado)'

  // Opções para o CustomSelect (sem ícone de gráfico)
  const monthSelectOptions = useMemo(() => {
    return [
      {
        value: 'last_6_months',
        label: consolidatedLabel,
      },
      {
        group: 'Filtrar Mês a Mês',
        items: availableMonths.map((m) => ({
          value: m.value,
          label: m.label,
        })),
      },
    ]
  }, [consolidatedLabel, availableMonths])

  // Rótulos amigáveis para mensagens informativas e toasts
  const periodLabelsMap = useMemo(() => {
    const map = {
      today: 'Hoje',
      week: 'Últimos 7 dias',
      last_6_months: consolidatedLabel,
    }
    availableMonths.forEach((m) => {
      map[m.value] = m.label
    })
    return map
  }, [consolidatedLabel, availableMonths])

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
      toast.info(`Exibindo faturamento de ${availableMonths[0]?.label || 'Mês Atual'}`)
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
    const label = periodLabelsMap[val] || val
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

    if (selectedPeriod === 'today') {
      return createZeroDataset('hoje', 'Hoje')
    }

    if (selectedPeriod === 'week') {
      return createZeroDataset('nos últimos 7 dias', 'Últimos 7 dias')
    }

    if (selectedPeriod === 'last_6_months') {
      const oldest = availableMonths[consolidatedCount - 1] || availableMonths[0]
      const newest = availableMonths[0]
      const rangeDesc =
        consolidatedCount === 1
          ? `no mês atual (${newest?.monthName || 'Mês Atual'})`
          : `nos últimos ${consolidatedCount} meses (${oldest?.monthName || ''} a ${newest?.monthName || ''})`

      const badgeDesc =
        consolidatedCount === 1
          ? `Consolidado Mês Atual (${newest?.monthName || ''} / ${newest?.year || ''})`
          : `Consolidado Últimos ${consolidatedCount} Meses (${oldest?.monthName || ''} a ${newest?.monthName || ''} / ${newest?.year || ''})`

      return createZeroDataset(rangeDesc, badgeDesc)
    }

    const monthObj = availableMonths.find((m) => m.value === selectedPeriod)
    if (monthObj) {
      const periodDesc = monthObj.isCurrent
        ? `neste mês (${monthObj.monthName})`
        : `em ${monthObj.monthName} / ${monthObj.year}`

      return createZeroDataset(
        periodDesc,
        `Mês de ${monthObj.monthName} / ${monthObj.year}`
      )
    }

    const fallbackMonth = availableMonths[0]
    return createZeroDataset(
      `neste mês (${fallbackMonth?.monthName || 'Mês Atual'})`,
      `Mês de ${fallbackMonth?.monthName || ''} / ${fallbackMonth?.year || ''}`
    )
  }, [dateBr, selectedPeriod, availableMonths, consolidatedCount])

  const planUsage = useMemo(() => {
    return calculateCompanyPlanUsage({
      planId: storeInfo?.planId || 'free',
      currentBilling: Number(storeInfo?.currentMonthBilling || 2420),
      currentOrdersCount: Number(storeInfo?.currentMonthOrders || 68),
      exceededOrdersCount: Number(storeInfo?.exceededOrdersCount || 0),
    })
  }, [
    storeInfo?.planId,
    storeInfo?.currentMonthBilling,
    storeInfo?.currentMonthOrders,
    storeInfo?.exceededOrdersCount,
  ])

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
              options={monthSelectOptions}
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

      {/* Card Informativo do Plano & Cota Mensal */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#1A1D20]">
                  Meu Plano: {planUsage.plan.name}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5E1E]">
                  {planUsage.plan.badge}
                </span>
              </div>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Mensalidade base: <strong>{formatCurrency(planUsage.basePrice)}</strong>
                {planUsage.metricType === 'orders'
                  ? ' • Franquia de até 600 pedidos no WhatsApp inclusos'
                  : ` • Teto de faturamento até ${formatCurrency(planUsage.limitValue)}/mês`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const text = `Olá! Sou da loja ${storeInfo?.name || 'parceira'} e gostaria de falar sobre o meu plano ${planUsage.plan.name} no NumInstante.`
              window.open(`https://wa.me/5584994334789?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
            }}
            className="px-3.5 py-2 rounded-xl border border-[#E9ECEF] hover:border-[#FF5E1E] text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tirar Dúvidas no WhatsApp</span>
          </button>
        </div>

        {/* Barra de Progresso do Consumo */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#6C757D]">
              {planUsage.metricType === 'orders' ? 'Consumo de Pedidos (WhatsApp)' : 'Consumo da Cota de Faturamento'}
            </span>
            <span className="font-extrabold text-[#1A1D20]">
              {planUsage.metricType === 'orders'
                ? `${planUsage.currentValue} de ${planUsage.limitValue} pedidos (${planUsage.percentage}%)`
                : `${formatCurrency(planUsage.currentValue)} de ${formatCurrency(planUsage.limitValue)} (${planUsage.percentage}%)`}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                planUsage.isExceeded
                  ? 'bg-rose-500'
                  : planUsage.isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${planUsage.percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-[#6C757D]">
              {planUsage.isExceeded
                ? 'Limite da franquia ultrapassado'
                : `Restam ${planUsage.metricType === 'orders' ? `${planUsage.remainingValue} pedidos` : formatCurrency(planUsage.remainingValue)}`}
            </span>

            {planUsage.isExceeded && (
              <span className="font-bold text-rose-600">
                + {planUsage.extraOrders} pedidos extras ({formatCurrency(planUsage.extraAmount)})
              </span>
            )}
          </div>
        </div>

        {/* Resumo se houver excedente */}
        {planUsage.isExceeded && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-rose-950 font-medium">
              Pedidos excedentes são faturados a <strong>{formatCurrency(planUsage.plan.extraOrderFee)}</strong> cada no fechamento mensal.
            </span>
            <span className="font-black text-rose-700 whitespace-nowrap">
              Total estimado do mês: {formatCurrency(planUsage.totalAmount)}
            </span>
          </div>
        )}
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
