# Foody — Especificação do Sistema de Rastreamento de Pedidos

## 1. Objetivo

Sistema simplificado de rastreamento de pedidos de delivery que permite usuários autenticados criar pedidos, acompanhar seus status e atualizar o fluxo de entrega.

## 2. Atores

| Ator | Descrição |
|------|-----------|
| Operador | Usuário autenticado que gerencia pedidos de delivery |

## 3. User Stories

### US-01 — Cadastro de usuário

**Como** operador, **quero** me cadastrar com nome, e-mail e senha **para** acessar o sistema.

**Critérios de aceite:**
- **Given** dados válidos (nome, e-mail único, senha ≥ 8 caracteres)
- **When** envio `POST /api/auth/register`
- **Then** recebo HTTP 201 com token JWT e dados do usuário

- **Given** e-mail já cadastrado
- **When** envio `POST /api/auth/register`
- **Then** recebo HTTP 409

### US-02 — Login

**Como** operador, **quero** fazer login com e-mail e senha **para** acessar o sistema.

**Critérios de aceite:**
- **Given** credenciais válidas
- **When** envio `POST /api/auth/login`
- **Then** recebo HTTP 200 com `{ token, expiresIn, user }`

- **Given** credenciais inválidas
- **When** envio `POST /api/auth/login`
- **Then** recebo HTTP 401

### US-03 — Proteção de rotas

**Como** sistema, **quero** exigir autenticação **para** proteger recursos.

**Critérios de aceite:**
- **Given** requisição sem token em `/api/orders`
- **When** acesso qualquer endpoint protegido
- **Then** recebo HTTP 401

- **Given** token JWT válido no header `Authorization: Bearer <token>`
- **When** acesso endpoint protegido
- **Then** a requisição é autorizada

### US-04 — Criar pedido

**Como** operador, **quero** criar um pedido com cliente, itens e endereço **para** iniciar o rastreamento.

**Critérios de aceite:**
- **Given** usuário autenticado e payload válido
- **When** envio `POST /api/orders`
- **Then** pedido é criado com status `RECEBIDO`, total calculado no servidor e HTTP 201

### US-05 — Listar pedidos

**Como** operador, **quero** listar todos os pedidos **para** acompanhar o fluxo.

**Critérios de aceite:**
- **Given** usuário autenticado
- **When** envio `GET /api/orders`
- **Then** recebo lista paginada de pedidos com status atual

- **Given** filtro `?status=EM_PREPARO`
- **When** envio `GET /api/orders?status=EM_PREPARO`
- **Then** recebo apenas pedidos nesse status

### US-06 — Buscar pedido por ID

**Como** operador, **quero** ver detalhes de um pedido **para** consultar itens, endereço e histórico.

**Critérios de aceite:**
- **Given** pedido existente
- **When** envio `GET /api/orders/{id}`
- **Then** recebo detalhes completos incluindo histórico de status

- **Given** ID inexistente
- **When** envio `GET /api/orders/{id}`
- **Then** recebo HTTP 404

### US-07 — Atualizar status

**Como** operador, **quero** atualizar o status do pedido **para** refletir o andamento da entrega.

**Critérios de aceite:**
- **Given** pedido em `RECEBIDO`
- **When** envio `PATCH /api/orders/{id}/status` com `{ "status": "EM_PREPARO" }`
- **Then** status é atualizado e histórico registrado

- **Given** transição inválida (ex.: `ENTREGUE → EM_PREPARO`)
- **When** envio atualização de status
- **Then** recebo HTTP 409 com destinos permitidos

## 4. Regras de negócio — Máquina de estados

| Status atual | Transições permitidas |
|--------------|----------------------|
| RECEBIDO | EM_PREPARO, CANCELADO |
| EM_PREPARO | SAIU_PARA_ENTREGA, CANCELADO |
| SAIU_PARA_ENTREGA | ENTREGUE, CANCELADO |
| ENTREGUE | (final) |
| CANCELADO | (final) |

- Pedidos nascem em `RECEBIDO`
- Total = soma de (quantidade × preço unitário) de cada item
- Histórico de status é append-only

## 5. Contrato da API

### POST /api/auth/register

**Request:**
```json
{
  "name": "Maria Silva",
  "email": "maria@foody.com",
  "password": "senha1234"
}
```

**Response 201:**
```json
{
  "token": "eyJhbG...",
  "expiresIn": 86400000,
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@foody.com" }
}
```

### POST /api/auth/login

**Request:**
```json
{ "email": "maria@foody.com", "password": "senha1234" }
```

**Response 200:** igual ao register.

### GET /api/auth/me

**Response 200:**
```json
{ "id": 1, "name": "Maria Silva", "email": "maria@foody.com" }
```

### POST /api/orders

**Request:**
```json
{
  "customerName": "João Santos",
  "deliveryAddress": {
    "street": "Rua das Flores",
    "number": "123",
    "city": "São Paulo",
    "zipCode": "01310-100"
  },
  "items": [
    { "name": "Pizza Margherita", "quantity": 2, "unitPrice": 45.90 },
    { "name": "Refrigerante 2L", "quantity": 1, "unitPrice": 12.00 }
  ]
}
```

**Response 201:**
```json
{
  "id": 1,
  "customerName": "João Santos",
  "status": "RECEBIDO",
  "total": 103.80,
  "deliveryAddress": { "street": "Rua das Flores", "number": "123", "city": "São Paulo", "zipCode": "01310-100" },
  "items": [...],
  "statusHistory": [{ "fromStatus": null, "toStatus": "RECEBIDO", "changedAt": "2026-07-30T18:00:00Z" }],
  "createdAt": "2026-07-30T18:00:00Z",
  "updatedAt": "2026-07-30T18:00:00Z"
}
```

### GET /api/orders

**Query params:** `status` (opcional), `page` (default 0), `size` (default 20)

**Response 200:** página com `content`, `totalElements`, `totalPages`.

### GET /api/orders/{id}

**Response 200:** pedido completo. **404** se não encontrado.

### PATCH /api/orders/{id}/status

**Request:**
```json
{ "status": "EM_PREPARO" }
```

**Response 200:** pedido atualizado. **409** se transição inválida.

## 6. Códigos de erro

| Código | Situação |
|--------|----------|
| 400 | Validação de payload |
| 401 | Não autenticado / credenciais inválidas |
| 404 | Recurso não encontrado |
| 409 | E-mail duplicado / transição de status inválida |

## 7. Requisitos não-funcionais

- API REST em Java 21 + Spring Boot 3.5
- Persistência SQLite (arquivo local)
- Autenticação JWT stateless
- Front-end React consumindo a API
- Swagger UI em `/swagger-ui.html`
