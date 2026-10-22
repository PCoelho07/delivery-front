import { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatTitleCase } from '../../../utils/textUtils'

export function NeighborhoodModal({
  isOpen,
  onClose,
  neighborhoodToEdit = null,
  onSave,
}) {
  const [name, setName] = useState(neighborhoodToEdit?.name || '')
  const [fee, setFee] = useState(
    neighborhoodToEdit ? String(neighborhoodToEdit.fee ?? '') : '5.00'
  )
  const [active, setActive] = useState(neighborhoodToEdit?.active ?? true)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o nome do bairro ou localidade.')
      return
    }

    const parsedFee = Math.max(0, parseFloat(String(fee).replace(',', '.')) || 0)
    const formattedName = formatTitleCase(name)

    onSave({
      id: neighborhoodToEdit?.id,
      name: formattedName,
      fee: parsedFee,
      active,
    })

    toast.success(
      neighborhoodToEdit
        ? `Localidade "${formattedName}" atualizada com sucesso!`
        : `Localidade "${formattedName}" cadastrada com sucesso!`
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9ECEF] space-y-5 animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                {neighborhoodToEdit
                  ? 'Editar Bairro / Localidade'
                  : 'Cadastrar Novo Bairro'}
              </h3>
              <p className="text-xs text-[#6C757D]">
                Região atendida para entrega de pedidos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6C757D] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nome do Bairro / Localidade *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Centro, Jardim América, Povoado Lagoa"
              autoFocus
              required
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-bold outline-none transition-all placeholder:text-[#9CA3AF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Taxa de Entrega (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6C757D]">
                R$
              </span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="5.00"
                required
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1A1D20] font-extrabold outline-none transition-all"
              />
            </div>
            <span className="text-[10px] text-[#6C757D] mt-1 block">
              Digite 0 para entrega grátis nesta localidade.
            </span>
          </div>

          {/* Status Ativo / Desativado */}
          <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#1A1D20] block">
                Status no Cardápio
              </span>
              <span className="text-[11px] text-[#6C757D]">
                {active
                  ? 'Ativo (aparece no dropdown de bairros do cliente)'
                  : 'Desativado (oculto no dropdown de bairros)'}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive(!active)}
              className="cursor-pointer"
            >
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  active ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                    active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white text-xs font-bold shadow-md shadow-[#FF5E1E]/20 transition-all cursor-pointer"
            >
              {neighborhoodToEdit ? 'Salvar Alterações' : 'Cadastrar Bairro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

