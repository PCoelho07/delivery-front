import { useState } from 'react'
import { X, Plus, Trash2, Puzzle } from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { formatTitleCase } from '../../../utils/textUtils'

function TemplateModalContent({ onClose, templateToEdit }) {
  const { addTemplate, updateTemplate } = useStoreAdmin()

  const [name, setName] = useState(templateToEdit?.name || '')
  const [desc, setDesc] = useState(templateToEdit?.desc || '')
  const [groups, setGroups] = useState(() => {
    if (templateToEdit?.groups && templateToEdit.groups.length > 0) {
      return templateToEdit.groups.map((g) => ({
        id: g.id || `grp-${Date.now()}-${Math.random()}`,
        name: g.name || '',
        required: Boolean(g.required),
        min: g.min ?? (g.required ? 1 : 0),
        max: g.max ?? (g.required ? 1 : 5),
        items: (g.items || []).map((it) => ({
          id: it.id || `it-${Date.now()}-${Math.random()}`,
          name: it.name || '',
          price: it.price !== undefined ? String(it.price) : '0',
        })),
      }))
    }
    return [
      {
        id: `grp-${Date.now()}-1`,
        name: '',
        required: true,
        min: 1,
        max: 1,
        items: [
          { id: `it-${Date.now()}-1`, name: '', price: '0' },
          { id: `it-${Date.now()}-2`, name: '', price: '0' },
        ],
      },
    ]
  })

  // Adicionar novo grupo
  const handleAddGroup = () => {
    const newGroup = {
      id: `grp-${Date.now()}`,
      name: '',
      required: false,
      min: 0,
      max: 5,
      items: [{ id: `it-${Date.now()}`, name: '', price: '0' }],
    }
    setGroups([...groups, newGroup])
  }

  // Remover grupo
  const handleRemoveGroup = (groupIndex) => {
    if (groups.length <= 1) {
      toast.error('O template precisa ter pelo menos um grupo de complementos.')
      return
    }
    setGroups(groups.filter((_, idx) => idx !== groupIndex))
  }

  // Atualizar campo do grupo
  const handleUpdateGroup = (groupIndex, field, value) => {
    setGroups((prev) =>
      prev.map((grp, idx) => {
        if (idx !== groupIndex) return grp
        const updated = { ...grp, [field]: value }

        // Ajusta min/max coerente ao alternar obrigatório/opcional
        if (field === 'required') {
          if (value === true) {
            updated.min = 1
            updated.max = 1
          } else {
            updated.min = 0
            updated.max = 5
          }
        }
        return updated
      })
    )
  }

  // Adicionar opção ao grupo
  const handleAddItem = (groupIndex) => {
    setGroups((prev) =>
      prev.map((grp, idx) => {
        if (idx !== groupIndex) return grp
        const newItem = {
          id: `it-${Date.now()}-${Math.random()}`,
          name: '',
          price: '0',
        }
        return { ...grp, items: [...grp.items, newItem] }
      })
    )
  }

  // Remover opção do grupo
  const handleRemoveItem = (groupIndex, itemIndex) => {
    setGroups((prev) =>
      prev.map((grp, gIdx) => {
        if (gIdx !== groupIndex) return grp
        if (grp.items.length <= 1) {
          toast.error('Cada grupo precisa ter no mínimo 1 opção.')
          return grp
        }
        return {
          ...grp,
          items: grp.items.filter((_, iIdx) => iIdx !== itemIndex),
        }
      })
    )
  }

  // Atualizar opção do grupo
  const handleUpdateItem = (groupIndex, itemIndex, field, value) => {
    setGroups((prev) =>
      prev.map((grp, gIdx) => {
        if (gIdx !== groupIndex) return grp
        return {
          ...grp,
          items: grp.items.map((it, iIdx) =>
            iIdx === itemIndex ? { ...it, [field]: value } : it
          ),
        }
      })
    )
  }

  // Submissão do formulário
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o nome do template.')
      return
    }

    if (groups.length === 0) {
      toast.error('Adicione ao menos um grupo de complementos.')
      return
    }

    // Valida se todos os grupos têm nome
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i]
      if (!g.name.trim()) {
        toast.error(`Informe o nome do Grupo ${i + 1}.`)
        return
      }
      if (g.items.length === 0) {
        toast.error(`O grupo "${g.name}" precisa ter ao menos uma opção.`)
        return
      }
      // Valida se as opções têm nome
      for (let j = 0; j < g.items.length; j++) {
        if (!g.items[j].name.trim()) {
          toast.error(
            `A opção ${j + 1} do grupo "${g.name}" precisa ter um nome.`
          )
          return
        }
      }
    }

    const formattedPayload = {
      name: formatTitleCase(name),
      desc: desc.trim(),
      groups: groups.map((g) => ({
        ...g,
        name: formatTitleCase(g.name),
        items: g.items.map((it) => ({
          ...it,
          name: formatTitleCase(it.name),
          price: parseFloat(String(it.price).replace(',', '.')) || 0,
        })),
      })),
    }

    if (templateToEdit) {
      updateTemplate(templateToEdit.id, formattedPayload)
      toast.success(`Template "${formattedPayload.name}" atualizado com sucesso!`)
    } else {
      addTemplate(formattedPayload)
      toast.success(`Novo template "${formattedPayload.name}" criado!`)
    }

    onClose()
  }

  return (
    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E9ECEF] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header do Modal */}
      <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5E1E] flex items-center justify-center font-bold text-lg shrink-0">
            <Puzzle className="w-5 h-5 text-[#FF5E1E]" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#1A1D20]">
              {templateToEdit
                ? 'Editar Template de Complementos'
                : 'Novo Template de Complementos'}
            </h3>
            <p className="text-xs text-[#6C757D]">
              Modelo reutilizável para vincular aos produtos (ex: Ponto da carne, adicionais pagos)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Formulário com Scroll Interno e Rodapé Fixo */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Seção 1: Dados Gerais do Template */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Nome do Template *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Hambúrgueres Artesanais, Pizzas Grandes, Açaí no Copo"
                required
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] font-bold outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Descrição do Template (Opcional)
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Ponto da carne, adicionais pagos e preferências sem ingrediente"
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] outline-none transition-all"
              />
            </div>
          </div>

        {/* Seção 2: Grupos de Complementos */}
        <div className="space-y-3 pt-2 border-t border-[#F1F3F5]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-[#1A1D20] uppercase tracking-wider">
                Grupos deste Template ({groups.length})
              </h4>
              <p className="text-[11px] text-[#6C757D]">
                Defina onde o cliente é obrigado a escolher e onde é opcional
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddGroup}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5E1E] border border-orange-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Grupo</span>
            </button>
          </div>

          {/* Lista dos Grupos */}
          <div className="space-y-4">
            {groups.map((grp, gIdx) => (
              <div
                key={grp.id || gIdx}
                className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-3.5 hover:border-[#FF5E1E]/30 transition-all shadow-xs"
              >
                {/* Cabeçalho do Grupo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E9ECEF]">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={grp.name}
                      onChange={(e) =>
                        handleUpdateGroup(gIdx, 'name', e.target.value)
                      }
                      placeholder={`Nome do Grupo ${gIdx + 1} (ex: Ponto da Carne, Adicionais)`}
                      required
                      className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-3 py-2 text-xs text-[#1A1D20] font-bold outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Seletor Tipo: Obrigatório vs Opcional */}
                    <div className="flex items-center bg-white border border-[#E9ECEF] rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateGroup(gIdx, 'required', true)}
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                          grp.required
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-[#6C757D] hover:text-[#1A1D20]'
                        }`}
                      >
                        🔴 Obrigatório
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateGroup(gIdx, 'required', false)}
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                          !grp.required
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-[#6C757D] hover:text-[#1A1D20]'
                        }`}
                      >
                        🟢 Opcional
                      </button>
                    </div>

                    {/* Excluir Grupo */}
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(gIdx)}
                      title="Excluir este grupo"
                      className="w-8 h-8 rounded-xl border border-[#E9ECEF] bg-white hover:bg-rose-50 text-[#6C757D] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-configuração de limite quando for opcional */}
                {!grp.required && (
                  <div className="flex items-center gap-2 text-[11px] text-[#6C757D] bg-white px-3 py-1.5 rounded-xl border border-[#E9ECEF] w-fit">
                    <span className="font-semibold">O cliente pode escolher até:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={grp.max ?? 5}
                      onChange={(e) =>
                        handleUpdateGroup(
                          gIdx,
                          'max',
                          parseInt(e.target.value) || 5
                        )
                      }
                      className="w-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-2 py-0.5 text-center text-xs font-bold text-[#1A1D20] outline-none"
                    />
                    <span>opções</span>
                  </div>
                )}

                {/* Linhas de Opções deste Grupo */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                    Opções e Valores Adicionais:
                  </span>

                  {grp.items.map((it, iIdx) => (
                    <div
                      key={it.id || iIdx}
                      className="flex items-center gap-2"
                    >
                      {/* Nome da Opção */}
                      <input
                        type="text"
                        value={it.name}
                        onChange={(e) =>
                          handleUpdateItem(
                            gIdx,
                            iIdx,
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="Nome da opção (ex: Bacon Crocante, Ao Ponto)"
                        required
                        className="flex-1 bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl px-3 py-1.5 text-xs text-[#1A1D20] outline-none"
                      />

                      {/* Preço Adicional */}
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6C757D]">
                          R$
                        </span>
                        <input
                          type="text"
                          value={it.price}
                          onChange={(e) =>
                            handleUpdateItem(
                              gIdx,
                              iIdx,
                              'price',
                              e.target.value
                            )
                          }
                          placeholder="0,00"
                          className="w-full bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-extrabold text-[#1A1D20] outline-none"
                        />
                      </div>

                      {/* Botão Remover Opção */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(gIdx, iIdx)}
                        title="Remover opção"
                        className="w-7 h-7 rounded-lg text-[#6C757D] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Botão Adicionar Opção ao Grupo */}
                  <button
                    type="button"
                    onClick={() => handleAddItem(gIdx)}
                    className="text-xs font-bold text-[#FF5E1E] hover:text-[#E64E12] inline-flex items-center gap-1.5 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar opção neste grupo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé Fixo com Ações */}
        <div className="p-4 sm:p-5 border-t border-[#E9ECEF] flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white text-xs font-bold shadow-md shadow-[#FF5E1E]/20 transition-all cursor-pointer"
          >
            {templateToEdit ? 'Salvar Alterações' : 'Criar Template'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function TemplateModal({ isOpen, onClose, templateToEdit = null }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <TemplateModalContent
        key={templateToEdit?.id || 'new'}
        onClose={onClose}
        templateToEdit={templateToEdit}
      />
    </div>
  )
}

