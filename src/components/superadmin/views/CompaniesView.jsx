import { useState, useMemo, useEffect } from 'react'
import {
  Building2,
  Plus,
  Search,
  Wrench,
  MessageCircle,
  Power,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSuperAdminStore } from '../../../store/useSuperAdminStore'
import { CompanyRegisterModal } from '../CompanyRegisterModal'
import { SYSTEM_PLANS, calculateCompanyPlanUsage } from '../../../utils/planRules'
import { formatCurrency } from '../../../lib/utils'

export function CompaniesView() {
  const {
    companies,
    toggleCompanyStatus,
    changeCompanyPlan,
    startSupportMode,
    fetchCompaniesFromApi,
  } = useSuperAdminStore()

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  useEffect(() => {
    fetchCompaniesFromApi?.()
  }, [fetchCompaniesFromApi])

  const totalCount = companies.length
  const activeCount = companies.filter((c) => c.status === 'active').length
  const trialCount = companies.filter((c) => c.status === 'trial').length
  const inactiveCount = companies.filter((c) => c.status === 'inactive').length

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const q = searchTerm.toLowerCase().trim()
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.cnpj.includes(q) ||
        c.phone.includes(q) ||
        c.owner.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [companies, statusFilter, searchTerm])

  const handleSupportClick = (company) => {
    startSupportMode(company)
    toast.success(`Modo de suporte ativado para "${company.name}".`)
  }

  const handleToggleStatus = (company) => {
    toggleCompanyStatus(company.id)
    if (company.status === 'inactive') {
      toast.success(`Loja "${company.name}" reativada com sucesso!`)
    } else {
      toast.warning(`Loja "${company.name}" desativada (acesso bloqueado).`)
    }
  }

  const handleWhatsAppContact = (company) => {
    const cleanPhone = company.phone.replace(/\D/g, '')
    const usage = calculateCompanyPlanUsage({
      planId: company.planId,
      currentBilling: company.currentBilling,
      currentOrdersCount: company.currentOrdersCount,
      exceededOrdersCount: company.exceededOrdersCount,
    })

    let messageText = `Olá ${company.owner}! Aqui é da equipe NumInstante Delivery. Como podemos te ajudar hoje com o restaurante ${company.name}?`

    if (usage.isExceeded) {
      messageText = `Olá ${company.owner}! Aqui é da equipe NumInstante Delivery. Vimos que o restaurante ${company.name} atingiu a cota do plano ${usage.plan.name} neste mês. Gostaríamos de conversar sobre as opções para o fechamento mensal ou migração de plano.`
    } else if (usage.isWarning) {
      messageText = `Olá ${company.owner}! Aqui é da equipe NumInstante Delivery. Notamos que o restaurante ${company.name} está bem próximo de atingir a cota do plano ${usage.plan.name} (${usage.metricType === 'orders' ? `${usage.currentValue} de 600 pedidos` : `${formatCurrency(usage.currentValue)} de ${formatCurrency(usage.limitValue)}`}). Queremos te apoiar caso deseje fazer um upgrade!`
    }

    window.open(
      `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`,
      '_blank'
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header com Botão de Cadastrar Empresa (Abre Janela API) */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <h2 className="text-base font-extrabold text-[#1A1D20]">
              Empresas Vinculadas na Plataforma
            </h2>
          </div>
          <p className="text-xs text-[#6C757D] mt-1">
            Gerencie os restaurantes cadastrados, ative/desative acessos ou entre em modo de suporte para configurar a loja.
          </p>
        </div>

        {/* Botão Cadastrar Empresa -> Abre Modal Integrado de Cadastro (API) */}
        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
          title="Abre o modal de cadastro de empresa conectado à API Go"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Empresa (API)</span>
        </button>
      </div>

      {/* 4 Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Total de Lojas</span>
          <div className="text-2xl font-black text-[#1A1D20]">{totalCount}</div>
          <span className="text-[11px] text-[#6C757D]">Cadastradas na base</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Lojas Ativas</span>
          <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          <span className="text-[11px] text-emerald-700 font-bold">● Cardápios online</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Em Período de Teste</span>
          <div className="text-2xl font-black text-amber-600">{trialCount}</div>
          <span className="text-[11px] text-amber-700">Trial de 7 a 14 dias</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E9ECEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#6C757D]">Desativadas / Suspensas</span>
          <div className="text-2xl font-black text-rose-600">{inactiveCount}</div>
          <span className="text-[11px] text-rose-700">Acesso bloqueado</span>
        </div>
      </div>

      {/* Barra de Filtros por Situação e Busca de Lojas */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Pills de Situação */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#FF5E1E] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] border border-[#E9ECEF]'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-[#FF5E1E] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] border border-[#E9ECEF]'
            }`}
          >
            Ativas ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('trial')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'trial'
                ? 'bg-[#FF5E1E] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] border border-[#E9ECEF]'
            }`}
          >
            Em Teste ({trialCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-[#FF5E1E] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] border border-[#E9ECEF]'
            }`}
          >
            Desativadas ({inactiveCount})
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CNPJ, telefone..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] font-semibold transition-all"
          />
        </div>
      </div>

      {/* Grade de Cards de Empresas */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E9ECEF] p-12 text-center space-y-2">
          <p className="font-extrabold text-sm text-[#1A1D20]">Nenhuma empresa encontrada</p>
          <p className="text-xs text-[#6C757D]">
            Tente ajustar o termo de pesquisa ou o filtro de situação acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((c) => {
            const isSuspended = c.status === 'inactive'
            const isTrial = c.status === 'trial'

            const usage = calculateCompanyPlanUsage({
              planId: c.planId,
              currentBilling: c.currentBilling,
              currentOrdersCount: c.currentOrdersCount,
              exceededOrdersCount: c.exceededOrdersCount,
            })

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF4EE] border border-[#FFE2D1] text-[#FF5E1E] flex items-center justify-center font-black text-sm shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-[#1A1D20] leading-tight truncate">
                          {c.name}
                        </h3>
                        <span className="text-[11px] text-[#6C757D] block truncate">
                          /{c.slug}
                        </span>
                      </div>
                    </div>

                    {/* Badge de Status */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {usage.isExceeded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          ● Cota Excedida
                        </span>
                      ) : usage.isWarning ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ● Perto do Teto
                        </span>
                      ) : null}

                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          ● Desativada
                        </span>
                      ) : isTrial ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ● Trial ({c.daysLeft}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ● Ativa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações da Empresa & Seletor de Plano */}
                  <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E9ECEF] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#6C757D]">
                      <span>CNPJ:</span>
                      <span className="font-bold text-[#1A1D20]">{c.cnpj}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#6C757D]">
                      <span>Responsável:</span>
                      <span className="font-bold text-[#1A1D20]">{c.owner}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#6C757D]">
                      <span>WhatsApp:</span>
                      <span className="font-bold text-[#1A1D20]">{c.phone}</span>
                    </div>

                    {/* Seletor de Plano Ativo */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E9ECEF]">
                      <span className="text-[#6C757D] font-bold">Plano:</span>
                      <select
                        value={c.planId || 'free'}
                        onChange={(e) => {
                          changeCompanyPlan(c.id, e.target.value)
                          toast.success(`Plano da loja "${c.name}" alterado para ${e.target.value}!`)
                        }}
                        className="text-xs font-black bg-white border border-[#E9ECEF] rounded-lg px-2 py-1 text-[#FF5E1E] outline-none focus:border-[#FF5E1E] cursor-pointer shadow-2xs"
                      >
                        {SYSTEM_PLANS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(p.price)}/mês)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Monitoramento de Franquia & Cálculo Automático de Excedente */}
                  <div className="bg-[#FFF8F5] rounded-xl p-3 border border-orange-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#4A5568]">
                        {usage.metricType === 'orders' ? 'Pedidos WhatsApp no Mês' : 'Faturamento no Mês'}
                      </span>
                      <span className="font-black text-[#1A1D20]">
                        {usage.metricType === 'orders'
                          ? `${usage.currentValue} de ${usage.limitValue} ped.`
                          : `${formatCurrency(usage.currentValue)} de ${formatCurrency(usage.limitValue)}`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          usage.isExceeded
                            ? 'bg-rose-500'
                            : usage.isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${usage.percentage}%` }}
                      />
                    </div>

                    {/* Resumo da Cobrança Mensal */}
                    <div className="pt-1.5 border-t border-orange-200/60 flex items-center justify-between text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-[#6C757D] block">
                          Base: {formatCurrency(usage.basePrice)}
                          {usage.extraOrders > 0 && ` + ${usage.extraOrders} ext. (${formatCurrency(usage.extraAmount)})`}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {usage.isExceeded
                            ? '● Excedente cobrado'
                            : usage.isWarning
                            ? '● Perto do limite'
                            : '● Consumo normal'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#6C757D] block uppercase font-bold">Total a Cobrar</span>
                        <span className={`text-xs font-black ${usage.isExceeded ? 'text-rose-600' : 'text-[#1A1D20]'}`}>
                          {formatCurrency(usage.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="space-y-2 pt-2 border-t border-[#E9ECEF]">
                  <button
                    type="button"
                    onClick={() => handleSupportClick(c)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>Acessar como Suporte</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className={`flex-1 py-1.5 px-2 rounded-xl border border-[#E9ECEF] hover:bg-slate-50 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isSuspended
                          ? 'text-emerald-700 hover:text-emerald-800'
                          : 'text-rose-600 hover:text-rose-700'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{isSuspended ? 'Reativar Perfil' : 'Desativar Perfil'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppContact(c)}
                      className="py-1.5 px-3 rounded-xl border border-[#E9ECEF] hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                      title="Falar no WhatsApp com o responsável"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Cadastro Integrado via API Go */}
      <CompanyRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  )
}
