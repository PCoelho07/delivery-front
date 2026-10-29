import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Minus, Plus, X } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

const EMPTY_ARRAY = []

export function ProductDetailsModal({
  item,
  storeName = 'Brasa Burger',
  onClose,
  onConfirmAdd,
}) {
  const [selectedAddonIds, setSelectedAddonIds] = useState([])
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState([])
  const [observation, setObservation] = useState('')
  const [quantity, setQuantity] = useState(1)

  const addons = item?.addons ?? EMPTY_ARRAY
  const preferences = item?.preferences ?? EMPTY_ARRAY
  const maxAddons = item?.maxAddons ?? (addons.length > 0 ? addons.length : 5)

  // Separa preferências agrupadas (ex: Ponto da Carne) de opções simples (ex: Sem cebola)
  const groupedPreferences = useMemo(() => {
    const groups = {}
    preferences.forEach((p) => {
      const gName = p.groupName || 'Do seu jeito'
      if (!groups[gName]) {
        groups[gName] = []
      }
      groups[gName].push(p)
    })
    return groups
  }, [preferences])

  // Se houver grupos de escolha única (como ponto da carne), pré-seleciona o primeiro
  useState(() => {
    const initialPrefs = []
    Object.entries(groupedPreferences).forEach(([gName, items]) => {
      if (gName !== 'Do seu jeito' && items.length > 0) {
        initialPrefs.push(items[0].id)
      }
    })
    if (initialPrefs.length > 0) {
      setSelectedPreferenceIds(initialPrefs)
    }
  })

  const toggleAddon = (addonId) => {
    setSelectedAddonIds((prev) => {
      if (prev.includes(addonId)) {
        return prev.filter((id) => id !== addonId)
      }
      if (maxAddons > 0 && prev.length >= maxAddons) {
        return prev
      }
      return [...prev, addonId]
    })
  }

  const selectSinglePreference = (prefId, groupItems) => {
    const groupItemIds = groupItems.map((i) => i.id)
    setSelectedPreferenceIds((prev) => {
      const filtered = prev.filter((id) => !groupItemIds.includes(id))
      return [...filtered, prefId]
    })
  }

  const togglePreference = (prefId) => {
    setSelectedPreferenceIds((prev) =>
      prev.includes(prefId)
        ? prev.filter((id) => id !== prefId)
        : [...prev, prefId]
    )
  }

  const totalPrice = useMemo(() => {
    if (!item) return 0
    const addonsSum = addons
      .filter((a) => selectedAddonIds.includes(a.id))
      .reduce((acc, a) => acc + (Number(a.price) || 0), 0)
    return ((Number(item.price) || 0) + addonsSum) * quantity
  }, [item, addons, selectedAddonIds, quantity])

  if (!item) return null

  const handleConfirm = () => {
    const chosenAddons = addons.filter((a) => selectedAddonIds.includes(a.id))
    const chosenPreferences = preferences.filter((p) =>
      selectedPreferenceIds.includes(p.id)
    )
    onConfirmAdd?.({
      product: item,
      quantity,
      addons: chosenAddons,
      preferences: chosenPreferences,
      observation,
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
        {/* Conteúdo Rolável com Custom Scrollbar */}
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

            {/* Botão Circular de Voltar (Apenas na versão Mobile) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar para o cardápio"
              className="md:hidden absolute top-4 left-4 w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>

            {/* Botão Circular de Fechar (Apenas na versão PC / Desktop) */}
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
              {storeName} · Feito na brasa
            </p>
          </div>

          {/* Seções de Personalização */}
          <div className="px-5 mt-6 space-y-6 pb-8">
            {/* Grupos Específicos com Opções Radio (Ex: Ponto da Carne) */}
            {Object.entries(groupedPreferences).map(([gName, groupItems]) => {
              if (gName === 'Do seu jeito') return null
              return (
                <section key={gName}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[15px] font-bold text-[#1A1D20]">
                      {gName}
                    </h2>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Obrigatório · Escolha 1
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {groupItems.map((pref) => {
                      const isSelected = selectedPreferenceIds.includes(pref.id)
                      return (
                        <div
                          key={pref.id}
                          onClick={() => selectSinglePreference(pref.id, groupItems)}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                            isSelected
                              ? 'border-[#FF5E1E] bg-[#FFF3EE]/30'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-[#FF5E1E]'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E1E]" />
                              )}
                            </span>
                            <span className="text-[13.5px] font-semibold text-[#1A1D20]">
                              {pref.name}
                            </span>
                          </div>

                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Grátis
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            {/* Adicionais (Turbine Seu Hambúrguer / Deixe ainda melhor) */}
            {addons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-bold text-[#1A1D20]">
                    Turbine Seu Hambúrguer (Adicionais)
                  </h2>
                  <span className="text-[11px] font-semibold text-[#6C757D] bg-gray-100 px-2 py-0.5 rounded-md">
                    Opcional{maxAddons > 0 ? ` · Até ${maxAddons}` : ''}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {addons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id)
                    return (
                      <label
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'border-[#FF5E1E] bg-[#FFF3EE]/30'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#FF5E1E] border-[#FF5E1E] text-white'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            {isChecked && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#1A1D20]">
                            {addon.name}
                          </span>
                        </div>

                        <span className="text-[13px] font-bold text-[#FF5E1E]">
                          + {formatCurrency(addon.price)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Preferências Simples (Do seu jeito) */}
            {groupedPreferences['Do seu jeito']?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-bold text-[#1A1D20]">
                    Do seu jeito
                  </h2>
                  <span className="text-[12px] text-[#6C757D]">Opcional</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {groupedPreferences['Do seu jeito'].map((pref) => {
                    const isChecked = selectedPreferenceIds.includes(pref.id)
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => togglePreference(pref.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'border-[#FF5E1E] bg-[#FF5E1E]/5 text-[#FF5E1E]'
                            : 'border-[#E2E5E9] bg-white hover:border-[#CBD5E1] text-[#1A1D20]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#FF5E1E] border-[#FF5E1E] text-white'
                              : 'bg-white border-[#CBD5E1]'
                          }`}
                        >
                          {isChecked && (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                        </span>
                        <span className="text-[13px] font-medium">
                          {pref.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Alguma observação? */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[15px] font-bold text-[#1A1D20]">
                  Alguma observação?
                </h2>
                <span className="text-[12px] text-[#6C757D]">Opcional</span>
              </div>

              <div className="relative bg-[#F8F9FA] rounded-2xl p-3.5 pb-6 border border-gray-200 focus-within:border-[#FF5E1E] transition-colors">
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value.slice(0, 140))}
                  maxLength={140}
                  rows={2}
                  placeholder="Ex.: enviar a maionese à parte."
                  className="w-full bg-transparent text-[13px] text-[#1A1D20] placeholder:text-[#6C757D]/80 resize-none focus:outline-none leading-relaxed"
                />
                <span className="absolute bottom-2.5 right-3.5 text-[11px] text-[#6C757D]">
                  {observation.length}/140
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Barra Inferior Fixa */}
        <footer className="shrink-0 border-t border-gray-100 bg-white px-5 pt-3 pb-4">
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

            {/* Botão Principal Laranja */}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 h-12 bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white font-bold text-[14px] sm:text-[15px] rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Adicionar à sacola</span>
              <span>·</span>
              <span>{formatCurrency(totalPrice)}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
