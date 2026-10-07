package com.pabloepedro.despacho.repository;

import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.repository.adapter.DespachoRepoAdp;
import com.pabloepedro.despacho.repository.client.DespachoMongo;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Repositório que persiste e consulta as ordens de despacho no MongoDB
@Repository
public class DespachoRepoImpl implements DespachoRepo {

    private final DespachoMongo mongo;

    public DespachoRepoImpl(DespachoMongo mongo) {
        this.mongo = mongo;
    }

    // Grava a ordem de despacho no banco
    @Override
    public Despacho save(Despacho despacho) {
        var orm = DespachoRepoAdp.toOrm(despacho);
        var saved = mongo.save(orm);
        return DespachoRepoAdp.toDomain(saved);
    }

    // Busca uma ordem pelo ID
    @Override
    public Optional<Despacho> findById(String id) {
        return mongo.findById(id).map(DespachoRepoAdp::toDomain);
    }

    // Lista despachos associados a um oficial (seja como remetente ou destinatário)
    // Se for admin, retorna todas as ordens globais da estação
    @Override
    public List<Despacho> findByOfficer(String officerUsername) {
        if (officerUsername != null && officerUsername.equalsIgnoreCase("admin")) {
            return findAll();
        }
        String clean = officerUsername != null ? officerUsername.trim() : "";
        return mongo.findByOfficerIgnoreCase(clean, clean)
                .stream().map(DespachoRepoAdp::toDomain).toList();
    }

    // Retorna todas as ordens de despacho do sistema
    @Override
    public List<Despacho> findAll() {
        return mongo.findAll().stream().map(DespachoRepoAdp::toDomain).toList();
    }

    // Retorna todas as ordens que ainda estão aguardando aprovação ou liberação
    @Override
    public List<Despacho> findPending() {
        return mongo.findByStatus(DespachoStatus.PENDING)
                .stream().map(DespachoRepoAdp::toDomain).toList();
    }
}
