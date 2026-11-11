/**
 * Dados base da vitrine multi-tenant.
 * Inicializados com avaliações de exemplo e informações de demonstração.
 */

export const DEFAULT_STORE_PREVIEW = {
  name: 'Brasa Burger',
  shortBrand: 'BRASA',
  subtitle: 'Hambúrguer artesanal · Feito na brasa',
  tagline: 'Brasa Burger · Feito na brasa',
  rating: '5,0',
  reviewsCount: 128,
  reviews: [
    {
      id: 'rev-1',
      author: 'Lucas Mendes',
      rating: 5,
      date: 'Ontem',
      comment: 'O hambúrguer de costela e a maionese verde são de outro mundo! Chegou bem quentinho.',
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Mariana Silva',
      rating: 5,
      date: 'Há 3 dias',
      comment: 'Batata crocante, pudim aveludado impecável e a entrega foi super rápida.',
      verified: true,
    },
  ],
  minOrder: 15.0,
  openingHours: 'Seg a Dom · 11:00 às 23:59',
  estimatedTime: '30 - 45 minutos',
  isOpen: true,
  city: 'São Paulo - SP',
  phone: '(11) 98765-4321',
  whatsapp: '5511987654321',
  instagramUrl: 'https://instagram.com/brasaburger',
  pix: {
    key: '12.345.678/0001-90',
    keyType: 'CNPJ',
    beneficiary: 'Brasa Burger Delivery Ltda',
  },
  neighborhoods: [
    { id: 'bairro-1', name: 'Centro', fee: 4.0, estimatedTime: '25 - 35 min', active: true },
    { id: 'bairro-2', name: 'Jardim América', fee: 6.0, estimatedTime: '30 - 45 min', active: true },
    { id: 'bairro-3', name: 'Vila Nova', fee: 7.5, estimatedTime: '35 - 50 min', active: true },
    { id: 'bairro-4', name: 'Bela Vista', fee: 5.0, estimatedTime: '30 - 40 min', active: true },
  ],
  bannerUrl:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  logoUrl:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
  categories: [],
}
