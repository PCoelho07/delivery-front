# Especificação de Contratos de API: Front-end ↔ Back-end (Go)

Para que o Front-end e o Back-end em Go caminhem perfeitamente alinhados — sem retrabalho, sem surpresas de nomenclatura e sem campos faltando —, precisamos definir os **Contratos de API (API Contracts / Schemas)**.

No desenvolvimento profissional de software, um contrato define:
1. **O Endpoint e Método HTTP** (`GET`, `POST`, `PUT/PATCH`, `DELETE`).
2. **O Identificador da Empresa (Multi-tenant)**: Como cada loja é isolada (ex.: pelo `slug` na URL pública ou pelo header `X-Business-ID` / Token no backoffice).
3. **A Estrutura de Dados (Payloads)**: Tipos primitivos (`string`, `float64`, `int`, `bool`, `[]array`), formatos de data e padrões de nomenclatura.

---

### 📐 Regras Globais de Padronização (O "Acordo de Cavalheiros")

1. **Nomenclatura JSON (Padrão Web / camelCase)**:
   * No banco relacional PostgreSQL, o padrão idiomático é `snake_case` (ex: `business_id`, `created_at`).
   * No JSON trafegado para o React, o padrão limpo é `camelCase` (ex: `businessId`, `createdAt`).
   * *No Go*: basta configurar as tags nas structs:
     ```go
     type Product struct {
         ID          int64   `json:"id" db:"id"`
         BusinessID  int64   `json:"businessId" db:"business_id"`
         Name        string  `json:"name" db:"name"`
         Price       float64 `json:"price" db:"price"`
         CreatedAt   string  `json:"createdAt" db:"created_at"`
     }
     ```
2. **Estrutura Padrão de Erro**:
   Toda resposta de erro (4xx, 5xx) deve devolver um contrato uniforme:
   ```json
   {
     "error": "BAD_REQUEST",
     "message": "Descrição amigável do erro para o front exibir em toasts"
   }
   ```

---

### 🗺️ Mapa de Contratos por Domínio

---

#### 1. Domínio da Loja & Perfil (`/store` / `/business`)

O cardápio do cliente carrega a loja pelo `slug` (ex.: `/brasa-burger`), enquanto o lojista altera as configurações no painel.

| Ação | Método | Rota | Descrição |
| :--- | :--- | :--- | :--- |
| **Buscar Loja por Slug** | `GET` | `/api/v1/store/{slug}` | Utilizado pelo cardápio digital do cliente para carregar toda a vitrine. |
| **Buscar Perfil (Lojista)** | `GET` | `/api/v1/business/{id}` | Carrega os dados cadastrais do restaurante. |
| **Atualizar Perfil** | `PUT` | `/api/v1/business/{id}` | Atualiza nome, logo, banner, telefones e endereço. |

**Contrato do Objeto Loja (`StoreInfo`):**
```json
{
  "id": 1,
  "name": "Brasa Burger",
  "slug": "brasa-burger",
  "corporateName": "Brasa Hamburgueria LTDA",
  "cnpj": "12.345.678/0001-90",
  "phone": "(84) 3281-1234",
  "whatsapp": "(84) 99876-5432",
  "instagram": "@brasaburger",
  "address": "Praça Antônio Basílio, 32",
  "logoUrl": "https://...",
  "bannerUrl": "https://...",
  "minOrder": 20.00,
  "estimatedDelivery": "40 - 50 min",
  "estimatedPickup": "20 - 30 min",
  "statusMode": "auto", // "auto" | "open" | "closed"
  "timezone": "America/Sao_Paulo",
  "createdAt": "2026-01-15T00:00:00Z"
}
```

---

#### 2. Domínio do Cardápio: Categorias, Produtos e Complementos

O front precisa renderizar os produtos associados a categorias e com seus respectivos grupos de adicionais (ex.: "Escolha o Ponto da Carne", "Adicionais Pagos").

| Ação | Método | Rota | Descrição |
| :--- | :--- | :--- | :--- |
| **Listar Produtos da Loja** | `GET` | `/business/{id}/products` | Lista de produtos (com `price_cents` inteiro). |
| **Buscar Produto Individual** | `GET` | `/products/{id}` | Retorna detalhes de um produto específico. |
| **Listar Grupos de Complementos** | `GET` | `/products/{id}/complement-groups` | Grupos de adicionais vinculados ao produto (`min`, `max`, `complements`). |
| **Listar Categorias** | `GET` | `/api/v1/business/{id}/categories` | Lista de abas/categorias do cardápio. |
| **Criar/Editar Categoria** | `POST` / `PUT` | `/api/v1/business/{id}/categories` | Cadastro e ordenação de categorias. |
| **Criar/Editar Produto** | `POST` / `PUT` | `/api/v1/business/{id}/products` | Cadastro de produto com foto e valores. |

**Contrato de Categoria (`Category`):**
```json
{
  "id": "cat-burgers",
  "businessId": 1,
  "name": "Hambúrgueres Artesanais",
  "order": 1,
  "active": true
}
```

**Contrato de Produto com Complementos (`Product`):**
```json
{
  "id": "prod-101",
  "businessId": 1,
  "categoryId": "cat-burgers",
  "name": "Brasa Bacon Duplo",
  "description": "2 blends de 160g na brasa, queijo cheddar e bacon crocante.",
  "price": 38.50,
  "promotionalPrice": 34.90, // ou null
  "imageUrl": "https://...",
  "available": true,
  "optionGroups": [
    {
      "id": "grp-1",
      "name": "Ponto da Carne",
      "required": true,
      "min": 1,
      "max": 1,
      "options": [
        { "id": "opt-1", "name": "Ao Ponto", "price": 0.00 },
        { "id": "opt-2", "name": "Bem Passado", "price": 0.00 }
      ]
    },
    {
      "id": "grp-2",
      "name": "Adicionais Especiais",
      "required": false,
      "min": 0,
      "max": 3,
      "options": [
        { "id": "opt-3", "name": "Bacon Extra", "price": 4.50 },
        { "id": "opt-4", "name": "Cheddar Melt", "price": 3.00 }
      ]
    }
  ]
}
```

