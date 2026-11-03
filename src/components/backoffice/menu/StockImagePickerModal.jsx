import { useState, useMemo } from 'react'
import { Images, Search, X, Check, ShieldCheck } from 'lucide-react'
import {
  STOCK_IMAGE_CATEGORIES,
  STOCK_IMAGES_CATALOG,
} from '../../../data/stockImagesData'

export function StockImagePickerModal({
  isOpen,
  onClose,
  currentImageUrl = '',
  onSelectImage,
}) {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#E9ECEF] animate-modal my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E9ECEF] flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-[#1A1D20]">
                  Banco de Fotos Gratuitas
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sem Copyright · Uso Livre</span>
                </span>
              </div>
              <p className="text-xs text-[#6C757D] truncate">
                Escolha fotos prontas de sucos, refrigerantes, porções e acompanhamentos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Busca e Abas de Categoria */}
        <div className="px-4 sm:px-5 pt-3.5 pb-3 border-b border-[#E9ECEF] bg-[#F8F9FA] space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar foto... Ex: suco de laranja, refrigerante lata, batata frita, água, açaí..."
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

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {STOCK_IMAGE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#FF5E1E] text-white shadow-xs'
                      : 'bg-white border border-[#E9ECEF] text-[#6C757D] hover:text-[#1A1D20] hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid de Fotos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {filteredImages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Images className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-[#1A1D20]">
                Nenhuma foto encontrada para &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-[11px] text-[#6C757D]">
                Tente buscar por outro termo ou selecione a aba &ldquo;Todos&rdquo;.
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF5E1E] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center p-2 opacity-0 group-hover:opacity-100">
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

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-[#6C757D]">
            {filteredImages.length} {filteredImages.length === 1 ? 'foto disponível' : 'fotos disponíveis'} para uso comercial gratuito
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

