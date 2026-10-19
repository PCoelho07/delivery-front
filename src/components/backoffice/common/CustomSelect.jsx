import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * CustomSelect - Componente de Dropdown Personalizado
 * Substitui o select nativo do navegador por um dropdown moderno,
 * acessível e estilizado com design tokens da aplicação.
 */
export function CustomSelect({
  value,
  onChange,
  options = [], // [{ value: 'id', label: 'Nome', desc?: 'Subtítulo', icon?: ReactNode }]
  placeholder = 'Selecione uma opção',
  label,
  helperText,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fecha o dropdown com tecla Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[#1A1D20] mb-1">
          {label} {required && <span className="text-[#FF5E1E]">*</span>}
        </label>
      )}

      {/* Botão Gatilho do Dropdown */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#F8F9FA] border rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen
            ? 'border-[#FF5E1E] bg-white ring-3 ring-[#FF5E1E]/10'
            : 'border-[#E9ECEF] hover:border-slate-300 hover:bg-white'
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="font-bold text-[#1A1D20] truncate">
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-[#6C757D] font-normal">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-[#6C757D] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#FF5E1E]' : ''
          }`}
        />
      </button>

      {/* Menu Flutuante de Opções */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#E9ECEF] rounded-2xl shadow-xl overflow-hidden py-1.5 max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn">
          {options.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-[#6C757D] text-center">
              Nenhuma opção cadastrada
            </div>
          ) : (
            options.map((option) => {
              const isSelected = String(option.value) === String(value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50 text-[#FF5E1E] font-bold'
                      : 'text-[#1A1D20] hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {option.icon && (
                      <span className="shrink-0 text-sm">{option.icon}</span>
                    )}
                    <div className="truncate">
                      <div className="font-bold text-[#1A1D20] truncate">
                        {option.label}
                      </div>
                      {option.desc && (
                        <div className="text-[10px] text-[#6C757D] truncate mt-0.5">
                          {option.desc}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#FF5E1E]/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#FF5E1E]" />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}

      {helperText && (
        <span className="text-[10px] text-[#6C757D] mt-1 block">
          {helperText}
        </span>
      )}
    </div>
  )
}

