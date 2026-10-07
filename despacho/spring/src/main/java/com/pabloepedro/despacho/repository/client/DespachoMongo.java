package com.pabloepedro.despacho.repository.client;

import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.repository.orm.DespachoOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

// Interface Spring Data MongoDB que gera as consultas automáticas para despachos
@Repository
public interface DespachoMongo extends MongoRepository<DespachoOrm, String> {
    // Busca despachos onde o oficial é o remetente ou o destinatário
    List<DespachoOrm> findBySenderUsernameOrReceiverUsername(String sender, String receiver);

    // Busca despachos ignorando maiúsculas e minúsculas
    @Query("{ '$or': [ { 'senderUsername': { '$regex': '^?0$', '$options': 'i' } }, { 'receiverUsername': { '$regex': '^?1$', '$options': 'i' } } ] }")
    List<DespachoOrm> findByOfficerIgnoreCase(String sender, String receiver);

    // Busca despachos pelo status atual (ex: PENDENTE, CONCLUIDO)
    List<DespachoOrm> findByStatus(DespachoStatus status);
}

