# Especificação do WebSocket Nativo (Front-end ↔ Backend em Go)

Este documento descreve o protocolo de mensagens em tempo real implementado no Front-end para sincronização de pedidos entre o cardápio dos clientes, o Gestor de Pedidos (Kanban) e a API em Go.

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

## 3. Mensagens Enviadas pelo Backend Go para o Front-end

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
- O pedido entra instantaneamente na coluna **"Novos Pedidos"** do Kanban.
- Reproduz alerta sonoro sintetizado (se o som estiver ativado no painel).
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
- Se o cliente estiver com a tela de rastreio aberta (`OrderConfirmationModal`), a barra de progresso avança imediatamente em tempo real.

---

### 3.3. Sincronização de Pedidos Ativos (`SYNC_ORDERS`)
Enviado opcionalmente pelo Go assim que o front-end se conecta, enviando a lista atual de pedidos do dia.

```json
{
  "type": "SYNC_ORDERS",
  "payload": [
    { "orderId": "#1041", "status": "preparo", ... },
    { "orderId": "#1042", "status": "entrega", ... }
  ]
}
```

---

## 4. Mensagens Enviadas pelo Front-end para o Backend Go

### 4.1. Conexão do Terminal (`JOIN_STORE`)
Enviado automaticamente pelo front-end no evento `onopen`.

```json
{
  "type": "JOIN_STORE",
  "payload": {
    "client": "delivery-front-backoffice",
    "timestamp": "2026-10-23T22:20:00.000Z"
  }
}
```

---

### 4.2. Alteração de Status pelo Operador (`UPDATE_ORDER_STATUS`)
Enviado quando o operador clica para avançar ou retroceder um card no Kanban:

```json
{
  "type": "UPDATE_ORDER_STATUS",
  "payload": {
    "orderId": "#1045",
    "status": "entrega",
    "updatedAt": "2026-10-23T22:25:00.000Z"
  }
}
```

---

### 4.3. Heartbeat / Ping (`PING`)
Enviado a cada 25 segundos para manter a conexão aberta em balanceadores e proxies:

```json
{
  "type": "PING",
  "payload": { "t": 1729738000000 }
}
```
*Resposta esperada do Go:*
```json
{
  "type": "PONG"
}
```

---

## 5. Exemplo de Implementação Mínima em Go (`gorilla/websocket`)

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permite conexões locais em desenvolvimento
	},
}

type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type StatusUpdatePayload struct {
	OrderID   string `json:"orderId"`
	Status    string `json:"status"`
	UpdatedAt string `json:"updatedAt"`
}

var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
)

func handleOrdersWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erro ao atualizar websocket:", err)
		return
	}
	defer conn.Close()

	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()

	defer func() {
		clientsMu.Lock()
		delete(clients, conn)
		clientsMu.Unlock()
	}()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			break
		}

		switch msg.Type {
		case "PING":
			conn.WriteJSON(map[string]string{"type": "PONG"})

		case "UPDATE_ORDER_STATUS":
			var payload StatusUpdatePayload
			json.Unmarshal(msg.Payload, &payload)
			log.Printf("Operador atualizou pedido %s para status %s", payload.OrderID, payload.Status)
			
			// Transmite para todos os clientes conectados (cozinha, motoboy, cliente)
			broadcast(msg)
		}
	}
}

func broadcast(msg Message) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		client.WriteJSON(msg)
	}
}

// Dispara quando uma nova venda for confirmada na API
func BroadcastNewOrder(orderData any) {
	payload, _ := json.Marshal(orderData)
	broadcast(Message{
		Type:    "ORDER_CREATED",
		Payload: payload,
	})
}
```

