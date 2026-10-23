import { useState } from 'react'
import {
  FolderPlus,
  PackagePlus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  FolderOpen,
  Plus,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { CategoryModal } from './CategoryModal'
import { ProductModal } from './ProductModal'
import { ConfirmModal } from '../common/ConfirmModal'

export function MenuVitrineView() {
  const {
    categories,
    deleteCategory,
    reorderCategory,
    toggleCategoryStatus,
    products,
    deleteProduct,
    toggleProductAvailability,
    reorderProduct,
    templates,
  } = useStoreAdmin()

  // Modal de Criação / Edição de Categoria
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)

  // Modal de Confirmação de Exclusão de Categoria
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Modal de Criação / Edição de Produto
  const [isProdModalOpen, setIsProdModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const [initialCategoryId, setInitialCategoryId] = useState('')

  // Modal de Confirmação de Exclusão de Produto
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  // Handlers de Categoria
  const handleOpenNewCategory = () => {
    setCategoryToEdit(null)
    setIsCatModalOpen(true)
  }

  const handleEditCategory = (cat) => {
    setCategoryToEdit(cat)
    setIsCatModalOpen(true)
  }

  const handleToggleCategoryStatus = (cat) => {
    toggleCategoryStatus(cat.id)
    const willBeActive = cat.status !== 'active'
    if (willBeActive) {
      toast.success(`Categoria "${cat.name}" ativada na vitrine!`)
    } else {
      toast.info(`Categoria "${cat.name}" desativada (oculta aos clientes).`)
    }
  }

  const handlePromptDeleteCategory = (cat) => {
    setCategoryToDelete(cat)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id)
      toast.success(`Categoria "${categoryToDelete.name}" excluída.`)
      setCategoryToDelete(null)
    }
  }

  // Handlers de Produto
  const handleOpenNewProduct = (catId = '') => {
    if (categories.length === 0) {
      toast.error('Cadastre primeiro uma Categoria na Vitrine antes de criar produtos.')
      setIsCatModalOpen(true)
      return
    }
    setProductToEdit(null)
    setInitialCategoryId(catId || categories[0]?.id || '')
    setIsProdModalOpen(true)
  }

  const handleEditProduct = (prod) => {
    setProductToEdit(prod)
    setInitialCategoryId(prod.categoryId)
    setIsProdModalOpen(true)
  }

  const handleToggleProductStock = (prod) => {
    toggleProductAvailability(prod.id)
    const willBeAvailable = !prod.available
    if (willBeAvailable) {
      toast.success(`"${prod.name}" marcado como DISPONÍVEL!`)
    } else {
      toast.info(`"${prod.name}" marcado como ESGOTADO no cardápio.`)
    }
  }

  const handlePromptDeleteProduct = (prod) => {
    setProductToDelete(prod)
    setIsDeleteProductModalOpen(true)
  }

  const handleConfirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id)
      toast.success(`Produto "${productToDelete.name}" excluído.`)
      setProductToDelete(null)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header com Botões da Vitrine */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#FF5E1E]" />
            <span>Cardápio & Vitrine de Produtos</span>
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Cadastre as categorias da vitrine, vincule templates de adicionais e controle produtos esgotados em tempo real.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleOpenNewCategory}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#FF5E1E] text-[#1A1D20] hover:text-[#FF5E1E] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#FF5E1E]" />
            <span>Nova Categoria</span>
          </button>

          <button
            onClick={() => handleOpenNewProduct()}
            className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal: Estado Vazio ou Lista de Categorias com seus Produtos */}
      {sortedCategories.length === 0 ? (
        /* Estado Inicial: Nenhuma Categoria */
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-base text-[#1A1D20]">
              Sua vitrine está vazia
            </h4>
            <p className="text-xs text-[#6C757D] max-w-md mx-auto">
              Comece cadastrando a primeira categoria da sua vitrine (ex: Lanches, Pizzas, Bebidas, Novidades) para então adicionar seus produtos com fotos compactadas.
            </p>
          </div>
          <button
            onClick={handleOpenNewCategory}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white font-bold text-xs shadow-md shadow-[#FF5E1E]/20 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Cadastrar Primeira Categoria</span>
          </button>
        </div>
      ) : (
        /* Lista de Categorias com Produtos Agrupados */
        <div className="space-y-6">
          {sortedCategories.map((cat) => {
            const catProducts = products
              .filter((p) => p.categoryId === cat.id)
              .sort((a, b) => a.order - b.order)

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden shadow-xs"
              >
                {/* Cabeçalho da Categoria de Vitrine */}
                <div className="p-4 bg-[#F8F9FA]/80 border-b border-[#E9ECEF] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Botões de Ordem da Categoria */}
                    <div className="flex flex-col items-center justify-center gap-0.5 bg-white border border-[#E9ECEF] rounded-xl px-2 py-1 shrink-0">
                      <button
                        onClick={() => reorderCategory(cat.id, -1)}
                        title="Subir posição da categoria"
                        className="text-[10px] text-[#6C757D] hover:text-[#FF5E1E] cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-[#FF5E1E]">
                        #{cat.order}
                      </span>
                      <button
                        onClick={() => reorderCategory(cat.id, 1)}
                        title="Descer posição da categoria"
                        className="text-[10px] text-[#6C757D] hover:text-[#FF5E1E] cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#1A1D20]">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-[#6C757D] bg-white border border-[#E9ECEF] px-2 py-0.5 rounded-full">
                          {catProducts.length}{' '}
                          {catProducts.length === 1 ? 'produto' : 'produtos'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6C757D]">
                        {cat.status === 'active'
                          ? 'Visível aos clientes no cardápio'
                          : 'Oculta no cardápio'}
                      </span>
                    </div>
                  </div>

                  {/* Ações da Categoria */}
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    {/* Switch Ativa / Desativada da Categoria */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cat.status === 'active'}
                      onClick={() => handleToggleCategoryStatus(cat)}
                      title={
                        cat.status === 'active'
                          ? 'Clique para desativar esta categoria'
                          : 'Clique para ativar esta categoria'
                      }
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E9ECEF] bg-white hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          cat.status === 'active'
                            ? 'bg-emerald-500'
                            : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                            cat.status === 'active'
                              ? 'translate-x-4'
                              : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-extrabold select-none ${
                          cat.status === 'active'
                            ? 'text-emerald-700'
                            : 'text-[#6C757D]'
                        }`}
                      >
                        {cat.status === 'active' ? 'Ativa' : 'Desativada'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="px-3 py-1.5 rounded-xl border border-[#E9ECEF] bg-white hover:border-[#FF5E1E] text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      onClick={() => handlePromptDeleteCategory(cat)}
                      className="p-1.5 text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenNewProduct(cat.id)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-[#FF5E1E] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Produto</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Produtos desta Categoria */}
                <div className="divide-y divide-[#E9ECEF]">
                  {catProducts.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <p className="text-xs text-[#6C757D]">
                        Nenhum produto cadastrado nesta categoria de vitrine ainda.
                      </p>
                      <button
                        onClick={() => handleOpenNewProduct(cat.id)}
                        className="text-xs font-bold text-[#FF5E1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cadastrar primeiro produto aqui</span>
                      </button>
                    </div>
                  ) : (
                    catProducts.map((prod) => {
                      const tmpl = templates.find((t) => t.id === prod.templateId)

                      return (
                        <div
                          key={prod.id}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            !prod.available
                              ? 'bg-rose-50/20 opacity-80'
                              : 'hover:bg-[#F8F9FA]/40'
                          }`}
                        >
                          {/* Foto + Informações Principais */}
                          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                            {/* Reordenação do Produto */}
                            <div className="flex flex-col items-center justify-center gap-0.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-1.5 py-1 shrink-0">
                              <button
                                onClick={() => reorderProduct(prod.id, -1)}
                                title="Subir ordem do produto"
                                className="text-[10px] text-[#6C757D] hover:text-[#FF5E1E] cursor-pointer"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[11px] font-black text-[#1A1D20]">
                                #{prod.order}
                              </span>
                              <button
                                onClick={() => reorderProduct(prod.id, 1)}
                                title="Descer ordem do produto"
                                className="text-[10px] text-[#6C757D] hover:text-[#FF5E1E] cursor-pointer"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Foto Compactada com Thumbnail */}
                            <div className="w-14 h-14 rounded-xl border border-[#E9ECEF] overflow-hidden bg-slate-100 shrink-0 relative">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className={`w-full h-full object-cover ${
                                  !prod.available ? 'grayscale' : ''
                                }`}
                              />
                              {!prod.available && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="text-[9px] font-black text-white uppercase tracking-tighter bg-rose-600 px-1 py-0.5 rounded-sm">
                                    Esgotado
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Textos */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`font-extrabold text-sm truncate transition-all ${
                                    !prod.available
                                      ? 'line-through text-[#6C757D]'
                                      : 'text-[#1A1D20]'
                                  }`}
                                >
                                  {prod.name}
                                </h4>
                                {prod.badge && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                                      !prod.available
                                        ? 'bg-slate-100 text-[#6C757D] opacity-60'
                                        : 'bg-orange-100 text-[#FF5E1E]'
                                    }`}
                                  >
                                    {prod.badge}
                                  </span>
                                )}
                              </div>

                              {prod.desc && (
                                <p className="text-xs text-[#6C757D] line-clamp-1 mt-0.5">
                                  {prod.desc}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {/* Preço */}
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xs font-black text-[#FF5E1E]">
                                    {formatCurrency(prod.price)}
                                  </span>
                                </div>

                                {/* Template Badge */}
                                {tmpl && (
                                  <span className="text-[10px] font-semibold text-slate-600 bg-[#F8F9FA] border border-[#E9ECEF] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                                    <span>{tmpl.name}</span>
                                    {tmpl.groups?.length > 0 && (
                                      <span className="opacity-75 text-[9px] font-bold">
                                        ({tmpl.groups.length} {tmpl.groups.length === 1 ? 'grupo' : 'grupos'})
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Ações: Switch Disponível/Esgotado + Editar + Excluir */}
                          <div className="flex items-center gap-2 sm:gap-2.5 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E9ECEF]">
                            {/* Switch Rápido de Esgotamento */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={prod.available}
                              onClick={() => handleToggleProductStock(prod)}
                              title={
                                prod.available
                                  ? 'Clique para marcar como ESGOTADO no cardápio'
                                  : 'Clique para REATIVAR o produto no cardápio'
                              }
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                prod.available
                                  ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                                  : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100'
                              }`}
                            >
                              <div
                                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                  prod.available
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                                    prod.available
                                      ? 'translate-x-4'
                                      : 'translate-x-0'
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-[11px] font-black select-none ${
                                  prod.available
                                    ? 'text-emerald-800'
                                    : 'text-rose-700'
                                }`}
                              >
                                {prod.available ? 'Disponível' : 'Esgotado'}
                              </span>
                            </button>

                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="px-3 py-1.5 rounded-xl border border-[#E9ECEF] hover:border-[#FF5E1E] text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>

                            <button
                              onClick={() => handlePromptDeleteProduct(prod)}
                              className="p-1.5 text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer"
                              title="Excluir produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Categoria */}
      {isCatModalOpen && (
        <CategoryModal
          key={categoryToEdit ? categoryToEdit.id : 'new-category'}
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          categoryToEdit={categoryToEdit}
        />
      )}

      {/* Modal de Confirmação para Categoria */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"? Os produtos vinculados a ela serão mantidos.`}
        confirmText="Sim, Excluir"
        confirmVariant="danger"
      />

      {/* Modal de Produto */}
      {isProdModalOpen && (
        <ProductModal
          key={productToEdit ? productToEdit.id : `new-prod-${initialCategoryId}`}
          isOpen={isProdModalOpen}
          onClose={() => setIsProdModalOpen(false)}
          productToEdit={productToEdit}
          initialCategoryId={initialCategoryId}
        />
      )}

      {/* Modal de Confirmação para Produto */}
      <ConfirmModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => setIsDeleteProductModalOpen(false)}
        onConfirm={handleConfirmDeleteProduct}
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto "${productToDelete?.name}"? Esta ação não poderá ser desfeita.`}
        confirmText="Sim, Excluir Produto"
        confirmVariant="danger"
      />
    </div>
  )
}
