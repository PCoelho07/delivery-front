import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * ErrorBoundary Global para capturar exceções imprevistas no ciclo de renderização do React
 * Evita a 'tela branca' (White Screen of Death) e oferece opções de recuperação ao usuário.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Falha de renderização capturada:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8F9FA] text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
            <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-black text-[#1A1D20] tracking-tight">
            Algo inesperado aconteceu
          </h2>
          <p className="text-xs text-[#6C757D] max-w-md mt-1.5 leading-relaxed">
            Ocorreu uma falha temporária ao carregar este módulo. Seus pedidos e configurações permanecem salvos em segurança.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-[#FF5E1E] text-white text-xs font-bold hover:bg-[#E64E12] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recarregar Página</span>
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] bg-white text-xs font-bold text-[#6C757D] hover:text-[#1A1D20] hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="mt-6 text-left max-w-lg w-full bg-white p-3.5 rounded-2xl border border-rose-200 text-[11px] text-slate-700 font-mono overflow-auto max-h-40 shadow-xs">
              <p className="font-bold text-rose-600 mb-1">Erro Técnico (Ambiente Dev):</p>
              <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

