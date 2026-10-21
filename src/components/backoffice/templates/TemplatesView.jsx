import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { TemplateModal } from './TemplateModal'
import { ConfirmModal } from '../common/ConfirmModal'

export function TemplatesView() {
  const { templates, products, deleteTemplate } = useStoreAdmin()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [templateToEdit, setTemplateToEdit] = useState(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)

  const handleOpenNew = () => {
    setTemplateToEdit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (tmpl) => {
    setTemplateToEdit(tmpl)
    setIsModalOpen(true)
  }

  const handlePromptDelete = (tmpl) => {
    if (tmpl.id === 'tmpl-none') {
      toast.info('O template padrão neutro não pode ser excluído.')
      return
    }
    setTemplateToDelete(tmpl)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id)
      toast.success(`Template "${templateToDelete.name}" excluído com sucesso.`)
      setTemplateToDelete(null)
    }
  }

  // Não exibe o tmpl-none nos cards editáveis principais (ou exibe com formato neutro)
  const activeTemplates = templates.filter((t) => t.id !== 'tmpl-none')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex items-center gap-2">
            <span>🧩 Templates de Complementos</span>
            <span className="text-xs font-bold text-[#FF5E1E] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              {activeTemplates.length} {activeTemplates.length === 1 ? 'modelo' : 'modelos'}
            </span>
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Crie modelos reutilizáveis (como pontos da carne, bordas de pizza ou adicionais) e vincule aos seus produtos.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5E1E]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Template</span>
        </button>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTemplates.map((tmpl) => {
          const usedCount = products.filter(
            (p) => p.templateId === tmpl.id
          ).length
          const groups = tmpl.groups || []

          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4 hover:border-[#FF5E1E]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-sm text-[#1A1D20] flex items-center gap-1.5 truncate">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-[#6C757D] mt-0.5 line-clamp-2">
                      {tmpl.desc || 'Sem descrição cadastrada'}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(tmpl)}
                      className="px-3 py-1.5 rounded-xl border border-[#E9ECEF] hover:border-[#FF5E1E] text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handlePromptDelete(tmpl)}
                      title="Excluir este template"
                      className="p-1.5 text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badge de Uso nos Produtos */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Ativo em <strong>{usedCount} {usedCount === 1 ? 'produto' : 'produtos'}</strong>
                    </span>
                  </span>
                </div>

                {/* Grupos deste Template */}
                <div className="space-y-2 pt-2 border-t border-[#F1F3F5]">
                  <span className="text-[11px] font-bold text-[#6C757D] block uppercase tracking-wider">
                    Grupos deste Modelo ({groups.length}):
                  </span>

                  {groups.length === 0 ? (
                    <p className="text-xs text-[#6C757D] italic">
                      Nenhum grupo configurado neste template.
                    </p>
                  ) : (
                    groups.map((grp, idx) => (
                      <div
                        key={grp.id || idx}
                        className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[#1A1D20]">
                          <span className="truncate">{grp.name}</span>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                              grp.required
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {grp.required ? 'Obrigatório' : 'Opcional'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6C757D]">
                          {grp.items?.length || 0} opções (
                          {(grp.items || [])
                            .slice(0, 3)
                            .map((i) => i.name)
                            .join(', ')}
                          {(grp.items || []).length > 3 ? '...' : ''})
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Criação / Edição de Template */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        templateToEdit={templateToEdit}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Template de Complementos?"
        description={`Tem certeza que deseja excluir o template "${templateToDelete?.name}"? Os produtos vinculados a ele passarão a não ter adicionais.`}
        confirmText="Sim, excluir template"
        confirmVariant="danger"
      />
    </div>
  )
}
