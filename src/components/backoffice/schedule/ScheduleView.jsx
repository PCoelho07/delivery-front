import { useState, useMemo } from 'react'
import {
  Clock,
  Zap,
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  PauseCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin, calculateStoreLiveStatus } from '../../../store/useStoreAdmin'
import { CustomSelect } from '../common/CustomSelect'
import { normalizeTime24h } from '../../../utils/textUtils'

const BRAZIL_TIMEZONES = [
  {
    value: 'America/Sao_Paulo',
    label: 'Horário de Brasília (GMT-3)',
    desc: 'Padrão Nacional · SP, RJ, DF, Sul, Sudeste e Nordeste',
  },
  {
    value: 'America/Manaus',
    label: 'Manaus / Cuiabá (GMT-4)',
    desc: 'Amazonas, Mato Grosso, MS, Rondônia e Roraima',
  },
  {
    value: 'America/Rio_Branco',
    label: 'Rio Branco (GMT-5)',
    desc: 'Acre e extremo oeste do Amazonas',
  },
  {
    value: 'America/Noronha',
    label: 'Fernando de Noronha (GMT-2)',
    desc: 'Arquipélago e ilhas oceânicas',
  },
]

export function ScheduleView() {
  const {
    schedule,
    timezone,
    storeStatusMode,
    setTimezone,
    setFullSchedule,
  } = useStoreAdmin()

  // Rascunho local de edição (só comita no clique de "Salvar Horários")
  const [draftSchedule, setDraftSchedule] = useState(() =>
    JSON.parse(JSON.stringify(schedule))
  )
  const [draftTimezone, setDraftTimezone] = useState(timezone || 'America/Sao_Paulo')

  // Verifica se há alterações pendentes em relação ao Zustand / localStorage
  const isDirty = useMemo(() => {
    return (
      draftTimezone !== (timezone || 'America/Sao_Paulo') ||
      JSON.stringify(draftSchedule) !== JSON.stringify(schedule)
    )
  }, [draftSchedule, draftTimezone, schedule, timezone])

  // Calcula o status dinâmico em tempo real da loja salva
  const liveStatus = calculateStoreLiveStatus(schedule, timezone, storeStatusMode)

  // Estado local para os inputs do atalho de replicação em massa
  const [bulkStart, setBulkStart] = useState('18:00')
  const [bulkEnd, setBulkEnd] = useState('23:30')

  // Atualiza um dia no rascunho
  const updateDraftDay = (dayId, partial) => {
    setDraftSchedule((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, ...partial } : d))
    )
  }

  // Aplica para todos os dias no rascunho (Dom a Dom)
  const handleApplyToAllDays = () => {
    const startNorm = normalizeTime24h(bulkStart, '18:00')
    const endNorm = normalizeTime24h(bulkEnd, '23:30')
    setBulkStart(startNorm)
    setBulkEnd(endNorm)
    setDraftSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        start: startNorm,
        end: endNorm,
        open: true,
      }))
    )
    toast.info(
      `Horário (${startNorm} às ${endNorm}) preenchido em todos os dias. Clique em "Salvar Horários" para confirmar.`
    )
  }

  // Aplica de Segunda a Sexta no rascunho
  const handleApplyWeekdays = () => {
    const startNorm = normalizeTime24h(bulkStart, '18:00')
    const endNorm = normalizeTime24h(bulkEnd, '23:30')
    setBulkStart(startNorm)
    setBulkEnd(endNorm)
    setDraftSchedule((prev) =>
      prev.map((d) =>
        ['seg', 'ter', 'qua', 'qui', 'sex'].includes(d.id)
          ? { ...d, start: startNorm, end: endNorm, open: true }
          : d
      )
    )
    toast.info(
      `Horário (${startNorm} às ${endNorm}) preenchido de Seg a Sex. Clique em "Salvar Horários" para confirmar.`
    )
  }

  // Aplica Sábado e Domingo no rascunho
  const handleApplyWeekend = () => {
    const startNorm = normalizeTime24h(bulkStart, '18:00')
    const endNorm = normalizeTime24h(bulkEnd, '23:30')
    setBulkStart(startNorm)
    setBulkEnd(endNorm)
    setDraftSchedule((prev) =>
      prev.map((d) =>
        ['sab', 'dom'].includes(d.id)
          ? { ...d, start: startNorm, end: endNorm, open: true }
          : d
      )
    )
    toast.info(
      `Horário (${startNorm} às ${endNorm}) preenchido para Sáb e Dom. Clique em "Salvar Horários" para confirmar.`
    )
  }

  // Alterna o status aberto/fechado de um dia no rascunho
  const handleToggleDayOpen = (day) => {
    updateDraftDay(day.id, { open: !day.open })
  }

  // Salvar no Zustand e persistir
  const handleSaveChanges = () => {
    setFullSchedule(draftSchedule)
    setTimezone(draftTimezone)
    toast.success('Horários de funcionamento salvos e aplicados com sucesso!')
  }

  // Descartar alterações do rascunho
  const handleDiscardChanges = () => {
    setDraftSchedule(JSON.parse(JSON.stringify(schedule)))
    setDraftTimezone(timezone || 'America/Sao_Paulo')
    toast.info('Alterações descartadas. Restaurado para os horários ativos.')
  }

  // Preenche valores padrão de Brasília no rascunho
  const handleResetDefault = () => {
    const defaultSchedule = [
      { id: 'seg', name: 'Segunda-feira', shortName: 'Seg', open: true, start: '18:00', end: '23:30' },
      { id: 'ter', name: 'Terça-feira', shortName: 'Ter', open: true, start: '18:00', end: '23:30' },
      { id: 'qua', name: 'Quarta-feira', shortName: 'Qua', open: true, start: '18:00', end: '23:30' },
      { id: 'qui', name: 'Quinta-feira', shortName: 'Qui', open: true, start: '18:00', end: '23:30' },
      { id: 'sex', name: 'Sexta-feira', shortName: 'Sex', open: true, start: '18:00', end: '00:00' },
      { id: 'sab', name: 'Sábado', shortName: 'Sáb', open: true, start: '18:00', end: '00:30' },
      { id: 'dom', name: 'Domingo', shortName: 'Dom', open: true, start: '18:00', end: '23:30' },
    ]
    setDraftSchedule(defaultSchedule)
    setDraftTimezone('America/Sao_Paulo')
    toast.info('Horários padrão carregados no rascunho. Clique em "Salvar Horários" para confirmar.')
  }

  // Obtém o dia atual da semana
  const [todayId] = useState(() => {
    const dayNamesMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
    return dayNamesMap[new Date().getDay()]
  })
  const todaySchedule = draftSchedule.find((d) => d.id === todayId)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1D20] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF5E1E]" />
            <span>Horários da Semana</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                liveStatus.variant === 'paused'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : liveStatus.isOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-[#6C757D] border-slate-200'
              }`}
            >
              {liveStatus.variant === 'paused' ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Fechado Temporariamente</span>
                </>
              ) : liveStatus.isOpen ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Aberto Agora</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>{liveStatus.label}</span>
                </>
              )}
            </span>
            {isDirty && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Alterações pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Defina o expediente semanal no padrão 24 horas e clique em <strong>Salvar Horários</strong> para aplicar.
          </p>
        </div>

        <button
          onClick={handleResetDefault}
          title="Carregar horários padrão no rascunho"
          className="px-3.5 py-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrão</span>
        </button>
      </div>

      {/* Bloco Unificado: Fuso Horário & Configuração Rápida */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Cabeçalho do Bloco: Título + Seletor de Fuso Horário integrado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F3F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 fill-[#FF5E1E]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1D20]">
                Configuração Rápida & Fuso Horário
              </h3>
              <p className="text-[11px] text-[#6C757D]">
                Ajuste o fuso e preencha o expediente padrão nos dias desejados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-[#6C757D] shrink-0 hidden md:inline">
              Fuso:
            </span>
            <div className="w-full sm:w-72">
              <CustomSelect
                value={draftTimezone || 'America/Sao_Paulo'}
                onChange={(val) => {
                  setDraftTimezone(val)
                  toast.info('Fuso horário alterado no rascunho.')
                }}
                options={BRAZIL_TIMEZONES}
                placeholder="Selecione o fuso horário"
              />
            </div>
          </div>
        </div>

        {/* Linha de Horários e Ações com Lucide Icons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Inputs De / Até */}
          <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-1.5 rounded-xl border border-[#E9ECEF] focus-within:border-[#FF5E1E] focus-within:bg-white transition-all shadow-xs">
            <span className="text-xs font-semibold text-[#6C757D]">De:</span>
            <input
              type="text"
              value={bulkStart}
              onChange={(e) => setBulkStart(e.target.value)}
              onBlur={(e) => setBulkStart(normalizeTime24h(e.target.value, '18:00'))}
              placeholder="18:00"
              maxLength={6}
              className="w-14 text-xs font-black text-[#1A1D20] outline-none text-center bg-transparent"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-1.5 rounded-xl border border-[#E9ECEF] focus-within:border-[#FF5E1E] focus-within:bg-white transition-all shadow-xs">
            <span className="text-xs font-semibold text-[#6C757D]">Até:</span>
            <input
              type="text"
              value={bulkEnd}
              onChange={(e) => setBulkEnd(e.target.value)}
              onBlur={(e) => setBulkEnd(normalizeTime24h(e.target.value, '23:30'))}
              placeholder="23:30"
              maxLength={6}
              className="w-14 text-xs font-black text-[#1A1D20] outline-none text-center bg-transparent"
            />
          </div>

          {/* Botão Principal: Todos os Dias (Dom a Dom) */}
          <button
            type="button"
            onClick={handleApplyToAllDays}
            className="px-3.5 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Todos os dias (Dom a Dom)</span>
          </button>

          {/* Botão Seg a Sex com Lucide Calendar */}
          <button
            type="button"
            onClick={handleApplyWeekdays}
            className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-[#FF5E1E] text-[#FF5E1E] hover:text-white border border-orange-200/80 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Seg a Sex (Dias úteis)</span>
          </button>

          {/* Botão Sáb e Dom com Lucide CalendarDays */}
          <button
            type="button"
            onClick={handleApplyWeekend}
            className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-[#FF5E1E] text-[#FF5E1E] hover:text-white border border-orange-200/80 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Sáb e Dom (Fim de semana)</span>
          </button>
        </div>
      </div>

      {/* Grade Semanal Limpa com Border Laranja Sutil no Hoje */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
          <div>
            <h3 className="font-extrabold text-sm text-[#1A1D20]">
              Grade Semanal de Funcionamento
            </h3>
            <p className="text-xs text-[#6C757D]">
              Horário padrão brasileiro de 24 horas (ex: 19:00 ou 19h).
            </p>
          </div>

          {todaySchedule && (
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-bold text-[#6C757D] block">
                Hoje ({todaySchedule.name}):
              </span>
              <span
                className={`text-xs font-black ${
                  liveStatus.variant === 'paused'
                    ? 'text-rose-600'
                    : liveStatus.isOpen
                    ? 'text-emerald-700'
                    : 'text-[#6C757D]'
                }`}
              >
                {liveStatus.variant === 'paused' ? (
                  <span className="inline-flex items-center gap-1 text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pausa temporária ativa no topo</span>
                  </span>
                ) : todaySchedule.open ? (
                  `Das ${todaySchedule.start} às ${todaySchedule.end} (${liveStatus.label})`
                ) : (
                  'Sem expediente programado hoje'
                )}
              </span>
            </div>
          )}
        </div>

        <div className="divide-y divide-[#F1F3F5] space-y-1">
          {draftSchedule.map((day) => {
            const isToday = day.id === todayId

            return (
              <div
                key={day.id}
                className={`py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl px-3 transition-colors ${
                  isToday
                    ? 'border border-[#FF5E1E]/25 bg-orange-50/15 shadow-[0_0_0_1px_rgba(255,94,30,0.06)]'
                    : 'border border-transparent hover:bg-slate-50/60'
                }`}
              >
                {/* Nome do Dia + Switch Aberto/Fechado */}
                <div className="flex items-center gap-3 w-48">
                  {/* Switch Aberto/Fechado */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.open}
                    onClick={() => handleToggleDayOpen(day)}
                    title={
                      day.open
                        ? `Clique para marcar ${day.name} como fechado no rascunho`
                        : `Clique para abrir ${day.name} no rascunho`
                    }
                    className="cursor-pointer"
                  >
                    <div
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        day.open ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                          day.open ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-bold ${
                          day.open ? 'text-[#1A1D20]' : 'text-[#6C757D] line-through'
                        }`}
                      >
                        {day.name}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF5E1E] text-white px-1.5 py-0.2 rounded-sm shadow-xs">
                          Hoje
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        day.open ? 'text-emerald-700' : 'text-[#6C757D]'
                      }`}
                    >
                      {day.open ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                </div>

                {/* Campos de Horário Brasileiro (24h) ou Aviso de Fechado */}
                {day.open ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-1.5 focus-within:border-[#FF5E1E] focus-within:bg-white transition-all shadow-xs">
                      <span className="text-xs text-[#6C757D] font-bold">Das</span>
                      <input
                        type="text"
                        value={day.start}
                        onChange={(e) =>
                          updateDraftDay(day.id, { start: e.target.value })
                        }
                        onBlur={(e) =>
                          updateDraftDay(day.id, {
                            start: normalizeTime24h(e.target.value, '18:00'),
                          })
                        }
                        placeholder="18:00"
                        maxLength={6}
                        className="w-14 text-xs font-black text-[#1A1D20] outline-none bg-transparent text-center"
                      />
                    </div>

                    <span className="text-xs font-bold text-[#6C757D]">às</span>

                    <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-1.5 focus-within:border-[#FF5E1E] focus-within:bg-white transition-all shadow-xs">
                      <input
                        type="text"
                        value={day.end}
                        onChange={(e) =>
                          updateDraftDay(day.id, { end: e.target.value })
                        }
                        onBlur={(e) =>
                          updateDraftDay(day.id, {
                            end: normalizeTime24h(e.target.value, '23:30'),
                          })
                        }
                        placeholder="23:30"
                        maxLength={6}
                        className="w-14 text-xs font-black text-[#1A1D20] outline-none bg-transparent text-center"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1 py-1">
                    <span className="text-xs text-[#6C757D] italic flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estabelecimento fechado durante todo este dia.</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDayOpen(day)}
                      className="text-xs font-bold text-[#FF5E1E] hover:underline cursor-pointer"
                    >
                      Ativar expediente
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Rodapé com Feedback e Botão Salvar Horários */}
        <div className="pt-4 border-t border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Você tem alterações não salvas. Clique em &ldquo;Salvar Horários&rdquo; para aplicar.</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#6C757D] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Horários sincronizados e ativos no cardápio da loja.</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] hover:bg-slate-100 text-[#6C757D] hover:text-[#1A1D20] font-bold text-xs transition-all cursor-pointer"
              >
                Descartar
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-6 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#FF5E1E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isDirty ? 'Salvar Horários' : 'Horários Salvos'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
