# Foody — Tarefas de Implementação

## Fase 1 — Especificação

- [x] Escrever `specs/spec.md` com user stories e contrato da API (US-01 a US-07)
- [x] Escrever `specs/plan.md` com arquitetura e modelo de dados
- [x] Escrever `specs/tasks.md` com checklist derivado da spec

## Fase 2 — Toolchain

- [x] Instalar JDK 21 (Temurin) via winget
- [x] Verificar Java 21 e Maven Wrapper

## Fase 3 — Back-end

- [x] Criar `pom.xml` Spring Boot 3.5.16 + dependências (US-03)
- [x] Configurar SQLite em `application.yaml` (US-04)
- [x] Implementar entidades User, Order, OrderItem, DeliveryAddress, OrderStatusHistory (US-04, US-06)
- [x] Implementar repositórios JPA
- [x] Implementar JwtService, JwtAuthenticationFilter, SecurityConfig (US-02, US-03)
- [x] Implementar AuthController: register, login, me (US-01, US-02)
- [x] Implementar OrderService com máquina de estados (US-07)
- [x] Implementar OrderController: CRUD + status (US-04, US-05, US-06, US-07)
- [x] Implementar GlobalExceptionHandler (400, 401, 404, 409)
- [x] Escrever OrderServiceTest (US-07)
- [x] Escrever OrderControllerIT (US-01 a US-07)
- [x] DataSeeder com usuário e pedidos demo

## Fase 4 — Front-end

- [x] Configurar Tailwind, React Router, proxy Vite
- [x] Implementar AuthContext + api.ts (US-01, US-02, US-03)
- [x] Implementar LoginPage e RegisterPage (US-01, US-02)
- [x] Implementar OrdersPage com listagem e filtro (US-05)
- [x] Implementar NewOrderPage (US-04)
- [x] Implementar OrderDetailPage com histórico e update de status (US-06, US-07)

## Fase 5 — Entrega

- [x] README com instruções de execução
- [x] `.gitignore` na raiz
- [x] Validar fluxo ponta a ponta
