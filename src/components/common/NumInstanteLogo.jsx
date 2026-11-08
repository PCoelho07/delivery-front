/**
 * Componente Oficial de Marca e Logo NumInstante
 *
 * Renderiza o ícone vetorial da cloche com linhas de velocidade e vapor,
 * e a tipografia característica "Num" + "Instante".
 */
export function NumInstanteIcon({ className = 'w-8 h-8', color = '#FF5E1E' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NumInstante Logo"
    >
      {/* Linhas de Velocidade / Motion Streaks à esquerda */}
      <path d="M6 28h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M3 35h18" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M8 42h15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 49h10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Chamas de Vapor / Fumaça saindo da cloche */}
      <path
        d="M48 16c1.2-3.8-1.5-6.5 0.5-10 1.6 3.5 3.5 5.5 2 9.5-0.8 2.2-2.5 0.5-2.5 0.5z"
        fill={color}
      />
      <path
        d="M54 18c1-3.2-1.2-5.4 0.4-8.2 1.3 2.9 2.8 4.5 1.6 7.8-0.6 1.8-2 0.4-2 0.4z"
        fill={color}
      />

      {/* Puxador da Tampa */}
      <circle cx="41" cy="20.5" r="3" fill={color} />

      {/* Cúpula / Cloche */}
      <path d="M23 44c0.8-13.5 9-19 18-19s17.2 5.5 18 19z" fill={color} />

      {/* Brilho da Curvatura */}
      <path
        d="M52 42c0-8.5-4.5-13.5-11-15"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Bandeja / Base da Cloche */}
      <path
        d="M19 46.5h44c1.2 0 1.8 1 1.2 2.2l-2.4 4c-0.4 0.8-1.2 1.3-2.1 1.3H22.3c-0.9 0-1.7-0.5-2.1-1.3l-2.4-4c-0.6-1.2 0-2.2 1.2-2.2z"
        fill={color}
      />
    </svg>
  )
}

export function NumInstanteLogo({
  variant = 'full', // 'full' | 'icon' | 'image'
  size = 'md', // 'sm' | 'md' | 'lg'
  badge = null,
  dark = false,
  className = '',
}) {
  if (variant === 'image') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/brand/numinstante-logo.jpg"
          alt="NumInstante Delivery"
          className={
            size === 'sm'
              ? 'h-7 object-contain rounded-lg'
              : size === 'lg'
                ? 'h-12 object-contain rounded-xl'
                : 'h-9 object-contain rounded-lg'
          }
        />
        {badge && (
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white">
            {badge}
          </span>
        )}
      </div>
    )
  }

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  if (variant === 'icon') {
    return (
      <div className={`shrink-0 ${className}`}>
        <NumInstanteIcon className={iconSizes[size] || iconSizes.md} />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* Símbolo Cloche */}
      <div className="shrink-0 flex items-center justify-center">
        <NumInstanteIcon className={iconSizes[size] || iconSizes.md} />
      </div>

      {/* Tipografia da Marca */}
      <div className="flex items-center gap-1.5 leading-none select-none">
        <span
          className={`font-black tracking-tight italic ${textSizes[size] || textSizes.md} ${
            dark ? 'text-white' : 'text-[#1A1D20]'
          }`}
        >
          Num<span className="text-[#FF5E1E]">Instante</span>
        </span>

        {badge && (
          <span
            className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
              dark
                ? 'bg-white/20 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
