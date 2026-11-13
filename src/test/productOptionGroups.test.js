import { describe, it, expect } from 'vitest'

// Teste das regras de normalização e validação de grupos da Opção A
describe('Product Option Groups Logic (Açaí & Burger)', () => {
  function validateGroups(groups, selections) {
    const missing = []
    groups.forEach((grp) => {
      const count = (selections[grp.id] || []).length
      if (grp.min > 0 && count < grp.min) {
        missing.push({
          groupId: grp.id,
          name: grp.name,
          remaining: grp.min - count,
        })
      }
    })
    return {
      isValid: missing.length === 0,
      missing,
    }
  }

  function calculateTotal(basePrice, groups, selections, quantity = 1) {
    let optionsSum = 0
    groups.forEach((grp) => {
      const selectedIds = selections[grp.id] || []
      grp.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          optionsSum += Number(opt.price) || 0
        }
      })
    })
    return (basePrice + optionsSum) * quantity
  }

  it('bloqueia confirmação do Açaí se a Base obrigatória não for selecionada', () => {
    const acaiGroups = [
      {
        id: 'grp-base',
        name: 'Escolha a Base',
        min: 1,
        max: 1,
        options: [
          { id: 'b-1', name: 'Tradicional', price: 0 },
          { id: 'b-2', name: 'Zero Açúcar', price: 0 },
        ],
      },
      {
        id: 'grp-frutas',
        name: 'Frutas Frescas',
        min: 0,
        max: 2,
        options: [
          { id: 'f-1', name: 'Banana', price: 0 },
          { id: 'f-2', name: 'Morango', price: 0 },
        ],
      },
    ]

    const emptySelections = {
      'grp-base': [],
      'grp-frutas': ['f-1'],
    }

    const res = validateGroups(acaiGroups, emptySelections)
    expect(res.isValid).toBe(false)
    expect(res.missing[0].name).toBe('Escolha a Base')

    // Atende requisito de base
    const validSelections = {
      'grp-base': ['b-1'],
      'grp-frutas': ['f-1', 'f-2'],
    }
    const resValid = validateGroups(acaiGroups, validSelections)
    expect(resValid.isValid).toBe(true)
  })

  it('calcula o preço total somando a base e opcionais pagos (Nutella + R$ 6)', () => {
    const basePrice = 18.0
    const groups = [
      {
        id: 'grp-base',
        options: [{ id: 'b-1', price: 0 }],
      },
      {
        id: 'grp-extras',
        options: [
          { id: 'ext-nutella', price: 6.0 },
          { id: 'ext-ninho', price: 5.0 },
        ],
      },
    ]

    const selections = {
      'grp-base': ['b-1'],
      'grp-extras': ['ext-nutella', 'ext-ninho'],
    }

    const total = calculateTotal(basePrice, groups, selections, 2)
    // (18 + 6 + 5) * 2 = 29 * 2 = 58
    expect(total).toBe(58.0)
  })

  it('respeita itens simples legados com addons e preferences', () => {
    const legacyBurgerGroups = [
      {
        id: 'legacy-pref-0',
        name: 'Ponto da Carne',
        min: 1,
        max: 1,
        options: [{ id: 'ao-ponto', price: 0 }],
      },
      {
        id: 'legacy-addons',
        name: 'Turbine seu pedido',
        min: 0,
        max: 5,
        options: [{ id: 'add-bacon', price: 5.5 }],
      },
    ]

    const selections = {
      'legacy-pref-0': ['ao-ponto'],
      'legacy-addons': ['add-bacon'],
    }

    const res = validateGroups(legacyBurgerGroups, selections)
    expect(res.isValid).toBe(true)
    const total = calculateTotal(29.9, legacyBurgerGroups, selections, 1)
    expect(total).toBeCloseTo(35.4)
  })
})
