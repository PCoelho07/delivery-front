# Especificação do WebSocket Nativo & Sincronização em Tempo Real (Front-end ↔ Backend em Go)

Este documento descreve o protocolo de mensageria em tempo real implementado no Front-end para sincronização de **pedidos** e do **catálogo de produtos/categorias** entre o cardápio dos clientes, o painel administrativo do lojista (Vitrine, Gestor Kanban) e a API em Go.

---

## 1. Conexão & Endpoints

- **Endpoint Padrão:** `ws://localhost:8080/ws/orders`
- **Configurável via variável de ambiente:**
  ```env
  VITE_WS_URL=ws://localhost:8080/ws/orders
  ```
- **Proxy de Desenvolvimento (Vite):**
  O Vite já está configurado para encaminhar requisições `/ws` para `ws://localhost:8080`.

---

## 2. Estrutura Padrão dos Envelopes JSON

Todas as mensagens trafegadas seguem o formato de envelope JSON com `type` e `payload`:

```json
{
  "type": "NOME_DO_EVENTO",
  "payload": { ... }
}
```

> **Compatibilidade Resiliente:** O front-end também aceita variações comuns como `{ "event": "...", "data": ... }` ou `{ "action": "..." }`.

---

## 3. Mensagens de Pedidos (Lojista & Cliente)

### 3.1. Novo Pedido Criado (`ORDER_CREATED`)
Disparado quando um cliente finaliza um pedido ou a API externa cadastra uma nova venda.

```json
{
  "type": "ORDER_CREATED",
  "payload": {
    "orderId": "#1045",
    "status": "aceito",
    "createdAt": "Hoje às 22:15",
    "elapsedTime": "Hoje às 22:15",
    "deliveryMethod": "delivery",
    "customer": {
      "name": "João Pereira",
      "phone": "(84) 98888-7777"
    },
    "address": {
      "street": "Av. Central",
      "number": "500",
      "neighborhoodName": "Centro",
      "complement": "Apto 101"
    },
    "items": [
      {
        "cartItemId": "item-1",
        "name": "Brasa Burger Duplo",
        "quantity": 1,
        "price": 35.0,
        "totalPrice": 39.0,
        "options": [
          { "name": "Ponto", "value": "Ao ponto" },
          { "name": "Adicional", "value": "Bacon crocante (+R$ 4,00)" }
        ],
        "notes": "Sem cebola"
      }
    ],
    "deliveryFee": 6.0,
    "subtotal": 39.0,
    "total": 45.0,
    "paymentMethod": "pix",
    "pix": {
      "key": "12.345.678/0001-90",
      "beneficiary": "Brasa Burger"
    }
  }
}
```
*Efeito no Front:*
- O pedido entra instantaneamente na coluna **"Novos Pedidos"** do Kanban do lojista.
- **Feedback Sonoro Lojista:** Toca alerta sonoro de alta ressonância (acorde em sino trítono Mi5 → Sol5 → C6).
- Exibe notificação toast na tela.

---

### 3.2. Atualização de Status do Pedido (`ORDER_STATUS_UPDATED`)
Disparado quando qualquer etapa do pedido muda (ex: avanço para cozinha, motoboy em rota, entrega finalizada).

```json
{
  "type": "ORDER_STATUS_UPDATED",
  "payload": {
    "orderId": "#1045",
    "status": "preparo"
  }
}
```

*Valores possíveis para `status`:*
- `"aceito"`: Novo Pedido pendente de aceite
- `"preparo"`: Em produção na cozinha
- `"entrega"`: Saiu para entrega (ou Pronto para retirada no balcão)
- `"concluido"`: Entregue e concluído com sucesso
- `"cancelado"`: Pedido cancelado

