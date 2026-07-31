# Foody — Rastreamento de Pedidos de Delivery

Sistema simplificado de rastreamento de pedidos de delivery, construído com **Spec Driven Development**.

## Stack

- **Back-end:** Java 21, Spring Boot 3.5.16, Spring Security (JWT), JPA, SQLite
- **Front-end:** React 19, Vite, TypeScript, Tailwind CSS v4

## Pré-requisitos

- JDK 21 (Temurin recomendado)
- Node.js 20+

## Como executar

### 1. Back-end

**Recomendado no Windows** (detecta JDK 21 automaticamente):

```powershell
cd backend
.\run.cmd
```

Ou com PowerShell:

```powershell
cd backend
.\run.ps1
```

Comandos Maven extras (testes, build, etc.):

```powershell
.\run.ps1 test
.\run.ps1 package
```

Alternativa manual com Maven Wrapper:

```bash
cd backend
./mvnw spring-boot:run
```

No Windows (PowerShell) — **exige JAVA_HOME apontando para JDK 21**:

```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd spring-boot:run
```

> **Erro comum:** `class file version 61.0 ... only recognizes up to 52.0`  
> Significa que o Maven está rodando com **Java 8**. Use `.\run.cmd` ou defina `JAVA_HOME` para o JDK 21 antes de executar o Maven.

Se o Maven Wrapper falhar, use Maven local (com JAVA_HOME correto):

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run
```

API disponível em `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

App disponível em `http://localhost:5173` (proxy para `/api` → `:8080`).

## Credenciais demo

| Campo | Valor |
|-------|-------|
| E-mail | `demo@foody.com` |
| Senha | `demo1234` |

Ao iniciar o back-end pela primeira vez, um usuário demo e pedidos de exemplo são criados automaticamente.

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário logado |
| POST | `/api/orders` | Criar pedido |
| GET | `/api/orders` | Listar pedidos |
| GET | `/api/orders/{id}` | Buscar por ID |
| PATCH | `/api/orders/{id}/status` | Atualizar status |

## Status do pedido

`RECEBIDO` → `EM_PREPARO` → `SAIU_PARA_ENTREGA` → `ENTREGUE`

Cancelamento permitido até antes de `ENTREGUE`.

## Especificação

Documentação Spec Driven Development em [`specs/`](specs/):

- [`specs/spec.md`](specs/spec.md) — requisitos e contrato da API
- [`specs/plan.md`](specs/plan.md) — arquitetura
- [`specs/tasks.md`](specs/tasks.md) — tarefas de implementação

## Testes

Na pasta `backend` (não use `mvn` — Maven não precisa estar instalado globalmente):

```powershell
cd backend
.\test.cmd
```

Alternativas:

```powershell
.\run.ps1 test
.\mvnw.cmd test
```
