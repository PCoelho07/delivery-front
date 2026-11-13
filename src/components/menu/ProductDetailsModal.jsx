import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Minus, Plus, X, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

/**
 * Normaliza os grupos de opções/complementos do item de forma flexível e agnóstica a produto.
 * Suporta:
 * 1. `item.optionGroups` (contrato padrão com groups + options)
 * 2. `item.complementGroups` (API Go / complementar com complements)
 * 3. `item.groups` (template groups com items)
 * 4. Fallback legado para hambúrgueres simples (`item.preferences` e `item.addons`)
 */
function normalizeGroups(item) {
  if (!item) return []

  const rawGroups =
    item.optionGroups || item.complementGroups || item.groups || null

  if (Array.isArray(rawGroups) && rawGroups.length > 0) {
    return rawGroups.map((grp, gIdx) => {
      const rawOptions = grp.options || grp.complements || grp.items || []
      const min = Number(grp.min ?? (grp.required ? 1 : 0)) || 0
      const max = Number(grp.max ?? (min > 1 ? min : 1)) || 1

      return {
        id: String(grp.id || `grp-${gIdx}`),
        name: grp.name || 'Opções',
        description: grp.description || '',
        required: min > 0 || Boolean(grp.required),
        min,
        max,
        options: rawOptions.map((opt, oIdx) => ({
          id: String(opt.id || `opt-${gIdx}-${oIdx}`),
          name: opt.name || 'Opção',
          description: opt.description || '',
          price: Number(opt.price) || 0,
        })),
      }
    })
  }

  // Fallback para itens legados baseados em addons e preferences soltos
  const syntheticGroups = []
  const preferences = item.preferences || []
  const addons = item.addons || []

  if (preferences.length > 0) {
    const prefGroups = {}
    preferences.forEach((p) => {
      const gName = p.groupName || 'Do seu jeito'
      if (!prefGroups[gName]) {
        prefGroups[gName] = []
      }
      prefGroups[gName].push(p)
    })

    Object.entries(prefGroups).forEach(([gName, items], gIdx) => {
      const isRequired = gName !== 'Do seu jeito'
      syntheticGroups.push({
        id: `legacy-pref-${gIdx}`,
        name: gName,
        description: isRequired ? 'Escolha 1 opção' : 'Escolha suas preferências',
        required: isRequired,
        min: isRequired ? 1 : 0,
        max: isRequired ? 1 : items.length,
        options: items.map((it) => ({
          id: String(it.id),
          name: it.name,
          description: '',
          price: Number(it.price) || 0,
        })),
      })
    })
  }

  if (addons.length > 0) {
    const maxAddons = Number(item.maxAddons) || addons.length
    syntheticGroups.push({
      id: 'legacy-addons',
      name: 'Turbine seu pedido (Adicionais)',
      description: `Escolha até ${maxAddons} adicionais`,
      required: false,
      min: 0,
      max: maxAddons,
      options: addons.map((it) => ({
        id: String(it.id),
        name: it.name,
        description: '',
        price: Number(it.price) || 0,
      })),
    })
  }

  return syntheticGroups
}

