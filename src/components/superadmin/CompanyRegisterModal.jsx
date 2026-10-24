import { useEffect, useState } from 'react'
import {
  Activity,
  Building2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCnpjMask, formatPhoneMask } from '../../lib/utils'
import { useBusinessStore } from '../../store/useBusinessStore'
import { useSuperAdminStore } from '../../store/useSuperAdminStore'

export function CompanyRegisterModal({ isOpen, onClose }) {
  const {
    healthStatus,
    isLoading: isApiLoading,
    checkApiHealth,
    createBusiness,
  } = useBusinessStore()

  const { addCompany } = useSuperAdminStore()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cnpj: '',
    owner: '',
    plan: 'pro',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      checkApiHealth()
    }
  }, [isOpen, checkApiHealth])

  if (!isOpen) return null

  const isOnline = healthStatus && healthStatus !== 'Offline'

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

  const toSlug = (name = '') =>
    name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const planOptions = [
    { id: 'trial', label: 'Trial Grátis (7 dias)', price: 0.0, name: 'Trial Grátis' },
    { id: 'basico', label: 'Plano Básico (R$ 49/mês)', price: 49.0, name: 'Plano Básico' },
    { id: 'pro', label: 'Plano Pro (R$ 99/mês)', price: 99.0, name: 'Plano Pro' },
    { id: 'enterprise', label: 'Plano Ilimitado (R$ 199/mês)', price: 199.0, name: 'Plano Ilimitado' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.cnpj.trim()) {
      toast.error('Preencha os campos obrigatórios: Nome, WhatsApp, E-mail e CNPJ.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Enviar para a API Go (POST /business)
      await createBusiness({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        cnpj: formData.cnpj.trim(),
      })

      // 2. Adicionar na base do Super Admin
      const selectedPlan = planOptions.find((p) => p.id === formData.plan) || planOptions[2]
      const newCompany = {
        id: Date.now(),
        name: formData.name.trim(),
        slug: toSlug(formData.name) || 'loja',
        cnpj: formData.cnpj.trim(),
        phone: formData.phone.trim(),
        owner: formData.owner.trim() || 'Proprietário',
        status: formData.plan === 'trial' ? 'trial' : 'active',
        plan: selectedPlan.id,
        planName: selectedPlan.name,
        price: selectedPlan.price,
        nextBilling: '24/11/2026',
        isPaid: selectedPlan.id !== 'trial',
        daysLeft: selectedPlan.id === 'trial' ? 7 : 30,
        productsCount: 0,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      }

      addCompany(newCompany)
      toast.success(`Restaurante "${formData.name}" cadastrado com sucesso!`)

      setFormData({
        name: '',
        phone: '',
        email: '',
        cnpj: '',
        owner: '',
        plan: 'pro',
      })
      onClose()
    } catch {
      toast.error(
        'Erro ao cadastrar na API Go (:8080). Verifique se o backend está em execução.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1A1D20]">
                Cadastrar Nova Empresa (API)
              </h3>
              <p className="text-[11px] text-[#6C757D]">
                Conectado ao endpoint <code className="font-bold text-slate-800">POST /business</code> da API Go
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1D20] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status da Conexão com API Go (:8080) */}
        <div className="px-5 pt-4">
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-xs font-semibold text-[#1A1D20]">
                API Go (:8080):{' '}
                <strong className={isOnline ? 'text-emerald-600' : 'text-amber-600'}>
                  {healthStatus || 'Testando...'}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={checkApiHealth}
              disabled={isApiLoading}
              className="p-1.5 rounded-lg bg-white border border-[#E9ECEF] text-[#6C757D] hover:text-[#1A1D20] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Testar conexão com API Go"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isApiLoading ? 'animate-spin' : ''}`} />
              <span>Testar</span>
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nome do Estabelecimento *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Brasa Burger Artesanal"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                WhatsApp / Telefone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(84) 99999-9999"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0001-00"
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                E-mail do Restaurante *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@brasaburger.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Proprietário / Responsável
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="Ex: Lucas Silva"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Plano da Assinatura</span>
            </label>
            <select
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors font-semibold cursor-pointer"
            >
              {planOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rodapé com Botões */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E9ECEF]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-xs font-bold text-[#6C757D] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Empresa (API)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

