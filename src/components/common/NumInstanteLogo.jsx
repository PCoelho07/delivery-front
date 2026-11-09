/**
 * Componente Oficial de Marca e Logo NumInstante
 *
 * Utiliza diretamente a imagem oficial transparente fornecida pelo usuário.
 */
export function NumInstanteIcon({ className = 'w-8 h-8 object-contain', alt = 'NumInstante' }) {
  return (
    <img
      src="/brand/numinstante-icon.png"
      alt={alt}
      className={`shrink-0 select-none object-contain ${className}`}
    />
  )
}

export function NumInstanteLogo({
  variant = 'full', // 'full' | 'icon'
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  badge = null,
  dark = false,
  className = '',
  alt = 'NumInstante Delivery',
}) {
  const logoHeights = {
    xs: 'h-5',
    sm: 'h-7',
    md: 'h-9 sm:h-10',
    lg: 'h-12 sm:h-14',
    xl: 'h-18',
  }

  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  }

  if (variant === 'icon') {
    return (
      <img
        src="/brand/numinstante-icon.png"
        alt={alt}
        className={`shrink-0 select-none object-contain ${iconSizes[size] || iconSizes.md} ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/brand/numinstante-logo.png"
        alt={alt}
        className={`w-auto select-none object-contain ${logoHeights[size] || logoHeights.md}`}
      />
      {badge && (
        <span
          className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
            dark ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  )
}
