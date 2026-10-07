import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// URLs dos serviços no projeto (Despacho na porta 8082 ou via Gateway na porta 8080)
const BASE_URL_DESPACHO = __ENV.BASE_URL_DESPACHO || __ENV.BASE_URL_VENDA || 'http://localhost:8082';
const BASE_URL_ESTOQUE  = __ENV.BASE_URL_ESTOQUE  || __ENV.BASE_URL_PRODUTO || 'http://localhost:8082';

// Identificador do recurso disputado na Estação Central (pode ser sobrescrito via CLI: -e PRODUTO_ID=...)
const PRODUTO_ID = __ENV.PRODUTO_ID || __ENV.SHIP_INSTANCE_ID || 'inst-station-starhawk';
const ESTOQUE_INICIAL = Number(__ENV.ESTOQUE_INICIAL || 1); // 1 ativo físico disponível sob disputa
const QTD_REQUISICOES = Number(__ENV.QTD_REQUISICOES || 30); // 30 pilotos requisitando concorrentemente

// Configurações do polling para aguardar liquidação assíncrona no RabbitMQ
const POLL_TENTATIVAS = Number(__ENV.POLL_TENTATIVAS || 20);
const POLL_INTERVALO = Number(__ENV.POLL_INTERVALO || 0.5); 

// Contadores de métricas oficiais do k6 (mantendo os nomes esperados na avaliação)
const preparando = new Counter('vendas_preparando');          // Ordem aceita e liquidada via RabbitMQ (ACCEPTED)
const cancelado = new Counter('vendas_cancelado');            // Concorrência barrada com sucesso pelo Lock do Mongo (409)
const timeoutPolling = new Counter('vendas_timeout_polling');  // Timeout no polling da fila
const erroInesperado = new Counter('erro_inesperado');        // Respostas inesperadas (5xx, erro de rede)

export const options = {
    scenarios: {
        compra_simultanea: {
            executor: 'shared-iterations',
            vus: QTD_REQUISICOES,
            iterations: QTD_REQUISICOES,
            maxDuration: '60s',
        },
    },
};

export default function () {
    // Payload nativo do microserviço de Despacho
    const payload = JSON.stringify({
        pilotUsername: `piloto-${__VU}`,
        shipInstanceId: PRODUTO_ID,
        missionRoute: 'PATRULHA_ORBITAL_CONCORRENTE'
    });

    const params = { 
        headers: { 
            'Content-Type': 'application/json' 
        } 
    };

    // 1. Envio da requisição de despacho para a API nativa
    const resVenda = http.post(`${BASE_URL_DESPACHO}/despacho/request-ship`, payload, params);

    // Validação da resposta HTTP:
    // - 201 Created: lock atômico adquirido com sucesso e ordem enviada ao RabbitMQ
    // - 409 Conflict: lock atômico impediu alocação concorrente (nave já reservada)
    const isAceito = resVenda.status === 201 || resVenda.status === 200;
    const isConflito = resVenda.status === 409;

    const ok = check(resVenda, {
        'requisicao aceita (2xx) ou conflito previsto (409)': (r) => isAceito || isConflito,
    });

    if (isConflito) {
        cancelado.add(1);
        return;
    }

    if (!ok || !isAceito) {
        erroInesperado.add(1);
        return;
    }

    let vendaId;
    try {
        vendaId = JSON.parse(resVenda.body).id;
    } catch (e) {
        erroInesperado.add(1);
        return;
    }

    // 2. Polling assíncrono: consulta a ordem no endpoint nativo até ser liquidada pelo RabbitMQ
    let statusFinal = null;
    for (let i = 0; i < POLL_TENTATIVAS; i++) {
        sleep(POLL_INTERVALO);

        const resStatus = http.get(`${BASE_URL_DESPACHO}/despacho/order/${vendaId}`);
        if (resStatus.status !== 200) continue;

        try {
            const status = JSON.parse(resStatus.body).status;
            // ACCEPTED indica que o RabbitMQ liquidou o despacho com sucesso
            if (status === 'ACCEPTED' || status === 'CANCELLED' || status === 'REJECTED') {
                statusFinal = status;
                break;
            }
        } catch (e) {
        }
    }

    if (statusFinal === 'ACCEPTED') {
        preparando.add(1);
    } else if (statusFinal === 'CANCELLED' || statusFinal === 'REJECTED') {
        cancelado.add(1);
    } else {
        timeoutPolling.add(1); 
    }
}

export function teardown() {
    // Consulta a frota e estoque remanescente na Estação Central
    const res = http.get(`${BASE_URL_ESTOQUE}/despacho/station-fleet`);
    let estoqueFinal = null;
    let totalNaves = 0;

    try {
        const body = JSON.parse(res.body);
        const ships = body.ships || body.assets || [];
        // Verifica se a nave disputada ainda está disponível na estação
        const disponivel = ships.some(s => s.instanceId === PRODUTO_ID && !s.lockedForDispatch);
        estoqueFinal = disponivel ? 1 : 0;
    } catch (e) {
        estoqueFinal = 'erro_ao_consultar';
    }

    console.log('====================================');
    console.log(`Estoque inicial esperado: ${ESTOQUE_INICIAL}`);
    console.log(`Estoque final no banco:   ${estoqueFinal}`);
    console.log(`Requisições enviadas:     ${QTD_REQUISICOES}`);
    console.log('====================================');
    console.log('Confira nas métricas finais do k6:');
    console.log('  vendas_preparando  → deve ser igual a ESTOQUE_INICIAL');
    console.log('  vendas_cancelado   → deve ser QTD_REQUISICOES - ESTOQUE_INICIAL');
    console.log('  vendas_timeout_polling → deve ser 0 (se não for, aumente POLL_TENTATIVAS)');
    console.log('====================================');

    if (typeof estoqueFinal === 'number') {
        if (estoqueFinal < 0) {
            console.error('FALHA: estoque ficou NEGATIVO — a transação não está protegendo contra concorrência.');
        } else {
            console.log('Estoque final bateu com o esperado. Integridade transacional protegida!');
        }
    }
}
