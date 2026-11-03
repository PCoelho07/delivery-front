/**
 * Banco de Imagens Gratuitas (Royalty-Free / Unsplash License — Uso Comercial Livre)
 * Focado em itens genéricos de delivery (copos de suco, refrigerantes, águas,
 * porções, acompanhamentos, sobremesas e lanches) para facilitar o cadastro do lojista.
 */

export const STOCK_IMAGE_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'sucos', label: '🍊 Sucos & Vitaminas' },
  { id: 'refrigerantes', label: '🥤 Refrigerantes & Águas' },
  { id: 'bebidas', label: '🍺 Drinks, Cervejas & Shakes' },
  { id: 'porcoes', label: '🍟 Porções & Salgados' },
  { id: 'lanches', label: '🍔 Lanches & Pizzas' },
  { id: 'sobremesas', label: '🍨 Açaí & Sobremesas' },
]

export const STOCK_IMAGES_CATALOG = [
  // ==========================================
  // SUCOS & VITAMINAS
  // ==========================================
  {
    id: 'stock-suco-laranja-1',
    name: 'Copo de Suco de Laranja Natural',
    category: 'sucos',
    tags: ['suco', 'laranja', 'natural', 'copo', 'vitamina', 'fruta'],
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-suco-laranja-2',
    name: 'Suco de Laranja com Gelo',
    category: 'sucos',
    tags: ['suco', 'laranja', 'gelo', 'copo', 'refrescante'],
    url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-limonada-1',
    name: 'Limonada Suíça / Suco de Limão',
    category: 'sucos',
    tags: ['limonada', 'limao', 'suco', 'hortela', 'verde', 'suica'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-suco-morango-1',
    name: 'Suco / Vitamina de Morango',
    category: 'sucos',
    tags: ['suco', 'morango', 'vitamina', 'vermelho', 'frutas vermelhas'],
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-suco-melancia-1',
    name: 'Copo de Suco de Melancia',
    category: 'sucos',
    tags: ['suco', 'melancia', 'natural', 'vermelho', 'copo'],
    url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-suco-abacaxi-1',
    name: 'Suco de Abacaxi / Maracujá',
    category: 'sucos',
    tags: ['suco', 'abacaxi', 'maracuja', 'amarelo', 'hortela', 'tropical'],
    url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-suco-verde-1',
    name: 'Suco Verde Detox com Hortelã',
    category: 'sucos',
    tags: ['suco', 'verde', 'detox', 'limao', 'hortela', 'abacaxi'],
    url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
  },

  // ==========================================
  // REFRIGERANTES & ÁGUAS
  // ==========================================
  {
    id: 'stock-refri-lata-cola',
    name: 'Refrigerante Cola Lata 350ml',
    category: 'refrigerantes',
    tags: ['refrigerante', 'lata', 'coca', 'cola', '350ml', 'gelado'],
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-refri-copo-cola',
    name: 'Copo de Refrigerante com Gelo e Limão',
    category: 'refrigerantes',
    tags: ['refrigerante', 'copo', 'cola', 'coca', 'gelo', 'limao'],
    url: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-refri-latas-variadas',
    name: 'Refrigerante em Lata Gelado',
    category: 'refrigerantes',
    tags: ['refrigerante', 'lata', 'guarana', 'soda', 'bebida'],
    url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-refri-limao-gelo',
    name: 'Refrigerante de Limão / Soda / Água com Gás',
    category: 'refrigerantes',
    tags: ['refrigerante', 'sprite', 'soda', 'limao', 'agua com gas', 'copo'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-agua-mineral',
    name: 'Água Mineral Sem Gás / Com Gás',
    category: 'refrigerantes',
    tags: ['agua', 'mineral', 'garrafa', 'copo', 'sem gas', 'com gas'],
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-cha-gelado',
    name: 'Chá Gelado / Ice Tea Pêssego ou Limão',
    category: 'refrigerantes',
    tags: ['cha', 'gelado', 'ice tea', 'pessego', 'limao', 'mate'],
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
  },

  // ==========================================
  // DRINKS, CERVEJAS & SHAKES
  // ==========================================
  {
    id: 'stock-milkshake-choc',
    name: 'Milkshake de Chocolate / Ovomaltine',
    category: 'bebidas',
    tags: ['milkshake', 'shake', 'chocolate', 'ovomaltine', 'chantilly'],
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-milkshake-morango',
    name: 'Milkshake de Morango com Chantilly',
    category: 'bebidas',
    tags: ['milkshake', 'shake', 'morango', 'chantilly', 'doce'],
    url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-cerveja-copo',
    name: 'Chopp / Cerveja Gelada no Copo',
    category: 'bebidas',
    tags: ['cerveja', 'chopp', 'pilsen', 'artesanal', 'copo', 'gelada'],
    url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-cerveja-garrafa',
    name: 'Cerveja Long Neck / Garrafa',
    category: 'bebidas',
    tags: ['cerveja', 'long neck', 'garrafa', 'heineken', 'bebida'],
    url: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-drink-caipirinha',
    name: 'Caipirinha / Drink de Limão',
    category: 'bebidas',
    tags: ['drink', 'caipirinha', 'limao', 'coquetel', 'alcool'],
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-cafe-expresso',
    name: 'Café Expresso / Cappuccino Cremoso',
    category: 'bebidas',
    tags: ['cafe', 'expresso', 'cappuccino', 'quente', 'xicara'],
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  },

  // ==========================================
  // PORÇÕES & ACOMPANHAMENTOS
  // ==========================================
  {
    id: 'stock-batata-frita-1',
    name: 'Porção de Batata Frita Crocante',
    category: 'porcoes',
    tags: ['batata', 'frita', 'porcao', 'acompanhamento', 'fritas'],
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-batata-rustica-2',
    name: 'Batata Frita com Molho Especial',
    category: 'porcoes',
    tags: ['batata', 'frita', 'rustica', 'cheddar', 'bacon', 'molho'],
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-onion-rings',
    name: 'Anéis de Cebola (Onion Rings)',
    category: 'porcoes',
    tags: ['onion', 'rings', 'aneis', 'cebola', 'empanado', 'porcao'],
    url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-nuggets-frango',
    name: 'Nuggets / Iscas de Frango Empanado',
    category: 'porcoes',
    tags: ['nuggets', 'frango', 'empanado', 'iscas', 'porcao'],
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-frango-frito',
    name: 'Porção de Frango a Passarinho /Tulipas',
    category: 'porcoes',
    tags: ['frango', 'passarinho', 'tulipa', 'coxinha da asa', 'porcao'],
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-nachos-porcao',
    name: 'Porção de Petiscos / Nachos com Molho',
    category: 'porcoes',
    tags: ['petisco', 'porcao', 'molho', 'entrada', 'salgado'],
    url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80',
  },

  // ==========================================
  // LANCHES & PIZZAS
  // ==========================================
  {
    id: 'stock-burger-classico',
    name: 'Hambúrguer Artesanal Clássico',
    category: 'lanches',
    tags: ['hamburguer', 'burger', 'artesanal', 'cheddar', 'lanche'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-burger-duplo',
    name: 'Duplo Smash Burger com Cheddar',
    category: 'lanches',
    tags: ['hamburguer', 'duplo', 'smash', 'cheddar', 'bacon'],
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-burger-salada',
    name: 'X-Salada / Burger com Alface e Tomate',
    category: 'lanches',
    tags: ['hamburguer', 'salada', 'x-salada', 'queijo', 'lanche'],
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-hotdog',
    name: 'Cachorro-Quente / Hot Dog Completo',
    category: 'lanches',
    tags: ['hot dog', 'cachorro quente', 'salsicha', 'lanche', 'prensado'],
    url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-pizza-tradicional',
    name: 'Pizza Artesanal Mussarela / Calabresa',
    category: 'lanches',
    tags: ['pizza', 'calabresa', 'mussarela', 'margherita', 'fatia'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-sanduiche-natural',
    name: 'Sanduíche Natural / Baguete Recheada',
    category: 'lanches',
    tags: ['sanduiche', 'natural', 'frango', 'baguete', 'fit'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  },

  // ==========================================
  // AÇAÍ & SOBREMESAS
  // ==========================================
  {
    id: 'stock-acai-tigela',
    name: 'Açaí no Copo / Tigela com Frutas',
    category: 'sobremesas',
    tags: ['acai', 'tigela', 'copo', 'morango', 'banana', 'granola'],
    url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-brownie-sorvete',
    name: 'Brownie de Chocolate com Sorvete',
    category: 'sobremesas',
    tags: ['brownie', 'chocolate', 'sorvete', 'petit gateau', 'doce'],
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-pudim-leite',
    name: 'Pudim / Torta Doce Especial',
    category: 'sobremesas',
    tags: ['pudim', 'sobremesa', 'doce', 'torta', 'caramelo'],
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stock-churros-doce',
    name: 'Churros Crocantes com Doce de Leite',
    category: 'sobremesas',
    tags: ['churros', 'doce de leite', 'chocolate', 'sobremesa'],
    url: 'https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&w=800&q=80',
  },
]

