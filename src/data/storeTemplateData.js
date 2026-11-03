/**
 * Dados base da vitrine multi-tenant (sem produtos, cupons, bairros ou avaliações de exemplo).
 * Todos os itens do cardápio são alimentados exclusivamente pelo Painel Administrativo ou API.
 */

export const DEFAULT_STORE_PREVIEW = {
  name: 'Brasa Burger',
  shortBrand: 'BRASA',
  subtitle: 'Hambúrguer artesanal · Feito na brasa',
  tagline: 'Brasa Burger · Feito na brasa',
  rating: '5,0',
  reviewsCount: 0,
  reviews: [],
  minOrder: 0,
  openingHours: 'Consulte horários',
  estimatedTime: '30 - 50 minutos',
  isOpen: false,
  city: 'Sua Região',
  phone: '',
  whatsapp: '',
  instagramUrl: '',
  pix: {
    key: '',
    keyType: 'Chave PIX',
    beneficiary: '',
  },
  neighborhoods: [],
  bannerUrl:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
  logoUrl: null,
  categories: [],
}
