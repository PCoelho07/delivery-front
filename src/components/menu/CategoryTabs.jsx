import { useEffect, useRef } from 'react'

export function CategoryTabs({ categories, activeCategoryId, onSelectCategory }) {
  const containerRef = useRef(null)
  const tabRefs = useRef({})

  // Mantém o botão da categoria ativa visível no scroll horizontal
  useEffect(() => {
    const activeEl = tabRefs.current[activeCategoryId]
    const containerEl = containerRef.current
    if (activeEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()
      const scrollLeft =
        containerEl.scrollLeft +
        (activeRect.left - containerRect.left) -
        containerRect.width / 2 +
        activeRect.width / 2

      containerEl.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      })
    }
  }, [activeCategoryId])

  if (!categories || categories.length === 0) return null

  return (
    <nav
      ref={containerRef}
      aria-label="Categorias do cardápio"
      className="w-full bg-[#F8F9FA] px-4 pt-3 pb-2 flex items-center gap-2.5 overflow-x-auto no-scrollbar shrink-0"
    >
      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id
        return (
          <button
            key={cat.id}
            ref={(el) => {
              tabRefs.current[cat.id] = el
            }}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-[13px] whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? 'bg-[#FF5E1E] text-white font-semibold shadow-xs'
                : 'bg-white text-[#6C757D] font-medium hover:text-[#1A1D20] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
          >
            {cat.tabLabel}
          </button>
        )
      })}
    </nav>
  )
}

