import { useState, useMemo } from 'react'
import {
  TicketPercent,
  Plus,
  Trash2,
  Copy,
  Check,
  Percent,
  Tag,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Utensils,
  Search,
  CheckSquare,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { formatCurrency } from '../../../lib/utils'
import { CustomSelect } from '../../common/CustomSelect'

export function CouponsView() {
  const {
    coupons,
    addCoupon,
    toggleCouponActive,
    deleteCoupon,
    categories = [],
    products = [],
  } = useStoreAdmin()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [code, setCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [isActive, setIsActive] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  // Escopo flexível: 'all' (todo cardápio) | 'category' (categoria inteira) | 'product' (produtos específicos)
  const [targetType, setTargetType] = useState('all')
  const [targetCategoryId, setTargetCategoryId] = useState('')
  const [targetProductIds, setTargetProductIds] = useState([])
  const [productSearch, setProductSearch] = useState('')

  const activeCoupons = (coupons || []).filter((c) => c.active !== false)
  const inactiveCoupons = (coupons || []).filter((c) => c.active === false)

  const maxDiscount = (coupons || []).reduce(
    (max, c) => (c.active ? Math.max(max, Number(c.discountPercent) || 0) : max),
    0
  )

  const handleOpenModal = () => {
    setCode('')
    setDiscountPercent('10')
    setIsActive(true)
    setTargetType('all')
    setTargetCategoryId(categories[0]?.id || '')
    setTargetProductIds([])
    setProductSearch('')
    setIsModalOpen(true)
  }

  // Filtragem de produtos para seleção
  const filteredProducts = useMemo(() => {
    const q = (productSearch || '').trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const matchName = (p.name || '').toLowerCase().includes(q)
      const cat = categories.find((c) => c.id === p.categoryId)
      const matchCat = cat?.name?.toLowerCase().includes(q)
      return matchName || matchCat
    })
  }, [products, categories, productSearch])

  // Opções customizadas de categoria para o CustomSelect
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => {
      const count = products.filter((p) => p.categoryId === cat.id).length
      return {
        value: cat.id,
        label: `${cat.name} (${count} ${count === 1 ? 'item' : 'itens'})`,
        icon: <Layers className="w-3.5 h-3.5 text-amber-600" />,
      }
    })
  }, [categories, products])

  const handleToggleProduct = (productId) => {
    setTargetProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id)
    const combined = Array.from(new Set([...targetProductIds, ...filteredIds]))
    setTargetProductIds(combined)
  }

  const handleClearSelection = () => {
    setTargetProductIds([])
  }

  const handleSaveCoupon = (e) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()

    if (!cleanCode) {
      toast.error('Informe o código do cupom (ex: PRIMEIRACOMPRA).')
      return
    }

    const pct = Number(discountPercent)
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      toast.error('O percentual de desconto deve ser entre 1% e 100%.')
      return
    }

    let targetCategoryName = ''
    if (targetType === 'category') {
      if (!targetCategoryId) {
        toast.error('Selecione uma categoria para o cupom.')
        return
      }
      const cat = categories.find((c) => c.id === targetCategoryId)
      targetCategoryName = cat?.name || 'Categoria Selecionada'
    }

    let targetProductNames = []
    if (targetType === 'product') {
      if (targetProductIds.length === 0) {
        toast.error('Selecione ao menos um produto participante da promoção.')
        return
      }
      targetProductNames = targetProductIds
        .map((id) => products.find((p) => p.id === id)?.name)
        .filter(Boolean)
    }

    const res = addCoupon({
      code: cleanCode,
      discountPercent: pct,
      active: isActive,
      targetType,
      targetCategoryId: targetType === 'category' ? targetCategoryId : null,
      targetCategoryName,
      targetProductIds: targetType === 'product' ? targetProductIds : [],
      targetProductNames,
    })

    if (res?.error) {
      toast.error(res.error)
      return
    }

    let scopeDesc = 'em todo o cardápio'
    if (targetType === 'category') scopeDesc = `na categoria ${targetCategoryName}`
    if (targetType === 'product') scopeDesc = `em ${targetProductNames.length} produto(s) selecionado(s)`

    toast.success(`Cupom ${cleanCode} cadastrado com sucesso!`, {
      description: `${pct}% de desconto ${scopeDesc}.`,
    })
    setIsModalOpen(false)
  }

  const handleCopyCode = async (c) => {
    try {
      await navigator.clipboard.writeText(c.code)
      setCopiedId(c.id)
      toast.success(`Código "${c.code}" copiado!`)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const handleDelete = (c) => {
    deleteCoupon(c.id)
    toast.success(`Cupom "${c.code}" removido.`)
  }

  const handleToggle = (c) => {
    toggleCouponActive(c.id)
    const willBeActive = !c.active
    if (willBeActive) {
      toast.success(`Cupom "${c.code}" ativado!`)
    } else {
      toast.info(`Cupom "${c.code}" pausado/desativado.`)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-[#FF5E1E]" />
            <span>Cupons de Desconto</span>
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Crie códigos promocionais com desconto geral, por categoria (ex: Dia do Hambúrguer) ou em produtos específicos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Cupom</span>
        </button>
      </div>

      {/* Cards de Métricas de Cupons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Cupons Ativos</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">
              {activeCoupons.length}
            </h3>
            <p className="text-[11px] text-[#6C757D] mt-0.5">Disponíveis aos clientes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Maior Desconto Ativo</p>
            <h3 className="text-2xl font-black text-[#FF5E1E] mt-0.5">
              {maxDiscount}% OFF
            </h3>
            <p className="text-[11px] text-[#6C757D] mt-0.5">Maior abatimento atual</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6C757D] font-medium">Total Cadastrado</p>
            <h3 className="text-2xl font-black text-[#1A1D20] mt-0.5">
              {(coupons || []).length}
            </h3>
            <p className="text-[11px] text-[#6C757D] mt-0.5">
              {inactiveCoupons.length} inativos/pausados
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid de Cupons */}
      {(coupons || []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center mx-auto">
            <TicketPercent className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-[#1A1D20]">
            Nenhum cupom cadastrado ainda
          </h4>
          <p className="text-xs text-[#6C757D] max-w-sm mx-auto">
            Cadastre cupons promocionais como PRIMEIRACOMPRA ou DIADOBURGER para incentivar seus clientes a finalizarem o pedido.
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5E1E] text-white text-xs font-bold cursor-pointer hover:bg-[#E64E12] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Cupom</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(coupons || []).map((c) => {
            const isCat = c.targetType === 'category'
            const isProd = c.targetType === 'product'

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl p-4 border transition-all space-y-3 flex flex-col justify-between ${
                  c.active !== false
                    ? 'border-emerald-200/90 shadow-2xs hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#1A1D20] tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c)}
                          className="p-1 text-slate-400 hover:text-[#FF5E1E] transition-colors cursor-pointer"
                          title="Copiar código do cupom"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-[#FF5E1E] block leading-none">
                        {c.discountPercent}%
                      </span>
                      <span className="text-[10px] font-bold text-[#6C757D] uppercase">
                        OFF
                      </span>
                    </div>
                  </div>

                  {/* Badge de Escopo */}
                  <div className="pt-0.5">
                    {isCat && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        <Layers className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Categoria: {c.targetCategoryName || 'Específica'}</span>
                      </span>
                    )}
                    {isProd && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                        <Utensils className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>
                          {c.targetProductNames?.length || c.targetProductIds?.length || 1} produto(s) participante(s)
                        </span>
                      </span>
                    )}
                    {!isCat && !isProd && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                        <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Válido em todo o cardápio</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra Inferior com Switch e Excluir */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.active !== false}
                    onClick={() => handleToggle(c)}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      c.active !== false
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                        : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                  >
                    <div
                      className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        c.active !== false ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                          c.active !== false ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-[10.5px] font-bold">
                      {c.active !== false ? 'Ativo' : 'Pausado'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Excluir cupom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Cadastro de Novo Cupom com Escopo Flexível */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            <div className="p-5 bg-white border-b border-[#E9ECEF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center">
                  <TicketPercent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1A1D20]">
                    Cadastrar Novo Cupom
                  </h3>
                  <p className="text-xs text-[#6C757D]">
                    Defina o código, desconto e os itens participantes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: DIADOBURGER"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E9ECEF] rounded-xl font-mono font-bold uppercase text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                    Desconto (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="15"
                      className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-[#E9ECEF] rounded-xl font-bold text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Seletor de Escopo do Cupom */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-[#1A1D20]">
                  Onde esse cupom é válido?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      targetType === 'all'
                        ? 'border-[#FF5E1E] bg-[#FFF3EE] text-[#FF5E1E] shadow-2xs font-bold'
                        : 'border-[#E9ECEF] bg-slate-50 text-[#6C757D] hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Todo Menu</span>
                    </span>
                    <span className="text-[10px] opacity-80 mt-1 block leading-tight font-normal">
                      Todos os itens
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('category')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      targetType === 'category'
                        ? 'border-[#FF5E1E] bg-[#FFF3EE] text-[#FF5E1E] shadow-2xs font-bold'
                        : 'border-[#E9ECEF] bg-slate-50 text-[#6C757D] hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span>Categoria</span>
                    </span>
                    <span className="text-[10px] opacity-80 mt-1 block leading-tight font-normal">
                      Ex: Hambúrgueres
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('product')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      targetType === 'product'
                        ? 'border-[#FF5E1E] bg-[#FFF3EE] text-[#FF5E1E] shadow-2xs font-bold'
                        : 'border-[#E9ECEF] bg-slate-50 text-[#6C757D] hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 shrink-0" />
                      <span>Específicos</span>
                    </span>
                    <span className="text-[10px] opacity-80 mt-1 block leading-tight font-normal">
                      Produtos avulsos
                    </span>
                  </button>
                </div>
              </div>

              {/* Seletor quando 'category' */}
              {targetType === 'category' && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
                  <label className="block text-xs font-bold text-amber-900">
                    Selecione a Categoria Participante:
                  </label>
                  <CustomSelect
                    value={targetCategoryId}
                    onChange={(val) => setTargetCategoryId(val)}
                    options={categoryOptions}
                    variant="amber"
                    placeholder="Selecione a categoria..."
                    icon={<Layers className="w-4 h-4 text-amber-600" />}
                  />
                  <p className="text-[11px] text-amber-800">
                    O desconto será calculado unicamente sobre os itens desta categoria que estiverem na sacola.
                  </p>
                </div>
              )}

              {/* Seletor quando 'product' */}
              {targetType === 'product' && (
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-900">
                      Produtos Participantes ({targetProductIds.length} selecionado{targetProductIds.length === 1 ? '' : 's'}):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                      >
                        Marcar todos
                      </button>
                      <span className="text-purple-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Pesquisar produto pelo nome..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-[#1A1D20] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5E1E]"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-purple-100">
                    {filteredProducts.length === 0 ? (
                      <p className="text-center py-4 text-[11px] text-purple-700">
                        Nenhum produto encontrado.
                      </p>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = targetProductIds.includes(p.id)
                        const cat = categories.find((c) => c.id === p.categoryId)

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProduct(p.id)}
                            className={`p-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-100/70 border border-purple-300'
                                : 'hover:bg-purple-100/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-700 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-[#1A1D20] text-xs truncate">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-[#6C757D]">
                                  {cat?.name || 'Geral'} • {formatCurrency(p.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-bold text-[#1A1D20]">
                  Status Inicial do Cupom
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#FF5E1E] focus:ring-[#FF5E1E] h-4 w-4 accent-[#FF5E1E]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Ativo imediatamente
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9ECEF] hover:bg-slate-50 text-[#6C757D] text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 cursor-pointer"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
