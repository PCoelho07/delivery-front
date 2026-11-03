import { useState, useMemo } from 'react'
import {
  Images,
  Search,
  X,
  Check,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  STOCK_IMAGE_CATEGORIES,
  STOCK_IMAGES_CATALOG,
} from '../../../data/stockImagesData'

/**
 * Normaliza qualquer link do Unsplash para a URL otimizada do CDN
 */
function normalizeUnsplashUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return ''
  const trimmed = inputUrl.trim()

  // Se já for uma URL direta do images.unsplash.com
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const url = new URL(trimmed)
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      url.searchParams.set('w', '600')
      url.searchParams.set('q', '80')
      return url.toString()
    } catch {
      return trimmed
    }
  }

  // Se for um link de página do Unsplash: https://unsplash.com/photos/[slug-ou-id]
  const match = trimmed.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/)
  if (match && match[1]) {
    const rawId = match[1]
    const photoId = rawId.includes('-') ? rawId.split('-').pop() : rawId
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&q=80`
  }

  return trimmed
}

const UNSPLASH_SHORTCUTS = [
  { label: 'Refrigerantes em Lata', query: 'soda can' },
  { label: 'Copos com Refrigerante e Gelo', query: 'coca cola glass ice' },
  { label: 'Sucos Naturais e Polpas', query: 'fruit juice' },
  { label: 'Batata Frita e Porções', query: 'french fries' },
  { label: 'Hambúrgueres Artesanais', query: 'burger' },
  { label: 'Pizzas Artesanais', query: 'pizza' },
  { label: 'Açaí e Sobremesas', query: 'acai bowl dessert' },
  { label: 'Cervejas e Chopp', query: 'beer glass' },
]

export function StockImagePickerModal({
  isOpen,
  onClose,
  currentImageUrl = '',
  onSelectImage,
}) {
  const [activeTab, setActiveTab] = useState('catalogo') // 'catalogo' | 'custom_unsplash'
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')

  // Estado para o buscador / colador do Unsplash
  const [customUrlInput, setCustomUrlInput] = useState('')
  const [customPreviewUrl, setCustomPreviewUrl] = useState('')
  const [customNameInput, setCustomNameInput] = useState('')

  // Quantidade de fotos por categoria
  const countsByCategory = useMemo(() => {
    const counts = { todos: STOCK_IMAGES_CATALOG.length }
    STOCK_IMAGES_CATALOG.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [])

  // Imagens filtradas no catálogo
  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return STOCK_IMAGES_CATALOG.filter((item) => {
      const matchesCat =
        selectedCategory === 'todos' || item.category === selectedCategory

      if (!matchesCat) return false
      if (!query) return true

      const inName = item.name.toLowerCase().includes(query)
      const inTags = (item.tags || []).some((tag) =>
        tag.toLowerCase().includes(query)
      )
      return inName || inTags
    })
  }, [selectedCategory, searchQuery])

  if (!isOpen) return null

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) {
      toast.error('Cole um link de imagem do Unsplash ou da web.')
      return
    }

    const normalized = normalizeUnsplashUrl(customUrlInput.trim())
    setCustomPreviewUrl(normalized)
    toast.success('Foto carregada no preview!')
  }

  const handleConfirmCustomImage = () => {
    if (!customPreviewUrl) return
    onSelectImage({
      id: `custom-${Date.now()}`,
      name: customNameInput.trim() || 'Foto do Unsplash',
      url: customPreviewUrl,
    })
    toast.success('Foto aplicada com sucesso!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E9ECEF] animate-modal my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E9ECEF] flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-[#1A1D20]">
                  Banco de Fotos Profissionais
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Unsplash License · 100% Livre de Copyright</span>
                </span>
              </div>
              <p className="text-xs text-[#6C757D] truncate">
                Fotos de alta qualidade de refrigerantes, sucos, porções, lanches e sobremesas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas Principais (Catálogo Verificado vs Buscar no Unsplash) */}
        <div className="px-4 sm:px-5 pt-3 pb-0 bg-white border-b border-[#E9ECEF] flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'catalogo'
                ? 'text-[#FF5E1E]'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            <span>Galeria Pronta ({STOCK_IMAGES_CATALOG.length} fotos)</span>
            {activeTab === 'catalogo' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5E1E] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom_unsplash')}
            className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom_unsplash'
                ? 'text-[#FF5E1E]'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colar Link / Explorar no Unsplash</span>
            {activeTab === 'custom_unsplash' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5E1E] rounded-full" />
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* ABA 1: CATÁLOGO PRONTO & VERIFICADO                            */}
        {/* ============================================================== */}
        {activeTab === 'catalogo' && (
          <>
            {/* Barra de Busca e Filtros de Categoria */}
            <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#E9ECEF] bg-[#F8F9FA] space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar por nome ou ingrediente... Ex: coca cola, guarana, laranja, fanta, batata frita..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] text-xs font-medium text-[#1A1D20] outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#1A1D20] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {STOCK_IMAGE_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id
                  const count = countsByCategory[cat.id] || 0
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#FF5E1E] text-white shadow-xs'
                          : 'bg-white border border-[#E9ECEF] text-[#6C757D] hover:text-[#1A1D20] hover:border-slate-300'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          active
                            ? 'bg-white/25 text-white'
                            : 'bg-slate-100 text-[#6C757D]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Grid de Fotos */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-[#FDFDFD]">
              {filteredImages.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Images className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-[#1A1D20]">
                    Nenhuma foto encontrada para &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#6C757D]">
                    Tente buscar por outro termo ou navegue pela aba de &ldquo;Explorar no Unsplash&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredImages.map((img) => {
                    const isSelected = currentImageUrl === img.url

                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          onSelectImage(img)
                          onClose()
                        }}
                        className={`group text-left rounded-2xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col bg-white hover:shadow-md ${
                          isSelected
                            ? 'border-[#FF5E1E] ring-2 ring-[#FF5E1E]/20'
                            : 'border-[#E9ECEF] hover:border-[#FF5E1E]/60'
                        }`}
                      >
                        <div className="aspect-4/3 w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.name}
                            loading="lazy"
                            onError={(e) => {
                              // Fallback elegante se a imagem falhar
                              e.currentTarget.style.display = 'none'
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.classList.remove('hidden')
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 flex-col items-center justify-center p-2 text-center">
                            <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                            <span className="text-[10px] text-slate-400 font-bold">
                              Foto ilustrativa
                            </span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF5E1E] text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end justify-center p-2 opacity-0 group-hover:opacity-100">
                            <span className="px-2.5 py-1 rounded-lg bg-[#FF5E1E] text-white text-[10px] font-bold shadow-sm">
                              Usar esta foto
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <p className="text-[11px] font-bold text-[#1A1D20] leading-snug line-clamp-2">
                            {img.name}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* ABA 2: EXPLORAR NO UNSPLASH / COLAR LINK                      */}
        {/* ============================================================== */}
        {activeTab === 'custom_unsplash' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FDFDFD]">
            <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80 space-y-1.5 text-xs text-orange-950">
              <p className="font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF5E1E]" />
                <span>Sim! Você pode usar qualquer foto do Unsplash</span>
              </p>
              <p className="text-[11.5px] leading-relaxed text-orange-900">
                O Unsplash disponibiliza milhões de fotos gastronômicas gratuitas de alta qualidade sob licença comercial livre.
                Basta pesquisar, copiar o link da foto desejada e colar abaixo. Nós formatamos automaticamente para o tamanho ideal do cardápio!
              </p>
            </div>

            {/* Campo para colar link */}
            <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E9ECEF] shadow-2xs">
              <h4 className="text-xs font-extrabold text-[#1A1D20] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#FF5E1E]" />
                <span>Colar Link do Unsplash ou URL da Imagem</span>
              </h4>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://unsplash.com/photos/... ou https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E9ECEF] focus:border-[#FF5E1E] text-xs text-[#1A1D20] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2.5 rounded-xl bg-[#1A1D20] hover:bg-black text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Carregar Foto
                  </button>
                </div>

                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="Nome do item (opcional, ex: Coca-Cola Lata 350ml)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9ECEF] focus:border-[#FF5E1E] text-xs text-[#1A1D20] outline-none"
                />
              </div>

              {/* Preview ao vivo da foto colada */}
              {customPreviewUrl && (
                <div className="pt-3 border-t border-[#E9ECEF] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-24 rounded-xl overflow-hidden bg-slate-100 border border-[#E9ECEF] shrink-0">
                    <img
                      src={customPreviewUrl}
                      alt="Preview Unsplash"
                      className="w-full h-full object-cover"
                      onError={() => {
                        toast.error('Não foi possível carregar a imagem deste link.')
                        setCustomPreviewUrl('')
                      }}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-center sm:justify-start">
                      <Check className="w-3.5 h-3.5" />
                      <span>Foto validada com sucesso!</span>
                    </p>
                    <p className="text-[11px] text-[#6C757D] truncate max-w-md">
                      {customPreviewUrl}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleConfirmCustomImage}
                        className="px-4 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#e04f16] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Usar esta foto no produto
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Atalhos para Abrir Pesquisas Prontas no Unsplash */}
            <div className="space-y-2.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E9ECEF]">
              <h4 className="text-xs font-extrabold text-[#1A1D20] flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#6C757D]" />
                <span>Atalhos Rápidos de Busca no Unsplash (Abre em nova aba)</span>
              </h4>
              <p className="text-[11px] text-[#6C757D]">
                Clique em qualquer categoria abaixo para explorar milhares de fotos gratuitas no Unsplash. Depois, copie o link da foto e cole acima:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {UNSPLASH_SHORTCUTS.map((shortcut) => (
                  <a
                    key={shortcut.query}
                    href={`https://unsplash.com/s/photos/${encodeURIComponent(shortcut.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] hover:bg-white hover:border-[#FF5E1E] text-xs font-semibold text-[#1A1D20] hover:text-[#FF5E1E] transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{shortcut.label}</span>
                    <ExternalLink className="w-3 h-3 text-[#6C757D]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-[#6C757D]">
            {filteredImages.length} fotos prontas disponíveis na galeria
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#E9ECEF] bg-white hover:bg-slate-50 text-xs font-bold text-[#6C757D] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
