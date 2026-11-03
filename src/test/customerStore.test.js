import { describe, it, expect, beforeEach } from 'vitest'
import { useCustomerStore } from '../store/useCustomerStore'

describe('Store do Cliente e Avaliações (useCustomerStore.js)', () => {
  beforeEach(() => {
    useCustomerStore.getState().clearProfile()
    useCustomerStore.getState().clearOrders()
  })

  it('salva os dados do perfil com o aniversário opcional', () => {
    useCustomerStore.getState().saveProfile({
      name: 'Lucas Mendes',
      phone: '(84) 99876-5432',
      birthday: '15/08',
      cpf: '123.456.789-00',
    })

    const profile = useCustomerStore.getState().profile
    expect(profile.name).toBe('Lucas Mendes')
    expect(profile.birthday).toBe('15/08')
    expect(profile.phone).toBe('(84) 99876-5432')
  })

  it('calcula a nota geral (média das 3 notas) ao avaliar um pedido', () => {
    // 1. Cria um pedido no store
    const initialOrder = {
      orderId: 'ord-100',
      total: 38.9,
      status: 'concluido',
      storeName: 'Brasa Burger',
      items: [{ name: 'Brasa da Casa', quantity: 1, totalPrice: 38.9 }],
    }
    useCustomerStore.getState().addOrder(initialOrder)

    // 2. Avalia com 3 notas individuais:
    // Entrega: 5, Qualidade: 4, Atendimento: 5 => Média = (5 + 4 + 5) / 3 = 4.666... => 4.7
    useCustomerStore.getState().rateOrder('ord-100', {
      deliveryRating: 5,
      qualityRating: 4,
      serviceRating: 5,
      comment: 'Chegou rápido e muito saboroso!',
    })

    const updatedOrders = useCustomerStore.getState().orders
    const targetOrder = updatedOrders.find((o) => o.orderId === 'ord-100')

    expect(targetOrder.rating).toBe(4.7)
    expect(targetOrder.review).toBeDefined()
    expect(targetOrder.review.overallRating).toBe(4.7)
    expect(targetOrder.review.deliveryRating).toBe(5)
    expect(targetOrder.review.comment).toBe('Chegou rápido e muito saboroso!')

    // 3. Verifica se a avaliação foi adicionada à lista geral de avaliações do store
    const reviews = useCustomerStore.getState().reviews
    expect(reviews.length).toBeGreaterThan(0)
    expect(reviews[0].overallRating).toBe(4.7)
  })
})

