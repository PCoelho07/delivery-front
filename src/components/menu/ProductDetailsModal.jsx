import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react'
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
  const maxAddons = item?.maxAddons ?? addons.length

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
      className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-[480px] h-dvh bg-white flex flex-col overflow-hidden shadow-2xl animate-modal-up">
        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Foto de Topo + Botão Voltar + Selo */}
          <div className="relative h-64 sm:h-72 w-full bg-[#1A1D20] overflow-hidden">
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

            {/* Botão Circular de Voltar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar para o cardápio"
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
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
              <h1 className="text-[22px] font-bold text-[#1A1D20] tracking-tight leading-tight">
                {item.name}
              </h1>
              <span className="text-[19px] font-bold text-[#FF5E1E] shrink-0">
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
            {/* 1. Deixe ainda melhor (Adicionais) */}
            {addons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[15px] font-bold text-[#1A1D20]">
                    Deixe ainda melhor
                  </h2>
                  <span className="text-[12px] text-[#6C757D]">
                    Opcional{maxAddons > 0 ? ` · até ${maxAddons}` : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {addons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id)
                    return (
                      <label
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className="flex items-center justify-between py-0.5 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#FF5E1E] border-[#FF5E1E] text-white'
                                : 'bg-white border-[#CBD5E1] group-hover:border-[#94A3B8]'
                            }`}
                          >
                            {isChecked && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </span>
                          <span className="text-[14px] text-[#1A1D20]">
                            {addon.name}
                          </span>
                        </div>

                        <span className="text-[13.5px] text-[#6C757D]">
                          + {formatCurrency(addon.price)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </section>
            )}

            {/* 2. Do seu jeito (Preferências / Remoções) */}
            {preferences.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-bold text-[#1A1D20]">
                    Do seu jeito
                  </h2>
                  <span className="text-[12px] text-[#6C757D]">Opcional</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {preferences.map((pref) => {
                    const isChecked = selectedPreferenceIds.includes(pref.id)
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => togglePreference(pref.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'border-[#FF5E1E] bg-[#FF5E1E]/5'
                            : 'border-[#E2E5E9] bg-white hover:border-[#CBD5E1]'
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
                        <span className="text-[13px] text-[#1A1D20]">
                          {pref.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* 3. Alguma observação? */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[15px] font-bold text-[#1A1D20]">
                  Alguma observação?
                </h2>
                <span className="text-[12px] text-[#6C757D]">Opcional</span>
              </div>

              <div className="relative bg-[#F8F9FA] rounded-2xl p-3.5 pb-6 border border-transparent focus-within:border-[#E2E5E9] transition-colors">
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

        {/* Barra Inferior Fixa (Total do Item + Stepper + Botão Adicionar ao Carrinho) */}
        <footer className="shrink-0 border-t border-gray-100 bg-white px-5 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-[#6C757D]">Total do item</span>
            <span className="text-[18px] font-bold text-[#1A1D20]">
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
              className="flex-1 h-12 bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white font-semibold text-[15px] rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
