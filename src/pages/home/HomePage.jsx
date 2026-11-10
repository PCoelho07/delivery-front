import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Smartphone,
  KanbanSquare,
  BarChart3,
  Compass,
  Headset,
  Menu,
  X,
  ChevronRight,
  FileText,
  ShieldCheck,
  LogIn,
  BellRing,
} from 'lucide-react'
import { LegalModal } from '../../components/common/LegalModal'

// Ícone Oficial do Instagram em SVG
export function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

// Ícone Oficial do WhatsApp em formato SVG vetorial reutilizável
export function WhatsAppIcon({ className = 'w-4 h-4 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 0 0 1.333 4.993L2 22l5.233-1.237a9.994 9.994 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.935 9.935 0 0 0 12.031 2Zm5.829 14.12c-.246.693-1.432 1.325-1.988 1.411-.513.079-1.163.112-1.876-.115-.433-.138-.988-.321-1.7-.628-2.99-1.291-4.943-4.301-5.092-4.501-.149-.199-1.216-1.617-1.216-3.084 0-1.467.768-2.189 1.04-2.487.273-.299.595-.373.793-.373.198 0 .397.002.57.01.183.009.428-.069.669.512.248.597.842 2.063.916 2.212.075.149.124.323.025.522-.099.199-.149.323-.298.497-.148.174-.313.389-.446.522-.149.149-.304.31-.131.608.173.298.77 1.271 1.653 2.058 1.136 1.013 2.094 1.327 2.392 1.476.298.149.471.124.645-.075.173-.199.743-.869.941-1.168.198-.298.397-.248.669-.149.273.099 1.735.818 2.032.967.298.149.496.224.57.348.075.124.075.72-.171 1.413Z" />
    </svg>
  )
}

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&auto=format&fit=crop&q=75',
    tag: 'Hamburguerias & Lanchonetes',
    title: 'Combos, adicionais e ponto da carne: seu cliente escolhe tudo sozinho sem errar.',
  },
  {
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640&auto=format&fit=crop&q=75',
    tag: 'Pizzarias & Restaurantes',
    title: 'Sabores meio a meio e bordas recheadas direto na impressora da sua cozinha.',
  },
  {
    image: 'https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?w=640&auto=format&fit=crop&q=75',
    tag: 'Açaíterias, Sushis & Docerias',
    title: 'Montagem de complementos passo a passo com total controle das etapas do pedido.',
  },
]

const CURRENT_YEAR = new Date().getFullYear()

