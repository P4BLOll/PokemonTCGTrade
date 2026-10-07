package com.pabloepedro.despacho.repository.adapter;

import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.repository.orm.DespachoOrm;

// Adaptador: converte entre o documento do MongoDB (DespachoOrm) e o domínio puro (Despacho)
public class DespachoRepoAdp {
    private DespachoRepoAdp() {}

    // Converte de documento do banco para entidade de negócio
    public static Despacho toDomain(DespachoOrm orm) {
        if (orm == null) return null;
        return new Despacho(
                orm.id(),
                orm.senderUsername(),
                orm.receiverUsername(),
                orm.offeredInstanceId(),
                orm.requestedInstanceId(),
                orm.status(),
                orm.createdAt()
        );
    }

    // Converte da entidade de negócio para o documento do MongoDB
    public static DespachoOrm toOrm(Despacho domain) {
        if (domain == null) return null;
        return new DespachoOrm(
                domain.id(),
                domain.senderUsername(),
                domain.receiverUsername(),
                domain.offeredInstanceId(),
                domain.requestedInstanceId(),
                domain.status(),
                domain.createdAt()
        );
    }
}

