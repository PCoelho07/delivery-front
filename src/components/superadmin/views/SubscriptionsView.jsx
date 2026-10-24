import { useState, useMemo } from 'react'
import {
  CreditCard,
  Check,
  MessageCircle,
  Power,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSuperAdminStore } from '../../../store/useSuperAdminStore'
import { formatCurrency } from '../../../lib/utils'

export function SubscriptionsView() {
  const { companies, markSubscriptionPaid, toggleCompanyStatus, adminProfile } =
    useSuperAdminStore()

  const [planFilter, setPlanFilter] = useState('all')

  const totalMrr = useMemo(() => {
    return companies
      .filter((c) => c.status === 'active' && c.plan !== 'trial')
      .reduce((acc, c) => acc + (c.price || 0), 0)
  }, [companies])

  const paidCount = companies.filter((c) => c.isPaid && c.status === 'active').length
  const dueSoonCount = companies.filter((c) => c.daysLeft >= 0 && c.daysLeft <= 5).length
  const overdueCount = companies.filter((c) => !c.isPaid || c.daysLeft < 0).length

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (planFilter === 'pago') return c.plan !== 'trial'
      if (planFilter === 'trial') return c.plan === 'trial'
      if (planFilter === 'overdue') return !c.isPaid || c.daysLeft < 0
      return true
    })
  }, [companies, planFilter])

  const handleMarkPaid = (company) => {
    markSubscriptionPaid(company.id)
    toast.success(`Assinatura de "${company.name}" renovada por mais 30 dias!`)
  }

  const handleWhatsAppBilling = (company) => {
    const cleanPhone = company.phone.replace(/\D/g, '')
    const pixKey = adminProfile.pixKey || 'financeiro@numinstante.com'
    const msg = encodeURIComponent(
      `Olá ${company.owner}! Passando para lembrar da renovação da sua assinatura do ${company.name} no valor de ${formatCurrency(company.price)} com vencimento em ${company.nextBilling}. Segue nossa chave PIX para acerto: ${pixKey}. Qualquer dúvida estamos à disposição!`
    )
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank')
    toast.info(`Lembrete de cobrança aberto no WhatsApp para "${company.name}".`)
  }

  const handleToggleStatus = (company) => {
    toggleCompanyStatus(company.id)
    if (company.status === 'inactive') {
      toast.success(`Loja "${company.name}" reativada com sucesso!`)
    } else {
      toast.warning(`Acesso de "${company.name}" suspenso por inadimplência.`)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-[#1A1D20]">
              Controle de Assinaturas & Cobranças
            </h2>
          </div>
          <p className="text-xs text-[#6C757D] mt-1">
            Acompanhe quem pagou no mês, renove ciclos de +30 dias, gerencie planos gratuitos e suspenda perfis inadimplentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            ● Próximo Lote de Cobrança: 01/11/2026
          </span>
        </div>
      </div>

      {/* 4 Cards de Métricas SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Faturamento Recorrente (MRR)</span>
          <div className="text-2xl font-black text-[#1A1D20]">{formatCurrency(totalMrr)}</div>
          <span className="text-[11px] text-emerald-700 font-bold">+12% este mês</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Assinaturas Pagas (Em Dia)</span>
          <div className="text-2xl font-black text-emerald-600">{paidCount}</div>
          <span className="text-[11px] text-[#6C757D]">Ciclo de 30 dias ativo</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Vencendo em Breve (&le; 5 dias)</span>
          <div className="text-2xl font-black text-amber-600">{dueSoonCount}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Exige contato / lembrete</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Atrasadas / Inadimplentes</span>
          <div className="text-2xl font-black text-rose-600">{overdueCount}</div>
          <span className="text-[11px] text-rose-700 font-semibold">Risco de suspensão</span>
        </div>
      </div>

      {/* Tabela de Assinaturas */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              Listagem de Estabelecimentos & Vencimentos
            </h3>
            <p className="text-xs text-[#6C757D]">
              Clique em <strong>"Marcar Pago"</strong> para renovar o acesso por mais 30 dias ou cobre via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-1.5 text-xs text-[#1A1D20] font-semibold outline-none focus:border-[#FF5E1E] transition-all cursor-pointer"
            >
              <option value="all">Todos os Planos</option>
              <option value="pago">Apenas Planos Pagos</option>
              <option value="trial">Apenas Planos Grátis / Trial</option>
              <option value="overdue">Apenas Atrasadas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9ECEF] text-[#6C757D] font-bold">
                <th className="pb-3 pl-2">Empresa</th>
                <th className="pb-3">Plano</th>
                <th className="pb-3">Valor Mensal</th>
                <th className="pb-3">Próximo Vencimento</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-2 text-right">Ações de Cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {filteredCompanies.map((c) => {
                const isOverdue = !c.isPaid || c.daysLeft < 0

                return (
                  <tr key={c.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-extrabold text-[#1A1D20] block">{c.name}</span>
                      <span className="text-[11px] text-[#6C757D]">
                        {c.owner} · {c.phone}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-[#1A1D20]">{c.planName}</td>
                    <td className="py-3 font-bold text-[#1A1D20]">
                      {c.price === 0 ? 'Gratuito' : formatCurrency(c.price)}
                    </td>
                    <td className="py-3 font-semibold text-slate-700">{c.nextBilling}</td>
                    <td className="py-3 text-center">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-[10.5px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Atrasado
                        </span>
                      ) : c.plan === 'trial' ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-[10.5px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Trial ({c.daysLeft}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-extrabold text-[10.5px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Pago / Em Dia
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(c)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Marcar fatura do mês como paga e somar +30 dias"
                        >
                          <Check className="w-3 h-3" />
                          <span>Marcar Pago (+30d)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWhatsAppBilling(c)}
                          className="px-2.5 py-1 rounded-lg border border-[#E9ECEF] hover:bg-slate-100 text-[11px] font-bold text-[#1A1D20] transition-all cursor-pointer flex items-center gap-1"
                          title="Enviar lembrete de cobrança no WhatsApp com PIX"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>Cobrar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1 rounded-lg border border-[#E9ECEF] hover:bg-slate-100 cursor-pointer transition-colors ${
                            c.status === 'inactive' ? 'text-emerald-600' : 'text-slate-400 hover:text-rose-600'
                          }`}
                          title={
                            c.status === 'inactive'
                              ? 'Reativar perfil da loja'
                              : 'Suspender por falta de pagamento'
                          }
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
