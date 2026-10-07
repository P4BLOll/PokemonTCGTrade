package com.pabloepedro.despacho.repository.client;

import com.pabloepedro.despacho.repository.orm.OfficerDockOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Interface Spring Data MongoDB para a coleção de baías/docas dos oficiais
@Repository
public interface OfficerDockMongo extends MongoRepository<OfficerDockOrm, String> {
    // Busca a baía de docas associada ao username do oficial (suporta tanto officerUsername quanto trainerUsername)
    @Query("{ '$or': [ { 'officerUsername': ?0 }, { 'trainerUsername': ?0 } ] }")
    Optional<OfficerDockOrm> findByOfficerUsername(String officerUsername);
}
