import { useState, useMemo } from 'react'
import {
  Store,
  Building2,
  Phone,
  MapPin,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Trash2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { formatCnpjMask, formatPhoneMask } from '../../../lib/utils'

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function StoreProfileView() {
  const { storeInfo, updateStoreInfo } = useStoreAdmin()

  // Rascunho local de edição (só comita no clique de "Salvar Alterações")
  const [draft, setDraft] = useState(() => ({
    name: storeInfo?.name || 'Brasa Burger',
    corporateName: storeInfo?.corporateName || 'Brasa Hamburgueria & Alimentos LTDA',
    cnpj: formatCnpjMask(storeInfo?.cnpj || '12.345.678/0001-90'),
    subtitle: storeInfo?.subtitle || 'Hambúrguer artesanal · Feito na brasa',
    phone: formatPhoneMask(storeInfo?.phone || '(84) 3281-1234'),
    whatsapp: formatPhoneMask(storeInfo?.whatsapp || '(84) 99876-5432'),
    instagram: storeInfo?.instagram || '@brasaburger',
    address: storeInfo?.address || 'Praça Antônio Basílio de Melo, 32, Nova Cruz / RN',
    logoUrl: storeInfo?.logoUrl || '',
    bannerUrl:
      storeInfo?.bannerUrl ||
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
  }))

  // Verifica se há alterações pendentes no rascunho
  const isDirty = useMemo(() => {
    return (
      draft.name !== (storeInfo?.name || 'Brasa Burger') ||
      draft.corporateName !== (storeInfo?.corporateName || 'Brasa Hamburgueria & Alimentos LTDA') ||
      draft.cnpj !== formatCnpjMask(storeInfo?.cnpj || '12.345.678/0001-90') ||
      draft.subtitle !== (storeInfo?.subtitle || 'Hambúrguer artesanal · Feito na brasa') ||
      draft.phone !== formatPhoneMask(storeInfo?.phone || '(84) 3281-1234') ||
      draft.whatsapp !== formatPhoneMask(storeInfo?.whatsapp || '(84) 99876-5432') ||
      draft.instagram !== (storeInfo?.instagram || '@brasaburger') ||
      draft.address !== (storeInfo?.address || 'Praça Antônio Basílio de Melo, 32, Nova Cruz / RN') ||
      draft.logoUrl !== (storeInfo?.logoUrl || '') ||
      draft.bannerUrl !== (storeInfo?.bannerUrl || '')
    )
  }, [draft, storeInfo])

  // Manipulação de Upload de Imagem (Logo ou Banner) via FileReader
  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).')
      return
    }

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result
      if (base64) {
        setDraft((prev) => ({ ...prev, [field]: String(base64) }))
        toast.success(
          field === 'logoUrl'
            ? 'Logo carregada no rascunho! Clique em "Salvar Alterações" para aplicar.'
            : 'Banner de fundo carregado no rascunho! Clique em "Salvar Alterações" para aplicar.'
        )
      }
    }
    reader.readAsDataURL(file)
  }

  // Descartar alterações
  const handleDiscard = () => {
    setDraft({
      name: storeInfo?.name || 'Brasa Burger',
      corporateName: storeInfo?.corporateName || 'Brasa Hamburgueria & Alimentos LTDA',
      cnpj: formatCnpjMask(storeInfo?.cnpj || '12.345.678/0001-90'),
      subtitle: storeInfo?.subtitle || 'Hambúrguer artesanal · Feito na brasa',
      phone: formatPhoneMask(storeInfo?.phone || '(84) 3281-1234'),
      whatsapp: formatPhoneMask(storeInfo?.whatsapp || '(84) 99876-5432'),
      instagram: storeInfo?.instagram || '@brasaburger',
      address: storeInfo?.address || 'Praça Antônio Basílio de Melo, 32, Nova Cruz / RN',
      logoUrl: storeInfo?.logoUrl || '',
      bannerUrl:
        storeInfo?.bannerUrl ||
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
    })
    toast.info('Alterações descartadas.')
  }

  // Salvar no Zustand e persistir
  const handleSave = (e) => {
    e?.preventDefault()

    if (!draft.name.trim()) {
      toast.error('O nome do estabelecimento é obrigatório.')
      return
    }

    updateStoreInfo({
      name: draft.name.trim(),
      corporateName: draft.corporateName.trim(),
      cnpj: draft.cnpj.trim(),
      subtitle: draft.subtitle.trim(),
      phone: draft.phone.trim(),
      whatsapp: draft.whatsapp.trim(),
      instagram: draft.instagram.trim().startsWith('@')
        ? draft.instagram.trim()
        : `@${draft.instagram.trim()}`,
      address: draft.address.trim(),
      logoUrl: draft.logoUrl.trim(),
      bannerUrl: draft.bannerUrl.trim(),
    })

    toast.success('Dados do restaurante e fotos salvos com sucesso!')
  }

  // Links de prévia
  const instagramPreviewUrl = draft.instagram
    ? `https://instagram.com/${draft.instagram.replace(/^@/, '')}`
    : null

  const whatsappDigits = draft.whatsapp.replace(/\D/g, '')
  const whatsappPreviewUrl = whatsappDigits
    ? `https://wa.me/55${whatsappDigits.startsWith('55') ? whatsappDigits.slice(2) : whatsappDigits}`
    : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex flex-wrap items-center gap-2">
            <Store className="w-5 h-5 text-[#FF5E1E]" />
            <span>Perfil & Dados do Estabelecimento</span>
            {isDirty && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Alterações pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Gerencie as informações da empresa contratante, logotipo, plano de fundo e redes sociais do cardápio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3.5 py-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#FF5E1E]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {/* Card 1: Identidade Visual (Logo e Banner de Capa) */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#FF5E1E]" />
            <span>Identidade Visual do Cardápio</span>
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Suba a logo circular do restaurante e a foto de plano de fundo exibida no topo do menu do cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Logo Circular */}
          <div className="md:col-span-5 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E9ECEF] flex flex-col items-center text-center space-y-3">
            <span className="text-xs font-bold text-[#1A1D20]">Logotipo (Circular)</span>

            <div className="relative w-24 h-24 rounded-full bg-[#1A1D20] border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              {draft.logoUrl ? (
                <img
                  src={draft.logoUrl}
                  alt="Logo da Loja"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <Store className="w-8 h-8 text-[#FF5E1E]" />
                  <span className="text-[10px] font-bold uppercase mt-0.5">Sem Logo</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload('logoUrl', e)}
                  className="hidden"
                />
                <span className="w-full py-2 px-3 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-[#FF5E1E] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upar Foto de Logo</span>
                </span>
              </label>

              {draft.logoUrl && (
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, logoUrl: '' }))}
                  className="text-[11px] font-semibold text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover logo</span>
                </button>
              )}
            </div>

            <div className="w-full pt-1">
              <input
                type="text"
                value={draft.logoUrl}
                onChange={(e) => setDraft((prev) => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="Ou cole a URL direta da logo"
                className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-2.5 py-1.5 text-[11px] text-[#1A1D20] outline-none"
              />
            </div>
          </div>

          {/* Banner de Plano de Fundo (Capa) */}
          <div className="md:col-span-7 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E9ECEF] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-[#1A1D20] block">
                Plano de Fundo (Banner Superior do Cardápio)
              </span>
              <span className="text-[11px] text-[#6C757D]">
                Recomendado: proporção retangular horizontal (ex: 1200x400px).
              </span>
            </div>

            <div className="relative h-28 w-full rounded-xl overflow-hidden border border-[#E9ECEF] bg-[#1A1D20] shadow-2xs">
              {draft.bannerUrl ? (
                <img
                  src={draft.bannerUrl}
                  alt="Banner de Capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Sem plano de fundo
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-full sm:w-auto flex-1">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload('bannerUrl', e)}
                  className="hidden"
                />
                <span className="w-full py-2 px-3 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-[#FF5E1E] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upar Plano de Fundo</span>
                </span>
              </label>

              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    bannerUrl:
                      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
                  }))
                }
                className="text-xs font-semibold text-[#6C757D] hover:text-[#1A1D20] px-3 py-2 rounded-xl border border-[#E9ECEF] bg-white cursor-pointer"
              >
                Restaurar Padrão
              </button>
            </div>

            <div>
              <input
                type="text"
                value={draft.bannerUrl}
                onChange={(e) => setDraft((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                placeholder="Ou cole a URL direta da imagem de fundo"
                className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-2.5 py-1.5 text-[11px] text-[#1A1D20] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Dados da Empresa Contratante */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#FF5E1E]" />
            <span>Dados da Empresa Contratante</span>
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Identificação jurídica e nome de exibição no sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Nome Fantasia */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D]">
              Nome do Estabelecimento (Fantasia) *
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Brasa Burger"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>

          {/* CNPJ */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D]">
              CNPJ do Estabelecimento
            </label>
            <input
              type="text"
              value={draft.cnpj}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, cnpj: formatCnpjMask(e.target.value) }))
              }
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>

          {/* Razão Social */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D]">
              Razão Social / Nome Empresarial
            </label>
            <input
              type="text"
              value={draft.corporateName}
              onChange={(e) => setDraft((prev) => ({ ...prev, corporateName: e.target.value }))}
              placeholder="Ex: Brasa Hamburgueria LTDA"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>

          {/* Slogan / Subtítulo */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D]">
              Slogan / Subtítulo no Cardápio
            </label>
            <input
              type="text"
              value={draft.subtitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Ex: Hambúrguer artesanal · Feito na brasa"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Canais de Contato & Redes Sociais */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#FF5E1E]" />
            <span>Canais de Atendimento & Redes Sociais</span>
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Esses canais aparecem nos botões de contato do cardápio e no acompanhamento de pedidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* WhatsApp de Contato */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp de Atendimento</span>
              </span>
              {whatsappPreviewUrl && (
                <a
                  href={whatsappPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                >
                  <span>Testar</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </label>
            <input
              type="tel"
              value={draft.whatsapp}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, whatsapp: formatPhoneMask(e.target.value) }))
              }
              placeholder="(84) 99876-5432"
              maxLength={15}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>

          {/* Telefone Comercial */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D] flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Telefone Fixo / Comercial</span>
            </label>
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, phone: formatPhoneMask(e.target.value) }))
              }
              placeholder="(84) 3281-1234"
              maxLength={15}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6C757D] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                <span>@ do Instagram</span>
              </span>
              {instagramPreviewUrl && (
                <a
                  href={instagramPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-700 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </label>
            <input
              type="text"
              value={draft.instagram}
              onChange={(e) => setDraft((prev) => ({ ...prev, instagram: e.target.value }))}
              placeholder="@brasaburger"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 4: Endereço Físico do Estabelecimento */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF5E1E]" />
            <span>Endereço Físico do Estabelecimento</span>
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Localização física exibida para o cliente nos detalhes da loja.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6C757D] mb-1">
            Endereço Completo (Rua, Número, Bairro, Cidade / UF)
          </label>
          <input
            type="text"
            value={draft.address}
            onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Ex: Praça Antônio Basílio de Melo, 32, Centro, Nova Cruz / RN"
            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1D20] outline-none transition-all"
          />
        </div>
      </div>
    </div>
  )
}
