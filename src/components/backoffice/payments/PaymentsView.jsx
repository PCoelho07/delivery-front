import { useState, useMemo } from 'react'
import {
  CreditCard,
  Banknote,
  QrCode,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  KeyRound,
  Save,
  CheckCircle2,
  Copy,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { CustomSelect } from '../common/CustomSelect'
import {
  formatCnpjMask,
  formatCpfMask,
  formatPhoneMask,
} from '../../../lib/utils'

const PIX_KEY_OPTIONS = [
  {
    value: 'cnpj',
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    icon: <Building2 className="w-4 h-4 text-[#FF5E1E]" />,
  },
  {
    value: 'cpf',
    label: 'CPF',
    placeholder: '000.000.000-00',
    icon: <User className="w-4 h-4 text-[#FF5E1E]" />,
  },
  {
    value: 'phone',
    label: 'Telefone / WhatsApp',
    placeholder: '(00) 00000-0000',
    icon: <Phone className="w-4 h-4 text-[#FF5E1E]" />,
  },
  {
    value: 'email',
    label: 'E-mail',
    placeholder: 'pix@seuestabelecimento.com.br',
    icon: <Mail className="w-4 h-4 text-[#FF5E1E]" />,
  },
  {
    value: 'random',
    label: 'Chave Aleatória (EVP)',
    placeholder: 'Ex: 123e4567-e89b-12d3-a456-426614174000',
    icon: <KeyRound className="w-4 h-4 text-[#FF5E1E]" />,
  },
]

export function PaymentsView() {
  const {
    paymentConfig,
    updatePaymentMethods,
    updatePixConfig,
  } = useStoreAdmin()

  // Estado de rascunho local para formas de pagamento
  const [draftMethods, setDraftMethods] = useState({
    money: paymentConfig?.methods?.money ?? true,
    pix: paymentConfig?.methods?.pix ?? true,
    credit: paymentConfig?.methods?.credit ?? true,
    debit: paymentConfig?.methods?.debit ?? true,
  })

  // Estado de rascunho local para dados do PIX
  const [draftPixKeyType, setDraftPixKeyType] = useState(
    paymentConfig?.pix?.keyType || 'cnpj'
  )
  const [draftPixKey, setDraftPixKey] = useState(paymentConfig?.pix?.key || '')
  const [draftBeneficiary, setDraftBeneficiary] = useState(
    paymentConfig?.pix?.beneficiary ?? 'Brasa Burger'
  )

  const [copiedPreview, setCopiedPreview] = useState(false)

  // Verifica se há alterações pendentes de salvar
  const isDirty = useMemo(() => {
    const savedMethods = paymentConfig?.methods || {}
    const savedPix = paymentConfig?.pix || {}

    const methodsChanged =
      draftMethods.money !== (savedMethods.money ?? true) ||
      draftMethods.pix !== (savedMethods.pix ?? true) ||
      draftMethods.credit !== (savedMethods.credit ?? true) ||
      draftMethods.debit !== (savedMethods.debit ?? true)

    const pixChanged =
      draftPixKeyType !== (savedPix.keyType || 'cnpj') ||
      draftPixKey !== (savedPix.key || '') ||
      draftBeneficiary !== (savedPix.beneficiary ?? 'Brasa Burger')

    return methodsChanged || pixChanged
  }, [draftMethods, draftPixKeyType, draftPixKey, draftBeneficiary, paymentConfig])

  // Alternar checkbox de forma de pagamento (apenas rascunho)
  const handleToggleMethod = (key) => {
    const activeCount = Object.values(draftMethods).filter(Boolean).length
    if (draftMethods[key] && activeCount <= 1) {
      toast.warning('Você precisa manter pelo menos 1 forma de pagamento ativa.')
      return
    }

    setDraftMethods((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Manipular digitação da chave PIX com máscara inteligente
  const handlePixKeyChange = (val) => {
    if (draftPixKeyType === 'cnpj') {
      setDraftPixKey(formatCnpjMask(val))
    } else if (draftPixKeyType === 'cpf') {
      setDraftPixKey(formatCpfMask(val))
    } else if (draftPixKeyType === 'phone') {
      setDraftPixKey(formatPhoneMask(val))
    } else {
      setDraftPixKey(val)
    }
  }

  // Ao trocar o tipo de chave no CustomSelect
  const handleKeyTypeChange = (newType) => {
    setDraftPixKeyType(newType)
    setDraftPixKey('')
  }

  // Descartar alterações de rascunho
  const handleDiscard = () => {
    setDraftMethods({
      money: paymentConfig?.methods?.money ?? true,
      pix: paymentConfig?.methods?.pix ?? true,
      credit: paymentConfig?.methods?.credit ?? true,
      debit: paymentConfig?.methods?.debit ?? true,
    })
    setDraftPixKeyType(paymentConfig?.pix?.keyType || 'cnpj')
    setDraftPixKey(paymentConfig?.pix?.key || '')
    setDraftBeneficiary(paymentConfig?.pix?.beneficiary || 'Brasa Burger')
    toast.info('Alterações descartadas.')
  }

  // Salvar tudo no Zustand e persistir
  const handleSave = (e) => {
    e?.preventDefault()

    if (draftMethods.pix && !draftPixKey.trim()) {
      toast.error('Informe a chave PIX do estabelecimento antes de salvar.')
      return
    }

    updatePaymentMethods(draftMethods)
    updatePixConfig({
      keyType: draftPixKeyType,
      key: draftPixKey.trim(),
      beneficiary: draftBeneficiary.trim() || 'Estabelecimento',
    })

    toast.success('Configurações de pagamento e PIX salvas com sucesso!')
  }

  // Testar copiar da prévia
  const handleCopyPreview = async () => {
    if (!draftPixKey) return
    try {
      await navigator.clipboard.writeText(draftPixKey)
      setCopiedPreview(true)
      toast.success('Chave PIX copiada!')
      setTimeout(() => setCopiedPreview(false), 2000)
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const selectedKeyMeta =
    PIX_KEY_OPTIONS.find((t) => t.value === draftPixKeyType) || PIX_KEY_OPTIONS[0]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FF5E1E]" />
            <span>Pagamentos & Chave PIX</span>
            {isDirty && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Alterações pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Defina as formas de pagamento disponíveis e configure a chave PIX do estabelecimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3.5 py-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Descartar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#FF5E1E]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Pagamentos</span>
          </button>
        </div>
      </div>

      {/* Card 1: Formas de Pagamento Aceitas */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#FF5E1E]" />
            <span>Formas de Pagamento Aceitas</span>
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Marque as opções que os clientes poderão escolher na finalização do pedido.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opção 1: Dinheiro */}
          <button
            type="button"
            onClick={() => handleToggleMethod('money')}
            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
              draftMethods.money
                ? 'border-[#FF5E1E] bg-orange-50/20'
                : 'border-[#E9ECEF] hover:border-slate-300 bg-white opacity-70'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                draftMethods.money
                  ? 'border-[#FF5E1E] bg-[#FF5E1E] text-white'
                  : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {draftMethods.money && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#FF5E1E]" />
              <span className="font-bold text-xs text-[#1A1D20]">Dinheiro</span>
            </div>
          </button>

          {/* Opção 2: PIX */}
          <button
            type="button"
            onClick={() => handleToggleMethod('pix')}
            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
              draftMethods.pix
                ? 'border-[#FF5E1E] bg-orange-50/20'
                : 'border-[#E9ECEF] hover:border-slate-300 bg-white opacity-70'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                draftMethods.pix
                  ? 'border-[#FF5E1E] bg-[#FF5E1E] text-white'
                  : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {draftMethods.pix && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#FF5E1E]" />
              <span className="font-bold text-xs text-[#1A1D20]">PIX</span>
            </div>
          </button>

          {/* Opção 3: Cartão de Crédito (Maquininha) */}
          <button
            type="button"
            onClick={() => handleToggleMethod('credit')}
            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
              draftMethods.credit
                ? 'border-[#FF5E1E] bg-orange-50/20'
                : 'border-[#E9ECEF] hover:border-slate-300 bg-white opacity-70'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                draftMethods.credit
                  ? 'border-[#FF5E1E] bg-[#FF5E1E] text-white'
                  : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {draftMethods.credit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF5E1E]" />
              <span className="font-bold text-xs text-[#1A1D20]">Cartão de Crédito (Maquininha)</span>
            </div>
          </button>

          {/* Opção 4: Cartão de Débito (Maquininha) */}
          <button
            type="button"
            onClick={() => handleToggleMethod('debit')}
            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
              draftMethods.debit
                ? 'border-[#FF5E1E] bg-orange-50/20'
                : 'border-[#E9ECEF] hover:border-slate-300 bg-white opacity-70'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                draftMethods.debit
                  ? 'border-[#FF5E1E] bg-[#FF5E1E] text-white'
                  : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {draftMethods.debit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF5E1E]" />
              <span className="font-bold text-xs text-[#1A1D20]">Cartão de Débito (Maquininha)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Card 2: Configuração da Chave PIX */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#FF5E1E]" />
            <span>Configuração da Chave PIX</span>
            {!draftMethods.pix && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                PIX desmarcado nas opções acima
              </span>
            )}
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Informe a chave PIX onde você recebe os pagamentos dos clientes.
          </p>
        </div>

        {/* Linha: CustomSelect Tipo de Chave + Campo da Chave lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
          {/* Dropdown Customizado Tipo de Chave */}
          <div className="md:col-span-5">
            <CustomSelect
              label="Tipo de Chave PIX"
              required
              value={draftPixKeyType}
              onChange={handleKeyTypeChange}
              options={PIX_KEY_OPTIONS}
              placeholder="Selecione o tipo de chave"
            />
          </div>

          {/* Campo do Lado para Colocar a Chave */}
          <div className="md:col-span-7 space-y-1">
            <label className="block text-xs font-bold text-[#1A1D20]">
              Chave PIX ({selectedKeyMeta.label}) <span className="text-[#FF5E1E]">*</span>
            </label>
            <input
              type="text"
              value={draftPixKey}
              onChange={(e) => handlePixKeyChange(e.target.value)}
              placeholder={selectedKeyMeta.placeholder}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-bold outline-none font-mono transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Nome do Titular / Nome da Conta PIX */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-bold text-[#1A1D20]">
            Nome da Conta / Titular do PIX (Favorecido) <span className="text-[#FF5E1E]">*</span>
          </label>
          <input
            type="text"
            value={draftBeneficiary}
            onChange={(e) => setDraftBeneficiary(e.target.value)}
            placeholder="Ex: Carlos Henrique da Silva ou Brasa Burger Ltda"
            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-bold outline-none transition-all placeholder:text-[#9CA3AF]"
          />
          <p className="text-[11px] text-[#6C757D]">
            Nome exibido ao cliente no momento do pagamento para conferência bancária. Não precisa ser obrigatoriamente o nome da loja — pode ser o nome do proprietário ou titular da conta onde o valor cai.
          </p>
        </div>

        {/* Prévia Visual da Chave PIX */}
        {draftPixKey && (
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-orange-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E1E]" />
                <span>Chave PIX configurada:</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF5E1E] text-white px-2 py-0.5 rounded-full">
                {selectedKeyMeta.label}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-200">
              <div className="min-w-0 pr-3">
                <span className="font-mono text-xs font-bold text-[#1A1D20] block truncate select-all">
                  {draftPixKey}
                </span>
                <span className="text-[10px] text-[#6C757D] block mt-0.5 truncate">
                  Nome na Conta / Titular: <strong>{draftBeneficiary.trim() || 'Não informado'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isDirty ? (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200">
                    Pendente de salvar
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                    Ativo no Checkout
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleCopyPreview}
                  className="px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-[#FF5E1E] text-[#FF5E1E] hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedPreview ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé ÚNICO com feedback de status */}
        <div className="pt-3 border-t border-[#F1F3F5] flex items-center justify-between">
          <div>
            {isDirty ? (
              <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Você tem alterações não salvas. Clique em &ldquo;Salvar Pagamentos&rdquo; no topo para aplicar ao cardápio.</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#6C757D] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Formas de pagamento e chave PIX salvas e sincronizadas com a loja.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
