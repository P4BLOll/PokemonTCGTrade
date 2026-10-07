package com.pabloepedro.despacho.queue;

import com.pabloepedro.despacho.config.RabbitConfig;
import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.repository.OfficerDockRepo;
import com.pabloepedro.despacho.repository.DespachoRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Assinantes (Subscribers) do padrão Pub/Sub escutando suas respectivas filas
 * a partir da Exchange de eventos de despacho e locação da frota.
 */
@Component
public class DespachoConsumer {

    private static final Logger log = LoggerFactory.getLogger(DespachoConsumer.class);

    private final OfficerDockRepo dockRepo;
    private final DespachoRepo despachoRepo;

    public DespachoConsumer(OfficerDockRepo dockRepo, DespachoRepo despachoRepo) {
        this.dockRepo = dockRepo;
        this.despachoRepo = despachoRepo;
    }

    /**
     * ASSINANTE 1: Processamento e Liquidação da Ordem de Despacho
     * Consome a mensagem assíncrona da fila de liquidação e transfere a titularidade dos ativos espaciais nas docas.
     */
    // Fila 1: Pega a mensagem do RabbitMQ e faz a transferência física da nave entre as docas
    @RabbitListener(queues = RabbitConfig.QUEUE_DESPACHO_SETTLEMENT)
    public void processDespachoSettlement(Despacho despacho) {
        log.info("[PUB/SUB - SUBSCRIBER 1 - LIQUIDACAO] Recebida proposta [{}] para transferencia de docas", despacho.id());

        try {
            if ("station_alpha_7".equalsIgnoreCase(despacho.senderUsername())) {
                // Nave saindo da base direto pra doca pessoal do piloto
                dockRepo.transferAsset(despacho.senderUsername(), despacho.receiverUsername(), despacho.offeredInstanceId());
                log.info("[AMQP DISPATCH WORKER] Nave [{}] despachada com sucesso da ESTAÇÃO CENTRAL para o piloto [{}]!",
                        despacho.offeredInstanceId(), despacho.receiverUsername());
            } else if ("station_alpha_7".equalsIgnoreCase(despacho.receiverUsername())) {
                // Piloto voltando de missão e devolvendo a nave pra base
                try {
                    dockRepo.transferAsset(despacho.senderUsername(), despacho.receiverUsername(), despacho.offeredInstanceId());
                } catch (Exception ignored) {
                    // Já pode ter sido movimentado previamente de forma síncrona
                }
                dockRepo.unlockAssetInstance("station_alpha_7", despacho.offeredInstanceId());
                log.info("[AMQP DISPATCH WORKER] Nave [{}] devolvida à ESTAÇÃO CENTRAL pelo piloto [{}]!",
                        despacho.offeredInstanceId(), despacho.senderUsername());
            } else {
                // Transferência direta entre dois oficiais
                dockRepo.transferAsset(despacho.senderUsername(), despacho.receiverUsername(), despacho.offeredInstanceId());
                if (despacho.requestedInstanceId() != null 
                        && !despacho.requestedInstanceId().isBlank()
                        && !despacho.requestedInstanceId().startsWith("PATRULHA")
                        && !despacho.requestedInstanceId().startsWith("MISSAO")
                        && !despacho.requestedInstanceId().startsWith("ROTA")) {
                    dockRepo.transferAsset(despacho.receiverUsername(), despacho.senderUsername(), despacho.requestedInstanceId());
                }
            }

            // Marca no banco que o despacho foi concluído com sucesso
            Despacho completed = new Despacho(
                    despacho.id(),
                    despacho.senderUsername(),
                    despacho.receiverUsername(),
                    despacho.offeredInstanceId(),
                    despacho.requestedInstanceId(),
                    DespachoStatus.ACCEPTED,
                    despacho.createdAt()
            );
            despachoRepo.save(completed);

            log.info("[AMQP DISPATCH WORKER - LIQUIDAÇÃO] Ordem [{}] liquidada com sucesso! Titularidade atualizada.", despacho.id());

        } catch (Exception ex) {
            log.error("[AMQP DISPATCH WORKER] Erro na liquidação da ordem [{}]: {}", despacho.id(), ex.getMessage());
        }
    }

    // Fila 2: Consome a mesma mensagem em paralelo pra gerar log de auditoria
    @RabbitListener(queues = RabbitConfig.QUEUE_DESPACHO_NOTIFICATION)
    public void processDespachoNotification(Despacho despacho) {
        if ("station_alpha_7".equalsIgnoreCase(despacho.senderUsername())) {
            log.info("[PUB/SUB - NOTIFICAÇÃO] ESTAÇÃO CENTRAL ALPHA-7 despachou nave [{}] para o piloto [{}] na rota [{}]!",
                    despacho.offeredInstanceId(), despacho.receiverUsername(), despacho.requestedInstanceId());
        } else if ("station_alpha_7".equalsIgnoreCase(despacho.receiverUsername())) {
            log.info("[PUB/SUB - NOTIFICAÇÃO] Piloto [{}] devolveu com sucesso a nave [{}] à doca da ESTAÇÃO CENTRAL ALPHA-7!",
                    despacho.senderUsername(), despacho.offeredInstanceId());
        } else {
            log.info("[PUB/SUB - NOTIFICAÇÃO] Ordem [{}] executada entre [{}] e [{}]!",
                    despacho.id(), despacho.senderUsername(), despacho.receiverUsername());
        }
    }
}
