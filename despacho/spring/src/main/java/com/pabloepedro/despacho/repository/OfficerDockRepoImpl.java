package com.pabloepedro.despacho.repository;

import com.pabloepedro.despacho.entity.OfficerDock;
import com.pabloepedro.despacho.repository.adapter.OfficerDockRepoAdp;
import com.pabloepedro.despacho.repository.client.OfficerDockMongo;
import com.pabloepedro.despacho.repository.orm.DockedAssetOrm;
import com.pabloepedro.despacho.repository.orm.OfficerDockOrm;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Repositório que gerencia as baías de naves no MongoDB, com trava atômica e transferência
@Repository
public class OfficerDockRepoImpl implements OfficerDockRepo {

    private final OfficerDockMongo mongo;
    private final MongoTemplate mongoTemplate;

    public OfficerDockRepoImpl(OfficerDockMongo mongo, MongoTemplate mongoTemplate) {
        this.mongo = mongo;
        this.mongoTemplate = mongoTemplate;
    }

    private Criteria buildOfficerCriteria(String officerUsername) {
        return new Criteria().orOperator(
                Criteria.where("officerUsername").is(officerUsername),
                Criteria.where("trainerUsername").is(officerUsername)
        );
    }

    // Salva ou atualiza a baía de docas do oficial
    @Override
    public OfficerDock save(OfficerDock dock) {
        var orm = OfficerDockRepoAdp.toOrm(dock);
        var saved = mongo.save(orm);
        return OfficerDockRepoAdp.toDomain(saved);
    }

    // Busca as naves de um comandante pelo nome de usuário
    @Override
    public Optional<OfficerDock> findByOfficerUsername(String officerUsername) {
        return mongo.findByOfficerUsername(officerUsername).map(OfficerDockRepoAdp::toDomain);
    }

    // Lista todas as docas de todos os comandantes
    @Override
    public List<OfficerDock> findAll() {
        return mongo.findAll().stream().map(OfficerDockRepoAdp::toDomain).toList();
    }

    // Trava atômica no MongoDB: só marca como travado se ainda estiver livre (lockedForDispatch = false ou null)
    @Override
    public boolean lockAssetInstance(String officerUsername, String instanceId) {
        // Garante que duas requisições concorrentes não peguem a mesma nave ao mesmo tempo
        Query query = new Query(buildOfficerCriteria(officerUsername)
                .and("cards").elemMatch(new Criteria().andOperator(
                        Criteria.where("instanceId").is(instanceId),
                        new Criteria().orOperator(
                                Criteria.where("lockedForDispatch").is(false),
                                Criteria.where("lockedForDispatch").is(null),
                                Criteria.where("lockedForDispatch").exists(false)
                        )
                )));
        Update update = new Update().set("cards.$.lockedForDispatch", true);

        // findAndModify é atômico no MongoDB: altera e retorna o documento num único passo
        OfficerDockOrm updated = mongoTemplate.findAndModify(query, update, OfficerDockOrm.class);
        return updated != null;
    }

    // Libera a trava caso a proposta de despacho seja cancelada ou recusada
    @Override
    public void unlockAssetInstance(String officerUsername, String instanceId) {
        Query query = new Query(buildOfficerCriteria(officerUsername)
                .and("cards.instanceId").is(instanceId));
        Update update = new Update().set("cards.$.lockedForDispatch", false);
        mongoTemplate.updateFirst(query, update, OfficerDockOrm.class);
    }

    // Transfere a propriedade da nave de um oficial para outro no MongoDB
    @Override
    public void transferAsset(String fromOfficer, String toOfficer, String instanceId) {
        OfficerDockOrm fromDock = mongo.findByOfficerUsername(fromOfficer).orElseThrow(
                () -> new RuntimeException("Oficial de origem nao encontrado: " + fromOfficer));

        DockedAssetOrm item = fromDock.assets().stream()
                .filter(c -> c.instanceId().equals(instanceId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ativo " + instanceId + " nao encontrado nas docas de " + fromOfficer));

        // 1. Tira a nave da doca do comandante de origem
        Query removeQuery = new Query(buildOfficerCriteria(fromOfficer));
        Update removeUpdate = new Update().pull("cards", Query.query(Criteria.where("instanceId").is(instanceId)));
        mongoTemplate.updateFirst(removeQuery, removeUpdate, OfficerDockOrm.class);

        // 2. Coloca a nave na doca do comandante de destino (já destravada)
        DockedAssetOrm transferredItem = new DockedAssetOrm(
                item.instanceId(), item.assetId(), item.assetName(), item.type(), item.rarity(), toOfficer, false);
        Query addQuery = new Query(buildOfficerCriteria(toOfficer));
        Update addUpdate = new Update().push("cards", transferredItem);
        mongoTemplate.updateFirst(addQuery, addUpdate, OfficerDockOrm.class);
    }

    // Adiciona uma nova nave à doca do comandante ou estação central
    @Override
    public void addAssetToDock(String officerUsername, com.pabloepedro.despacho.entity.DockedAsset asset) {
        var existing = findByOfficerUsername(officerUsername);
        if (existing.isEmpty()) {
            save(new OfficerDock(java.util.UUID.randomUUID().toString(), officerUsername, List.of(asset)));
        } else {
            Query query = new Query(buildOfficerCriteria(officerUsername));
            DockedAssetOrm orm = OfficerDockRepoAdp.toItemOrm(asset);
            Update update = new Update().push("cards", orm);
            mongoTemplate.updateFirst(query, update, OfficerDockOrm.class);
        }
    }

    // Remove uma nave da doca pelo ID da instância
    @Override
    public void removeAssetFromDock(String officerUsername, String instanceId) {
        Query query = new Query(buildOfficerCriteria(officerUsername));
        Update update = new Update().pull("cards", Query.query(Criteria.where("instanceId").is(instanceId)));
        mongoTemplate.updateFirst(query, update, OfficerDockOrm.class);
    }
}
