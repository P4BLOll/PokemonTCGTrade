# ⚡ Pokémon TCG Trade - Plataforma de Trocas em Microsserviços

> Sistema distribuído e reativo para catálogo, coleção e troca de cartas Pokémon TCG, construído com Spring Boot, MongoDB Atlas, RabbitMQ e frontend em React Native Web (Expo Router).

---

## 🏗️ Arquitetura do Sistema

O projeto é estruturado em arquitetura de microsserviços desacoplados através de mensageria assíncrona (RabbitMQ) e roteamento centralizado via API Gateway:

```
                            ┌────────────────────────┐
                            │   Frontend Web (Expo)  │
                            │      :8083 (Web)       │
                            └───────────┬────────────┘
                                        │ HTTP / REST
                                        ▼
                            ┌────────────────────────┐
                            │   Spring Cloud Gateway │
                            │          :8080         │
                            └─────┬────────────┬─────┘
                                  │            │
            /api/auth/**, /api/users/**       /api/cards/**, /api/trades/**, /api/binder/**
                                  ▼            ▼
                   ┌─────────────────┐      ┌─────────────────────────┐
                   │  Auth Service   │      │      Trade Service      │
                   │      :8081      │      │          :8082          │
                   └────────┬────────┘      └────────────┬────────────┘
                            │                            │
                     MongoDB (users)             MongoDB (cards, trades)
                                                         │
                                                  RabbitMQ (Broker)
                                            (Filas de Eventos de Troca)
```

---

## 📦 Serviços e Tecnologias

### 1. **Gateway Service (`:8080`)**
- **Tecnologias:** Spring Boot 3, Spring Cloud Gateway, Reactive WebFlux.
- **Função:** Roteamento dinâmico de requisições, filtros de CORS globais e terminação centralizada de APIs.

### 2. **Auth Service (`:8081`)**
- **Tecnologias:** Spring Boot 3, Spring Security, JWT (JSON Web Tokens), MongoDB Atlas.
- **Função:** Registro de treinadores, autenticação segura, geração e validação de tokens JWT com claims de autorização.

### 3. **Trade Service (`:8082`)**
- **Tecnologias:** Spring Boot 3, Spring Data MongoDB, RabbitMQ (AMQP), DDD (Domain-Driven Design).
- **Função:**
  - Catálogo com 91 cartas oficiais cobrindo 4 expansões (*Base Set*, *Fossil*, *Neo Genesis* e *Evolving Skies*).
  - Gerenciamento de pastas de cartas dos usuários ("Minha Coleção").
  - Proposta, aceite, rejeição e cancelamento de trocas atômicas.
  - Teste de concorrência com fila RabbitMQ contra condições de corrida (*double-spending* de cartas).

### 4. **Frontend Web (`:8083`)**
- **Tecnologias:** React Native Web, Expo Router v57, TypeScript, Design System com Design Tokens.
- **Tipografia:**
  - **Rajdhani:** Títulos, nomes de cards, contadores e badges gamer.
  - **Inter:** Textos de leitura, formulários e controles.
  - **JetBrains Mono:** Identificadores de instâncias e status de concorrência.
- **Design Tokens:** Esquema escuro com paleta Pokébola (`--brand-red: #EE1515`, `--accent-gold: #FFCB05`, `--bg-base: #0E0F12`).

---

## 🚀 Como Executar

### Pré-requisitos
- **Java 17+**
- **Node.js 20+**
- **RabbitMQ** rodando em `localhost:5672` (guest/guest)
- **MongoDB Atlas** ou MongoDB local configurado

### 1. Iniciar o Gateway
```bash
cd gateway
./mvnw spring-boot:run
```

### 2. Iniciar o Auth Service
```bash
cd auth
./mvnw spring-boot:run -pl spring
```

### 3. Iniciar o Trade Service
```bash
cd trade
./mvnw spring-boot:run -pl spring
```

### 4. Iniciar o Frontend
```bash
cd frontend
npm install
npm run web
```
Acesse a aplicação no navegador em **`http://localhost:8083`**.

---

## 👥 Contas Padrão para Testes Rápidos

| Treinador | Senha | Cartas Iniciais na Coleção |
| :--- | :--- | :--- |
| `ash` | `ash123` | Pikachu (Base Set), Charizard (Base Set) |
| `misty` | `misty123` | Blastoise (Base Set), Gyarados (Base Set) |
| `brock` | `brock123` | Onix, Geodude |

---

## 📄 Licença
Este projeto é distribuído para fins educacionais e de demonstração.
