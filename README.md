# 🪐 Giedi Prime (AERO-OS // HANGAR-SYS v5.0)
## Plataforma Distribuída de Gestão de Frotas, Docas e Despacho Aeroespacial

> Ecossistema de microsserviços distribuídos construído com Spring Boot 3, Spring Cloud Gateway, RabbitMQ (CloudAMQP), MongoDB Atlas e Frontend CRT em React Native Web (Expo Router).

---

## 🏗️ Topologia da Arquitetura Distribuída (Os 6 Serviços Integrados)

O sistema é composto por **6 microsserviços integrados**, desacoplados via mensageria assíncrona AMQP, orquestrados através de um API Gateway unificado e projetados sob os princípios de **Clean Architecture** e **SOLID**:

```
                                  ┌────────────────────────────────┐
                                  │ 04 // Frontend Web (AERO-OS)   │
                                  │      :8083 (Expo Web)          │
                                  │   (Cookies HttpOnly Seguros)   │
                                  └───────────────┬────────────────┘
                                                  │ HTTP / REST + Cookies
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │ 02 // Spring Cloud Gateway     │
                                  │          :8080                 │
                                  │  (Validação de Cookies & JWT)  │
                                  └───┬───────┬────────┬───────┬───┘
                                      │       │        │       │
             ┌────────────────────────┘       │        │       └────────────────────────┐
             ▼                                ▼        ▼                                ▼
┌────────────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────────────┐
│ 01 // Auth Service     │  │ 05 // Estoque     │  │ 03 // Despacho    │  │ 06 // Relatório        │
│ :8081 (Spring Boot)    │  │ :8084 (Hangar)    │  │ :8082 (Alocação)  │  │ :8085 (Telemetria)     │
└────────────┬───────────┘  └─────────▲─────────┘  └─────────┬─────────┘  └────────────┬───────────┘
             │                        │                      │                         │
      MongoDB (Users)                 │              MongoDB (Despachos)      Auditoria & Logs
                                      │                      │
                                      │              [Publica Evento]
                                      │                      ▼
                                      │           ┌─────────────────────┐
                                      │           │ CloudAMQP (RabbitMQ)│
                                      │           │ Exchange de Sincro- │
                                      │           │ nização de Estoque  │
                                      │           └──────────┬──────────┘
                                      │                      │
                                      └────────[Consome]─────┘
                                  (Altera Naves, Docas e Arsenal)
```

---

## ⚡ 1. Mensageria Assíncrona: Despacho ➔ RabbitMQ ➔ Estoque

A comunicação entre o serviço de **Despacho** e o serviço de **Estoque** opera de forma assíncrona e desacoplada via **RabbitMQ (CloudAMQP)**:

### Fluxo de Troca de Mensagens e Mutação de Estoque:
1. **Emissão da Ordem no Despacho (`:8082`)**:
   - Um piloto requisita um vetor espacial através de `POST /despacho/requisitar-nave`.
   - O Caso de Uso `RequisitarNaveUseCase` valida o pedido, adquire o lock atômico de concorrência e persiste a entidade `Despacho`.
   - O Despacho dispara o evento `DespachoEstoqueEvento` para a exchange `giedi.estoque.sync.exchange` via `EstoqueEventPublisherPort`.
2. **Consumo no Estoque (`:8084`)**:
   - O componente `EstoqueDespachoConsumer` escuta a fila dedicada `giedi.estoque.despacho.queue`.
   - Ao receber a mensagem, aciona o Caso de Uso `AtualizarEstoquePorDespachoUseCase`.
3. **Alteração Real do Inventário de Estoque**:
   - **Naves**: O status do vetor solicitado (ex: `PROTO-STARHAWK`, `INT-VALK-9`) é alterado de `READY` para `IN_MISSION`, vinculando o piloto à nave.
   - **Arsenal de Suprimentos**: É realizada a baixa automática de suprimentos consumíveis de missão (ex: baixa de 1 unidade de `COMP-03` - Células de Fusão 500MW do arsenal).
   - **Docas**: A baia de contenção correspondente tem seu status alterado para `IN_FLIGHT`.
4. **Devolução**:
   - Ao chamar `POST /despacho/devolver-nave/{id}`, um evento `DESPACHO_DEVOLVIDO` é publicado via mensageria, retornando a nave para o status `READY` no Estoque.

---

## 🔒 2. Sessão Segura por Cookies (HttpOnly) & Ocultação do Token

Em conformidade rigorosa com as boas práticas de segurança web:
- **Cookies HttpOnly**: O token JWT gerado pelo microsserviço de Auth (`:8081`) é encapsulado em um Cookie HTTP seguro (`AUTH_SESSION`) com flags:
  - `HttpOnly = true`: O JavaScript do navegador **NÃO tem acesso** ao valor do token (`document.cookie` e scripts de terceiros não conseguem lê-lo, mitigando ataques de XSS).
  - `Max-Age = 86400`: Mantém a sessão do usuário persistida no navegador por 24 horas.
  - `SameSite = Lax` e `Path = /`: Restrição de domínio e contexto para requisições cruzadas seguras.
