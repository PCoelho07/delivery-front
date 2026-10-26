import { useState, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  Edit3,
  Power,
  Trash2,
  CheckCircle2,
  Sparkles,
  Package,
  Building2,
  TrendingUp,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSuperAdminStore } from '../../../store/useSuperAdminStore'
import { formatCurrency } from '../../../lib/utils'
import { PlanModal } from '../PlanModal'

export function PlansManagementView() {
  const { plans, companies, addPlan, updatePlan, togglePlanStatus, deletePlan } =
    useSuperAdminStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | inactive
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState(null)

  // Estatísticas dos Planos
  const totalPlans = (plans || []).length
  const activePlansCount = (plans || []).filter((p) => p.status === 'active').length

  // Plano mais assinado pelas empresas cadastradas
  const mostPopularPlan = useMemo(() => {
    if (!companies || companies.length === 0 || !plans || plans.length === 0) return null
    const counts = {}
    companies.forEach((c) => {
      if (c.plan) counts[c.plan] = (counts[c.plan] || 0) + 1
    })
    let maxId = null
    let maxCount = -1
    Object.entries(counts).forEach(([planId, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxId = planId
      }
    })
    const found = plans.find((p) => p.id === maxId)
    return found ? { plan: found, count: maxCount } : null
  }, [companies, plans])

  // Contagem de empresas por plano
  const companyCountByPlan = useMemo(() => {
    const map = {}
    ;(companies || []).forEach((c) => {
      if (c.plan) map[c.plan] = (map[c.plan] || 0) + 1
    })
    return map
  }, [companies])

  // Filtra os planos
  const filteredPlans = useMemo(() => {
    return (plans || []).filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const q = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.badge?.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [plans, statusFilter, searchTerm])

  const handleCreateNew = () => {
    setPlanToEdit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (plan) => {
    setPlanToEdit(plan)
    setIsModalOpen(true)
  }

  const handleSavePlan = (planData) => {
    if (planToEdit) {
      updatePlan(planToEdit.id, planData)
    } else {
      addPlan(planData)
    }
  }

  const handleToggleStatus = (plan) => {
    togglePlanStatus(plan.id)
    if (plan.status === 'active') {
      toast.warning(`Plano "${plan.name}" pausado (não aparecerá para novos cadastros).`)
    } else {
      toast.success(`Plano "${plan.name}" ativado com sucesso!`)
    }
  }

  const handleDelete = (plan) => {
    const companiesUsing = companyCountByPlan[plan.id] || 0
    if (companiesUsing > 0) {
      toast.error(
        `Não é possível excluir o plano "${plan.name}" pois existem ${companiesUsing} empresa(s) vinculadas a ele. Pause o plano ou migre as empresas antes.`
      )
      return
    }

    if (window.confirm(`Deseja realmente excluir o plano "${plan.name}"?`)) {
      deletePlan(plan.id)
      toast.success(`Plano "${plan.name}" removido!`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Aba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1D20] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF5E1E]" />
            <span>Planos & Preços da Plataforma</span>
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Cadastre os planos de assinatura do sistema, ajuste os valores e defina os limites de produtos
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Novo Plano</span>
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="text-xs font-bold">Total de Planos</span>
            <Tag className="w-4 h-4 text-[#FF5E1E]" />
          </div>
          <p className="text-2xl font-black text-[#1A1D20]">{totalPlans}</p>
          <p className="text-[11px] text-[#6C757D]">Opções cadastradas</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="text-xs font-bold">Planos Ativos</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{activePlansCount}</p>
          <p className="text-[11px] text-[#6C757D]">Disponíveis para contratação</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="text-xs font-bold">Mais Assinado</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-[#1A1D20] truncate">
            {mostPopularPlan?.plan.name || 'N/A'}
          </p>
          <p className="text-[11px] text-[#6C757D]">
            {mostPopularPlan ? `${mostPopularPlan.count} restaurantes ativos` : 'Sem assinaturas'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6C757D]">
            <span className="text-xs font-bold">Flexibilidade</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-extrabold text-[#1A1D20] pt-1">
            Valores 100% Editáveis
          </p>
          <p className="text-[11px] text-[#6C757D]">Altere preços a qualquer momento</p>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#E9ECEF] shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do plano, descrição ou benefício..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#F8F9FA] rounded-xl border border-transparent focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none transition-colors"
          />
        </div>

        {/* Filtro de Status */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#F8F9FA] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-[#FF5E1E] shadow-2xs'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            Todos ({totalPlans})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            Ativos ({activePlansCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            Pausados ({totalPlans - activePlansCount})
          </button>
        </div>
      </div>

      {/* Grade de Cards dos Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPlans.map((plan) => {
          const isActive = plan.status === 'active'
          const companiesCount = companyCountByPlan[plan.id] || 0
          const isFree = Number(plan.price) === 0

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition-all duration-200 relative group shadow-2xs hover:shadow-md ${
                isActive
                  ? plan.badge === 'Mais Popular'
                    ? 'border-[#FF5E1E]/40 ring-1 ring-[#FF5E1E]/20'
                    : 'border-[#E9ECEF]'
                  : 'border-dashed border-gray-300 opacity-75 bg-gray-50/50'
              }`}
            >
              {/* Topo do Card: Badges e Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 min-h-6">
                  {plan.badge ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#FFF3EE] text-[#FF5E1E] border border-[#FFE2D1]">
                      <Sparkles className="w-3 h-3 text-[#FF5E1E]" />
                      {plan.badge}
                    </span>
                  ) : (
                    <span />
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    {isActive ? 'Ativo' : 'Pausado'}
                  </span>
                </div>

                {/* Nome e Descrição */}
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1D20]">
                    {plan.name}
                  </h3>
                  <p className="text-[11.5px] text-[#6C757D] line-clamp-2 mt-1">
                    {plan.description || 'Plano customizado para o sistema.'}
                  </p>
                </div>

                {/* Bloco de Preço */}
                <div className="pt-2 pb-1 border-y border-[#E9ECEF]/70">
                  <div className="flex items-baseline gap-1">
                    {isFree ? (
                      <span className="text-2xl font-black text-emerald-600">
                        Grátis
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-[#1A1D20]">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-xs text-[#6C757D] font-medium">
                          /{plan.billingPeriod || 'mês'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Informações de Trial & Limites */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {plan.trialDays > 0 && (
                      <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {plan.trialDays} dias de teste
                      </span>
                    )}

                    <span className="text-[10.5px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Package className="w-3 h-3 text-[#6C757D]" />
                      {plan.maxProducts ? `Até ${plan.maxProducts} itens` : 'Itens Ilimitados'}
                    </span>
                  </div>
                </div>

                {/* Empresas Vinculadas */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#6C757D]">
                  <Building2 className="w-3.5 h-3.5 text-[#FF5E1E]" />
                  <span>
                    <strong className="text-[#1A1D20]">{companiesCount}</strong> {companiesCount === 1 ? 'empresa vinculada' : 'empresas vinculadas'}
                  </span>
                </div>

                {/* Lista de Recursos / Vantagens */}
                <div className="pt-2 space-y-1.5">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#6C757D]">
                    O que está incluso:
                  </p>
                  <ul className="space-y-1.5">
                    {(plan.features || []).map((feat, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-[#1A1D20] flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight text-[11.5px]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ações no Rodapé do Card */}
              <div className="pt-4 mt-4 border-t border-[#E9ECEF] flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleEdit(plan)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#FFF3EE] hover:text-[#FF5E1E] text-xs font-bold text-[#1A1D20] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(plan)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                  }`}
                  title={isActive ? 'Pausar Plano' : 'Ativar Plano'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(plan)}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-rose-50 text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Excluir Plano"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}

        {filteredPlans.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#E9ECEF] p-8 text-center space-y-2">
            <Layers className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#1A1D20]">
              Nenhum plano encontrado
            </h4>
            <p className="text-xs text-[#6C757D]">
              Tente alterar os termos da busca ou clique em &ldquo;Cadastrar Novo Plano&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Plano */}
      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setPlanToEdit(null)
        }}
        onSave={handleSavePlan}
        planToEdit={planToEdit}
      />
    </div>
  )
}

