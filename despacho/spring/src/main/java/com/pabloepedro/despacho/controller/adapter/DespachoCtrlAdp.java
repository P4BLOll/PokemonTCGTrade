package com.pabloepedro.despacho.controller.adapter;

import com.pabloepedro.despacho.controller.response.DespachoResponse;
import com.pabloepedro.despacho.entity.Despacho;

// Adaptador: converte a entidade pura de domínio 'Despacho' no DTO 'DespachoResponse' para enviar via JSON
public class DespachoCtrlAdp {
    private DespachoCtrlAdp() {}

    // Pega o objeto de negócio e monta o formato que o frontend espera receber
    public static DespachoResponse toResponse(Despacho d) {
        if (d == null) return null;
        return new DespachoResponse(
                d.id(),
                d.senderUsername(),
                d.receiverUsername(),
                d.offeredInstanceId(),
                d.requestedInstanceId(),
                d.status(),
                d.createdAt()
        );
    }
}

