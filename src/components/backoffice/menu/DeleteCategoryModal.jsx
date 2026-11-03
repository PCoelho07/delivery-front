import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRightLeft,
  EyeOff,
  FolderMinus,
  Trash2,
  X,
} from 'lucide-react'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { CustomSelect } from '../common/CustomSelect'

/**
 * Modal Inteligente para Exclusão de Categorias
 *
 * Implementa a melhor prática de mercado (Padrão iFood / Shopify):
 * - Se a categoria não tem itens: exclusão direta simples.
 * - Se a categoria possui itens vinculados: Bloqueio preventivo que oferece:
 *   1. Remanejo assistido (Mover produtos para outra categoria ativa)
 *   2. Desativação preventiva (Ocultar da vitrine sem perder dados)
 *   3. Exclusão em massa (Apenas sob confirmação explícita de risco)
 */
export function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
  onDeleteCategoryOnly,
  onMoveProductsAndDelete,
  onDeactivateCategory,
  onDeleteCategoryAndProducts,
}) {
  const { categories, products } = useStoreAdmin()

  const linkedProducts = category
    ? products.filter((p) => String(p.categoryId) === String(category.id))
    : []

  const hasLinkedProducts = linkedProducts.length > 0

  // Outras categorias elegíveis para receber os itens
  const otherCategories = categories.filter(
    (c) => String(c.id) !== String(category?.id)
  )

  const [selectedAction, setSelectedAction] = useState('move') // 'move' | 'deactivate' | 'delete_all'
  const [targetCategoryId, setTargetCategoryId] = useState(
    otherCategories[0]?.id || ''
  )

  if (!isOpen || !category) return null

  const handleConfirm = () => {
    if (!hasLinkedProducts) {
      onDeleteCategoryOnly(category.id)
      onClose()
      return
    }

    if (selectedAction === 'move') {
      if (!targetCategoryId) return
      onMoveProductsAndDelete(category.id, targetCategoryId)
    } else if (selectedAction === 'deactivate') {
      onDeactivateCategory(category.id)
    } else if (selectedAction === 'delete_all') {
      onDeleteCategoryAndProducts(category.id)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E9ECEF] space-y-4 animate-modal-up my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                hasLinkedProducts
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {hasLinkedProducts ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <FolderMinus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                Excluir Categoria &ldquo;{category.name}&rdquo;
              </h3>
              <p className="text-xs text-[#6C757D]">
                {hasLinkedProducts
                  ? `Contém ${linkedProducts.length} ${
                      linkedProducts.length === 1
                        ? 'produto cadastrado'
                        : 'produtos cadastrados'
                    }`
                  : 'Categoria vazia (nenhum produto vinculado)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6C757D] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cenário 1: Categoria Vazia (Exclusão Direta) */}
        {!hasLinkedProducts && (
          <div className="space-y-4">
            <p className="text-xs text-[#6C757D] leading-relaxed">
              Tem certeza que deseja excluir esta categoria? Como não há produtos
              nela, ela será removida imediatamente da sua vitrine.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Excluir Categoria
              </button>
            </div>
          </div>
        )}

        {/* Cenário 2: Categoria com Produtos (Bloqueio Preventivo com 3 Opções) */}
        {hasLinkedProducts && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">
                Atenção: Esta categoria possui itens ativos!
              </p>
              <p className="text-[11.5px] text-amber-800 leading-relaxed">
                Para evitar perda acidental de cadastros, fotos e descrições,
                escolha como deseja proceder com os {linkedProducts.length} itens:
              </p>
            </div>

            {/* Opções de Resolução */}
            <div className="space-y-2.5 text-xs">
              {/* Opção 1: Mover para outra categoria (se houver outra) */}
              {otherCategories.length > 0 && (
                <label
                  className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedAction === 'move'
                      ? 'border-[#FF5E1E] bg-orange-50/50 ring-2 ring-[#FF5E1E]/10'
                      : 'border-[#E9ECEF] hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="delete_cat_action"
                      value="move"
                      checked={selectedAction === 'move'}
                      onChange={() => setSelectedAction('move')}
                      className="accent-[#FF5E1E]"
                    />
                    <ArrowRightLeft className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                    <div>
                      <p className="font-bold text-[#1A1D20]">
                        Mover produtos para outra categoria (Recomendado)
                      </p>
                      <p className="text-[11px] text-[#6C757D]">
                        Transfere todos os lanches para uma categoria existente e apaga apenas a categoria vazia.
                      </p>
                    </div>
                  </div>

                  {selectedAction === 'move' && (
                    <div className="pl-6 pt-1">
                      <CustomSelect
                        label="Categoria de destino para os produtos:"
                        value={targetCategoryId}
                        onChange={(val) => setTargetCategoryId(val)}
                        options={otherCategories.map((c) => ({
                          value: c.id,
                          label: c.name,
                          desc: `${
                            products.filter((p) => String(p.categoryId) === String(c.id)).length
                          } produtos atuais`,
                        }))}
                        placeholder="Selecione a categoria de destino..."
                      />
                    </div>
                  )}
                </label>
              )}

              {/* Opção 2: Desativar da vitrine (Ocultar) */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedAction === 'deactivate'
                    ? 'border-[#FF5E1E] bg-orange-50/50 ring-2 ring-[#FF5E1E]/10'
                    : 'border-[#E9ECEF] hover:bg-[#F8F9FA]'
                }`}
              >
                <input
                  type="radio"
                  name="delete_cat_action"
                  value="deactivate"
                  checked={selectedAction === 'deactivate'}
                  onChange={() => setSelectedAction('deactivate')}
                  className="accent-[#FF5E1E] mt-0.5"
                />
                <EyeOff className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1A1D20]">
                    Apenas Desativar / Ocultar da Vitrine
                  </p>
                  <p className="text-[11px] text-[#6C757D]">
                    Os clientes não verão mais esta categoria nem seus lanches, mas nenhum dado é perdido.
                  </p>
                </div>
              </label>

              {/* Opção 3: Exclusão em Massa (Destrutiva) */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedAction === 'delete_all'
                    ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-500/10'
                    : 'border-[#E9ECEF] hover:bg-[#F8F9FA]'
                }`}
              >
                <input
                  type="radio"
                  name="delete_cat_action"
                  value="delete_all"
                  checked={selectedAction === 'delete_all'}
                  onChange={() => setSelectedAction('delete_all')}
                  className="accent-rose-600 mt-0.5"
                />
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-950">
                    Excluir Categoria e TODOS os {linkedProducts.length} Produtos
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Ação permanente: apaga a categoria e remove todos os produtos associados do sistema.
                  </p>
                </div>
              </label>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E9ECEF]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                  selectedAction === 'delete_all'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#FF5E1E] hover:bg-[#E64E12]'
                }`}
              >
                {selectedAction === 'move'
                  ? 'Mover e Excluir Categoria'
                  : selectedAction === 'deactivate'
                  ? 'Ocultar Categoria'
                  : 'Excluir Tudo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

