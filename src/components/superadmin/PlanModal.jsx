import { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { CustomSelect } from '../common/CustomSelect'

const BILLING_PERIOD_OPTIONS = [
  { value: 'mês', label: 'Mensal (/mês)' },
  { value: 'trimestre', label: 'Trimestral (/trimestre)' },
  { value: 'semestre', label: 'Semestral (/semestre)' },
  { value: 'ano', label: 'Anual (/ano)' },
  { value: '7 dias', label: '7 Dias (Degustação)' },
]

function PlanModalForm({ planToEdit, onSave, onClose }) {
  const isEditing = Boolean(planToEdit)

  const [name, setName] = useState(() => planToEdit?.name || '')
  const [price, setPrice] = useState(() => String(planToEdit?.price ?? (isEditing ? '0' : '49')))
  const [billingPeriod, setBillingPeriod] = useState(() => planToEdit?.billingPeriod || 'mês')
  const [trialDays, setTrialDays] = useState(() => String(planToEdit?.trialDays ?? '0'))
  const [isUnlimitedProducts, setIsUnlimitedProducts] = useState(
    () => planToEdit?.maxProducts === null || planToEdit?.maxProducts === undefined ? isEditing : false
  )
  const [maxProducts, setMaxProducts] = useState(
    () => planToEdit?.maxProducts ? String(planToEdit.maxProducts) : '50'
  )
  const [description, setDescription] = useState(
    () => planToEdit?.description || 'Plano sob medida para o crescimento do seu delivery.'
  )
  const [badge, setBadge] = useState(() => planToEdit?.badge || '')
  const [features, setFeatures] = useState(() =>
    Array.isArray(planToEdit?.features)
      ? [...planToEdit.features]
      : [
          'Cardápio digital mobile first',
          'Pedidos direto no WhatsApp',
          'Painel em tempo real',
          'Suporte via WhatsApp',
        ]
  )
  const [newFeatureText, setNewFeatureText] = useState('')
  const [status, setStatus] = useState(() => planToEdit?.status || 'active')

  const handleAddFeature = (e) => {
    e?.preventDefault()
    const trimmed = newFeatureText.trim()
    if (!trimmed) return
    if (features.includes(trimmed)) {
      toast.warning('Este benefício já foi adicionado.')
      return
    }
    setFeatures((prev) => [...prev, trimmed])
    setNewFeatureText('')
  }

  const handleRemoveFeature = (indexToRemove) => {
    setFeatures((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o nome do plano.')
      return
    }

    const numPrice = parseFloat(price.replace(',', '.'))
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error('Informe um valor válido para o plano.')
      return
    }

    const numTrial = parseInt(trialDays, 10) || 0
    const numMaxProducts = isUnlimitedProducts ? null : parseInt(maxProducts, 10) || 30

    const planData = {
      id: isEditing
        ? planToEdit.id
        : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
      name: name.trim(),
      price: numPrice,
      billingPeriod,
      trialDays: numTrial,
      maxProducts: numMaxProducts,
      description: description.trim(),
      badge: badge.trim() || null,
      features: features.length > 0 ? features : ['Acesso completo ao cardápio e gestão de pedidos'],
      status,
    }

    onSave(planData)
    toast.success(isEditing ? `Plano "${planData.name}" atualizado!` : `Novo plano "${planData.name}" cadastrado!`)
    onClose()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-2xl max-w-xl w-full my-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Cabeçalho */}
      <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF3EE] text-[#FF5E1E] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-[#FF5E1E]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              {isEditing ? 'Editar Plano de Assinatura' : 'Cadastrar Novo Plano'}
            </h3>
            <p className="text-[11px] text-[#6C757D]">
              Configure o valor, limites e recursos disponíveis para as empresas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#F8F9FA] flex items-center justify-center text-[#6C757D] hover:text-[#1A1D20] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome do Plano */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nome do Plano *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plano Intermediário"
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
            />
          </div>

          {/* Badge de Destaque */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1 flex items-center justify-between">
              <span>Badge / Destaque Visual</span>
              <span className="text-[10px] text-[#6C757D] font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Mais Popular, Recomendado"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Preço e Ciclo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] font-bold focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Ciclo de Cobrança
            </label>
            <CustomSelect
              value={billingPeriod}
              onChange={(val) => setBillingPeriod(val)}
              options={BILLING_PERIOD_OPTIONS}
              direction="bottom"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1 flex items-center justify-between">
              <span>Dias de Trial</span>
              <HelpCircle className="w-3 h-3 text-[#6C757D]" title="Deixe 0 para não oferecer teste grátis" />
            </label>
            <input
              type="number"
              min="0"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Limite de Produtos */}
        <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1A1D20]">
              Limite de Produtos no Cardápio
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#FF5E1E]">
              <input
                type="checkbox"
                checked={isUnlimitedProducts}
                onChange={(e) => setIsUnlimitedProducts(e.target.checked)}
                className="w-4 h-4 text-[#FF5E1E] rounded accent-[#FF5E1E] cursor-pointer"
              />
              <span>Produtos Ilimitados</span>
            </label>
          </div>

          {!isUnlimitedProducts && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={maxProducts}
                onChange={(e) => setMaxProducts(e.target.value)}
                placeholder="Ex: 50"
                className="w-36 px-3.5 py-2 text-xs bg-white rounded-xl border border-[#E9ECEF] text-[#1A1D20] font-bold focus:outline-none focus:border-[#FF5E1E]"
              />
              <span className="text-[11.5px] text-[#6C757D]">
                Quantidade máxima de itens ativos que o restaurante pode cadastrar.
              </span>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-bold text-[#1A1D20] mb-1">
            Descrição do Plano
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Ideal para quem está começando e precisa de agilidade no atendimento..."
            className="w-full px-3.5 py-2 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Lista de Recursos / Benefícios */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1A1D20]">
            Recursos & Vantagens Inclusas
          </label>

          {/* Input para Adicionar Novo Recurso */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature()
                }
              }}
              placeholder="Ex: Domínio próprio, Taxa zero sobre pedidos..."
              className="flex-1 px-3.5 py-2 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3.5 py-2 rounded-xl bg-[#FFF3EE] hover:bg-[#FFE6DC] text-[#FF5E1E] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Lista dos Recursos Adicionados */}
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 [scrollbar-width:thin]">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E9ECEF] text-xs"
              >
                <div className="flex items-center gap-2 text-[#1A1D20] min-w-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span className="truncate">{feat}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1 text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                  title="Remover recurso"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {features.length === 0 && (
              <p className="text-[11px] text-[#6C757D] italic py-1">
                Nenhum recurso adicionado ainda. Adicione os benefícios que aparecerão no card do plano.
              </p>
            )}
          </div>
        </div>

        {/* Status Inicial */}
        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1A1D20]">
            <input
              type="checkbox"
              checked={status === 'active'}
              onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
              className="w-4 h-4 text-[#FF5E1E] rounded accent-[#FF5E1E] cursor-pointer"
            />
            <span>Disponibilizar plano para contratação imediatamente</span>
          </label>
        </div>

        {/* Rodapé com Botões */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E9ECEF]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-xs font-bold text-[#6C757D] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? 'Salvar Alterações' : 'Criar Plano'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export function PlanModal({ isOpen, onClose, onSave, planToEdit = null }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <PlanModalForm
        key={planToEdit?.id || 'new-plan'}
        planToEdit={planToEdit}
        onSave={onSave}
        onClose={onClose}
      />
    </div>
  )
}

