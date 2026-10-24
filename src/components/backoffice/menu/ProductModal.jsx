import { useState, useRef, useMemo } from 'react'
import {
  PackagePlus,
  X,
  UploadCloud,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Pencil,
  Sliders,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { compressImage } from '../../../utils/imageCompressor'
import { CustomSelect } from '../common/CustomSelect'
import { formatTitleCase } from '../../../utils/textUtils'
import { ProductConfigModal } from './ProductConfigModal'

export function ProductModal({
  isOpen,
  onClose,
  productToEdit = null,
  initialCategoryId = '',
}) {
  const {
    categories,
    templates,
    products,
    addProduct,
    updateProduct,
  } = useStoreAdmin()

  const defaultCategory =
    initialCategoryId || productToEdit?.categoryId || categories[0]?.id || ''

  // Próxima ordem automática para esta categoria
  const defaultOrder =
    productToEdit?.order !== undefined
      ? productToEdit.order
      : (products?.filter((p) => p.categoryId === defaultCategory)?.length || 0) + 1

  // === DADOS DO PRODUTO ===
  const [name, setName] = useState(productToEdit?.name || '')
  const [categoryId, setCategoryId] = useState(defaultCategory)
  const [desc, setDesc] = useState(productToEdit?.desc || '')
  const [price, setPrice] = useState(
    productToEdit?.price !== undefined ? String(productToEdit.price) : ''
  )
  const [order, setOrder] = useState(defaultOrder)
  const [isAvailable, setIsAvailable] = useState(
    productToEdit?.available ?? true
  )

  // Configuração selecionada: por padrão 'tmpl-none' (Sem Adicional)
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    productToEdit?.templateId || 'tmpl-none'
  )

  // Controle do Submodal de Adicionar / Editar Configuração
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [configToEdit, setConfigToEdit] = useState(null)

  // Ao trocar de categoria em novo produto, recalcula a ordem sugerida
  const handleCategoryChange = (newCatId) => {
    setCategoryId(newCatId)
    if (!productToEdit) {
      const prodsInCat = products.filter((p) => p.categoryId === newCatId)
      setOrder(prodsInCat.length + 1)
    }
  }

  // === FOTO & COMPRESSÃO ===
  const [imagePreview, setImagePreview] = useState(productToEdit?.image || '')
  const [compressionInfo, setCompressionInfo] = useState(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)

  // Lista de configurações disponíveis
  const availableConfigs = useMemo(
    () => templates.filter((t) => t.id !== 'tmpl-none'),
    [templates]
  )

  // Opções formatadas para o CustomSelect de configurações
  const configSelectOptions = useMemo(
    () => [
      {
        value: 'tmpl-none',
        label: '🚫 Sem Adicional (Padrão)',
        desc: 'Produto simples, vai direto para a sacola ao clicar',
      },
      ...availableConfigs.map((cfg) => {
        const gCount = cfg.groups?.length || 0
        const groupNames = (cfg.groups || [])
          .map((g) => g.name)
          .filter(Boolean)
          .slice(0, 3)
          .join(', ')
        return {
          value: cfg.id,
          label: `${cfg.name} (${gCount} ${gCount === 1 ? 'grupo' : 'grupos'})`,
          desc: groupNames ? `Grupos: ${groupNames}` : `${gCount} grupos de opções`,
        }
      }),
    ],
    [availableConfigs]
  )

  // Configuração ativa selecionada
  const activeConfig = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  )

  // Abrir modal para Criar Nova Configuração
  const handleOpenCreateConfig = () => {
    setConfigToEdit(null)
    setIsConfigModalOpen(true)
  }

  // Abrir modal para Editar Configuração selecionada
  const handleOpenEditConfig = () => {
    if (!activeConfig || activeConfig.id === 'tmpl-none') return
    setConfigToEdit(activeConfig)
    setIsConfigModalOpen(true)
  }

  // Quando a configuração for salva no submodal, atualiza e auto-seleciona
  const handleConfigSaved = (savedConfig) => {
    if (savedConfig && savedConfig.id) {
      setSelectedTemplateId(savedConfig.id)
    }
  }

  // Handlers de Imagem
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
      toast.success(`Foto compactada para ${result.sizeKB} KB!`)
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
    toast.success('Link da foto aplicado!')
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setCompressionInfo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Submit do formulário do produto
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o nome do produto.')
      return
    }

    if (!categoryId) {
      toast.error('Selecione uma categoria do cardápio para o produto.')
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
      templateId: selectedTemplateId || 'tmpl-none',
      desc: desc.trim(),
      price: numericPrice,
      order: Number(order) || 1,
      available: isAvailable,
      image:
        imagePreview ||
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, productPayload)
      toast.success(`Produto "${formattedName}" atualizado com sucesso!`)
    } else {
      addProduct(productPayload)
      toast.success(`Produto "${formattedName}" cadastrado no cardápio!`)
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E9ECEF] animate-modal my-auto overflow-hidden">
          {/* Header do Modal */}
          <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold">
                <PackagePlus className="w-5 h-5 text-[#FF5E1E]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1A1D20]">
                  {productToEdit
                    ? 'Editar Produto da Vitrine'
                    : 'Cadastrar Produto no Cardápio'}
                </h3>
                <p className="text-xs text-[#6C757D]">
                  Cadastre informações, fotos e selecione a configuração de opcionais
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body - Único, limpo e direto */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
              {/* Seção 1: Foto do Produto */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1.5">
                  Foto do Produto (Otimização Automática)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#E9ECEF] bg-white overflow-hidden relative shrink-0 flex items-center justify-center group shadow-xs">
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
                        <span>
                          {isCompressing
                            ? 'Compactando...'
                            : 'Carregar Foto do Computador'}
                        </span>
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

                    {compressionInfo && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Foto compactada para <strong>{compressionInfo.sizeKB} KB</strong>.
                        </span>
                      </div>
                    )}

                    {isUrlInputOpen && (
                      <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://exemplo.com/foto.jpg"
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
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-semibold placeholder:font-normal placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              {/* Seção 3: Categoria no Cardápio */}
              <div>
                {categories.length > 0 ? (
                  <CustomSelect
                    label="Categoria no Cardápio (Onde o produto será exibido) *"
                    required
                    value={categoryId}
                    onChange={handleCategoryChange}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                      desc:
                        c.status === 'active'
                          ? '🟢 Visível aos clientes no cardápio'
                          : '⚪ Oculta na vitrine',
                    }))}
                    placeholder="Selecione a categoria..."
                    helperText="O produto ficará listado dentro desta categoria na vitrine."
                  />
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                      Categoria no Cardápio *
                    </label>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Cadastre primeiro uma Categoria no menu.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção 4: Preço Base de Venda e Ordem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                    Preço Base de Venda (R$) *
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                        price ? 'font-black text-[#1A1D20]' : 'font-medium text-slate-400'
                      }`}
                    >
                      R$
                    </span>
                    <input
                      type="text"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1A1D20] font-black placeholder:font-normal placeholder:text-slate-300 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                    Posição / Ordem na Categoria *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    required
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-black outline-none text-center"
                  />
                </div>
              </div>

              {/* Seção 5: Descrição dos Ingredientes */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Descrição dos Ingredientes / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex: Pão artesanal selado na manteiga, 180g de blend suculento, queijo cheddar inglês e molho especial."
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl p-3 text-xs text-[#1A1D20] placeholder:font-normal placeholder:text-slate-400 outline-none transition-all resize-none"
                />
              </div>

              {/* ============================================================ */}
              {/* SEÇÃO 6: CONFIGURAÇÃO DE OPCIONAIS / COMPLEMENTOS */}
              {/* ============================================================ */}
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-4 sm:p-5 space-y-3">
                <div>
                  <label className="text-xs font-extrabold text-[#1A1D20] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#FF5E1E]" />
                    <span>Configuração de Opcionais do Produto</span>
                  </label>
                </div>

                {/* Dropdown Estilizado com CustomSelect + Botão 'Adicionar Configuração' */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
                  <div className="flex-1">
                    <CustomSelect
                      value={selectedTemplateId}
                      onChange={(val) => setSelectedTemplateId(val)}
                      options={configSelectOptions}
                      placeholder="Selecione a configuração..."
                    />
                  </div>

                  {/* Botão Adicionar Configuração */}
                  <button
                    type="button"
                    onClick={handleOpenCreateConfig}
                    className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF5E1E] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs h-[42px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Configuração</span>
                  </button>
                </div>

                {/* Feedback / Resumo Visual da Configuração Selecionada */}
                {activeConfig && activeConfig.id !== 'tmpl-none' ? (
                  <div className="p-3 rounded-xl bg-white border border-orange-200 text-xs text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                      <div>
                        <span className="font-extrabold text-[#1A1D20]">
                          {activeConfig.name}
                        </span>
                        <span className="text-[#6C757D] text-[11px] block">
                          {activeConfig.groups?.length || 0}{' '}
                          {(activeConfig.groups?.length || 0) === 1
                            ? 'grupo configurado'
                            : 'grupos configurados'}{' '}
                          ({(activeConfig.groups || []).map((g) => g.name).filter(Boolean).join(', ')})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenEditConfig}
                      className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF5E1E] border border-orange-200 text-[11px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Editar Configuração</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6C757D] leading-tight">
                    Por padrão, o produto é cadastrado <strong>sem adicionais</strong> (vai direto para a sacola ao ser clicado pelo cliente).
                  </p>
                )}
              </div>

              {/* Seção 7: Disponibilidade no Cardápio (Ativado / Esgotado) */}
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
                        ? 'Ativado / Disponível no Cardápio'
                        : 'Esgotado / Indisponível no Momento'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C757D] mt-0.5">
                    {isAvailable
                      ? 'Clientes podem ver e pedir normalmente no cardápio'
                      : 'Aparece como "Esgotado" bloqueando novos pedidos'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isAvailable}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAvailable(!isAvailable)
                  }}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                      isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Rodapé Fixo */}
            <div className="p-4 sm:p-5 border-t border-[#E9ECEF] flex items-center justify-end gap-2.5 shrink-0 bg-white">
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
                className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#FF5E1E]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Submodal para Adicionar / Editar Configuração */}
      {isConfigModalOpen && (
        <ProductConfigModal
          key={configToEdit ? configToEdit.id : 'new-config'}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          configToEdit={configToEdit}
          onSaveSuccess={handleConfigSaved}
        />
      )}
    </>
  )
}