- **Token Oculto no Navegador**:
  - O corpo da resposta de autenticação (`/auth/login`) **NÃO retorna a string do token**. Retorna exclusivamente dados do perfil (`username`, `roles`, `authenticated: true`).
  - Nenhum token é armazenado no `localStorage` ou `sessionStorage`.
  - O navegador anexa o Cookie automaticamente em todas as requisições (`withCredentials = true`).
  - O Gateway (`Spring Cloud Gateway`) extrai o token diretamente do Cookie seguro, valida criptograficamente e o retransmite internamente via `Authorization: Bearer <token>` para os serviços internos através do filtro reativo `AuthCookieRelayFilter`.
  - Endpoint `/auth/me` permite validar o estado da sessão a qualquer momento, e `/auth/logout` invalida o cookie definindo `Max-Age = 0`.

---

## 🏛️ 3. Conformidade com Clean Architecture & Princípios SOLID (Contratos no Domínio)

O projeto segue a regra arquitetural estrita de que **todos os contratos (interfaces) pertencem ao módulo `domain`**, enquanto as **implementações e adaptadores concretos pertencem ao módulo `spring`** (sem a necessidade de pastas artificiais de `usecase`):

### Estrutura de Camadas (Domain vs Spring):
1. **Módulo `domain` (Núcleo Puro de Domínio - Enterprise Business Rules)**:
   - **Entidades**: `ShipAsset`, `ArsenalComponent`, `DockBay`, `Despacho`, `DockedAsset`, `Login`, `Auth`.
   - **Eventos de Integração**: `DespachoEstoqueEvento`.
   - **Contratos de Repositório (Portas)**:
     - `ShipRepository`, `ArsenalRepository`, `DockBayRepository`, `HangarInventoryRepository` (Segregação de Interfaces - ISP).
     - `DespachoRepo`, `OfficerDockRepo`, `ShipAssetRepo`, `LoginRepo`.
   - **Contratos de Mensageria (Portas)**:
     - `EstoqueEventPublisherPort` (contrato de mensageria para mutação de estoque).
     - `DespachoQueueProducer`, `AtualizarMissaoPublicador`.
   - **Contratos de Serviços de Negócio**:
     - `HangarInventoryService`: contrato de regras do hangar e de mutação física de estoque via AMQP.
     - `DespachoService`: contrato de regras de locação, trava atômica e despacho de naves.
     - `AuthService`: contrato de autenticação e validação de sessão segura.

2. **Módulo `spring` (Adaptadores, Frameworks e Infraestrutura)**:
   - **Implementações de Serviços**: `HangarInventoryServiceImpl`, `DespachoServiceImpl`, `AuthServiceImpl` (implementando os contratos do domínio).
   - **Adaptadores Inbound**:
     - Controllers REST (`DespachoCtrl`, `EstoqueController`, `DockInventoryController`, `AuthCtrl`) injetando diretamente as interfaces de contrato do domínio.
     - Listeners AMQP (`EstoqueDespachoConsumer`) escutando o RabbitMQ e delegando para `HangarInventoryService`.
   - **Adaptadores Outbound**:
     - `RabbitEstoqueEventPublisherAdapter` implementando `EstoqueEventPublisherPort` via `RabbitTemplate`.
     - `HangarInventoryRepositoryImpl`, Spring Data MongoDB Repositories.

### Princípios SOLID Aplicados:
- **S (Single Responsibility Principle)**: Cada classe de serviço e controller tem uma responsabilidade bem delimitada. Controllers apenas lidam com HTTP/DTOs; serviços tratam regras de negócio e repositórios tratam persistência.
- **O (Open/Closed Principle)**: O sistema de eventos e repositórios é aberto para extensão através de novos adaptadores de porta sem alterar os contratos do domínio.
- **L (Liskov Substitution Principle)**: Todas as implementações de repositório, publicadores e serviços cumprem integralmente as interfaces definidas no domínio.
- **I (Interface Segregation Principle)**: Segregação do repositório de estoque em interfaces específicas (`ShipRepository`, `ArsenalRepository`, `DockBayRepository`), evitando interfaces "gordas" e monolíticas.
- **D (Dependency Inversion Principle)**: Controllers e consumidores dependem exclusivamente de contratos/interfaces declarados no módulo `domain`, e não de classes concretas de infraestrutura.

---

## 🚦 Portas dos Serviços no Cluster

| Microsserviço | Porta | Tecnologia | Endpoint de Teste Gateway (:8080) |
| :--- | :--- | :--- | :--- |
| **01. Gateway** | `:8080` | Spring Cloud Gateway | `http://localhost:8080/actuator/health` |
| **02. Auth & Login** | `:8081` | Spring Boot + Cookies HttpOnly | `http://localhost:8080/auth/me` |
| **03. Despacho / Alocação** | `:8082` | Spring Boot + RabbitMQ | `http://localhost:8080/despacho/station-fleet` |
| **04. Front-End** | `:8083` | Expo React Native Web | `http://localhost:8083` |
| **05. Estoque / Hangar** | `:8084` | Spring Boot + AMQP Listener | `http://localhost:8080/estoque/naves` |
| **06. Relatório / Telemetria**| `:8085` | Spring Boot Analytics | `http://localhost:8080/relatorios/geral` |

---

## 🚀 Como Executar o Ecossistema Completo

Para iniciar todos os **6 microsserviços e o frontend** em janelas independentes com um único comando:

### Via PowerShell:
```powershell
.\iniciar-projeto.ps1
```

### Via Batch (CMD):
```cmd
.\iniciar-projeto.bat
```
