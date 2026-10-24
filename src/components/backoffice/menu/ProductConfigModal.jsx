import { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { formatTitleCase } from '../../../utils/textUtils'

export function ProductConfigModal({
  isOpen,
  onClose,
  configToEdit = null,
  onSaveSuccess,
}) {
  const { addTemplate, updateTemplate } = useStoreAdmin()

  const [name, setName] = useState(() => {
    if (configToEdit && configToEdit.id !== 'tmpl-none') {
      return configToEdit.name || ''
    }
    return ''
  })

  const [groups, setGroups] = useState(() => {
    if (configToEdit && configToEdit.id !== 'tmpl-none' && configToEdit.groups) {
      return configToEdit.groups.map((g) => ({
        id: g.id || `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: g.name || '',
        required: Boolean(g.required),
        min: g.min ?? (g.required ? 1 : 0),
        max: g.max ?? (g.required ? 1 : 5),
        items: (g.items || []).map((it) => ({
          id: it.id || `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: it.name || '',
          price: it.price !== undefined ? String(it.price) : '0',
        })),
      }))
    }
    return [
      {
        id: `grp-${Date.now()}-1`,
        name: '',
        required: false,
        min: 0,
        max: 5,
        items: [
          { id: `it-${Date.now()}-1`, name: '', price: '0' },
          { id: `it-${Date.now()}-2`, name: '', price: '0' },
        ],
      },
    ]
  })

  if (!isOpen) return null

  // Adicionar novo grupo de opções
  const handleAddGroup = () => {
    const newGroup = {
      id: `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      required: false,
      min: 0,
      max: 5,
      items: [
        {
          id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: '',
          price: '0',
        },
      ],
    }
    setGroups((prev) => [...prev, newGroup])
  }

  // Remover grupo
  const handleRemoveGroup = (groupIndex) => {
    if (groups.length <= 1) {
      toast.error('A configuração precisa de pelo menos 1 grupo de opções.')
      return
    }
    setGroups((prev) => prev.filter((_, idx) => idx !== groupIndex))
  }

  // Atualizar campo do grupo
  const handleUpdateGroup = (groupIndex, field, value) => {
    setGroups((prev) =>
      prev.map((grp, idx) => {
        if (idx !== groupIndex) return grp
        const updated = { ...grp, [field]: value }

        // Ao alternar Obrigatório / Opcional, auto-ajusta min e max
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
          id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: '',
          price: '0',
        }
        return { ...grp, items: [...(grp.items || []), newItem] }
      })
    )
  }

  // Remover opção
  const handleRemoveItem = (groupIndex, itemIndex) => {
    setGroups((prev) =>
      prev.map((grp, idx) => {
        if (idx !== groupIndex) return grp
        return {
          ...grp,
          items: grp.items.filter((_, iIdx) => iIdx !== itemIndex),
        }
      })
    )
  }

  // Atualizar opção
  const handleUpdateItem = (groupIndex, itemIndex, field, value) => {
    setGroups((prev) =>
      prev.map((grp, idx) => {
        if (idx !== groupIndex) return grp
        return {
          ...grp,
          items: grp.items.map((it, iIdx) => {
            if (iIdx !== itemIndex) return it
            return { ...it, [field]: value }
          }),
        }
      })
    )
  }

  // Salvar Configuração
  const handleSave = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Informe o Nome da Configuração (ex: Hambúrgueres Tradicionais).')
      return
    }

    const formattedConfigName = formatTitleCase(name)

    // Valida grupos
    const validGroups = groups
      .filter((g) => g.name.trim() !== '')
      .map((g) => ({
        id: g.id,
        name: formatTitleCase(g.name),
        required: Boolean(g.required),
        min: Number(g.min) || (g.required ? 1 : 0),
        max: Number(g.max) || (g.required ? 1 : 5),
        items: (g.items || [])
          .filter((it) => it.name.trim() !== '')
          .map((it) => ({
            id: it.id,
            name: formatTitleCase(it.name),
            price: Math.max(0, parseFloat(String(it.price).replace(',', '.')) || 0),
          })),
      }))

    if (validGroups.length === 0) {
      toast.error('Informe o nome de pelo menos um Grupo de Opções (ex: Ponto da Carne).')
      return
    }

    for (const grp of validGroups) {
      if (!grp.items || grp.items.length === 0) {
        toast.error(`O grupo "${grp.name}" precisa ter pelo menos uma opção cadastrada.`)
        return
      }
    }

    let savedResult = null

    if (configToEdit && configToEdit.id && configToEdit.id !== 'tmpl-none') {
      // Atualiza configuração existente
      updateTemplate(configToEdit.id, {
        name: formattedConfigName,
        desc: `${validGroups.length} ${validGroups.length === 1 ? 'grupo' : 'grupos'} de opções`,
        groups: validGroups,
      })
      savedResult = {
        id: configToEdit.id,
        name: formattedConfigName,
        groups: validGroups,
      }
      toast.success(`Configuração "${formattedConfigName}" atualizada com sucesso!`)
    } else {
      // Cria nova configuração geral na loja
      const newTemplate = addTemplate({
        name: formattedConfigName,
        desc: `${validGroups.length} ${validGroups.length === 1 ? 'grupo' : 'grupos'} de opções`,
        groups: validGroups,
      })
      savedResult = newTemplate
      toast.success(
        `Configuração "${formattedConfigName}" criada e salva na loja para todos os produtos!`
      )
    }

    onSaveSuccess?.(savedResult)
    onClose()
  }

  const isEditing = Boolean(configToEdit && configToEdit.id && configToEdit.id !== 'tmpl-none')

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E9ECEF] animate-modal my-auto overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E9ECEF] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5 text-[#FF5E1E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                {isEditing ? 'Editar Configuração de Opcionais' : 'Adicionar Configuração de Opcionais'}
              </h3>
              <p className="text-xs text-[#6C757D]">
                Configure opcionais, obrigatórios e adicionais salvos para toda a loja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
            {/* Nome da Configuração */}
            <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5E1E]" />
                  <span>Nome da Configuração *</span>
                </label>
                <span className="text-[10px] font-extrabold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
                  Salva Geral na Loja
                </span>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Hambúrgueres Tradicionais, Pizzas Grandes, Açaí Completo..."
                className="w-full bg-white border border-orange-200 focus:border-[#FF5E1E] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1D20] outline-none shadow-2xs"
              />
              <p className="text-[11px] text-orange-900/80 leading-relaxed">
                💡 Esta configuração ficará disponível no menu para ser vinculada a qualquer outro produto com apenas 1 clique.
              </p>
            </div>

            {/* Lista de Grupos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#1A1D20] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF5E1E]" />
                  <span>Grupos de Opções ({groups.length})</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-[#FF5E1E] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Grupo</span>
                </button>
              </div>

              {groups.map((group, gIdx) => (
                <div
                  key={group.id || gIdx}
                  className="bg-white rounded-2xl border border-[#E9ECEF] p-4 shadow-xs space-y-3.5"
                >
                  {/* Cabeçalho do Grupo: Nome + Obrigatório/Opcional + Excluir */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-[#6C757D] mb-1">
                        Nome do Grupo / Etapa *
                      </label>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) =>
                          handleUpdateGroup(gIdx, 'name', e.target.value)
                        }
                        placeholder="Ex: Ponto da Carne, Turbine seu Burger, Borda Recheada"
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D20] outline-none"
                      />
                    </div>

                    {/* Seletor Obrigatório vs Opcional */}
                    <div className="flex items-center gap-2 shrink-0 sm:pt-4">
                      <div className="bg-[#F8F9FA] p-1 rounded-xl border border-[#E9ECEF] flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateGroup(gIdx, 'required', true)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                            group.required
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-[#6C757D] hover:text-[#1A1D20]'
                          }`}
                        >
                          Obrigatório
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateGroup(gIdx, 'required', false)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                            !group.required
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-[#6C757D] hover:text-[#1A1D20]'
                          }`}
                        >
                          Opcional
                        </button>
                      </div>

                      {groups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(gIdx)}
                          className="p-2 text-[#6C757D] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Remover este grupo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Limites de Escolha (Mínimo / Máximo) */}
                  <div className="flex items-center gap-3 bg-[#F8F9FA] p-2.5 rounded-xl text-xs text-[#6C757D]">
                    <span className="font-semibold text-[11px]">
                      Quantidade de escolhas do cliente:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] font-bold text-[#1A1D20]">
                        Mín:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={group.min}
                        onChange={(e) =>
                          handleUpdateGroup(gIdx, 'min', e.target.value)
                        }
                        className="w-12 bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-lg px-2 py-1 text-center font-bold text-xs text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] font-bold text-[#1A1D20]">
                        Máx:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={group.max}
                        onChange={(e) =>
                          handleUpdateGroup(gIdx, 'max', e.target.value)
                        }
                        className="w-12 bg-white border border-[#E9ECEF] focus:border-[#FF5E1E] rounded-lg px-2 py-1 text-center font-bold text-xs text-[#1A1D20] outline-none"
                      />
                    </div>
                  </div>

                  {/* Tabela de Opções deste Grupo */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-bold text-[#6C757D]">
                      Opções / Adicionais deste Grupo:
                    </label>

                    {(group.items || []).map((item, iIdx) => (
                      <div key={item.id || iIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleUpdateItem(gIdx, iIdx, 'name', e.target.value)
                          }
                          placeholder="Ex: Ao Ponto, Bacon Crocante, Catupiry Original"
                          className="flex-1 bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl px-3 py-1.5 text-xs text-[#1A1D20] font-medium placeholder:font-normal placeholder:text-slate-400 outline-none"
                        />

                        <div className="relative w-28 shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">
                            +R$
                          </span>
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) =>
                              handleUpdateItem(gIdx, iIdx, 'price', e.target.value)
                            }
                            placeholder="0,00"
                            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#FF5E1E] focus:bg-white rounded-xl pl-9 pr-2 py-1.5 text-xs text-[#1A1D20] font-bold placeholder:font-normal placeholder:text-slate-300 outline-none text-right"
                          />
                        </div>

                        {group.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(gIdx, iIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="Remover opção"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddItem(gIdx)}
                      className="w-full py-2 rounded-xl border border-dashed border-[#E9ECEF] hover:border-[#FF5E1E] bg-[#F8F9FA] hover:bg-orange-50 text-[11px] font-bold text-[#6C757D] hover:text-[#FF5E1E] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Opção neste grupo</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddGroup}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-orange-200 hover:border-[#FF5E1E] bg-orange-50/40 hover:bg-orange-50 text-xs font-bold text-[#FF5E1E] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Outro Grupo de Opções</span>
              </button>
            </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="p-4 sm:p-5 border-t border-[#E9ECEF] flex items-center justify-end gap-2.5 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] text-xs font-bold text-[#6C757D] hover:bg-[#F8F9FA] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white text-xs font-bold shadow-md shadow-[#FF5E1E]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Configuração' : 'Criar Configuração'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
