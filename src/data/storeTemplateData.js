/**
 * Dados de template visual baseados no Figma para visualização da vitrine multi-tenant.
 * Quando os endpoints de cardápio e personalização forem adicionados na API Go,
 * esses campos serão alimentados diretamente pelo retorno do backend.
 */

const DEFAULT_BURGER_ADDONS = [
  { id: 'addon-1', name: 'Cheddar extra', price: 4.0 },
  { id: 'addon-2', name: 'Bacon crocante', price: 6.0 },
  { id: 'addon-3', name: 'Blend extra · 180 g', price: 12.0 },
]

const DEFAULT_BURGER_PREFERENCES = [
  { id: 'pref-1', name: 'Sem cebola' },
  { id: 'pref-2', name: 'Sem maionese' },
]

export const DEFAULT_STORE_PREVIEW = {
  name: 'Brasa Burger',
  shortBrand: 'BRASA',
  subtitle: 'Hambúrguer artesanal · Feito na brasa',
  tagline: 'Brasa Burger · Feito na brasa',
  rating: '4,9',
  reviewsCount: 248,
  minOrder: 10.0,
  openingHours: '18h às 23h',
  estimatedTime: '30 - 50 minutos',
  isOpen: true,
  city: 'Sua Região',
  phone: '(00) 00000-0000',
  whatsapp: '5500000000000',
  instagramUrl: 'https://instagram.com',
  pix: {
    key: '00000000000',
    keyType: 'Chave PIX',
    beneficiary: 'Brasa Burger',
  },
  neighborhoods: [
    { id: 'centro', name: 'Centro', fee: 3.0 },
    { id: 'jardim-america', name: 'Jardim América', fee: 4.0 },
    { id: 'vila-nova', name: 'Vila Nova', fee: 5.0 },
    { id: 'bela-vista', name: 'Bela Vista', fee: 5.0 },
    { id: 'alto-boa-vista', name: 'Alto da Boa Vista', fee: 6.0 },
  ],
  bannerUrl:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
  logoUrl: null,
  categories: [
    {
      id: 'populares',
      tabLabel: 'Populares',
      sectionTitle: 'Os favoritos da casa',
      items: [
        {
          id: 'item-1',
          name: 'Brasa da casa',
          description:
            'Blend 180 g, cheddar, cebola caramelizada e maionese da casa.',
          price: 34.9,
          badge: 'MAIS PEDIDO',
          imageUrl:
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          maxAddons: 3,
          addons: DEFAULT_BURGER_ADDONS,
          preferences: DEFAULT_BURGER_PREFERENCES,
        },
        {
          id: 'item-2',
          name: 'Duplo smash',
          description:
            'Dois smashs, cheddar duplo, picles e nosso molho especial.',
          price: 39.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
          maxAddons: 3,
          addons: DEFAULT_BURGER_ADDONS,
          preferences: [
            { id: 'pref-picles', name: 'Sem picles' },
            { id: 'pref-molho', name: 'Sem molho especial' },
          ],
        },
        {
          id: 'item-3',
          name: 'Batata rústica',
          description:
            'Douradinha, com alecrim, flor de sal e aioli de alho assado.',
          price: 19.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
          maxAddons: 2,
          addons: [
            { id: 'addon-cheddar', name: 'Cheddar cremoso', price: 5.0 },
            { id: 'addon-bacon', name: 'Farofa de bacon', price: 6.0 },
          ],
          preferences: [
            { id: 'pref-alecrim', name: 'Sem alecrim' },
            { id: 'pref-aioli', name: 'Aioli à parte' },
          ],
        },
      ],
    },
    {
      id: 'lanches',
      tabLabel: 'Lanches',
      sectionTitle: 'Lanches',
      items: [
        {
          id: 'item-4',
          name: 'Double Cheddar Smash',
          description:
            'Dois smash burgers, cheddar derretido, picles e maionese no brioche.',
          price: 38.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
          maxAddons: 3,
          addons: DEFAULT_BURGER_ADDONS,
          preferences: DEFAULT_BURGER_PREFERENCES,
        },
        {
          id: 'item-5',
          name: 'Clássico Salada Brasa',
          description:
            'Hambúrguer 180 g na brasa, queijo prato, alface americana, tomate e molho especial.',
          price: 32.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
          maxAddons: 3,
          addons: DEFAULT_BURGER_ADDONS,
          preferences: DEFAULT_BURGER_PREFERENCES,
        },
        {
          id: 'item-6',
          name: 'Bacon BBQ Defumado',
          description:
            'Blend 180 g, fatias de bacon crocante, queijo cheddar, onion rings e barbecue da casa.',
          price: 41.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
          maxAddons: 3,
          addons: DEFAULT_BURGER_ADDONS,
          preferences: DEFAULT_BURGER_PREFERENCES,
        },
      ],
    },
    {
      id: 'bebidas',
      tabLabel: 'Bebidas',
      sectionTitle: 'Bebidas',
      items: [
        {
          id: 'item-7',
          name: 'Coca-Cola Lata 350ml',
          description: 'Lata 350ml trincando de gelada.',
          price: 6.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
          maxAddons: 0,
          addons: [],
          preferences: [
            { id: 'pref-gelo', name: 'Com gelo e limão' },
            { id: 'pref-sem-gelo', name: 'Sem gelo' },
          ],
        },
        {
          id: 'item-8',
          name: 'Suco Natural de Laranja 500ml',
          description:
            'Feito na hora com laranjas selecionadas, sem adição de conservantes.',
          price: 12.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
          maxAddons: 0,
          addons: [],
          preferences: [
            { id: 'pref-sem-acucar', name: 'Sem açúcar' },
            { id: 'pref-pouco-gelo', name: 'Pouco gelo' },
          ],
        },
        {
          id: 'item-9',
          name: 'Limonada Suíça Cremosa',
          description:
            'Limão taiti batido com toque de leite condensado e hortelã fresca.',
          price: 14.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
          maxAddons: 0,
          addons: [],
          preferences: [{ id: 'pref-hortela', name: 'Sem hortelã' }],
        },
      ],
    },
    {
      id: 'acompanhamentos',
      tabLabel: 'Acompanhamentos',
      sectionTitle: 'Acompanhamentos',
      items: [
        {
          id: 'item-10',
          name: 'Fritas Tradicionais Crocantes',
          description:
            'Porção individual de batatas fritas sequinhas com toque de sal.',
          price: 14.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
          maxAddons: 2,
          addons: [
            { id: 'addon-cheddar-fritas', name: 'Cheddar extra', price: 4.0 },
            { id: 'addon-bacon-fritas', name: 'Bacon crocante', price: 6.0 },
          ],
          preferences: [{ id: 'pref-pouco-sal', name: 'Pouco sal' }],
        },
        {
          id: 'item-11',
          name: 'Onion Rings Artesanais',
          description:
            'Anéis de cebola empanados na cerveja, acompanha molho barbecue.',
          price: 21.9,
          badge: null,
          imageUrl:
            'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
          maxAddons: 1,
          addons: [
            { id: 'addon-bbq-extra', name: 'Barbecue extra', price: 3.5 },
          ],
          preferences: [],
        },
      ],
    },
  ],
}
