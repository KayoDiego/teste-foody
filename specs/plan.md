# Foody — Plano de Arquitetura

## 1. Visão geral

Monorepo com back-end Spring Boot e front-end React, comunicando via REST + JWT.

```mermaid
flowchart LR
    subgraph frontend [Frontend React]
        UI[Pages + Components]
        AuthCtx[AuthContext]
        ApiClient[api.ts]
    end
    subgraph backend [Backend Spring Boot]
        Controllers[Controllers]
        Services[Services]
        Security[JWT Filter]
        JPA[JPA + SQLite]
    end
    UI --> AuthCtx
    UI --> ApiClient
    ApiClient -->|Bearer JWT| Controllers
    Controllers --> Security
    Controllers --> Services
    Services --> JPA
```

## 2. Stack

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Back-end | Spring Boot 3.5.16 | Ecossistema maduro, REST + Security + JPA |
| Runtime | Java 21 (Temurin) | LTS, compatível com Spring Boot 3.x |
| Build | Maven Wrapper | Sem dependência de Maven global |
| Banco | SQLite + Hibernate community dialect | Persistência local simples, zero config |
| Auth | Spring Security + JWT (jjwt) | Stateless, adequado para SPA |
| API docs | springdoc-openapi | Swagger UI automático |
| Front-end | React 19 + Vite + TS | SPA rápida com HMR |
| Estilo | Tailwind CSS v4 | UI responsiva com utilitários |

## 3. Modelo de dados

```mermaid
erDiagram
    USERS ||--o{ ORDERS : creates
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_STATUS_HISTORY : tracks
    USERS {
        long id
        string name
        string email
        string password_hash
        datetime created_at
    }
    ORDERS {
        long id
        string customer_name
        string street
        string number
        string city
        string zip_code
        enum status
        decimal total
        datetime created_at
        datetime updated_at
    }
    ORDER_ITEMS {
        long id
        string name
        int quantity
        decimal unit_price
    }
    ORDER_STATUS_HISTORY {
        long id
        enum from_status
        enum to_status
        datetime changed_at
    }
```

## 4. Fluxo de autenticação

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant JwtService
    participant DB

    Client->>AuthController: POST /api/auth/login
    AuthController->>AuthService: login(email, password)
    AuthService->>DB: findByEmail
    AuthService->>AuthService: BCrypt verify
    AuthService->>JwtService: generateToken(user)
    JwtService-->>Client: token + user

    Client->>OrderController: GET /api/orders (Bearer token)
    OrderController->>JwtFilter: validate token
    JwtFilter->>JwtService: parse + validate
    JwtFilter->>OrderController: SecurityContext set
    OrderController-->>Client: orders list
```

## 5. Estrutura de pacotes (back-end)

```
com.foody.tracking
├── FoodyTrackingApplication
├── config/          SecurityConfig, OpenApiConfig, DataSeeder
├── auth/            AuthController, AuthService, DTOs
├── security/        JwtService, JwtAuthenticationFilter, AppUserDetailsService
├── user/            User, UserRepository
├── order/           entidades, repositórios, service, controller, DTOs
└── common/          exceções, GlobalExceptionHandler
```

## 6. Estrutura front-end

```
frontend/src/
├── lib/             api.ts, types.ts
├── context/         AuthContext.tsx
├── components/      ProtectedRoute, Layout, StatusBadge
└── pages/           Login, Register, Orders, NewOrder, OrderDetail
```

## 7. Configuração SQLite

- Arquivo: `backend/data/foody.db`
- Hikari `maximum-pool-size: 1` (lock de escrita único)
- `ddl-auto: update` para desenvolvimento
- Dialeto: `org.hibernate.community.dialect.SQLiteDialect`

## 8. Segurança

- Endpoints públicos: `/api/auth/register`, `/api/auth/login`, Swagger
- Demais `/api/**` exigem JWT
- CORS habilitado para `http://localhost:5173`
- Senhas hasheadas com BCrypt