---

#### 3. Domínio de Operação: Horários, Entregas e Pagamentos

Configurações que ditam as regras no checkout e se a loja aceita pedidos no momento.

* **Horários (`/api/v1/business/{id}/schedule`)**:
  ```json
  {
    "timezone": "America/Sao_Paulo",
    "statusMode": "auto",
    "days": {
      "seg": { "isOpen": false, "start": "18:00", "end": "23:00" },
      "ter": { "isOpen": true, "start": "18:00", "end": "23:30" },
      "qua": { "isOpen": true, "start": "18:00", "end": "23:30" },
      "qui": { "isOpen": true, "start": "18:00", "end": "23:30" },
      "sex": { "isOpen": true, "start": "18:00", "end": "00:00" },
      "sab": { "isOpen": true, "start": "18:00", "end": "00:00" },
      "dom": { "isOpen": true, "start": "18:00", "end": "23:30" }
    }
  }
  ```

* **Taxas de Entrega & Bairros (`/api/v1/business/{id}/delivery`)**:
  ```json
  {
    "allowDelivery": true,
    "allowPickup": true,
    "neighborhoods": [
      { "id": "b-1", "name": "Centro", "fee": 5.00, "active": true },
      { "id": "b-2", "name": "Planalto", "fee": 8.00, "active": true }
    ]
  }
  ```

* **Métodos de Pagamento (`/api/v1/business/{id}/payments`)**:
  ```json
  {
    "pix": { "enabled": true, "keyType": "cnpj", "key": "12345678000190" },
    "cash": { "enabled": true, "allowChange": true },
    "cardOnDelivery": { "enabled": true, "credit": true, "debit": true }
  }
  ```

---

#### 4. Domínio de Cupons de Desconto (`/api/v1/business/{id}/coupons`)

O contrato deve refletir as validações que acabamos de blindar no front:

```json
[
  {
    "id": "cupom-1",
    "code": "BURGER10",
    "discountPercent": 10,
    "active": true,
    "targetType": "category", // "all" | "category" | "product"
    "targetCategoryId": "cat-burgers",
    "targetCategoryName": "Hambúrgueres Artesanais",
    "targetProductIds": [],
    "createdAt": "2026-10-10T12:00:00Z"
  }
]
```

---

#### 5. Domínio de Pedidos & Tempo Real (REST + WebSocket)

Este é o coração do sistema: o cliente final cria o pedido via REST, e o backend propaga em milissegundos para o lojista via WebSocket.

* **Criação do Pedido pelo Cliente (`POST /api/v1/orders`)**:
  ```json
  {
    "businessId": 1,
    "deliveryMethod": "delivery", // "delivery" | "pickup"
    "customer": {
      "name": "Maria Silva",
      "phone": "(84) 99999-0000"
    },
    "address": {
      "street": "Rua das Flores",
      "number": "120",
      "neighborhoodName": "Centro",
      "complement": "Casa",
      "reference": "Próximo à praça"
    },
    "payment": {
      "method": "pix", // "pix" | "cash" | "card"
      "changeFor": null
    },
    "couponCode": "BURGER10",
    "items": [
      {
        "productId": "prod-101",
        "name": "Brasa Bacon Duplo",
        "quantity": 2,
        "price": 34.90,
        "totalPrice": 77.80,
        "options": [
          { "name": "Ponto da Carne", "value": "Ao Ponto" },
          { "name": "Adicional", "value": "Bacon Extra (+R$ 4.00)" }
        ],
        "notes": "Sem picles, por favor"
      }
    ],
    "subtotal": 77.80,
    "deliveryFee": 5.00,
    "discount": 7.78,
    "total": 75.02
  }
  ```

* **Evento WebSocket para o Gestor de Pedidos do Lojista (`ws://localhost:8080/ws/orders`)**:
  Envelope padronizado:
  ```json
  {
    "type": "ORDER_CREATED",
    "payload": {
      "orderId": "#1045",
      "status": "recebido", // "recebido" | "aceito" | "preparo" | "entrega" | "concluido" | "cancelado"
      "createdAt": "Hoje às 20:30",
      "deliveryMethod": "delivery",
      "customer": { "name": "Maria Silva", "phone": "(84) 99999-0000" },
      "items": [ ... ],
      "total": 75.02
    }
  }
  ```

---

#### 6. Domínio do Super Admin: Empresas & Planos

Para a gestão de múltiplos restaurantes e cobrança de planos:

* `GET /api/v1/superadmin/companies`: Lista todas as empresas cadastradas com métricas de pedidos e status.
* `POST /api/v1/business`: O endpoint que já existe no Go, recebendo exatamente:
  ```json
  {
    "name": "Novo Restaurante",
    "phone": "(84) 99999-8888",
    "email": "contato@restaurante.com",
    "cnpj": "12.345.678/0001-90"
  }
  ```

---

### 💡 Próximo Passo Recomendado

Como você já tem a base do Go em `delivery-api-main` com `business` e `products`, a estratégia mais rápida é:
1. Começar unificando os contratos de **Criação da Empresa e Listagem de Produtos** (os que já existem no Go).
2. Adicionar as rotas de **Categorias** e **Grupos de Complementos** no Go para fechar o ciclo do cardápio digital.

Quer que foquemos em um desses domínios específicos primeiro para desenhar os structs em Go ou os clientes HTTP no Front?