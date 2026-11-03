import { describe, it, expect } from 'vitest'
import { calculateStoreLiveStatus } from '../store/useStoreAdmin'

describe('Motor de Horários e Status da Loja (calculateStoreLiveStatus)', () => {
  const scheduleMock = [
    { id: 'seg', dayIndex: 1, open: false, start: '00:00', end: '00:00' },
    { id: 'ter', dayIndex: 2, open: true, start: '18:00', end: '23:30' },
    { id: 'qua', dayIndex: 3, open: true, start: '18:00', end: '23:30' },
    { id: 'qui', dayIndex: 4, open: true, start: '18:00', end: '23:30' },
    { id: 'sex', dayIndex: 5, open: true, start: '18:00', end: '23:30' },
    { id: 'sab', dayIndex: 6, open: true, start: '18:00', end: '23:30' },
    { id: 'dom', dayIndex: 0, open: true, start: '18:00', end: '23:30' },
  ]

  it('respeita o modo pausado: "paused" fecha a loja com aviso claro', () => {
    const status = calculateStoreLiveStatus(scheduleMock, 'America/Sao_Paulo', 'paused')
    expect(status.isOpen).toBe(false)
    expect(status.mode).toBe('paused')
    expect(status.badge).toBe('Pausado Manualmente')
    expect(status.label).toBe('Fechado Temporariamente')
  })

  it('respeita o modo forçado: "forced_open" mantém a loja aberta mesmo fora do horário', () => {
    const status = calculateStoreLiveStatus(scheduleMock, 'America/Sao_Paulo', 'forced_open')
    expect(status.isOpen).toBe(true)
    expect(status.mode).toBe('forced_open')
    expect(status.badge).toBe('Aberto Manualmente')
    expect(status.label).toBe('Aberto agora')
  })

  it('respeita o modo automático: "auto" calcula a abertura com base na tabela', () => {
    const status = calculateStoreLiveStatus(scheduleMock, 'America/Sao_Paulo', 'auto')
    expect(status.mode).toBe('auto')
    expect(typeof status.isOpen).toBe('boolean')
    expect(status.todayHours).toBeDefined()
  })

  it('retorna texto informativo com o horário de funcionamento do dia', () => {
    const status = calculateStoreLiveStatus(scheduleMock, 'America/Sao_Paulo', 'auto')
    expect(status.todayHours).toBeDefined()
    expect(typeof status.todayHours).toBe('string')
  })
})
