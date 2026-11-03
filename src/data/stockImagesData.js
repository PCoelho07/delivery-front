/**
 * Banco de Imagens Gratuitas e Verificadas (Royalty-Free / Unsplash License — Uso Comercial Livre)
 * Focado em itens genéricos de delivery (refrigerantes diversos, sucos, águas,
 * porções, lanches, combos, sobremesas e cafés) para facilitar o cadastro do lojista.
 *
 * Todas as URLs são verificadas com status HTTP 200 e formatadas com CDN Unsplash
 * (auto=format&fit=crop&w=600&q=80).
 */

export const STOCK_IMAGE_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'refrigerantes', label: '🥤 Refrigerantes & Águas' },
  { id: 'sucos', label: '🍊 Sucos & Vitaminas' },
  { id: 'porcoes', label: '🍟 Porções & Salgados' },
  { id: 'lanches', label: '🍔 Lanches & Pizzas' },
  { id: 'sobremesas', label: '🍨 Açaí & Sobremesas' },
  { id: 'bebidas', label: '🍺 Drinks, Cervejas & Shakes' },
]

export const STOCK_IMAGES_CATALOG = [
  // ==========================================
  // REFRIGERANTES, ÁGUAS & ENERGÉTICOS
  // ==========================================
  {
    id: 'stock-coca-lata-red',
    name: 'Refrigerante Cola Lata 350ml',
    category: 'refrigerantes',
    tags: ['refrigerante', 'lata', 'coca', 'cola', '350ml', 'gelado', 'vermelha'],
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-coca-copo-gelo',
    name: 'Copo de Refrigerante Cola com Gelo e Limão',
    category: 'refrigerantes',
    tags: ['refrigerante', 'copo', 'cola', 'coca', 'gelo', 'limao', 'gas'],
    url: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-coca-garrafa-vidro',
    name: 'Refrigerante Cola Garrafa Gelada',
    category: 'refrigerantes',
    tags: ['refrigerante', 'garrafa', 'coca', 'cola', 'gelada', 'vidro', '2l', '600ml'],
    url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-coca-lata-moderna',
    name: 'Refrigerante Cola Lata Gelada',
    category: 'refrigerantes',
    tags: ['refrigerante', 'lata', 'coca cola', 'cola', 'gelo', 'refresco'],
    url: 'https://images.unsplash.com/photo-1596803244618-8dbee441d70b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-refri-guarana-verde',
    name: 'Refrigerante Guaraná / Soda Lata Verde',
    category: 'refrigerantes',
    tags: ['refrigerante', 'guarana', 'lata', 'verde', 'soda', 'sprite', '350ml'],
    url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-refri-laranja-fanta',
    name: 'Refrigerante de Laranja Lata 350ml',
    category: 'refrigerantes',
    tags: ['refrigerante', 'laranja', 'fanta', 'sukita', 'lata', 'citrico'],
    url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-refri-copo-laranja',
    name: 'Copo de Refrigerante de Laranja com Gás',
    category: 'refrigerantes',
    tags: ['refrigerante', 'copo', 'laranja', 'fanta', 'gelo', 'gas'],
    url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-refri-copo-soda-limao',
    name: 'Refrigerante Limão / Soda com Gelo e Rodela de Limão',
    category: 'refrigerantes',
    tags: ['refrigerante', 'sprite', 'soda', 'limao', 'copo', 'gas', 'refrescante'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-refri-gas-borbulhante',
    name: 'Refrigerante com Gás Borbulhante no Copo',
    category: 'refrigerantes',
    tags: ['refrigerante', 'gas', 'borbulhas', 'copo', 'gelo', 'limao'],
    url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-refri-copo-vermelho',
    name: 'Copo Refrescante de Refrigerante com Canudo',
    category: 'refrigerantes',
    tags: ['refrigerante', 'copo', 'canudo', 'gelo', 'fast food', 'combo'],
    url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-agua-mineral-garrafa',
    name: 'Água Mineral sem Gás Garrafa 500ml',
    category: 'refrigerantes',
    tags: ['agua', 'mineral', 'garrafa', 'sem gas', '500ml', 'gelada'],
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-agua-com-gas-copo',
    name: 'Água Mineral com Gás e Rodela de Limão',
    category: 'refrigerantes',
    tags: ['agua', 'com gas', 'limao', 'copo', 'gasosa', 'gelo', 'mineral'],
    url: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-agua-tonica-citrus',
    name: 'Água Tônica / Citrus com Limão e Gelo',
    category: 'refrigerantes',
    tags: ['tonica', 'citrus', 'schweppes', 'limao', 'copo', 'gelo', 'refrigerante'],
    url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-agua-coco-natural',
    name: 'Água de Coco Gelada no Copo / Natural',
    category: 'refrigerantes',
    tags: ['agua de coco', 'coco', 'natural', 'gelado', 'copo', 'saudavel'],
    url: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-energetico-lata',
    name: 'Energético em Lata Gelado (Red Bull / Monster)',
    category: 'refrigerantes',
    tags: ['energetico', 'lata', 'red bull', 'monster', 'gelado', 'energia'],
    url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-energetico-copo',
    name: 'Copo de Energético com Gelo',
    category: 'refrigerantes',
    tags: ['energetico', 'copo', 'gelo', 'drink', 'energia'],
    url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cha-gelado-limao',
    name: 'Chá Gelado com Limão / Ice Tea Pêssego',
    category: 'refrigerantes',
    tags: ['cha', 'ice tea', 'gelado', 'pessego', 'limao', 'mate', 'copo'],
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // SUCOS & VITAMINAS
  // ==========================================
  {
    id: 'stock-suco-laranja-1',
    name: 'Copo de Suco de Laranja Natural 500ml',
    category: 'sucos',
    tags: ['suco', 'laranja', 'natural', 'copo', 'vitamina', 'fruta', 'jarra'],
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-laranja-gelo',
    name: 'Suco de Laranja com Pedras de Gelo',
    category: 'sucos',
    tags: ['suco', 'laranja', 'gelo', 'copo', 'refrescante', 'acucar'],
    url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-limonada-suica',
    name: 'Limonada Suíça / Suco de Limão Natural',
    category: 'sucos',
    tags: ['limonada', 'limao', 'suco', 'hortela', 'verde', 'suica'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-morango-natural',
    name: 'Suco Natural de Morango Fresco',
    category: 'sucos',
    tags: ['suco', 'morango', 'vitamina', 'vermelho', 'frutas vermelhas', 'copo'],
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-melancia-fresco',
    name: 'Copo de Suco de Melancia Gelado',
    category: 'sucos',
    tags: ['suco', 'melancia', 'natural', 'vermelho', 'copo', 'gelo'],
    url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-maracuja-abacaxi',
    name: 'Suco de Maracujá / Abacaxi com Hortelã',
    category: 'sucos',
    tags: ['suco', 'abacaxi', 'maracuja', 'amarelo', 'hortela', 'tropical'],
    url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-manga-cremoso',
    name: 'Suco de Manga Cremoso / Polpa',
    category: 'sucos',
    tags: ['suco', 'manga', 'cremoso', 'polpa', 'amarelo', 'vitamina'],
    url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-uva-integral',
    name: 'Suco de Uva Integral Tinto',
    category: 'sucos',
    tags: ['suco', 'uva', 'integral', 'tinto', 'roxo', 'copo'],
    url: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-suco-verde-detox',
    name: 'Suco Verde Detox com Hortelã e Couve',
    category: 'sucos',
    tags: ['suco', 'verde', 'detox', 'limao', 'hortela', 'saudavel', 'couve'],
    url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // PORÇÕES & SALGADOS
  // ==========================================
  {
    id: 'stock-batata-frita-tradicional',
    name: 'Porção de Batata Frita Palito Crocante',
    category: 'porcoes',
    tags: ['batata', 'frita', 'porcao', 'acompanhamento', 'fritas', 'palito'],
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-batata-frita-cone',
    name: 'Batata Frita no Cone com Molho Especial',
    category: 'porcoes',
    tags: ['batata', 'frita', 'cone', 'molho', 'maionese', 'ketchup'],
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-batata-cheddar-bacon',
    name: 'Batata Frita com Cheddar Cremoso e Bacon',
    category: 'porcoes',
    tags: ['batata', 'cheddar', 'bacon', 'cremoso', 'porcao', 'turbinada'],
    url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-onion-rings',
    name: 'Anéis de Cebola Empanados (Onion Rings)',
    category: 'porcoes',
    tags: ['onion', 'rings', 'aneis', 'cebola', 'empanado', 'porcao', 'petisco'],
    url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-nuggets-frango',
    name: 'Nuggets / Iscas de Frango Douradas',
    category: 'porcoes',
    tags: ['nuggets', 'frango', 'empanado', 'iscas', 'porcao', 'dourado'],
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-frango-crispy-crocante',
    name: 'Iscas de Frango Crocante / Frango Frito',
    category: 'porcoes',
    tags: ['frango', 'crispy', 'frango frito', 'tulipa', 'passarinho', 'porcao'],
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-coxinhas-salgados',
    name: 'Porção de Salgadinhos / Mini Coxinhas',
    category: 'porcoes',
    tags: ['coxinha', 'salgadinho', 'frango', 'festa', 'porcao', 'petisco'],
    url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-pastel-frito',
    name: 'Pastéis Fritos Crocantes (Carne / Queijo)',
    category: 'porcoes',
    tags: ['pastel', 'pasteis', 'frito', 'carne', 'queijo', 'porcao'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-nachos-cheddar',
    name: 'Nachos Crocantes com Queijo Cheddar e Molho',
    category: 'porcoes',
    tags: ['nachos', 'cheddar', 'guacamole', 'petisco', 'molho', 'mexicano'],
    url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // LANCHES & PIZZAS
  // ==========================================
  {
    id: 'stock-burger-blend-classico',
    name: 'Hambúrguer Artesanal Clássico no Pão Brioche',
    category: 'lanches',
    tags: ['hamburguer', 'burger', 'artesanal', 'cheddar', 'lanche', 'brioche'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-burger-smash-duplo',
    name: 'Duplo Smash Burger com Cheddar Inglês',
    category: 'lanches',
    tags: ['hamburguer', 'duplo', 'smash', 'cheddar', 'bacon', 'lanche'],
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-burger-x-salada',
    name: 'X-Salada Especial com Alface e Tomate',
    category: 'lanches',
    tags: ['hamburguer', 'salada', 'x-salada', 'queijo', 'lanche', 'fresco'],
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-burger-crispy-chicken',
    name: 'Hambúrguer de Frango Empanado Crocante',
    category: 'lanches',
    tags: ['hamburguer', 'chicken', 'frango', 'crocante', 'empanado', 'lanche'],
    url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-burger-bacon-artesanal',
    name: 'Hambúrguer com Fatias de Bacon Crocante',
    category: 'lanches',
    tags: ['hamburguer', 'bacon', 'cheddar', 'artesanal', 'lanche'],
    url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-combo-burger-fritas-refri',
    name: 'Combo Completo (Hambúrguer + Fritas + Refrigerante)',
    category: 'lanches',
    tags: ['combo', 'hamburguer', 'fritas', 'refrigerante', 'promocao', 'completo'],
    url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-hot-dog-prensado',
    name: 'Cachorro-Quente / Hot Dog Completo',
    category: 'lanches',
    tags: ['hot dog', 'cachorro quente', 'salsicha', 'prensado', 'lanche'],
    url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-sanduiche-natural-baguete',
    name: 'Sanduíche Natural / Baguete de Frango',
    category: 'lanches',
    tags: ['sanduiche', 'natural', 'baguete', 'fit', 'frango', 'saudavel'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-pizza-calabresa',
    name: 'Pizza Artesanal Calabresa com Cebola',
    category: 'lanches',
    tags: ['pizza', 'calabresa', 'forno', 'cebola', 'artesanal', '8 fatias'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-pizza-fatia-mussarela',
    name: 'Fatia de Pizza Mussarela com Queijo Derretido',
    category: 'lanches',
    tags: ['pizza', 'fatia', 'mussarela', 'queijo', 'derretido', 'crocante'],
    url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-pizza-broto-individual',
    name: 'Pizza Broto Individual Especial',
    category: 'lanches',
    tags: ['pizza', 'broto', 'individual', 'mussarela', 'forno'],
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // AÇAÍ & SOBREMESAS
  // ==========================================
  {
    id: 'stock-acai-tigela-completo',
    name: 'Açaí na Tigela com Banana, Morango e Granola',
    category: 'sobremesas',
    tags: ['acai', 'tigela', 'banana', 'morango', 'granola', 'completo'],
    url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-brownie-quente-sorvete',
    name: 'Brownie de Chocolate com Sorvete e Calda',
    category: 'sobremesas',
    tags: ['brownie', 'chocolate', 'sorvete', 'petit gateau', 'calda', 'sobremesa'],
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-pudim-leite-condensado',
    name: 'Pudim de Leite Condensado com Calda de Caramelo',
    category: 'sobremesas',
    tags: ['pudim', 'leite', 'caramelo', 'flan', 'sobremesa', 'doce', 'tradicional'],
    url: 'https://images.unsplash.com/photo-1592981749207-bdbb9b981cb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-churros-doce-leite',
    name: 'Churros Crocantes com Doce de Leite',
    category: 'sobremesas',
    tags: ['churros', 'doce de leite', 'chocolate', 'crocante', 'sobremesa'],
    url: 'https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cheesecake-frutas-vermelhas',
    name: 'Torta Cheesecake com Calda de Frutas Vermelhas',
    category: 'sobremesas',
    tags: ['cheesecake', 'torta', 'frutas vermelhas', 'morango', 'sobremesa'],
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-taca-sorvete-calda',
    name: 'Taça de Sorvete com Cobertura e Calda',
    category: 'sobremesas',
    tags: ['sorvete', 'taca', 'calda', 'chocolate', 'baunilha', 'gelado'],
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-bolo-chocolate-fatia',
    name: 'Fatia de Bolo de Chocolate Cremoso',
    category: 'sobremesas',
    tags: ['bolo', 'chocolate', 'fatia', 'brigadeiro', 'doce'],
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // DRINKS, CERVEJAS & SHAKES
  // ==========================================
  {
    id: 'stock-milkshake-chocolate',
    name: 'Milkshake de Chocolate Cremoso com Chantilly',
    category: 'bebidas',
    tags: ['milkshake', 'shake', 'chocolate', 'chantilly', 'cremoso', 'doce'],
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-milkshake-morango',
    name: 'Milkshake de Morango com Chantilly',
    category: 'bebidas',
    tags: ['milkshake', 'shake', 'morango', 'chantilly', 'doce', 'calda'],
    url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-chopp-artesanal',
    name: 'Chopp Artesanal / Cerveja Gelada no Copo',
    category: 'bebidas',
    tags: ['cerveja', 'chopp', 'pilsen', 'artesanal', 'copo', 'gelada'],
    url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cerveja-long-neck',
    name: 'Cerveja Long Neck Gelada',
    category: 'bebidas',
    tags: ['cerveja', 'long neck', 'garrafa', 'heineken', 'gelada'],
    url: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cerveja-lata-gotas',
    name: 'Cerveja em Lata Trincando de Gelada',
    category: 'bebidas',
    tags: ['cerveja', 'lata', 'gelada', '350ml', 'gotas', 'gelo', 'heineken'],
    url: 'https://images.unsplash.com/photo-1704403107153-681627549b9f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cerveja-lata-pilsen',
    name: 'Cerveja em Lata no Gelo 350ml',
    category: 'bebidas',
    tags: ['cerveja', 'lata', 'pilsen', '350ml', 'gelada'],
    url: 'https://images.unsplash.com/photo-1543308922-6b60a73f48a1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-caipirinha-tradicional',
    name: 'Caipirinha Tradicional de Limão e Gelo',
    category: 'bebidas',
    tags: ['drink', 'caipirinha', 'limao', 'coquetel', 'alcool'],
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cafe-espresso-quente',
    name: 'Café Expresso Tradicional Quentinho',
    category: 'bebidas',
    tags: ['cafe', 'espresso', 'expresso', 'xicara', 'quente'],
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cappuccino-cremoso',
    name: 'Cappuccino Cremoso com Canela',
    category: 'bebidas',
    tags: ['cappuccino', 'cafe', 'leite', 'espuma', 'canela'],
    url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stock-cafe-gelado-iced',
    name: 'Café Gelado (Iced Coffee) com Gelo',
    category: 'bebidas',
    tags: ['cafe', 'gelado', 'iced coffee', 'copo', 'leite'],
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
  },
]
