import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  icon = null,
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
  variant = 'default', // 'default' | 'amber' | 'orange' | 'purple'
  direction = 'auto', // 'auto' | 'top' | 'bottom'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [autoOpenUpward, setAutoOpenUpward] = useState(false)
  const containerRef = useRef(null)

  // Disparado ao abrir o dropdown: calcula se cabe melhor acima ou abaixo
  const handleToggle = () => {
    if (disabled) return
    if (!isOpen && direction === 'auto' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setAutoOpenUpward(spaceBelow < 250 && spaceAbove > spaceBelow)
    }
    setIsOpen((prev) => !prev)
  }

  // Fecha ao clicar fora ou ao pressionar Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Localiza a opção selecionada (mesmo dentro de optgroups)
  const allFlatOptions = options.flatMap((opt) =>
    opt.group ? opt.items || [] : [opt]
  )
  const selectedOption = allFlatOptions.find((opt) => String(opt.value) === String(value))

  const handleSelect = (optValue) => {
    onChange?.(optValue)
    setIsOpen(false)
  }

  // Estilização por variante
  const variantStyles = {
    default:
      'bg-white border-[#E9ECEF] hover:border-slate-300 text-[#1A1D20] focus:border-[#FF5E1E]',
    amber:
      'bg-white border-amber-200/90 hover:border-amber-400 text-amber-950 focus:border-[#FF5E1E]',
    orange:
      'bg-white border-orange-200/90 hover:border-orange-400 text-[#1A1D20] focus:border-[#FF5E1E]',
    purple:
      'bg-white border-purple-200/90 hover:border-purple-400 text-purple-950 focus:border-[#FF5E1E]',
  }

  const isUpward = direction === 'top' || (direction === 'auto' && autoOpenUpward)

  const positionClasses = isUpward
    ? 'bottom-full mb-1.5'
    : 'top-full mt-1.5'

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Botão Gatilho do Dropdown */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs select-none text-left ${
          variantStyles[variant] || variantStyles.default
        } ${isOpen ? 'ring-2 ring-[#FF5E1E]/20 border-[#FF5E1E]' : ''} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#6C757D] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FF5E1E]' : ''
          }`}
        />
      </button>

      {/* Menu Flutuante Customizado */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 ${positionClasses} bg-white border border-[#E9ECEF] rounded-2xl shadow-xl shadow-slate-900/10 z-50 py-1.5 animate-fade-in max-h-56 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] ${menuClassName}`}
        >
          {options.map((opt, idx) => {
            if (opt.group) {
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="px-3.5 py-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#6C757D] bg-slate-50/80 border-y border-slate-100/60 mt-1 first:mt-0">
                    {opt.group}
                  </div>
                  {(opt.items || []).map((subOpt) => {
                    const isSelected = String(subOpt.value) === String(value)
                    return (
                      <div
                        key={subOpt.value}
                        onClick={() => handleSelect(subOpt.value)}
                        className={`px-3.5 py-2 mx-1 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#FFF3EE] text-[#FF5E1E] font-bold'
                            : 'text-[#1A1D20] hover:bg-[#F8F9FA] hover:text-[#FF5E1E] font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {subOpt.icon && (
                            <span className="shrink-0">{subOpt.icon}</span>
                          )}
                          <span className="truncate">{subOpt.label}</span>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-[#FF5E1E] shrink-0 stroke-[2.5]" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            }

            const isSelected = String(opt.value) === String(value)
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`px-3.5 py-2 mx-1 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#FFF3EE] text-[#FF5E1E] font-bold'
                    : 'text-[#1A1D20] hover:bg-[#F8F9FA] hover:text-[#FF5E1E] font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#FF5E1E] shrink-0 stroke-[2.5]" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
