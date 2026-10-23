import { useState, useMemo } from 'react'
import {
  MapPin,
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin, DEFAULT_NEIGHBORHOODS } from '../../../store/useStoreAdmin'
import { formatCurrency } from '../../../lib/utils'
import { NeighborhoodModal } from './NeighborhoodModal'
import { ConfirmModal } from '../common/ConfirmModal'

export function DeliveryView() {
  const {
    deliveryConfig,
    neighborhoods,
    updateDeliveryConfig,
    addNeighborhood,
    updateNeighborhood,
    toggleNeighborhoodActive,
    deleteNeighborhood,
    setFullNeighborhoods,
  } = useStoreAdmin()

  // Estado local para configurações gerais de entrega e tempos estimados
  const [pricingMode, setPricingMode] = useState(
    deliveryConfig?.pricingMode || 'by_neighborhood'
  )
  const [fixedFee, setFixedFee] = useState(
    String(deliveryConfig?.fixedFee ?? '5.00')
  )
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    deliveryConfig?.estimatedDelivery || '40 - 50 min'
  )
  const [estimatedPickup, setEstimatedPickup] = useState(
    deliveryConfig?.estimatedPickup || '20 - 30 min'
  )
  const [allowPickup, setAllowPickup] = useState(
    deliveryConfig?.allowPickup ?? true
  )
  const [minOrder, setMinOrder] = useState(
    String(deliveryConfig?.minOrder ?? '15.00')
  )

  // Verifica se há alterações pendentes no rascunho em relação ao estado salvo
  const isDirty = useMemo(() => {
    const parsedFixed = Math.max(0, parseFloat(String(fixedFee).replace(',', '.')) || 0)
    const parsedMin = Math.max(0, parseFloat(String(minOrder).replace(',', '.')) || 0)
    return (
      pricingMode !== (deliveryConfig?.pricingMode || 'by_neighborhood') ||
      parsedFixed !== Number(deliveryConfig?.fixedFee ?? 5.0) ||
      estimatedDelivery.trim() !== (deliveryConfig?.estimatedDelivery || '40 - 50 min') ||
      estimatedPickup.trim() !== (deliveryConfig?.estimatedPickup || '20 - 30 min') ||
      allowPickup !== (deliveryConfig?.allowPickup ?? true) ||
      parsedMin !== Number(deliveryConfig?.minOrder ?? 15.0)
    )
  }, [
    pricingMode,
    fixedFee,
    estimatedDelivery,
    estimatedPickup,
    allowPickup,
    minOrder,
    deliveryConfig,
  ])

  // Filtro de busca de bairros
  const [searchQuery, setSearchQuery] = useState('')

  // Modais
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false)
  const [neighborhoodToEdit, setNeighborhoodToEdit] = useState(null)
  const [neighborhoodToDelete, setNeighborhoodToDelete] = useState(null)

  // Bairros filtrados
  const filteredNeighborhoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return neighborhoods
    return neighborhoods.filter((n) => n.name.toLowerCase().includes(q))
  }, [neighborhoods, searchQuery])

  const activeCount = useMemo(
    () => neighborhoods.filter((n) => n.active !== false).length,
    [neighborhoods]
  )
  const inactiveCount = neighborhoods.length - activeCount

  // Salvar configurações gerais
  const handleSaveGeneralConfig = (e) => {
    e?.preventDefault()
    const parsedFixedFee = Math.max(0, parseFloat(String(fixedFee).replace(',', '.')) || 0)
    const parsedMinOrder = Math.max(0, parseFloat(String(minOrder).replace(',', '.')) || 0)

    updateDeliveryConfig({
      pricingMode,
      fixedFee: parsedFixedFee,
      estimatedDelivery: estimatedDelivery.trim() || '40 - 50 min',
      estimatedPickup: estimatedPickup.trim() || '20 - 30 min',
      allowPickup,
      minOrder: parsedMinOrder,
    })

    toast.success('Configurações de entrega e prazos salvas com sucesso!')
  }

  // Descartar alterações e restaurar valores salvos
  const handleDiscard = () => {
    setPricingMode(deliveryConfig?.pricingMode || 'by_neighborhood')
    setFixedFee(String(deliveryConfig?.fixedFee ?? '5.00'))
    setEstimatedDelivery(deliveryConfig?.estimatedDelivery || '40 - 50 min')
    setEstimatedPickup(deliveryConfig?.estimatedPickup || '20 - 30 min')
    setAllowPickup(deliveryConfig?.allowPickup ?? true)
    setMinOrder(String(deliveryConfig?.minOrder ?? '15.00'))
    toast.info('Alterações descartadas.')
  }

  // Alternar modalidade de cobrança (rascunho, salva ao clicar em Salvar Configurações)
  const handleChangePricingMode = (newMode) => {
    setPricingMode(newMode)
    if (newMode === 'fixed') {
      toast.info('Modalidade alterada para Taxa Fixa no rascunho.')
    } else {
      toast.info('Modalidade alterada para Taxa por Bairro no rascunho.')
    }
  }

  // Salvar bairro (novo ou edição)
  const handleSaveNeighborhood = (neighborhoodData) => {
    if (neighborhoodData.id) {
      updateNeighborhood(neighborhoodData.id, neighborhoodData)
    } else {
      addNeighborhood(neighborhoodData)
    }
  }

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (neighborhoodToDelete) {
      deleteNeighborhood(neighborhoodToDelete.id)
      toast.success(`Localidade "${neighborhoodToDelete.name}" excluída com sucesso!`)
      setNeighborhoodToDelete(null)
    }
  }

  // Restaurar lista padrão de bairros de exemplo
  const handleRestoreDefaultNeighborhoods = () => {
    setFullNeighborhoods(DEFAULT_NEIGHBORHOODS)
    toast.success('Bairros padrão restaurados com sucesso!')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex flex-wrap items-center gap-2">
            <Truck className="w-5 h-5 text-[#FF5E1E]" />
            <span>Bairros & Taxas de Entrega</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-orange-50 text-[#FF5E1E] border-orange-200">
              {deliveryConfig?.pricingMode === 'fixed'
                ? `Taxa Fixa (${formatCurrency(Number(deliveryConfig?.fixedFee) || 0)})`
                : 'Taxa por Bairro'}
            </span>
            {isDirty && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Alterações pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Defina a modalidade de cobrança, os prazos estimados e clique em <strong>Salvar Configurações</strong> para aplicar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3.5 py-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveGeneralConfig}
            className="px-4 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#FF5E1E]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>

      {/* Card 1: Modalidade de Cobrança & Prazos Estimados */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#FF5E1E]" />
            <span>Forma de Cobrança da Taxa de Entrega</span>
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Selecione como a taxa de entrega será calculada no carrinho do cliente
          </p>
        </div>

        {/* Seleção de Modalidade (Cards Interativos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Opção 1: Por Bairro */}
          <div
            onClick={() => handleChangePricingMode('by_neighborhood')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              pricingMode === 'by_neighborhood'
                ? 'border-[#FF5E1E] bg-orange-50/20 shadow-xs'
                : 'border-[#E9ECEF] hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    pricingMode === 'by_neighborhood'
                      ? 'bg-[#FF5E1E] text-white shadow-xs'
                      : 'bg-slate-100 text-[#6C757D]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1A1D20]">
                    Taxa por Bairro / Localidade
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                    Mais flexível
                  </span>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  pricingMode === 'by_neighborhood'
                    ? 'border-[#FF5E1E]'
                    : 'border-slate-300'
                }`}
              >
                {pricingMode === 'by_neighborhood' && (
                  <div className="w-2 h-2 rounded-full bg-[#FF5E1E]" />
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Cada localidade atendida possui sua própria taxa cadastrada na tabela abaixo.
            </p>
          </div>

          {/* Opção 2: Taxa Fixa */}
          <div
            onClick={() => handleChangePricingMode('fixed')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              pricingMode === 'fixed'
                ? 'border-[#FF5E1E] bg-orange-50/20 shadow-xs'
                : 'border-[#E9ECEF] hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    pricingMode === 'fixed'
                      ? 'bg-[#FF5E1E] text-white shadow-xs'
                      : 'bg-slate-100 text-[#6C757D]'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1A1D20]">
                    Taxa Fixa para toda a Cidade
                  </h4>
                  <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-1.5 py-0.2 rounded-md">
                    Ideal para interior
                  </span>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  pricingMode === 'fixed'
                    ? 'border-[#FF5E1E]'
                    : 'border-slate-300'
                }`}
              >
                {pricingMode === 'fixed' && (
                  <div className="w-2 h-2 rounded-full bg-[#FF5E1E]" />
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Cobrança única de entrega independente do bairro (ou grátis).
            </p>
          </div>
        </div>

        {/* Campo de Valor da Taxa Fixa quando ativo */}
        {pricingMode === 'fixed' && (
          <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-orange-950 block">
                Valor da Taxa Fixa de Entrega
              </span>
              <span className="text-[11px] text-orange-900/80">
                Este valor será cobrado em todos os pedidos com entrega selecionada
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-orange-300 rounded-xl px-3 py-2 shadow-xs focus-within:border-[#FF5E1E]">
                <span className="text-xs font-bold text-[#6C757D]">R$</span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={fixedFee}
                  onChange={(e) => setFixedFee(e.target.value)}
                  placeholder="5.00"
                  className="w-20 text-xs font-black text-[#1A1D20] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Grid de Prazos Estimados e Pedido Mínimo */}
        <div className="pt-2 border-t border-[#F1F3F5] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Prazo Entrega */}
          <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E9ECEF] space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Tempo Estimado de Entrega</span>
            </label>
            <input
              type="text"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="Ex: 40 - 50 min"
              className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none"
            />
          </div>

          {/* Prazo Retirada */}
          <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E9ECEF] space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D] flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Tempo Estimado de Retirada</span>
            </label>
            <input
              type="text"
              value={estimatedPickup}
              onChange={(e) => setEstimatedPickup(e.target.value)}
              placeholder="Ex: 20 - 30 min"
              className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none"
            />
          </div>

          {/* Pedido Mínimo */}
          <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E9ECEF] space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Pedido Mínimo (R$)</span>
            </label>
            <input
              type="number"
              step="1.00"
              min="0"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="15.00"
              className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none"
            />
          </div>
        </div>

        {/* Switch Retirada no Balcão + Botão Salvar Prazos */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={allowPickup}
              onClick={() => setAllowPickup(!allowPickup)}
              className="cursor-pointer"
            >
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  allowPickup ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                    allowPickup ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
            <span className="text-xs font-bold text-[#1A1D20]">
              Permitir retirada no balcão sem taxa de entrega
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Lista e Gestão de Bairros / Localidades */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F3F5]">
          <div>
            <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5E1E]" />
              <span>Bairros & Localidades Atendidas</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#6C757D]">
                {neighborhoods.length}
              </span>
            </h3>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Bairros desativados são ocultados automaticamente no dropdown do cliente
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              {activeCount} ativos
            </span>
            {inactiveCount > 0 && (
              <span className="text-[11px] font-semibold text-[#6C757D] bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                {inactiveCount} desativados
              </span>
            )}
          </div>
        </div>

        {/* Aviso amigável caso esteja em modo de Taxa Fixa */}
        {pricingMode === 'fixed' && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Atenção:</strong> A loja está atualmente no modo <strong>Taxa Fixa ({formatCurrency(Number(fixedFee) || 0)})</strong>. Os valores cadastrados abaixo serão aplicados caso você mude para a modalidade &ldquo;Taxa por Bairro&rdquo;.
            </span>
          </div>
        )}

        {/* Barra de Busca + Ações da Lista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar bairro ou localidade..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-xs font-medium text-[#1A1D20] outline-none focus:border-[#FF5E1E] focus:bg-white transition-all placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="flex items-center gap-2">
            {neighborhoods.length === 0 && (
              <button
                type="button"
                onClick={handleRestoreDefaultNeighborhoods}
                className="px-3 py-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setNeighborhoodToEdit(null)
                setIsNeighborhoodModalOpen(true)
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Bairro</span>
            </button>
          </div>
        </div>

        {/* Lista de Bairros */}
        <div className="divide-y divide-[#F1F3F5] border border-[#F1F3F5] rounded-2xl overflow-hidden">
          {filteredNeighborhoods.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2 bg-[#F8F9FA]/50">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-[#1A1D20]">
                Nenhuma localidade encontrada
              </p>
              <p className="text-[11px] text-[#6C757D]">
                {searchQuery
                  ? `Nenhum resultado para "${searchQuery}".`
                  : 'Cadastre os bairros atendidos pelo seu estabelecimento.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={handleRestoreDefaultNeighborhoods}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-100 hover:bg-[#FF5E1E] text-[#FF5E1E] hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Carregar Bairros de Exemplo</span>
                </button>
              )}
            </div>
          ) : (
            filteredNeighborhoods.map((nb) => {
              const isActive = nb.active !== false

              return (
                <div
                  key={nb.id}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isActive ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/50'
                  }`}
                >
                  {/* Nome e Indicador */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-orange-50 text-[#FF5E1E]'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isActive ? 'text-[#1A1D20]' : 'text-[#6C757D] line-through'
                          }`}
                        >
                          {nb.name}
                        </span>
                        {!isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                            Desativado
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6C757D]">
                        {isActive
                          ? 'Visível no dropdown do cliente'
                          : 'Oculto no dropdown do cardápio'}
                      </span>
                    </div>
                  </div>

                  {/* Valor da Taxa, Switch Ativo e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    {/* Taxa em R$ */}
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#1A1D20] block">
                        {nb.fee > 0 ? formatCurrency(nb.fee) : 'Grátis'}
                      </span>
                      {pricingMode === 'fixed' && (
                        <span className="text-[10px] text-[#6C757D]">
                          (Fixo: {formatCurrency(Number(fixedFee) || 0)})
                        </span>
                      )}
                    </div>

                    {/* Switch Ativo / Desativado */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={() => {
                        toggleNeighborhoodActive(nb.id)
                        toast.info(
                          isActive
                            ? `Bairro "${nb.name}" desativado (oculto no cardápio).`
                            : `Bairro "${nb.name}" reativado no cardápio.`
                        )
                      }}
                      title={
                        isActive
                          ? 'Clique para desativar e ocultar no cardápio'
                          : 'Clique para reativar no cardápio'
                      }
                      className="cursor-pointer"
                    >
                      <div
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                            isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setNeighborhoodToEdit(nb)
                          setIsNeighborhoodModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg text-[#6C757D] hover:text-[#1A1D20] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Editar bairro e taxa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setNeighborhoodToDelete(nb)}
                        className="p-1.5 rounded-lg text-[#6C757D] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir bairro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#6C757D]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>As taxas e alterações de bairros sincronizam em tempo real com o cardápio.</span>
          </span>
        </div>
      </div>

      {/* Modal de Cadastro / Edição de Bairro */}
      <NeighborhoodModal
        isOpen={isNeighborhoodModalOpen}
        onClose={() => {
          setIsNeighborhoodModalOpen(false)
          setNeighborhoodToEdit(null)
        }}
        neighborhoodToEdit={neighborhoodToEdit}
        onSave={handleSaveNeighborhood}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={Boolean(neighborhoodToDelete)}
        onClose={() => setNeighborhoodToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Bairro"
        description={`Tem certeza que deseja excluir o bairro "${neighborhoodToDelete?.name}"? Ele deixará de aparecer nas opções de entrega.`}
        confirmText="Sim, Excluir"
        confirmVariant="danger"
      />
    </div>
  )
}

