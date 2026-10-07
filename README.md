# 🪐 Giedi Prime (AERO-OS // HANGAR-SYS v4.8)
## Plataforma Distribuída de Gestão de Frotas, Docas e Despacho Aeroespacial

> Ecossistema de microsserviços distribuídos construído com Spring Boot 3, Spring Cloud Gateway, RabbitMQ (CloudAMQP), MongoDB Atlas e Frontend CRT em React Native Web (Expo Router).

---

## 🏗️ Topologia da Arquitetura Distribuída (Os 6 Serviços Requeridos)

O sistema é composto por **6 microsserviços integrados**, desacoplados via mensageria assíncrona AMQP e orquestrados através de um API Gateway unificado:

```
                                  ┌────────────────────────────────┐
                                  │ 04 // Frontend Web (AERO-OS)   │
                                  │      :8083 (Expo Web)          │
                                  └───────────────┬────────────────┘
                                                  │ HTTP / REST
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │ 02 // Spring Cloud Gateway     │
                                  │          :8080                 │
                                  └───┬───────┬────────┬───────┬───┘
                                      │       │        │       │
             ┌────────────────────────┘       │        │       └────────────────────────┐
             ▼                                ▼        ▼                                ▼
┌────────────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────────────┐
│ 01 // Auth Service     │  │ 05 // Estoque     │  │ 03 // Despacho    │  │ 06 // Relatório        │
│ :8081 (Spring Boot)    │  │ :8084 (Hangar)    │  │ :8082 (Alocação)  │  │ :8085 (Telemetria)     │
└────────────┬───────────┘  └─────────┬─────────┘  └─────────┬─────────┘  └────────────┬───────────┘
             │                        │                      │                         │
      MongoDB (Users)          Docas & Arsenal        MongoDB (Despachos)      Auditoria & Logs
                                                             │
                                                     CloudAMQP (RabbitMQ)
                                                  (Buffer de Despacho & Lock)
```

---

## 📦 Detalhamento dos 6 Microsserviços

### 1. **Auth & Security Service (`:8081`)**
- **Tecnologias:** Spring Boot 3, Spring Security, JWT (JSON Web Tokens), MongoDB Atlas.
- **Função:** Autenticação central de administradores e oficiais, emissão e validação de tokens JWT com roles (`ROLE_ADMIN`, `ROLE_COMMANDER`, `ROLE_PILOT`), criptografia BCrypt de senhas e controle rigoroso de acesso às rotas da estação.

### 2. **API Gateway Service (`:8080`)**
- **Tecnologias:** Spring Cloud Gateway, Reactive WebFlux, Netty.
- **Função:** Ponto único de entrada (Reverse Proxy), balanceamento de carga, políticas de CORS globais, roteamento reativo para todos os outros 5 serviços e verificação unificada de tokens JWT.

### 3. **Despacho & Alocação Service (`:8082`)**
- **Tecnologias:** Spring Boot 3, Spring Data MongoDB, RabbitMQ (AMQP), Concorrência com Lock Otimista.
- **Função:**
  - Gerenciamento de contratos de locação de naves e ordens de despacho (`/despacho/requisitar-nave`, `/despacho/propose`, `/despacho/pending`).
  - Buffer de fila sequencial no RabbitMQ (`giedi.despacho.pubsub.exchange`).
  - **Prevenção de Condição de Corrida**: Bloqueio atômico de naves protótipo raras de unidade única (`PROTO-STARHAWK`), garantindo que 2 pilotos disparando requisições simultâneas não obtenham a mesma nave (1 obtém lock, 1 recebe 409 Conflict).

### 4. **Front-End Web (`:8083`)**
- **Tecnologias:** React Native Web, Expo Router v57, TypeScript, Phosphor Green CRT Design Tokens.
- **Aparência e Consolas:**
  - `[01 // OPS_CENTER]`: Radar orbital vetorial 360°, matriz de ocupação de docas e inspecção técnica.
  - `[02 // DOCK_BAYS]`: Baias de contenção do hangar, blueprints vetoriais e medidores de escudos/combustível.
  - `[03 // DISPATCH_BUS]`: Buffer de fila do RabbitMQ e laboratório de concorrência com terminal ao vivo.
  - `[04 // TELEMETRY]`: Status dos 6 microsserviços, osciloscópio do reator de fusão e rotas hiperespaciais.

### 5. **Estoque & Hangar Service (`:8084`)**
- **Tecnologias:** Spring Boot 3, Spring Web, Thread-Safe In-Memory Data Store.
- **Função:**
  - **Docas do Hangar (`/estoque/naves`, `/estoque/docas`)**: Catálogo das 8 naves operacionais (`Valkyrie-IX`, `Goliath-Titan`, `StarHawk Prototype`, etc.), níveis de combustível, integridade de escudos, horas de voo e baias alocadas (`DCK-A01` a `DCK-C02`).
  - **Arsenal Técnico (`/estoque/arsenal`)**: Peças sobressalentes (motores de dobra, geradores de plasma, células de fusão 500MW, droides de reparo R-4, munição railgun).
  - **Alertas de Reposição (`/estoque/arsenal/criticos`)**: Detecção de peças abaixo do limite seguro de estoque.
  - **Controle de Alocação Sincronizado**: Garantia de consistência e integridade operacional nas baias de ancoragem.

### 6. **Relatório & Telemetria Service (`:8085`)**
- **Tecnologias:** Spring Boot 3, Analytics Engine, REST API.
- **Função:**
  - **Relatório Executivo (`/relatorios/geral`)**: Visão consolidada da frota, horas totais de voo, estabilidade do reator e faturamento em Créditos Galácticos (CR).
  - **Relatório de Combustível (`/relatorios/combustivel`)**: Queima de combustível em kg/s discriminada por setor orbital (Kronos, Têmis, Órion, Vega).
  - **Auditoria de Despachos (`/relatorios/auditoria`)**: Histórico auditado de ordens de despacho, locks atômicos e concorrências bloqueadas com sucesso.
  - **Saúde do Cluster (`/relatorios/cluster`, `/relatorios/telemetria`)**: Monitoramento em tempo real do estado e latência dos nós da arquitetura.

---

## 🚦 Portas dos Serviços em Execução

| Microsserviço | Porta | Tecnologia | Endpoint de Teste Gateway (:8080) |
| :--- | :--- | :--- | :--- |
| **01. Gateway** | `:8080` | Spring Cloud Gateway | `http://localhost:8080/actuator/health` |
| **02. Auth & Login** | `:8081` | Spring Boot + JWT | `http://localhost:8080/auth/login` |
| **03. Despacho / Alocação** | `:8082` | Spring Boot + RabbitMQ | `http://localhost:8080/despacho/pending` |
| **04. Front-End** | `:8083` | Expo React Native Web | `http://localhost:8083` |
| **05. Estoque / Hangar** | `:8084` | Spring Boot REST | `http://localhost:8080/estoque/naves` |
| **06. Relatório / Telemetria**| `:8085` | Spring Boot Analytics | `http://localhost:8080/relatorios/geral` |