export function ProductDetailsModal({
  item,
  storeName = 'Brasa Burger',
  onClose,
  onConfirmAdd,
}) {
  const groups = useMemo(() => normalizeGroups(item), [item])

  // Estado das seleções: { [groupId]: [optionId1, optionId2, ...] }
  const [selections, setSelections] = useState(() => {
    const initial = {}
    groups.forEach((grp) => {
      // Se for obrigatório e de escolha única (min === 1 && max === 1), pré-seleciona a primeira opção
      if (grp.min === 1 && grp.max === 1 && grp.options.length > 0) {
        initial[grp.id] = [grp.options[0].id]
      } else {
        initial[grp.id] = []
      }
    })
    return initial
  })

  const [observation, setObservation] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Alterna seleção de uma opção em um grupo
  const handleToggleOption = (group, optionId) => {
    setSelections((prev) => {
      const current = prev[group.id] || []
      const isSingle = group.max === 1

      if (isSingle) {
        // Modo Radio: se já selecionado e não obrigatório, desmarca; se obrigatório, troca para a nova
        if (current.includes(optionId)) {
          return group.min === 0 ? { ...prev, [group.id]: [] } : prev
        }
        return { ...prev, [group.id]: [optionId] }
      }

      // Modo Multi-select (Checkbox)
      if (current.includes(optionId)) {
        return {
          ...prev,
          [group.id]: current.filter((id) => id !== optionId),
        }
      }

      // Trava de cota: se já atingiu o máximo, ignora novas seleções
      if (group.max > 0 && current.length >= group.max) {
        return prev
      }

      return {
        ...prev,
        [group.id]: [...current, optionId],
      }
    })
  }

  // Preço total calculado dinamicamente
  const totalPrice = useMemo(() => {
    if (!item) return 0
    let optionsSum = 0

    groups.forEach((grp) => {
      const selectedIds = selections[grp.id] || []
      grp.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          optionsSum += Number(opt.price) || 0
        }
      })
    })

    return ((Number(item.price) || 0) + optionsSum) * quantity
  }, [item, groups, selections, quantity])

  // Validação dos requisitos obrigatórios
  const validation = useMemo(() => {
    const missingGroups = []

    groups.forEach((grp) => {
      const count = (selections[grp.id] || []).length
      if (grp.min > 0 && count < grp.min) {
        missingGroups.push({
          group: grp,
          remaining: grp.min - count,
        })
      }
    })

    const isValid = missingGroups.length === 0
    let promptMessage = ''

    if (!isValid) {
      const firstMissing = missingGroups[0]
      promptMessage = `Escolha ${firstMissing.remaining} em "${firstMissing.group.name}"`
    }

    return { isValid, missingGroups, promptMessage }
  }, [groups, selections])

  if (!item) return null

  const handleConfirm = () => {
    if (!validation.isValid) return

    // Prepara payload rico com todas as opções selecionadas
    const allSelectedOptions = []
    const mappedAddons = []
    const mappedPreferences = []

    groups.forEach((grp) => {
      const selectedIds = selections[grp.id] || []
      grp.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          const itemPayload = {
            id: opt.id,
            name: opt.name,
            price: opt.price,
            groupId: grp.id,
            groupName: grp.name,
          }
          allSelectedOptions.push(itemPayload)

          if (opt.price > 0) {
            mappedAddons.push({
              id: opt.id,
              name: opt.name,
              price: opt.price,
              groupName: grp.name,
            })
          } else {
            mappedPreferences.push({
              id: opt.id,
              name: opt.name,
              groupName: grp.name,
            })
          }
        }
      })
    })

    onConfirmAdd?.({
      product: item,
      quantity,
      observation,
      selectedOptions: allSelectedOptions,
      // Retrocompatibilidade total com sacola e checkout existentes:
      addons: mappedAddons,
      preferences: mappedPreferences,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-xs p-0 md:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] h-dvh md:max-w-lg md:h-auto md:max-h-[90vh] md:rounded-3xl md:my-auto bg-white flex flex-col overflow-hidden shadow-2xl animate-modal-up transform-gpu"
      >
        {/* Conteúdo Rolável (Opção A: Lista Contínua com Travas em Tempo Real) */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Foto de Topo + Botões de Ação */}
          <div className="relative h-64 sm:h-72 w-full bg-[#1A1D20] overflow-hidden shrink-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-white/60">
                Sem imagem
              </div>
            )}

            {/* Botão Circular de Voltar (Mobile) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar para o cardápio"
              className="md:hidden absolute top-4 left-4 w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>

            {/* Botão Circular de Fechar (Desktop) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="hidden md:flex absolute top-4 right-4 w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 items-center justify-center shadow-md transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>

            {/* Badge (Ex: MAIS PEDIDO) */}
            {item.badge && (
              <span className="absolute bottom-3.5 left-4 bg-white text-[#1A1D20] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                {item.badge}
              </span>
            )}
          </div>

          {/* Cabeçalho de Informações do Produto */}
          <div className="px-5 pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-[22px] font-extrabold text-[#1A1D20] tracking-tight leading-tight">
                {item.name}
              </h1>
              <span className="text-[20px] font-extrabold text-[#FF5E1E] shrink-0">
                {formatCurrency(item.price)}
              </span>
            </div>

            {item.description && (
              <p className="mt-2 text-[13.5px] text-[#6C757D] leading-relaxed">
                {item.description}
              </p>
            )}

            <p className="mt-2 text-[12px] text-[#6C757D]">
              {storeName} · Personalize seu pedido
            </p>
          </div>

          {/* Seções de Grupos e Personalização (Opção A) */}
          <div className="px-5 mt-6 space-y-6 pb-8">
            {groups.map((group) => {
              const selectedIds = selections[group.id] || []
              const count = selectedIds.length
              const isMaxReached = group.max > 0 && count >= group.max
              const isSingle = group.max === 1

              // Texto do Badge exatamente como na versão da imagem da Vercel
              let badgeText = ''
              if (group.required) {
                badgeText = isSingle
                  ? 'Obrigatório · Escolha 1'
                  : `Obrigatório · Até ${group.max}`
              } else {
                badgeText = isSingle
                  ? 'Opcional · 1 opção'
                  : `Opcional · Até ${group.max}`
              }

              return (
                <section
                  key={group.id}
                  className="rounded-2xl p-4 border border-gray-100 bg-[#FAFAFA]/70"
                >
                  {/* Cabeçalho do Grupo com Título e Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-[15px] font-bold text-[#1A1D20]">
                        {group.name}
                      </h2>
                      {group.description && (
                        <p className="text-[12px] text-[#6C757D] mt-0.5">
                          {group.description}
                        </p>
                      )}
                    </div>

                    {/* Badge da Vercel (Obrigatório / Opcional) */}
                    <div className="shrink-0 text-right">
                      {group.required ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {badgeText}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#6C757D] bg-gray-100 px-2 py-0.5 rounded-md">
                          {badgeText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lista de Opções */}
                  <div className="space-y-2.5 mt-3">
                    {group.options.map((option) => {
                      const isSelected = selectedIds.includes(option.id)
                      const isDisabled = !isSelected && isMaxReached && !isSingle

                      return (
                        <div
                          key={option.id}
                          onClick={() => {
                            if (!isDisabled) {
                              handleToggleOption(group, option.id)
                            }
                          }}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between select-none transition-all ${
                            isDisabled
                              ? 'opacity-40 border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'cursor-pointer hover:border-gray-300'
                          } ${
                            isSelected
                              ? 'border-[#FF5E1E] bg-[#FFF3EE]/30'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {/* Controle Visual: Radio (max===1) ou Checkbox (max > 1) */}
                            {isSingle ? (
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'border-[#FF5E1E]'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E1E]" />
                                )}
                              </span>
                            ) : (
                              <span
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-[#FF5E1E] border-[#FF5E1E] text-white'
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                )}
                              </span>
                            )}

                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-[#1A1D20] truncate">
                                {option.name}
                              </p>
                              {option.description && (
                                <p className="text-[11.5px] text-[#6C757D] truncate mt-0.5">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Preço / Badge Grátis estilo Vercel */}
                          <div className="shrink-0 text-right">
                            {option.price > 0 ? (
                              <span className="text-[13px] font-bold text-[#FF5E1E]">
                                + {formatCurrency(option.price)}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                Grátis
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            {/* Alguma observação? */}
            <section className="rounded-2xl p-4 border border-gray-100 bg-[#FAFAFA]/60">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[15px] font-bold text-[#1A1D20]">
                  Alguma observação?
                </h2>
                <span className="text-[12px] text-[#6C757D]">Opcional</span>
              </div>

              <div className="relative bg-white rounded-xl p-3 pb-6 border border-gray-200 focus-within:border-[#FF5E1E] transition-colors">
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value.slice(0, 140))}
                  maxLength={140}
                  rows={2}
                  placeholder="Ex.: enviar a maionese à parte, sem cebola, etc."
                  className="w-full bg-transparent text-[13px] text-[#1A1D20] placeholder:text-[#6C757D]/70 resize-none focus:outline-none leading-relaxed"
                />
                <span className="absolute bottom-2 right-3 text-[11px] text-[#6C757D]">
                  {observation.length}/140
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Barra Inferior Fixa */}
        <footer className="shrink-0 border-t border-gray-100 bg-white px-5 pt-3 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-[#6C757D]">Total do item</span>
            <span className="text-[18px] font-extrabold text-[#1A1D20]">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de Quantidade */}
            <div className="flex items-center justify-between border border-[#E2E5E9] rounded-2xl px-3.5 h-12 w-[116px] shrink-0 bg-white">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className={`p-1 transition-colors cursor-pointer ${
                  quantity <= 1
                    ? 'text-[#CBD5E1] cursor-not-allowed'
                    : 'text-[#6C757D] hover:text-[#1A1D20]'
                }`}
              >
                <Minus className="w-4 h-4 stroke-[2.2]" />
              </button>

              <span className="text-[15px] font-bold text-[#1A1D20] select-none">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar quantidade"
                className="p-1 text-[#FF5E1E] hover:text-[#E64E12] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Botão Principal: Habilitado quando obrigatórios atendidos, ou com aviso orientador */}
            <button
              type="button"
              disabled={!validation.isValid}
              onClick={handleConfirm}
              className={`flex-1 h-12 text-white font-bold text-[14px] sm:text-[15px] rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                validation.isValid
                  ? 'bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {validation.isValid ? (
                <>
                  <span>Adicionar à sacola</span>
                  <span>·</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-[12.5px] px-2 truncate">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{validation.promptMessage}</span>
                </span>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
