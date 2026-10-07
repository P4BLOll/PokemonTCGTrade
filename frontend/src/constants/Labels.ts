/**
 * AERO-OS // CENTRALIZED TERMINAL LABELS
 * Regra de consistência linguística definida:
 * - Termos técnicos de sistema / infraestrutura: INGLÊS (DISPATCH QUEUE, COMM_LOG, BUS ONLINE, AUDIT TRAIL, DEFCON, KERNEL)
 * - Textos de ação e estado operacional do usuário: PORTUGUÊS (SOLICITAR DESPACHO, EM ESPERA, ATIVO EM INSPEÇÃO, CONFIRMAR)
 */
export const TerminalLabels = {
  // Termos Técnicos do Kernel (Inglês)
  system: {
    kernelVer: "AERO-OS // KERNEL v5.1",
    opsCenter: "OPS_CENTER",
    dockBays: "DOCK_BAYS",
    dispatchBus: "DISPATCH_BUS",
    telemetry: "TELEMETRY",
    radarScan: "ORBITAL RADAR // SECTOR SCAN",
    dockMatrix: "DOCK OCCUPANCY MATRIX",
    activeBays: "8/12 ACTIVE BAYS",
    dispatchQueue: "DISPATCH QUEUE // ORBITAL BUFFER",
    busOnline: "● BUS ONLINE",
    commLog: "COMM_LOG // AUDIT TRAIL",
    encChannel: "ENCRYPTED CHANNEL 142.8 MHZ",
    reactorStable: "98.4% STABLE",
    syncStatus: "SYSTEM [SYNC]",
  },

  // Ações e Estados Operacionais (Português)
  actions: {
    requestDispatch: "SOLICITAR DESPACHO",
    openDispatchTerminal: "ABRIR TERMINAL DE DESPACHO",
    inspect: "INSPECIONAR",
    logout: "ENCERRAR SESSÃO",
    authorizing: "AUTORIZANDO...",
    authorized: "ACESSO AUTORIZADO",
    confirm: "CONFIRMAR ORDEM",
    cancel: "CANCELAR",
    close: "FECHAR [ESC]",
    returnToHangar: "RETORNAR AO HANGAR",
    calibrateReactor: "RECALIBRAR NÚCLEOS",
  },

  // Painéis e Rótulos do Operador (Português)
  panels: {
    commandCenter: "CENTRO DE COMANDO ORBITAL",
    inspectedAsset: "ATIVO EM INSPEÇÃO",
    operational: "OPERACIONAIS",
    inMission: "EM MISSÃO",
    maintenance: "MANUTENÇÃO",
    queueBlocked: "FILA BLOQUEADA",
    hullIntegrity: "INTEGRIDADE DO CASCO",
    fuelReserves: "RESERVAS DE COMBUSTÍVEL",
    personalDock: "DOCA PESSOAL",
    stationDepot: "ESTAÇÃO CENTRAL // RESERVA DE VETORES",
    hyperlanes: "ROTAS HIPERESPACIAIS CONECTADAS",
    microservices: "ECOSSISTEMA DISTRIBUÍDO // TOPOLOGIA DE MICROSSERVIÇOS",
  },

  // Modais de Confirmação & Alertas
  modals: {
    confirmDispatchTitle: "CONFIRMAÇÃO // ORDEM DE DESPACHO",
    confirmDispatchDesc: "Confirma a emissão da ordem de missão interestelar e alocação do vetor com retenção de taxa operacional?",
    confirmLogoutTitle: "CONFIRMAÇÃO // ENCERRAR SESSÃO",
    confirmLogoutDesc: "Deseja desconectar sua credencial de oficial e retornar ao terminal de acesso?",
    prototypeLockWarning: "ATENÇÃO: Este vetor é um protótipo exclusivo de unidade única. O bloqueio atômico será emitido via barramento AMQP.",
  },

  // Controle de Intensidade CRT
  crtModes: {
    label: "CRT:",
    full: "CHEIO",
    subtle: "SUTIL",
    off: "OFF",
  },

  // Tags de Estado de Largura Fixa e Legenda
  statusTags: {
    ready: "[RDY]",
    busy: "[BUSY]",
    alert: "[ALERT]",
    waiting: "[WAIT]",
    legend: "[RDY] pronto   [BUSY] ocupado   [ALERT] atenção",
  },
};