*Efeito no Front:*
- Move o card automaticamente entre as colunas do Kanban.
- No app do Cliente: A tela de rastreio (`OrderConfirmationModal` ou `DesktopTrackingScreen`) avança a etapa em tempo real.
- **Feedback Sonoro Cliente:** Toca um som discreto calibrado para o status específico:
  - `"preparo"`: Tom suave senoidal duplo (Fá5 → Lá5).
  - `"entrega"`: Arpejo sutil e alegre (Ré5 → Fá#5 → Lá5).
  - `"concluido"`: Arpejo suave de celebração (Dó5 → Mi5 → Sol5 → Dó6).

---

### 3.3. Sincronização de Pedidos Ativos (`SYNC_ORDERS`)
Enviado opcionalmente pelo Go assim que o front-end se conecta, enviando a lista atual de pedidos do dia.

```json
{
  "type": "SYNC_ORDERS",
  "payload": [
    { "orderId": "#1041", "status": "preparo" },
    { "orderId": "#1042", "status": "entrega" }
  ]
}
```

---

## 4. Mensagens de Catálogo em Tempo Real (Menu & Vitrine)

Permite que alterações cadastrais feitas pelo lojista reflitam instantaneamente nos cardápios abertos pelos clientes em celulares e navegadores sem precisar recarregar a página.

### 4.1. Item Adicionado ao Cardápio (`MENU_ITEM_CREATED`)
```json
{
  "type": "MENU_ITEM_CREATED",
  "payload": {
    "id": "item-1730592819",
    "name": "Smash Cheddar Bacon",
    "categoryId": "cat-lanches",
    "templateId": "tmpl-burger",
    "price": 28.9,
    "desc": "Pão brioche, 2 smash 80g, cheddar cremoso e bacon crocante.",
    "image": "https://...",
    "available": true,
    "order": 1,
    "badge": "NOVO"
  }
}
```
*Efeito no Front:*
- O item é adicionado à lista de produtos e inserido na categoria correspondente no cardápio de todos os clientes conectados.

---

### 4.2. Item Atualizado ou Pausado (`MENU_ITEM_UPDATED`)
Usado tanto para alteração de dados cadastrais (preço, descrição, foto) quanto para **Pausa / Esgotamento**:

```json
{
  "type": "MENU_ITEM_UPDATED",
  "payload": {
    "id": "item-1730592819",
    "available": false
  }
}
```
*Efeito no Front:*
- O cardápio do cliente reflete a alteração em tempo real.
- **Se `available: false` (Esgotado):** O item permanece visível no cardápio com badge visual **"Esgotado / Indisponível"** e botão de adicionar bloqueado.
- **Se o cliente já tiver o item na sacola:** O `useCartStore` sinaliza o produto com aviso em destaque vermelho (`isUnavailable: true`), desabilita o botão de avançar para checkout e exibe o botão **"Remover itens indisponíveis"**.

---

### 4.3. Item Excluído do Cardápio (`MENU_ITEM_DELETED`)
```json
{
  "type": "MENU_ITEM_DELETED",
  "payload": {
    "id": "item-1730592819",
    "productId": "item-1730592819",
    "categoryId": "cat-lanches"
  }
}
```
*Efeito no Front:*
- O produto é removido do cardápio do cliente imediatamente.
- Se estiver no carrinho de algum cliente, é marcado como indisponível com aviso: *"Este produto foi removido do cardápio pelo restaurante"*, impedindo a conclusão da compra com o item excluído.

---

### 4.4. Categoria Criada, Atualizada ou Excluída
- **`CATEGORY_CREATED`:**
  ```json
  { "type": "CATEGORY_CREATED", "payload": { "id": "cat-sobremesas", "name": "Sobremesas", "order": 4, "status": "active" } }
  ```
- **`CATEGORY_UPDATED`:**
  ```json
  { "type": "CATEGORY_UPDATED", "payload": { "id": "cat-sobremesas", "name": "Sobremesas Artesanais", "status": "active" } }
  ```
- **`CATEGORY_DELETED`:**
  ```json
  { "type": "CATEGORY_DELETED", "payload": { "id": "cat-sobremesas", "categoryId": "cat-sobremesas" } }
  ```
*Efeito no Front:*
- Atualiza a barra de categorias e seções de itens instantaneamente em todos os clientes.

---

## 5. Regras de Negócio e Integridade Referencial no Banco de Dados

### 5.1. Análise Comparativa das Abordagens de Exclusão de Categorias

| Abordagem | Funcionamento | Riscos & Problemas | Recomendação de Mercado |
| :--- | :--- | :--- | :--- |
| **1. Exclusão em Cascata (`CASCADE`)** | Ao apagar uma categoria, todos os produtos dela são apagados do banco. | **Crítico:** Perda acidental de dados cadastrais (fichas técnicas, fotos, complementos, histórico). Um clique errado do operador apaga dezenas de pratos. | ❌ **Condenada** em plataformas de e-commerce e delivery (iFood, Shopify, Mercado Livre). |
| **2. Categoria "Geral" / Arquivo Automático (`SET NULL`)** | Desvincula os produtos e os joga em uma categoria padrão invisível aos clientes. | Pode causar desorganização e produtos "perdidos" sem categoria que o lojista esquece de reclassificar. | ⚠️ Aceitável como fallback, mas confusa para a operação diária. |
| **3. Bloqueio Preventivo com Remanejo Assistido** | Se a categoria tiver produtos ativos, o sistema impede a exclusão direta e oferece opções guiadas: **Mover produtos para outra categoria** ou **Apenas Ocultar/Desativar**. | **Zero perda acidental de dados.** O lojista tem total controle e clareza do destino dos seus produtos. | ✅ **Padrão Oficial de Mercado** (Adotado pelo iFood Gestor, Uber Eats e Shopify). |

### 5.2. Solução Implementada no Sistema
O modal `DeleteCategoryModal.jsx` e o store `useStoreAdmin.js` implementam o **Bloqueio Preventivo com 3 Alternativas**:
1. **Mover Produtos para Outra Categoria (Padrão Recomendado):** O lojista seleciona a categoria de destino no dropdown, os produtos são reclassificados e a categoria antiga é deletada com segurança.
2. **Desativar / Ocultar da Vitrine:** Mantém todos os produtos e a categoria intactos no banco, apenas alterando `status: 'inactive'` para não aparecer aos clientes.
3. **Exclusão em Massa Sob Confirmação:** O lojista é alertado explicitamente sobre a perda definitiva de todos os itens daquela categoria e deve confirmar conscientemente.

---

### 5.3. Modelagem SQL Recomendada (PostgreSQL / MySQL)

Para garantir integridade física no banco de dados, utilize **Soft Delete** nas tabelas de catálogo e **Snapshot de Dados** na tabela de itens do pedido:

```sql
-- 1. Categorias com Soft Delete
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL -- Soft delete
);

-- 2. Produtos vinculados à Categoria com bloqueio de integridade (RESTRICT)
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Impede hard delete caso existam produtos ativos vinculados
    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- 3. Itens do Pedido Histórico (REGRA DE OURO): NUNCA DEPENDER DO PRODUTO ATUAL
-- Guarda snapshot com nome, categoria e preço praticados no momento da venda.
CREATE TABLE order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NULL, -- Pode ser NULL se o produto for deletado no futuro
    product_name VARCHAR(150) NOT NULL, -- Snapshot imutável
    category_name VARCHAR(120) NOT NULL, -- Snapshot imutável
    unit_price DECIMAL(10, 2) NOT NULL, -- Preço praticado no momento
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    options_json JSONB NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,
        
    -- Se o produto original for deletado, os pedidos do financeiro NÃO são afetados!
    CONSTRAINT fk_order_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
);
```

---

## 6. Exemplo de Código Backend em Go (Transação de Remanejo e Broadcast)

Abaixo está o controller em Go ilustrando como processar a exclusão de categoria com remanejo seguro de produtos dentro de uma transação do banco:

```go
package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type DeleteCategoryRequest struct {
	Action           string `json:"action"`           // "move" | "delete_all" | "only"
	TargetCategoryID string `json:"targetCategoryId"` // Categoria de destino (se action == "move")
}

func HandleDeleteCategory(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID := vars["id"]

	var req DeleteCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Payload inválido", http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Erro ao iniciar transação", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	if req.Action == "move" {
		if req.TargetCategoryID == "" {
			http.Error(w, "Categoria de destino obrigatória", http.StatusBadRequest)
			return
		}

		// 1. Remaneja os produtos para a categoria destino
		_, err := tx.Exec(`
			UPDATE products 
			SET category_id = $1, updated_at = NOW() 
			WHERE category_id = $2 AND deleted_at IS NULL
		`, req.TargetCategoryID, categoryID)
		if err != nil {
			http.Error(w, "Erro ao mover produtos", http.StatusInternalServerError)
			return
		}

		// 2. Soft delete na categoria esvaziada
		_, err = tx.Exec(`
			UPDATE categories 
			SET deleted_at = NOW() 
			WHERE id = $1
		`, categoryID)
		if err != nil {
			http.Error(w, "Erro ao remover categoria", http.StatusInternalServerError)
			return
		}

	} else if req.Action == "delete_all" {
		// Soft delete em todos os produtos da categoria
		_, err := tx.Exec(`
			UPDATE products 
			SET deleted_at = NOW() 
			WHERE category_id = $1 AND deleted_at IS NULL
		`, categoryID)
		if err != nil {
			http.Error(w, "Erro ao remover produtos", http.StatusInternalServerError)
			return
		}

		// Soft delete na categoria
		_, err = tx.Exec(`UPDATE categories SET deleted_at = NOW() WHERE id = $1`, categoryID)
		if err != nil {
			http.Error(w, "Erro ao remover categoria", http.StatusInternalServerError)
			return
		}

	} else {
		// Exclusão direta (garante que não possui produtos ativos)
		var count int
		_ = tx.QueryRow(`SELECT COUNT(*) FROM products WHERE category_id = $1 AND deleted_at IS NULL`, categoryID).Scan(&count)
		if count > 0 {
			http.Error(w, "Categoria possui produtos ativos. Remaneje ou exclua os produtos primeiro.", http.StatusConflict)
			return
		}
		_, _ = tx.Exec(`UPDATE categories SET deleted_at = NOW() WHERE id = $1`, categoryID)
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Erro ao confirmar transação", http.StatusInternalServerError)
		return
	}

	// 3. Notifica todos os clientes e lojistas via WebSocket
	BroadcastWebSocket(Message{
		Type: "CATEGORY_DELETED",
		Payload: map[string]string{
			"id":         categoryID,
			"categoryId": categoryID,
		},
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
```
