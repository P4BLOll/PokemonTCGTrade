package com.pabloepedro.despacho.repository;

import com.pabloepedro.despacho.entity.Despacho;
import java.util.List;
import java.util.Optional;

// Contrato do domínio para manipular as ordens de despacho (independente do MongoDB)
public interface DespachoRepo {
    // Salva ou atualiza a ordem de despacho
    Despacho save(Despacho despacho);

    // Busca a ordem pelo ID
    Optional<Despacho> findById(String id);

    // Busca todas as ordens vinculadas a um oficial
    List<Despacho> findByOfficer(String officerUsername);


    // Retorna todas as ordens registradas no sistema
    default List<Despacho> findAll() {
        return List.of();
    }

    // Retorna as ordens que ainda estão aguardando liberação
    List<Despacho> findPending();
}

