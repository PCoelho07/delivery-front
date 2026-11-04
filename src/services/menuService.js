import { api } from './api'

/**
 * Serviço de Cardápio (Domínio 2 dos Contratos de API)
 *
 * Gerencia Categorias, Produtos e Grupos de Adicionais (Templates).
 */

export const menuService = {
  // ==========================================
  // CATEGORIAS (/api/v1/business/{id}/categories)
  // ==========================================

  async listCategories(businessId) {
    if (!businessId) return []
    try {
      const response = await api.get(`/v1/business/${businessId}/categories`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/categories`)
        return Array.isArray(fallback.data) ? fallback.data : []
      } catch {
        return []
      }
    }
  },

  async createCategory(businessId, categoryData) {
    const payload = {
      id: categoryData.id,
      businessId: Number(businessId) || 1,
      name: categoryData.name,
      order: Number(categoryData.order) || 1,
      active: categoryData.status === 'active' || categoryData.active !== false,
    }

    try {
      const response = await api.post(`/v1/business/${businessId}/categories`, payload)
      return response.data
    } catch {
      return payload
    }
  },

  async updateCategory(businessId, categoryId, partial) {
    const payload = {
      ...partial,
      active: partial.status ? partial.status === 'active' : partial.active,
    }

    try {
      const response = await api.put(
        `/v1/business/${businessId}/categories/${categoryId}`,
        payload
      )
      return response.data
    } catch {
      return payload
    }
  },

  async deleteCategory(businessId, categoryId, { action = 'only', targetCategoryId = '' } = {}) {
    try {
      const response = await api.delete(
        `/v1/business/${businessId}/categories/${categoryId}`,
        {
          data: { action, targetCategoryId },
        }
      )
      return response.data
    } catch {
      return { success: true }
    }
  },

  // ==========================================
  // PRODUTOS (/api/v1/business/{id}/products)
  // ==========================================

  async listProducts(businessId) {
    if (!businessId) return []
    try {
      const response = await api.get(`/v1/business/${businessId}/products`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/products`)
        return Array.isArray(fallback.data) ? fallback.data : []
      } catch {
        return []
      }
    }
  },

  async createProduct(businessId, productData) {
    const payload = {
      id: productData.id,
      businessId: Number(businessId) || 1,
      categoryId: productData.categoryId,
      templateId: productData.templateId || 'tmpl-none',
      name: productData.name,
      description: productData.desc || productData.description || '',
      price: Number(productData.price) || 0,
      promotionalPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
      imageUrl: productData.image || productData.imageUrl || '',
      available: productData.available !== false,
      order: Number(productData.order) || 1,
      badge: productData.badge || null,
      optionGroups: productData.optionGroups || [],
    }

    try {
      const response = await api.post(`/v1/business/${businessId}/products`, payload)
      return response.data
    } catch {
      return payload
    }
  },

  async updateProduct(businessId, productId, partial) {
    const payload = {
      ...partial,
      description: partial.desc !== undefined ? partial.desc : partial.description,
      imageUrl: partial.image !== undefined ? partial.image : partial.imageUrl,
    }

    try {
      const response = await api.put(
        `/v1/business/${businessId}/products/${productId}`,
        payload
      )
      return response.data
    } catch {
      return payload
    }
  },

  async setProductAvailability(businessId, productId, available) {
    try {
      const response = await api.patch(
        `/v1/business/${businessId}/products/${productId}/availability`,
        { available }
      )
      return response.data
    } catch {
      return { id: productId, available }
    }
  },

  async deleteProduct(businessId, productId) {
    try {
      const response = await api.delete(
        `/v1/business/${businessId}/products/${productId}`
      )
      return response.data
    } catch {
      return { success: true }
    }
  },

  // ==========================================
  // TEMPLATES / COMPLEMENTOS (/api/v1/business/{id}/templates)
  // ==========================================

  async listTemplates(businessId) {
    if (!businessId) return []
    try {
      const response = await api.get(`/v1/business/${businessId}/templates`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      return []
    }
  },

  async createTemplate(businessId, templateData) {
    try {
      const response = await api.post(
        `/v1/business/${businessId}/templates`,
        templateData
      )
      return response.data
    } catch {
      return templateData
    }
  },

  async updateTemplate(businessId, templateId, templateData) {
    try {
      const response = await api.put(
        `/v1/business/${businessId}/templates/${templateId}`,
        templateData
      )
      return response.data
    } catch {
      return templateData
    }
  },

  async deleteTemplate(businessId, templateId) {
    try {
      const response = await api.delete(
        `/v1/business/${businessId}/templates/${templateId}`
      )
      return response.data
    } catch {
      return { success: true }
    }
  },
}
