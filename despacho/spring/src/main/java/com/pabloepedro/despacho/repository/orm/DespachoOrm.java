package com.pabloepedro.despacho.repository.orm;

import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

// Documento gravado na coleção 'despachos' do MongoDB
@Document(collection = "despachos")
public record DespachoOrm(
        @Id String id,
        String senderUsername,
        String receiverUsername,
        String offeredInstanceId,
        String requestedInstanceId,
        DespachoStatus status,
        LocalDateTime createdAt
) {
}

