import { useEffect, useState } from 'react'
import {
  Activity,
  Building2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  X,
  FileText,
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
      .replace(/[^a-z0-9]/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.cnpj.trim()) {
      toast.error('Preencha os 4 campos obrigatórios: Nome, WhatsApp, E-mail e CNPJ.')
      return
    }

    setIsSubmitting(true)

    try {
      // Envia para a API Go (POST /business com as 4 infos exatas)
      const apiResult = await createBusiness({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        cnpj: formData.cnpj.trim(),
      })

      // Adiciona na base do Super Admin
      const newCompany = {
        id: apiResult?.id || Date.now(),
        name: formData.name.trim(),
        slug: toSlug(formData.name) || 'loja',
        cnpj: formData.cnpj.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        status: 'active',
        createdAt: new Date().toLocaleDateString('pt-BR'),
      }

      addCompany(newCompany)
      toast.success(`Restaurante "${formData.name}" cadastrado com sucesso!`)

      setFormData({
        name: '',
        phone: '',
        email: '',
        cnpj: '',
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
      <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-2xl max-w-lg w-full my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3EE] text-[#FF5E1E] flex items-center justify-center">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                Cadastrar Nova Empresa (API)
              </h3>
              <p className="text-xs text-[#6C757D]">
                Conectado ao endpoint <code className="font-bold text-slate-800">POST /business</code> da API Go
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1D20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status da Conexão com API Go (:8080) */}
        <div className="mx-5 mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity
              className={`w-4 h-4 ${
                isOnline ? 'text-emerald-500' : 'text-rose-500'
              }`}
            />
            <span className="text-xs font-semibold text-[#1A1D20]">
              API Go (:8080):{' '}
              <strong className={isOnline ? 'text-emerald-600' : 'text-rose-600'}>
                {healthStatus || 'Verificando...'}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={checkApiHealth}
            disabled={isApiLoading}
            className="text-[11px] font-bold text-[#FF5E1E] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Testar conexão com API Go"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isApiLoading ? 'animate-spin' : ''}`} />
            <span>Testar conexão</span>
          </button>
        </div>

        {/* Formulário Enxuto com as 4 Infos */}
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
              <div className="relative">
                <FileText className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0001-00"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

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
