import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Building2,
  ExternalLink,
  FileText,
  Flame,
  Mail,
  Phone,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCnpjMask, formatPhoneMask } from '../lib/utils'
import { useBusinessStore } from '../store/useBusinessStore'

export function HomePage() {
  const {
    businesses,
    healthStatus,
    isLoading,
    error,
    checkApiHealth,
    fetchBusinesses,
    createBusiness,
  } = useBusinessStore()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cnpj: '',
  })

  useEffect(() => {
    checkApiHealth()
    fetchBusinesses()
  }, [checkApiHealth, fetchBusinesses])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: formatPhoneMask(value) }))
      return
    }
    if (name === 'cnpj') {
      setFormData((prev) => ({ ...prev, cnpj: formatCnpjMask(value) }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.email || !formData.cnpj) {
      toast.error(
        'Preencha todos os campos obrigatórios (name, phone, email, cnpj).'
      )
      return
    }

    try {
      await createBusiness({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        cnpj: formData.cnpj.trim(),
      })
      toast.success('Estabelecimento cadastrado com sucesso via POST /business!')
      setFormData({ name: '', phone: '', email: '', cnpj: '' })
    } catch {
      toast.error(
        'Erro ao enviar para POST /business. Verifique se a API Go (:8080) está rodando.'
      )
    }
  }

  const toSlug = (name = '') =>
    encodeURIComponent(name.toLowerCase().trim().replace(/\s+/g, '-'))

  const isOnline = healthStatus && healthStatus !== 'Offline'

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] text-[#1A1D20] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabeçalho do Backoffice + Status da API Go */}
        <header className="bg-white p-5 sm:p-6 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1D20] flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-[#FF5E1E]" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#1A1D20] leading-tight">
                Backoffice — Gestão de Empresas
              </h1>
              <p className="text-[13px] text-[#6C757D] mt-0.5">
                Conectado aos endpoints reais da API Go (
                <code className="text-[#1A1D20] font-semibold">GET /health</code>
                ,{' '}
                <code className="text-[#1A1D20] font-semibold">
                  GET /business
                </code>{' '}
                e{' '}
                <code className="text-[#1A1D20] font-semibold">
                  POST /business
                </code>
                )
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-[#FFF3EE] border-[#FF5E1E]/30 text-[#FF5E1E]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>
                API (:8080): <strong>{healthStatus || 'Verificando...'}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                checkApiHealth()
                fetchBusinesses()
              }}
              className="p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-gray-200/70 border border-[#E2E5E9] transition-colors cursor-pointer"
              title="Testar conexão com a API"
            >
              <RefreshCw
                className={`w-4 h-4 text-[#1A1D20] ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-2xl bg-[#FFF3EE] border border-[#FF5E1E]/30 text-[#1A1D20] text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-[#FF5E1E]">API Go desconectada:</strong>{' '}
              {error}. Para testar o banco, inicie o backend na porta{' '}
              <code>:8080</code> (<code>go run cmd/api/main.go</code>).
            </div>
            <Link
              to="/brasa-burger"
              className="px-3.5 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <span>Ver Cardápio (Figma)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Formulário POST /business */}
          <section className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.03)] h-fit">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[17px] font-bold text-[#1A1D20] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FF5E1E]" strokeWidth={2.5} />
                Cadastrar Empresa
              </h2>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F8F9FA] text-[#6C757D]">
                POST /business
              </span>
            </div>
            <p className="text-[12.5px] text-[#6C757D] mb-5">
              Cadastro manual de estabelecimentos parceiros na API.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#6C757D] mb-1">
                  Nome do Estabelecimento (<code>name</code>) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Brasa Burger"
                  className="w-full px-3.5 py-2.5 text-[13.5px] bg-[#F8F9FA] rounded-xl border border-[#E2E5E9] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6C757D] mb-1">
                  Telefone / WhatsApp (<code>phone</code>) *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2.5 text-[13.5px] bg-[#F8F9FA] rounded-xl border border-[#E2E5E9] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6C757D] mb-1">
                  E-mail (<code>email</code>) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@brasaburger.com.br"
                  className="w-full px-3.5 py-2.5 text-[13.5px] bg-[#F8F9FA] rounded-xl border border-[#E2E5E9] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6C757D] mb-1">
                  CNPJ (<code>cnpj</code>) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3.5 py-2.5 text-[13.5px] bg-[#F8F9FA] rounded-xl border border-[#E2E5E9] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-[14.5px] rounded-2xl transition-all cursor-pointer shadow-xs"
              >
                {isLoading ? 'Enviando para API...' : 'Cadastrar Empresa'}
              </button>
            </form>
          </section>

          {/* Coluna Direita: Listagem GET /business */}
          <section className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-bold text-[#1A1D20]">
                      Empresas Cadastradas
                    </h2>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F8F9FA] text-[#6C757D]">
                      GET /business
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#6C757D] mt-0.5">
                    Cada empresa gera seu link próprio multi-tenant (
                    <code>/:nome-da-empresa</code>).
                  </p>
                </div>

                <span className="px-3 py-1 text-[12px] font-bold bg-[#FFF3EE] text-[#FF5E1E] rounded-full">
                  {businesses.length} registro(s)
                </span>
              </div>

              {businesses.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-[#E2E5E9] bg-[#F8F9FA] rounded-2xl space-y-3">
                  <Building2 className="w-8 h-8 text-[#6C757D] mx-auto stroke-[1.8]" />
                  <div className="space-y-1">
                    <p className="text-[14px] font-semibold text-[#1A1D20]">
                      Nenhuma empresa retornada por <code>GET /business</code>
                    </p>
                    <p className="text-[12.5px] text-[#6C757D] max-w-md mx-auto">
                      Cadastre uma empresa no formulário ao lado ou clique
                      abaixo para visualizar o cardápio modelo do Figma.
                    </p>
                  </div>
                  <Link
                    to="/brasa-burger"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[13px] font-semibold transition-colors"
                  >
                    <span>Abrir Cardápio Modelo (Brasa Burger)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {businesses.map((b, index) => (
                    <div
                      key={b.id || index}
                      className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-white border border-[#E2E5E9] rounded-md text-[#6C757D]">
                            ID #{b.id}
                          </span>
                          <h3 className="text-[15px] font-bold text-[#1A1D20]">
                            {b.name}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#6C757D]">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#FF5E1E]" />
                            {formatPhoneMask(b.phone)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#FF5E1E]" />
                            {b.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-[#FF5E1E]" />
                            CNPJ: {formatCnpjMask(b.cnpj)}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/${toSlug(b.name)}`}
                        className="inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#FF5E1E] hover:bg-[#E64E12] px-3.5 py-2.5 rounded-xl shrink-0 transition-colors"
                      >
                        <span>Abrir Cardápio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