export function HomePage() {
  const scrollContainerRef = useRef(null)

  const [activeNav, setActiveNav] = useState('inicio')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [legalModal, setLegalModal] = useState(null) // null | 'terms' | 'privacy'

  // Carrossel com rotação automática a cada 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  // Animação de Scroll Reveal (elementos surgindo conforme a rolagem)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      {
        root: container,
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px',
      }
    )

    const elements = container.querySelectorAll('.reveal')
    elements.forEach((el) => revealObserver.observe(el))

    // A primeira dobra (Início / Hero) já fica visível imediatamente
    const heroEls = document.getElementById('inicio')?.querySelectorAll('.reveal')
    heroEls?.forEach((el) => el.classList.add('revealed'))

    return () => revealObserver.disconnect()
  }, [])

  // Atualização dinâmica da aba ativa conforme a rolagem
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const sections = ['inicio', 'sobre-nos', 'funcionalidades', 'planos']
    const containerTop = container.scrollTop

    for (const id of sections) {
      const el = document.getElementById(id)
      if (el) {
        const top = el.offsetTop - 120
        const height = el.offsetHeight
        if (containerTop >= top && containerTop < top + height) {
          setActiveNav(id)
          break
        }
      }
    }
  }

  // Rolagem suave e precisa para as seções (alinhada exatamente ao título do tópico)
  const scrollToSection = (e, sectionId) => {
    if (e) e.preventDefault()
    setMobileMenuOpen(false)

    if (sectionId === 'inicio') {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setActiveNav('inicio')
      return
    }

    // Executa após o fechamento do menu mobile para garantir medição precisa do topo
    setTimeout(() => {
      const target = document.getElementById(sectionId)
      const container = scrollContainerRef.current
      if (!target || !container) return

      // Revela imediatamente todos os elementos animados da seção alvo
      target.classList.add('revealed')
      target.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'))

      // Altura da barra superior fixa fechada (sem o menu mobile aberto)
      const isDesktop = window.innerWidth >= 768
      const headerBar = container.querySelector('header .max-w-7xl')
      const headerHeight = headerBar?.offsetHeight || (isDesktop ? 80 : 64)

      // Posição absoluta exata do topo da seção dentro do container
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const targetAbsoluteTop = targetRect.top - containerRect.top + container.scrollTop

      // No desktop, compensação suave para centralizar o bloco (título + cards) com respiro visual equilibrado
      const desktopOffset = 30
      const scrollOffset = isDesktop ? headerHeight - desktopOffset : headerHeight + 12

      container.scrollTo({
        top: Math.max(0, Math.round(targetAbsoluteTop - scrollOffset)),
        behavior: 'smooth',
      })

      setActiveNav(sectionId)
    }, 40)
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-white scroll-smooth selection:bg-[#FF5E1E] selection:text-white"
    >
      {/* =========================================================================
          1. HEADER (CABEÇALHO RESPONSIVO DESKTOP + MOBILE)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E9ECEF] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo Oficial Alinhada à Esquerda */}
          <a
            href="#inicio"
            onClick={(e) => scrollToSection(e, 'inicio')}
            className="flex items-center shrink-0 group"
          >
            <img
              src="/brand/numinstante-logo.png"
              alt="NumInstante"
              width="648"
              height="133"
              className="h-10 sm:h-11 lg:h-12 w-auto object-contain select-none transition-transform duration-300 md:group-hover:scale-[1.015]"
            />
          </a>

          {/* Links de Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-bold text-[#6C757D]">
            {[
              { id: 'inicio', label: 'Início' },
              { id: 'sobre-nos', label: 'Sobre Nós' },
              { id: 'funcionalidades', label: 'Funcionalidades' },
              { id: 'planos', label: 'Planos' },
            ].map((link) => {
              const isActive = activeNav === link.id
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`nav-link px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-[#FF5E1E] bg-[#FFF4EE] font-black'
                      : 'text-[#6C757D] hover:text-[#FF5E1E] hover:bg-[#FFF4EE]/60'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          {/* Ações à Direita (Desktop + Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20NumInstante%20e%20quero%20conhecer%20o%20sistema%20para%20o%20meu%20delivery."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hover-zoom hidden lg:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-[#25D366] hover:border-[#25D366] text-emerald-800 hover:text-white text-xs font-black shadow-2xs"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-white" />
              <span>Falar no WhatsApp</span>
            </a>

            <Link
              to="/login"
              className="btn-hover-zoom inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#FF5E1E]/25"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>

            {/* Botão Menu Hamburger Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu"
              className="md:hidden p-2 rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] text-[#1A1D20] hover:border-[#FF5E1E] hover:text-[#FF5E1E] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Gaveta de Navegação Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E9ECEF] px-4 pt-3 pb-5 space-y-2 shadow-xl animate-modal-up">
            <a
              href="#inicio"
              onClick={(e) => scrollToSection(e, 'inicio')}
              className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm text-[#1A1D20] hover:bg-[#FFF4EE] hover:text-[#FF5E1E] transition-colors"
            >
              <span>Início</span>
              <ChevronRight className="w-4 h-4 text-[#6C757D]" />
            </a>
            <a
              href="#sobre-nos"
              onClick={(e) => scrollToSection(e, 'sobre-nos')}
              className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm text-[#1A1D20] hover:bg-[#FFF4EE] hover:text-[#FF5E1E] transition-colors"
            >
              <span>Sobre Nós (Nossa História)</span>
              <ChevronRight className="w-4 h-4 text-[#6C757D]" />
            </a>
            <a
              href="#funcionalidades"
              onClick={(e) => scrollToSection(e, 'funcionalidades')}
              className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm text-[#1A1D20] hover:bg-[#FFF4EE] hover:text-[#FF5E1E] transition-colors"
            >
              <span>Funcionalidades do Sistema</span>
              <ChevronRight className="w-4 h-4 text-[#6C757D]" />
            </a>
            <a
              href="#planos"
              onClick={(e) => scrollToSection(e, 'planos')}
              className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm text-[#1A1D20] hover:bg-[#FFF4EE] hover:text-[#FF5E1E] transition-colors"
            >
              <span>Planos por Faturamento</span>
              <ChevronRight className="w-4 h-4 text-[#6C757D]" />
            </a>

            <div className="pt-2 border-t border-[#E9ECEF] flex flex-col gap-2.5">
              <Link
                to="/login"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-sm font-black flex items-center justify-center gap-2.5 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Acessar Painel (Login)</span>
              </Link>
              <a
                href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20NumInstante%20no%20celular%20e%20quero%20falar%20com%20um%20consultor."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] text-white text-sm font-black flex items-center justify-center gap-2.5 shadow-md"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Falar com Consultor no WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          CONTEÚDO PRINCIPAL (LANDMARK MAIN ACESSIBILIDADE WCAG)
          ========================================================================= */}
      <main id="main-content">
        {/* =========================================================================
            2. HERO SECTION (DESTAQUE PRINCIPAL + CARROSSEL)
            ========================================================================= */}
        <section
          id="inicio"
          className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F5] via-white to-[#F8F9FA] pt-8 pb-16 sm:pt-12 sm:pb-20 lg:py-24 border-b border-[#E9ECEF]"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF5E1E]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Coluna Esquerda: Copywriting e CTA Principal */}
              <div className="reveal lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
                {/* Tag Superior (Kicker) */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5E1E] text-xs font-extrabold tracking-wide uppercase shadow-2xs">
                  <span>🚀 CARDÁPIO DIGITAL & GESTÃO DE PEDIDOS</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-black text-[#1A1D20] tracking-tight leading-[1.15]">
                  A experiência de delivery que o seu restaurante merece.{' '}
                  <span className="text-[#FF5E1E]">Moderna para o cliente, simples para a sua equipe.</span>
                </h1>

                <p className="text-base sm:text-lg text-[#4A5568] font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Um cardápio digital elegante que converte mais pedidos pelo celular, integrado a um painel de pedidos prático com alerta sonoro e impressão rápida. Tecnologia ágil com suporte humano e dedicado perto de você.
                </p>

                {/* CTA Principal com Hover Zoom e Ícone Oficial do WhatsApp */}
                <div className="pt-2 flex flex-col items-center lg:items-start gap-2.5">
                  <a
                    href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Vim%20pela%20p%C3%A1gina%20principal%20do%20NumInstante%20e%20quero%20falar%20com%20um%20especialista%20sobre%20como%20implantar%20na%20minha%20loja."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hover-zoom w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-base font-black shadow-xl shadow-[#FF5E1E]/30 flex items-center justify-center gap-2.5 group"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Falar com um Especialista</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <p className="text-xs sm:text-sm text-[#6C757D] font-medium text-center lg:text-left">
                    * Comece 100% Grátis no Plano Start (Fature até R$ 2.500 sem pagar nada)
                  </p>
                </div>
              </div>

              {/* Coluna Direita: Carrossel Interativo do Setor de Alimentação */}
              <div className="reveal reveal-delay-2 lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#1A1D20] aspect-[4/3.8] sm:aspect-[4/4.2]">
                  {HERO_SLIDES.map((slide, index) => {
                    const isCurrent = currentSlide === index
                    return (
                      <div
                        key={index}
                        className={`hero-slide absolute inset-0 transition-opacity duration-700 ${
                          isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.tag}
                          width="600"
                          height="570"
                          fetchPriority={index === 0 ? 'high' : 'auto'}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6">
                          <span className="inline-block w-fit px-2.5 py-1 rounded-lg bg-[#FF5E1E] text-white text-[10px] font-black uppercase tracking-wider mb-2">
                            {slide.tag}
                          </span>
                          <p className="text-white text-base sm:text-xl font-black leading-snug">
                            {slide.title}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {/* Indicadores do Carrossel (Touch Target >= 24px) */}
                  <div className="absolute top-4 right-4 flex items-center bg-black/40 backdrop-blur-md px-1.5 py-1 rounded-full z-20">
                    {HERO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        aria-label={`Ir para o slide ${i + 1}`}
                        className="p-2 inline-flex items-center justify-center focus:outline-hidden"
                      >
                        <span
                          className={`block transition-all ${
                            currentSlide === i
                              ? 'w-6 h-2 rounded-full bg-[#FF5E1E]'
                              : 'w-2 h-2 rounded-full bg-white/60 hover:bg-white'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Flutuante 1: Notificação de Pedido no PDV (Visível no Mobile e Desktop) */}
                <div className="flex animate-float absolute -left-2 sm:-left-6 top-3 sm:top-8 bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-[#E9ECEF] items-center gap-2 sm:gap-3 z-20">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                    <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-[#1A1D20]">Pedido no PDV #204</span>
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        PIX Pago
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[#6C757D] font-semibold">2x Combo Brasa • R$ 74,90</p>
                  </div>
                </div>

                {/* Card Flutuante 2: Notificação de Pedido no Painel do Sistema (Visível no Mobile e Desktop) */}
                <div className="flex animate-float-delayed absolute -right-2 sm:-right-6 bottom-36 sm:bottom-36 bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-[#E9ECEF] items-center gap-2 sm:gap-3 z-20">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FF5E1E] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF5E1E]/30">
                    <KanbanSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#FF5E1E]">
                      Painel de Pedidos
                    </p>
                    <p className="text-[11px] sm:text-xs font-black text-[#1A1D20]">🔔 &ldquo;Chegou um pedido novo!&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* =========================================================================
          3. SOBRE NÓS (HISTÓRIA REGIONAL: NOVA CRUZ -> TODO O RN)
          ========================================================================= */}
      <section id="sobre-nos" className="py-12 sm:py-16 bg-white border-b border-[#E9ECEF] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* Cabeçalho da Seção */}
          <div className="reveal text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5E1E] text-xs font-extrabold tracking-wide uppercase shadow-2xs">
              <span>🤝 SUPORTE HUMANO & PRESENÇA LOCAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1D20] tracking-tight">
              Por Que o NumInstante?
            </h2>
            <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed">
              A tecnologia de delivery mais moderna do mercado, com o suporte humano e próximo da nossa terra.
            </p>
          </div>

          <div className="reveal bg-gradient-to-br from-[#1A1D20] via-[#212529] to-[#1A1D20] rounded-3xl p-6 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#FF5E1E]/20 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Nascido no RN para libertar os restaurantes das taxas abusivas e do suporte demorado.
                </h3>

                <blockquote className="p-5 sm:p-6 rounded-2xl bg-white/5 border-l-4 border-[#FF5E1E] text-white/90 text-sm sm:text-base leading-relaxed font-medium">
                  &ldquo;Criamos o NumInstante com um objetivo claro: entregar uma plataforma de delivery bonita, rápida e acessível para os negócios da nossa região. Conhecemos a rotina do comércio local: sabemos que cada pedido conta e que, se acontecer qualquer problema ou imprevisto na hora do pico, você não pode ficar horas esperando a resposta de um robô. Aqui, você tem tecnologia de ponta para vender mais e gente de verdade do seu lado para resolver na hora.&rdquo;
                </blockquote>

                <div className="pt-1">
                  <a
                    href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Sou%20empreendedor%20no%20RN%20e%20quero%20conhecer%20a%20parceria%20do%20NumInstante%20para%20o%20meu%20neg%C3%B3cio."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hover-zoom w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 sm:py-3.5 rounded-2xl sm:rounded-xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-sm sm:text-sm font-black shadow-lg shadow-[#FF5E1E]/30"
                  >
                    <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span>Falar com Nossa Equipe</span>
                  </a>
                </div>
              </div>

              {/* Cards de Alcance Regional */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="reveal reveal-delay-1 bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5E1E] text-white flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base">Raízes no Agreste Potiguar</h3>
                  <p className="text-[13px] sm:text-xs text-white/90 leading-relaxed">
                    Criado e aprimorado lado a lado com os comerciantes de Nova Cruz e região.
                  </p>
                </div>

                <div className="reveal reveal-delay-2 bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base">Presente em Todo o RN</h3>
                  <p className="text-[13px] sm:text-xs text-white/90 leading-relaxed">
                    Levando inovação sem complicação do litoral ao interior do estado.
                  </p>
                </div>

                <div className="reveal reveal-delay-3 bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-5 space-y-2 sm:col-span-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Headset className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base">Suporte Humanizado no WhatsApp</h3>
                      <p className="text-[13px] sm:text-xs text-white/90 leading-relaxed">
                        Sem filas de espera nem chamados demorados. Se der qualquer dúvida ou problema,
                        você fala direto com quem resolve na hora.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FUNCIONALIDADES (O PODER DO SISTEMA)
          ========================================================================= */}
      <section id="funcionalidades" className="py-8 sm:py-12 bg-[#F8F9FA] border-b border-[#E9ECEF] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          {/* Cabeçalho da Seção */}
          <div className="reveal text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5E1E] text-xs font-extrabold tracking-wide uppercase shadow-2xs">
              <span>⚡ RECURSOS COMPLETOS & SEM LIMITES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1D20] tracking-tight">
              Tudo o que seu Delivery Precisa para Rodar com Tranquilidade
            </h2>
            <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed">
              Uma plataforma completa pensada para quem prepara com carinho e entrega com agilidade.
            </p>
          </div>

          {/* Grid de 3 Pilares com Pontos-Chave */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Pilar 1: Cardápio & Vendas Online */}
            <div className="reveal reveal-delay-1 bg-white rounded-3xl p-5 sm:p-7 border border-[#E9ECEF] shadow-xs hover:shadow-xl hover:border-[#FF5E1E]/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Header do Card */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E9ECEF]">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF4EE] text-[#FF5E1E] flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[10px] font-extrabold uppercase tracking-wider text-[#FF5E1E]">
                      Vitrine Própria
                    </span>
                    <h3 className="text-lg sm:text-lg font-black text-[#1A1D20]">
                      Cardápio Moderno e Intuitivo
                    </h3>
                  </div>
                </div>

                {/* Lista de Pontos-Chave */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Seu Cardápio sem Baixar Aplicativo
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Link exclusivo (<code className="text-[#FF5E1E] font-bold">numinstante.com.br/sua-loja</code>) direto no navegador do celular, rápido e sem barreiras.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Banco de Imagens Profissionais
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Centenas de fotos prontas e apetitosas para deixar seus itens com apresentação de alto nível.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Sua Marca em Destaque
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Cadastre o logotipo e banner da sua loja, além dos links oficiais de WhatsApp e Instagram para fortalecer seu negócio.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Pausa Rápida de Itens com 1 Clique
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Acabou um ingrediente na cozinha? Pause produtos ou adicionais instantaneamente pelo painel.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pilar 2: Cozinha, Pedidos & Operação */}
            <div className="reveal reveal-delay-2 bg-white rounded-3xl p-5 sm:p-7 border border-[#E9ECEF] shadow-xs hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Header do Card */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E9ECEF]">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <KanbanSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                      Operação Ágil
                    </span>
                    <h3 className="text-lg sm:text-lg font-black text-[#1A1D20]">
                      Gestão de Cozinha &amp; Balcão
                    </h3>
                  </div>
                </div>

                {/* Lista de Pontos-Chave */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Painel Visual com Alerta Sonoro
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        A tela apita a cada novo pedido e organiza as etapas: Recebido, Em Preparo e Pronto.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Impressão Térmica em 1 Clique
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Comanda organizada direto para a chapa, forno e entregador (formato padrão 80mm).
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        PIX Direto e Formas de Pagamento
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        PIX copia-e-cola na hora, maquininha na entrega e troco calculado sem confusão.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Abertura e Fechamento Automáticos
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Configure seus dias e turnos de atendimento para o cardápio abrir e fechar pontualmente no sistema.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pilar 3: Entregas, Fidelização & Finanças */}
            <div className="reveal reveal-delay-3 bg-white rounded-3xl p-5 sm:p-7 border border-[#E9ECEF] shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Header do Card */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E9ECEF]">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                      Controle &amp; Gestão
                    </span>
                    <h3 className="text-lg sm:text-lg font-black text-[#1A1D20]">
                      Entregas, Clientes &amp; Finanças
                    </h3>
                  </div>
                </div>

                {/* Lista de Pontos-Chave */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Taxas Flexíveis: Bairro, Fixa ou Balcão
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Defina valores justos por região e permita retirada no balcão sem taxa de entrega.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Avisos Automáticos no WhatsApp
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Notificações de status para o cliente acompanhar do preparo até a saída para entrega.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Avaliações com Notas em Estrelas
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Feedback dos clientes em 3 critérios (Entrega, Qualidade e Atendimento) no topo da vitrine para gerar confiança.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-sm font-black text-[#1A1D20]">
                        Cupons de Desconto &amp; Métricas
                      </h4>
                      <p className="text-[13px] sm:text-xs text-[#4A5568] leading-relaxed">
                        Crie códigos promocionais (% ou R$) e acompanhe o faturamento do dia, semana e mês sem complicação.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Estratégico da Seção de Funcionalidades */}
          <div
            id="funcionalidades-cta"
            className="reveal bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E9ECEF] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-black text-[#1A1D20]">
                Quer ver a plataforma funcionando na prática?
              </h3>
              <p className="text-sm sm:text-sm text-[#4A5568] leading-relaxed">
                Nossa equipe mostra o cardápio digital, o painel de pedidos e a comanda impressa ao vivo pelo WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Vi%20as%20funcionalidades%20do%20NumInstante%20no%20site%20e%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hover-zoom w-full md:w-auto px-6 py-4 sm:py-3 rounded-2xl sm:rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm sm:text-sm font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 shrink-0"
            >
              <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Solicitar Demonstração no WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SEÇÃO DE PLANOS POR FAIXA DE FATURAMENTO
          ========================================================================= */}
      <section id="planos" className="py-14 sm:py-20 bg-white border-b border-[#E9ECEF] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="reveal text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5E1E] text-xs font-extrabold tracking-wide uppercase shadow-2xs">
              <span>💰 PREÇOS JUSTOS & SEM PEGADINHAS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1A1D20] tracking-tight">
              O mesmo sistema 100% liberado para todos. Você só paga quando faturar mais.
            </h2>
            <p className="text-base sm:text-lg text-[#4A5568] font-medium leading-relaxed">
              Sem limite de produtos, sem travas de funções e com zero comissões sobre as suas vendas. Escolha a faixa que acompanha a realidade da sua loja.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* Plano Start: Até R$ 2.500 de Faturamento */}
            <div className="reveal reveal-delay-1 rounded-3xl border-2 border-emerald-500/40 bg-[#F8F9FA] p-6 sm:p-7 flex flex-col justify-between space-y-6 relative shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full">
                    Plano Start • Grátis
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E9ECEF]">
                  <p className="text-xs sm:text-[11px] font-bold uppercase tracking-wider text-[#6C757D]">
                    Faturamento Mensal
                  </p>
                  <p className="text-base sm:text-lg font-black text-[#1A1D20]">
                    Até R$ 2.500,00 / mês
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600">Grátis</span>
                  <span className="text-sm sm:text-xs text-[#4A5568] font-bold block mt-0.5">
                    R$ 0,00 de mensalidade
                  </span>
                </div>

                <p className="text-sm sm:text-xs text-[#4A5568] leading-relaxed">
                  Tire seu delivery do papel ou teste na sua loja sem nenhum custo fixo para pesar no seu caixa.
                </p>

                <div className="pt-2 border-t border-[#E9ECEF]">
                  <p className="text-xs sm:text-[11px] font-extrabold uppercase tracking-wider text-[#1A1D20] mb-3">
                    Tudo 100% liberado:
                  </p>
                  <ul className="space-y-2.5 text-[13px] sm:text-xs font-semibold text-[#1A1D20]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Cardápio Digital
                      completo e ilimitado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> PDV e Painel de
                      Pedidos em tempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Alerta sonoro de
                      novos pedidos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Envio de
                      mensagens automáticas no WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Taxas por bairro,
                      cupons e métricas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Zero comissão
                      sobre as suas vendas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Suporte ágil via
                      WhatsApp
                    </li>
                  </ul>
                </div>
              </div>

              <a
                href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Quero%20come%C3%A7ar%20no%20NumInstante%20com%20o%20Plano%20Start%20(faturamento%20at%C3%A9%20R%24%202.500%2Fm%C3%AAs)."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover-zoom w-full py-4 sm:py-3.5 rounded-2xl sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-sm font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Começar com Plano Start</span>
              </a>
            </div>

            {/* Plano Express: De R$ 2.501 até R$ 6.000 de Faturamento */}
            <div className="reveal reveal-delay-2 rounded-3xl border-2 border-[#FF5E1E] bg-white p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl shadow-[#FF5E1E]/15 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF5E1E] text-white text-[11px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
                ⭐ Mais Escolhido
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] sm:text-xs font-extrabold uppercase tracking-wider text-[#FF5E1E] bg-[#FFF4EE] px-3.5 py-1.5 rounded-full">
                    Plano Express • Crescimento
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-orange-200/80">
                  <p className="text-xs sm:text-[11px] font-bold uppercase tracking-wider text-[#6C757D]">
                    Faturamento Mensal
                  </p>
                  <p className="text-base sm:text-lg font-black text-[#1A1D20]">
                    De R$ 2.501 até R$ 6.000
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#FF5E1E]">R$ 49,90</span>
                  <span className="text-sm sm:text-xs text-[#6C757D] font-bold"> / mês</span>
                  <span className="text-sm sm:text-xs text-[#4A5568] font-medium block mt-0.5">
                    Valor fixo mensal, sem surpresas
                  </span>
                </div>

                <p className="text-sm sm:text-xs text-[#4A5568] leading-relaxed">
                  Para lojas em ritmo de crescimento que já vendem todos os dias e precisam de uma operação ágil.
                </p>

                <div className="pt-2 border-t border-[#E9ECEF]">
                  <p className="text-xs sm:text-[11px] font-extrabold uppercase tracking-wider text-[#1A1D20] mb-3">
                    Tudo 100% liberado:
                  </p>
                  <ul className="space-y-2.5 text-[13px] sm:text-xs font-semibold text-[#1A1D20]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Cardápio Digital
                      completo e ilimitado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> PDV e Painel de
                      Pedidos em tempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Alerta sonoro de
                      novos pedidos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Envio de
                      mensagens automáticas no WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Taxas por bairro,
                      cupons e métricas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Zero comissão
                      sobre as suas vendas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Suporte ágil e
                      prioritário via WhatsApp
                    </li>
                  </ul>
                </div>
              </div>

              <a
                href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Quero%20falar%20com%20um%20consultor%20sobre%20o%20Plano%20Express%20(R%24%2049%2C90%2Fm%C3%AAs)%20do%20NumInstante!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover-zoom w-full py-4 sm:py-3.5 rounded-2xl sm:rounded-xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-sm sm:text-sm font-black shadow-lg shadow-[#FF5E1E]/25 flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Escolher Plano Express</span>
              </a>
            </div>

            {/* Plano Turbo: Acima de R$ 6.000 de Faturamento */}
            <div className="reveal reveal-delay-3 rounded-3xl border border-[#E9ECEF] bg-white p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-900 bg-slate-100 px-3.5 py-1.5 rounded-full">
                    Plano Turbo • Alta Escala
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                  <p className="text-xs sm:text-[11px] font-bold uppercase tracking-wider text-[#6C757D]">
                    Faturamento Mensal
                  </p>
                  <p className="text-base sm:text-lg font-black text-[#1A1D20]">
                    Acima de R$ 6.000,00 / mês
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#1A1D20]">R$ 89,90</span>
                  <span className="text-sm sm:text-xs text-[#6C757D] font-bold"> / mês</span>
                  <span className="text-sm sm:text-xs text-[#4A5568] font-medium block mt-0.5">
                    Teto máximo fixo, venda sem limites
                  </span>
                </div>

                <p className="text-sm sm:text-xs text-[#4A5568] leading-relaxed">
                  Para operações consolidadas. Fature R$ 10 mil, R$ 30 mil ou mais com previsibilidade e custo fixo enxuto.
                </p>

                <div className="pt-2 border-t border-[#E9ECEF]">
                  <p className="text-xs sm:text-[11px] font-extrabold uppercase tracking-wider text-[#1A1D20] mb-3">
                    Tudo 100% liberado:
                  </p>
                  <ul className="space-y-2.5 text-[13px] sm:text-xs font-semibold text-[#1A1D20]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Cardápio Digital
                      completo e ilimitado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> PDV e Painel de
                      Pedidos em tempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Alerta sonoro de
                      novos pedidos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Envio de
                      mensagens automáticas no WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Taxas por bairro,
                      cupons e métricas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Zero comissão
                      sobre as suas vendas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E1E] shrink-0" /> Atendimento
                      prioritário e consultoria VIP
                    </li>
                  </ul>
                </div>
              </div>

              <a
                href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Meu%20delivery%20quer%20acelerar%20com%20o%20Plano%20Turbo%20(R%24%2089%2C90%2Fm%C3%AAs)%20do%20NumInstante!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover-zoom w-full py-4 sm:py-3.5 rounded-2xl sm:rounded-xl bg-[#1A1D20] hover:bg-[#FF5E1E] text-white text-sm sm:text-sm font-black flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Escolher Plano Turbo</span>
              </a>
            </div>
          </div>

          {/* Banner de Implantação e Configuração Assistida (Online ou Presencial) */}
          <div className="reveal bg-gradient-to-r from-[#FFF8F5] via-white to-[#FFF4EE] rounded-3xl p-6 sm:p-8 border-2 border-orange-200/80 shadow-md flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5E1E] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FF5E1E]/25 mx-auto sm:mx-0">
                <Headset className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-lg font-black text-[#1A1D20]">
                    Sem tempo para cadastrar? Nossa equipe configura tudo para você!
                  </h3>
                  <span className="text-xs sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#FF5E1E] text-white tracking-wider">
                    Taxa Fixa Única
                  </span>
                </div>
                <p className="text-sm sm:text-sm text-[#4A5568] leading-relaxed max-w-2xl">
                  Realizamos a <strong>configuração completa da sua loja online ou presencial</strong>: nossa equipe cadastra seu cardápio, fotos dos produtos, adicionais, taxas por bairro e formas de pagamento. Você recebe o sistema 100% pronto para vender!
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Quero%20saber%20o%20valor%20da%20taxa%20fixa%20para%20voc%C3%AAs%20configurarem%20o%20meu%20card%C3%A1pio%20(online%20ou%20presencial)."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hover-zoom w-full lg:w-auto px-6 py-4 sm:py-3.5 rounded-2xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-base sm:text-sm font-black shadow-lg shadow-[#FF5E1E]/20 flex items-center justify-center gap-2.5 shrink-0 whitespace-nowrap"
            >
              <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Contratar Configuração</span>
            </a>
          </div>
        </div>
      </section>
      </main>

      {/* =========================================================================
          6. FOOTER (RODAPÉ COMPLETO)
          ========================================================================= */}
      <footer className="bg-[#1A1D20] text-white pt-14 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
            {/* Coluna 1: Marca e Posicionamento Regional */}
            <div className="lg:col-span-4 space-y-4">
              <a
                href="#inicio"
                onClick={(e) => scrollToSection(e, 'inicio')}
                className="inline-block group focus:outline-hidden"
              >
                <img
                  src="/brand/numinstante-logo-footer.png"
                  alt="NumInstante"
                  width="670"
                  height="155"
                  className="h-10 sm:h-11 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </a>
              <p className="text-sm sm:text-base font-extrabold text-white max-w-sm leading-snug">
                &ldquo;Transformando a velocidade do seu atendimento em lucro real num instante.&rdquo;
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5E1E] bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Desenvolvido em Nova Cruz • Para todo o RN</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                Tecnologia ágil para restaurantes, pizzarias, hamburguerias e deliverys venderem com cardápio próprio e zero comissões.
              </p>
            </div>

            {/* Coluna 2: Navegação Rápida */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5E1E]">
                Navegação
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-xs font-semibold text-white/80">
                <li>
                  <a
                    href="#inicio"
                    onClick={(e) => scrollToSection(e, 'inicio')}
                    className="hover:text-[#FF5E1E] transition-colors inline-block py-0.5"
                  >
                    Início
                  </a>
                </li>
                <li>
                  <a
                    href="#sobre-nos"
                    onClick={(e) => scrollToSection(e, 'sobre-nos')}
                    className="hover:text-[#FF5E1E] transition-colors inline-block py-0.5"
                  >
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a
                    href="#funcionalidades"
                    onClick={(e) => scrollToSection(e, 'funcionalidades')}
                    className="hover:text-[#FF5E1E] transition-colors inline-block py-0.5"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="#planos"
                    onClick={(e) => scrollToSection(e, 'planos')}
                    className="hover:text-[#FF5E1E] transition-colors inline-block py-0.5"
                  >
                    Planos &amp; Preços
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Suporte & Institucional */}
            <div className="lg:col-span-3 space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5E1E]">
                Suporte &amp; Legal
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-xs font-semibold text-white/80">
                <li>
                  <a
                    href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Preciso%20de%20suporte%20com%20o%20sistema%20NumInstante."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF5E1E] transition-colors inline-flex items-center gap-2 py-0.5"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                    <span>Central de Suporte</span>
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="hover:text-[#FF5E1E] transition-colors inline-flex items-center gap-2 py-0.5 text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                    <span>Termos de Uso</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="hover:text-[#FF5E1E] transition-colors inline-flex items-center gap-2 py-0.5 text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                    <span>Privacidade (LGPD)</span>
                  </button>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-[#FF5E1E] transition-colors inline-flex items-center gap-2 py-0.5"
                  >
                    <LogIn className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                    <span>Acessar Painel (Login)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais e Atendimento */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5E1E]">
                Conecte-se Conosco
              </h4>
              <p className="text-sm sm:text-xs text-white/70 leading-relaxed">
                Acompanhe dicas práticas de gestão, novidades do sistema e casos de sucesso:
              </p>
              <div>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hover-zoom inline-flex items-center gap-2.5 px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 text-white text-sm sm:text-xs font-extrabold shadow-md"
                >
                  <InstagramIcon className="w-4 h-4 shrink-0" />
                  <span>Seguir no Instagram</span>
                </a>
              </div>
              <div className="pt-1 flex items-center gap-2 text-xs text-white/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Atendimento humano ativo no WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Linha Final de Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60 text-center sm:text-left">
            <p className="font-semibold">
              © {CURRENT_YEAR} NumInstante Delivery • Todos os direitos reservados.
            </p>
            <p className="text-white/50 text-[11px] sm:text-xs">
              Tecnologia potiguar feita para impulsionar negócios locais.
            </p>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          7. BOTÃO FLUTUANTE DE WHATSAPP (CONVERSÃO CONTÍNUA)
          ========================================================================= */}
      <a
        href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Estou%20visitando%20o%20site%20do%20NumInstante%20e%20quero%20tirar%20uma%20d%C3%BAvida."
        target="_blank"
        rel="noopener noreferrer"
        title="Falar com um Consultor no WhatsApp"
        className="whatsapp-pulse btn-hover-zoom fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-2xl"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>

      {/* =========================================================================
          8. MODAL COMPLETO: TERMOS DE USO / PRIVACIDADE (LGPD)
          ========================================================================= */}
      <LegalModal
        activeTab={legalModal}
        onTabChange={setLegalModal}
        onClose={() => setLegalModal(null)}
      />
    </div>
  )
}
