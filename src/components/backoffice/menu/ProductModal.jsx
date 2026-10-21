import { useState, useRef } from 'react'
import {
  PackagePlus,
  X,
  UploadCloud,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { compressImage } from '../../../utils/imageCompressor'
import { CustomSelect } from '../common/CustomSelect'
import { formatTitleCase } from '../../../utils/textUtils'

export function ProductModal({
  isOpen,
  onClose,
  productToEdit = null,
  initialCategoryId = '',
}) {
  const { categories, templates, products, addProduct, updateProduct } =
    useStoreAdmin()

  const defaultCategory =
    initialCategoryId || productToEdit?.categoryId || categories[0]?.id || ''

  // Calcula a próxima ordem automaticamente para esta categoria (ex: se já tem 1, o próximo é 2)
  const defaultOrder =
    productToEdit?.order !== undefined
      ? productToEdit.order
      : (products?.filter((p) => p.categoryId === defaultCategory)?.length || 0) + 1

  // Form states
  const [name, setName] = useState(productToEdit?.name || '')
  const [categoryId, setCategoryId] = useState(defaultCategory)
  const [templateId, setTemplateId] = useState(
    productToEdit?.templateId || 'tmpl-none'
  )
  const [desc, setDesc] = useState(productToEdit?.desc || '')
  const [price, setPrice] = useState(
    productToEdit?.price !== undefined ? String(productToEdit.price) : ''
  )
  const [order, setOrder] = useState(defaultOrder)
  // Ativado (disponível) ou Esgotado (indisponível)
  const [isAvailable, setIsAvailable] = useState(
    productToEdit?.available ?? true
  )

  // Ao trocar de categoria em um novo produto, atualiza automaticamente a ordem
  const handleCategoryChange = (newCatId) => {
    setCategoryId(newCatId)
    if (!productToEdit) {
      const prodsInCat = products.filter((p) => p.categoryId === newCatId)
      setOrder(prodsInCat.length + 1)
    }
  }

  // Imagem & Compressão
  const [imagePreview, setImagePreview] = useState(
    productToEdit?.image || ''
  )
  const [compressionInfo, setCompressionInfo] = useState(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // Handler de upload com compressão automática no front
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    try {
      const result = await compressImage(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.8,
        mimeType: 'image/webp',
      })

      setImagePreview(result.dataUrl)
      setCompressionInfo({
        originalSizeKB: result.originalSizeKB,
        sizeKB: result.sizeKB,
        savedPercent: Math.max(
          0,
          Math.round(
            ((result.originalSizeKB - result.sizeKB) /
              (result.originalSizeKB || 1)) *
              100
          )
        ),
      })
      toast.success(
        `Foto otimizada! Reduzida para ${result.sizeKB} KB (${result.originalSizeKB > result.sizeKB ? 'redução de peso aplicada' : 'ótima qualidade'}).`
      )
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível processar a foto. Tente outra imagem.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    setImagePreview(urlInput.trim())
    setCompressionInfo(null)
    setUrlInput('')
    setIsUrlInputOpen(false)
    toast.success('Link da imagem aplicado!')
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setCompressionInfo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o nome do produto.')
      return
    }

    if (!categoryId) {
      toast.error('Selecione uma categoria de vitrine para o produto.')
      return
    }

    const numericPrice = parseFloat(String(price).replace(',', '.'))
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error('Informe um preço de venda válido.')
      return
    }

    const formattedName = formatTitleCase(name)

    const productPayload = {
      name: formattedName,
      categoryId,
      templateId,
      desc: desc.trim(),
      price: numericPrice,
      order: Number(order) || 1,
      available: isAvailable,
      image: imagePreview || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, productPayload)
      toast.success(`Produto "${formattedName}" atualizado com sucesso!`)
    } else {
      addProduct(productPayload)
      toast.success(`Produto "${formattedName}" cadastrado na vitrine!`)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E9ECEF] animate-modal my-auto overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold">
              <PackagePlus className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                {productToEdit ? 'Editar Produto da Vitrine' : 'Novo Produto na Vitrine'}
              </h3>
              <p className="text-xs text-[#6C757D]">
                Cadastre informações, foto compactada e vincule aos adicionais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body com scroll */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar"
        >
          {/* Seção 1: Upload com Compressão Automática & Pré-visualização */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1.5">
              Foto do Produto (Otimização Automática)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
              {/* Preview Box */}
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-[#E9ECEF] bg-white overflow-hidden relative shrink-0 flex items-center justify-center group shadow-xs">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Prévia do Produto"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-5 h-5 text-rose-400" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2 text-[#6C757D]">
                    <UploadCloud className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span className="text-[10px] font-bold block leading-tight">
                      Sem foto
                    </span>
                  </div>
                )}
              </div>

              {/* Controles de Foto */}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="prod-file-upload"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="prod-file-upload"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#FF5E1E] text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] transition-all shadow-xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-[#FF5E1E]" />
                    <span>{isCompressing ? 'Compactando...' : 'Carregar Foto'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E9ECEF] hover:bg-slate-100 text-xs font-semibold text-[#6C757D] transition-all cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Colar Link</span>
                  </button>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Remover
                    </button>
                  )}
                </div>

                {/* Badge de Compressão */}
                {compressionInfo && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Foto compactada: <strong>{compressionInfo.sizeKB} KB</strong>{' '}
                      (reduzida de {compressionInfo.originalSizeKB} KB para carregamento rápido)
                    </span>
                  </div>
                )}

                {/* Campo para Colar Link de Imagem */}
                {isUrlInputOpen && (
                  <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/foto-do-lanche.jpg"
                      className="flex-1 bg-white border border-[#E9ECEF] rounded-xl px-3 py-1.5 text-xs text-[#1A1D20] outline-none focus:border-[#FF5E1E]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-[#FF5E1E] text-white rounded-xl text-xs font-bold hover:bg-[#E64E12] transition-colors cursor-pointer"
                    >
                      Usar
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-[#6C757D]">
                  Fotos pesadas são automaticamente otimizadas em WebP para que o cardápio abra instantaneamente no celular do cliente.
                </p>
              </div>
            </div>
          </div>

          {/* Seção 2: Nome do Produto */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Brasa Burger Especial, Pizza Margherita, Açaí 500ml"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-semibold outline-none transition-all"
            />
          </div>

          {/* Seção 3: Categoria de Vitrine & Template de Adicionais (Dropdown Personalizado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoria da Vitrine (CustomSelect) */}
            {categories.length > 0 ? (
              <CustomSelect
                label="Categoria da Vitrine (Onde aparece)"
                required
                value={categoryId}
                onChange={handleCategoryChange}
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  desc:
                    c.status === 'active'
                      ? '🟢 Categoria ativa no menu'
                      : '⚪ Oculta na vitrine',
                }))}
                placeholder="Selecione a categoria..."
                helperText="Define em qual aba do menu este item ficará listado."
              />
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Categoria da Vitrine *
                </label>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Cadastre primeiro uma Categoria na Vitrine.</span>
                </div>
              </div>
            )}

            {/* Template de Adicionais (CustomSelect) */}
            <CustomSelect
              label="Template de Adicionais / Complementos"
              value={templateId}
              onChange={(val) => setTemplateId(val)}
              options={templates.map((t) => ({
                value: t.id,
                label: t.name,
                desc: t.desc,
              }))}
              placeholder="Selecione o template..."
              helperText="Define quais grupos de complementos abrem ao clicar."
            />

            {/* Pré-visualização dos Grupos Herdados do Template */}
            {(() => {
              const currentTmpl = templates.find((t) => t.id === templateId)
              const tmplGroups = currentTmpl?.groups || []

              if (templateId === 'tmpl-none' || tmplGroups.length === 0) {
                return (
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-[11px] text-[#6C757D] italic flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Este produto não terá adicionais (vai direto para a sacola).</span>
                  </div>
                )
              }

              return (
                <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5E1E]" />
                      <span>Complementos herdados deste template ({tmplGroups.length}):</span>
                    </span>
                    <span className="text-[10px] font-extrabold bg-[#FF5E1E] text-white px-2 py-0.5 rounded-full">
                      {currentTmpl.name}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {tmplGroups.map((grp, idx) => (
                      <div
                        key={grp.id || idx}
                        className="flex items-center justify-between text-xs py-1 border-b border-orange-200/40 last:border-b-0"
                      >
                        <span className="font-bold text-orange-950 text-[11px]">
                          ✓ {grp.name}{' '}
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded ml-1 ${
                              grp.required
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {grp.required ? 'Obrigatório' : 'Opcional'}
                          </span>
                        </span>
                        <span className="text-[10px] text-orange-900/80">
                          {grp.items?.length || 0} opções
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Seção 4: Descrição do Produto */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Descrição dos Ingredientes / Detalhes
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Pão artesanal tostado, 180g de blend bovino suculento, queijo cheddar derretido, bacon fatiado crocante e maionese especial da casa."
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl p-3 text-xs text-[#1A1D20] outline-none transition-all resize-none"
            />
          </div>

          {/* Seção 5: Preço de Venda e Ordem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preço de Venda */}
            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Preço de Venda (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6C757D]">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="34,90"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1D20] font-black outline-none"
                />
              </div>
              <span className="text-[10px] text-[#6C757D] mt-1 block">
                Valor do item exibido no cardápio
              </span>
            </div>

            {/* Ordem de Exibição na Categoria */}
            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Ordem na Vitrine *
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2.5 text-xs text-[#1A1D20] font-black text-center outline-none"
              />
              <span className="text-[10px] text-[#6C757D] mt-1 block text-center">
                Posição dentro desta categoria
              </span>
            </div>
          </div>

          {/* Seção 6: Status de Disponibilidade (Ativado no cardápio ou Esgotado) */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1.5">
              Disponibilidade no Cardápio
            </label>
            <div
              onClick={() => setIsAvailable(!isAvailable)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isAvailable
                  ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50'
                  : 'bg-rose-50/50 border-rose-300 hover:bg-rose-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-extrabold ${
                      isAvailable ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {isAvailable
                      ? '🟢 Ativado / Disponível no Cardápio'
                      : '🔴 Esgotado / Indisponível no Momento'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6C757D] mt-0.5">
                  {isAvailable
                    ? 'Clientes podem ver e adicionar à sacola normalmente'
                    : 'Aparece como "Esgotado" e impede que os clientes façam pedidos deste item'}
                </p>
              </div>

              {/* Switch deslizante tipo iOS */}
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsAvailable(!isAvailable)
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Alternar disponibilidade</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E9ECEF] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCompressing || categories.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#FF5E1E]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

