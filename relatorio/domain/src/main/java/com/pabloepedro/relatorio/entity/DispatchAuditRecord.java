package com.pabloepedro.relatorio.entity;

import java.time.LocalDateTime;

// Guarda o histórico de cada despacho: quem pediu a nave, se o lock atômico funcionou e o status no RabbitMQ
public class DispatchAuditRecord {
    private String dispatchId;
    private String shipCode;
    private String shipName;
    private String requisitioner;
    private String destinationSector;
    private String queueBroker;     // RabbitMQ AMQP Fanout/Direct
    private String status;          // EXECUTED, CONFLICT_BLOCKED, PENDING, CANCELLED
    private boolean atomicLockAcquired;
    private LocalDateTime timestamp;
    private String details;

    public DispatchAuditRecord() {}

    public DispatchAuditRecord(String dispatchId, String shipCode, String shipName, String requisitioner,
                               String destinationSector, String queueBroker, String status,
                               boolean atomicLockAcquired, LocalDateTime timestamp, String details) {
        this.dispatchId = dispatchId;
        this.shipCode = shipCode;
        this.shipName = shipName;
        this.requisitioner = requisitioner;
        this.destinationSector = destinationSector;
        this.queueBroker = queueBroker;
        this.status = status;
        this.atomicLockAcquired = atomicLockAcquired;
        this.timestamp = timestamp;
        this.details = details;
    }

    public String getDispatchId() { return dispatchId; }
    public void setDispatchId(String dispatchId) { this.dispatchId = dispatchId; }

    public String getShipCode() { return shipCode; }
    public void setShipCode(String shipCode) { this.shipCode = shipCode; }

    public String getShipName() { return shipName; }
    public void setShipName(String shipName) { this.shipName = shipName; }

    public String getRequisitioner() { return requisitioner; }
    public void setRequisitioner(String requisitioner) { this.requisitioner = requisitioner; }

    public String getDestinationSector() { return destinationSector; }
    public void setDestinationSector(String destinationSector) { this.destinationSector = destinationSector; }

    public String getQueueBroker() { return queueBroker; }
    public void setQueueBroker(String queueBroker) { this.queueBroker = queueBroker; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isAtomicLockAcquired() { return atomicLockAcquired; }
    public void setAtomicLockAcquired(boolean atomicLockAcquired) { this.atomicLockAcquired = atomicLockAcquired; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    // Setters de compatibilidade com o payload de auditoria emitido pelo microsserviço de Despacho
    public void setOrderCode(String orderCode) {
        if (this.dispatchId == null) this.dispatchId = orderCode;
    }
    public void setPilotCallsign(String pilotCallsign) {
        if (this.requisitioner == null) this.requisitioner = pilotCallsign;
    }
    public void setTargetSector(String targetSector) {
        if (this.destinationSector == null) this.destinationSector = targetSector;
    }
    public void setProtocol(String protocol) {
        if (this.queueBroker == null) this.queueBroker = protocol;
    }
    public void setSuccess(boolean success) {
        this.atomicLockAcquired = success;
    }
}
