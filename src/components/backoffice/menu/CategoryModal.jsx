import { useState } from 'react'
import { FolderPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { formatTitleCase } from '../../../utils/textUtils'

export function CategoryModal({ isOpen, onClose, categoryToEdit = null }) {
  const { categories, addCategory, updateCategory } = useStoreAdmin()

  const [name, setName] = useState(categoryToEdit?.name || '')
  const [order, setOrder] = useState(
    categoryToEdit?.order ?? (categories.length + 1)
  )
  const [status, setStatus] = useState(categoryToEdit?.status || 'active')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o nome da categoria.')
      return
    }

    const formattedName = formatTitleCase(name)

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: formattedName,
        order: Number(order) || 1,
        status,
      })
      toast.success(`Categoria "${formattedName}" atualizada com sucesso!`)
    } else {
      addCategory({
        name: formattedName,
        order: Number(order) || 1,
        status,
      })
      toast.success(`Nova categoria "${formattedName}" criada com sucesso!`)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9ECEF] space-y-5 animate-modal">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria na Vitrine'}
              </h3>
              <p className="text-xs text-[#6C757D]">
                Aba de navegação exibida no cardápio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Categoria */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: ✨ Novidades do Mês, 🍔 Hambúrgueres, 🥤 Bebidas"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-semibold outline-none transition-all"
            />
          </div>

          {/* Número da Ordem no Menu */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Ordem no Menu *
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#FF5E1E] font-extrabold outline-none"
            />
            <span className="text-[10px] text-[#6C757D] mt-1 block">
              Posição de exibição na barra de categorias (ex: 1 é a primeira aba).
            </span>
          </div>

          {/* Status no Menu com Toggle Switch Interativo */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1.5">
              Status na Vitrine
            </label>
            <div
              onClick={() =>
                setStatus(status === 'active' ? 'inactive' : 'active')
              }
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                status === 'active'
                  ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-extrabold ${
                      status === 'active'
                        ? 'text-emerald-900'
                        : 'text-[#1A1D20]'
                    }`}
                  >
                    {status === 'active' ? 'Categoria Ativa' : 'Categoria Desativada'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6C757D] mt-0.5">
                  {status === 'active'
                    ? 'Aparece normalmente para os clientes no cardápio'
                    : 'Oculta na vitrine (os clientes não verão esta aba)'}
                </p>
              </div>

              {/* Switch tipo iOS: verde quando ativo com bolinha para frente, cinza quando desativado */}
              <button
                type="button"
                role="switch"
                aria-checked={status === 'active'}
                onClick={(e) => {
                  e.stopPropagation()
                  setStatus(status === 'active' ? 'inactive' : 'active')
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Alternar status da categoria</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                    status === 'active' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E9ECEF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold shadow-md shadow-[#FF5E1E]/20 transition-all"
            >
              {categoryToEdit ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

