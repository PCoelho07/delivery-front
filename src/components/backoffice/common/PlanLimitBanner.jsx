import { useState, useEffect } from 'react'
import { AlertTriangle, AlertCircle, ArrowUpRight, MessageCircle, X } from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'
import { calculateCompanyPlanUsage } from '../../../utils/planRules'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { useNotificationStore } from '../../../store/useNotificationStore'

export function PlanLimitBanner() {
  const storeInfo = useStoreAdmin((state) => state.storeInfo)

  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem('dismissed_plan_limit_banner'))
    } catch {
      return false
    }
  })

  const planId = storeInfo?.planId || 'free'
  const currentBilling = Number(storeInfo?.currentMonthBilling || 2420)
  const currentOrdersCount = Number(storeInfo?.currentMonthOrders || 68)
  const exceededOrdersCount = Number(storeInfo?.exceededOrdersCount || 0)

  const usage = calculateCompanyPlanUsage({
    planId,
    currentBilling,
    currentOrdersCount,
    exceededOrdersCount,
  })

  const { plan, isExceeded, isWarning, remainingValue, extraOrders, extraAmount } = usage

  // Sincroniza alerta no sino de notificações do lojista (mesmo se o banner estiver fechado)
  useEffect(() => {
    if (!isWarning && !isExceeded) return

    const notifId = isExceeded ? 'plan-limit-exceeded' : 'plan-limit-warning'
    const notifs = useNotificationStore.getState().notifications
    const alreadyExists = notifs.some((n) => n.id === notifId)

    if (!alreadyExists) {
      useNotificationStore.setState((state) => ({
        notifications: [
          {
            id: notifId,
            type: 'system',
            title: isExceeded
              ? `Limite do ${plan.name} Atingido`
              : `Atenção ao Limite do ${plan.name}`,
            message: isExceeded
              ? `Sua franquia mensal foi ultrapassada. Pedidos adicionais acumulam taxa de excedente. Fale com nosso suporte para verificar opções de migração.`
              : `Faltam apenas ${
                  usage.metricType === 'orders'
                    ? `${remainingValue} pedidos`
                    : formatCurrency(remainingValue)
                } para atingir a cota mensal do seu plano.`,
            read: false,
            timestamp: 'Hoje',
            createdAt: Date.now(),
          },
          ...state.notifications.filter((n) => n.id !== notifId),
        ],
      }))
    }
  }, [isWarning, isExceeded, usage.metricType, remainingValue, plan.name])

  // Se o consumo estiver normal ou o lojista dispensou na sessão atual, não exibe
  if (isDismissed || (!usage.isWarning && !usage.isExceeded)) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      sessionStorage.setItem('dismissed_plan_limit_banner', 'true')
    } catch {
      // safe fallback
    }
  }

  const handleWhatsAppContact = () => {
    const text = isExceeded
      ? `Olá! Sou da loja ${storeInfo?.name || 'parceira'} e atingi o limite do ${plan.name} no NumInstante. Gostaria de entender as opções de migração e regularização.`
      : `Olá! Sou da loja ${storeInfo?.name || 'parceira'} e estou próximo do limite do ${plan.name} no NumInstante. Gostaria de saber mais sobre como fazer o upgrade.`

    window.open(
      `https://wa.me/5584994334789?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 sm:p-4.5 mb-5 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 shrink-0 ${
        isExceeded
          ? 'bg-rose-50/90 border-rose-200 text-rose-950'
          : 'bg-amber-50/90 border-amber-200 text-amber-950'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isExceeded
              ? 'bg-rose-100 text-rose-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isExceeded ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isExceeded
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-amber-200 text-amber-800'
              }`}
            >
              {isExceeded ? 'Limite Atingido' : 'Atenção ao Limite'}
            </span>
            <span className="font-extrabold text-xs sm:text-sm">
              {plan.name}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed">
            {isExceeded ? (
              usage.metricType === 'orders' ? (
                <>
                  Sua loja completou <strong>{usage.currentValue} pedidos</strong> neste mês, ultrapassando a cota de <strong>600 pedidos</strong> do pacote de WhatsApp. Pedidos extras acumulam <strong>R$ 0,32 cada</strong> (total atual: {extraOrders} pedidos extras = {formatCurrency(extraAmount)}).
                </>
              ) : (
                <>
                  Sua loja faturou <strong>{formatCurrency(usage.currentValue)}</strong>, ultrapassando o teto de <strong>{formatCurrency(usage.limitValue)}</strong>. Pedidos adicionais acumulam taxa de <strong>{formatCurrency(plan.extraOrderFee)} por pedido</strong>.
                </>
              )
            ) : (
              usage.metricType === 'orders' ? (
                <>
                  Sua loja já realizou <strong>{usage.currentValue} de 600 pedidos</strong> com mensagens automáticas. Faltam apenas <strong>{remainingValue} pedidos</strong> para atingir a franquia deste mês.
                </>
              ) : (
                <>
                  Faltam apenas <strong>{formatCurrency(remainingValue)}</strong> para atingir o teto de faturamento de <strong>{formatCurrency(usage.limitValue)}</strong> da sua cota mensal.
                </>
              )
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
        <button
          type="button"
          onClick={handleWhatsAppContact}
          className={`flex-1 md:flex-initial px-4 py-2 rounded-xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
            isExceeded
              ? 'bg-rose-700 hover:bg-rose-800 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Falar com Suporte</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* Botão de Fechar Alerta (Dismiss na sessão) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          title="Fechar aviso temporariamente nesta sessão"
          aria-label="Fechar aviso temporariamente"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
