import { useState } from 'react'
import { UserCog, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useSuperAdminStore } from '../../../store/useSuperAdminStore'

export function AdminProfileView() {
  const { adminProfile, updateAdminProfile } = useSuperAdminStore()

  const [form, setForm] = useState({
    name: adminProfile.name || 'Master Admin',
    email: adminProfile.email || 'admin@numinstante.com',
    trialDays: adminProfile.trialDays || 7,
    pixKey: adminProfile.pixKey || 'financeiro@numinstante.com',
    supportPhone: adminProfile.supportPhone || '(84) 99999-8888',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error('A confirmação de senha não confere com a nova senha digitada.')
      return
    }

    updateAdminProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      trialDays: Number(form.trialDays) || 7,
      pixKey: form.pixKey.trim(),
      supportPhone: form.supportPhone.trim(),
    })

    toast.success('Configurações do Super Admin salvas com sucesso!')
    setForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1A1D20]">
              Configuração do Perfil de Administrador
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Defina suas credenciais de acesso master e os parâmetros operacionais globais da plataforma SaaS.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Credenciais Master */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E9ECEF] pb-3">
            <ShieldCheck className="w-4 h-4 text-[#FF5E1E]" />
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              Credenciais de Acesso Super Admin
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1D20]">Nome do Administrador</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1D20]">E-mail de Login</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1D20]">Nova Senha Master (Opcional)</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1D20]">Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Parâmetros Globais da Plataforma */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-sm text-[#1A1D20] border-b border-[#E9ECEF] pb-3">
            Configurações Gerais da Plataforma
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1D20]">
                Dias de Teste Grátis (Trial Padrão)
              </label>
              <input
                type="number"
                name="trialDays"
                value={form.trialDays}
                onChange={handleChange}
                min={1}
                max={60}
                required
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
              <p className="text-[10.5px] text-[#6C757D]">
                Período concedido às lojas antes de exigir plano pago.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1D20]">
                Chave PIX do Super Admin (Recebimento de Mensalidades)
              </label>
              <input
                type="text"
                name="pixKey"
                value={form.pixKey}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
              <p className="text-[10.5px] text-[#6C757D]">
                Chave enviada na mensagem automática de cobrança via WhatsApp.
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-[#1A1D20]">
                WhatsApp Oficial do Suporte Técnico
              </label>
              <input
                type="text"
                name="supportPhone"
                value={form.supportPhone}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:border-[#FF5E1E] focus:bg-white text-[#1A1D20] transition-all"
              />
              <p className="text-[10.5px] text-[#6C757D]">
                Número para os estabelecimentos entrarem em contato com a equipe master.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações do Perfil</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

