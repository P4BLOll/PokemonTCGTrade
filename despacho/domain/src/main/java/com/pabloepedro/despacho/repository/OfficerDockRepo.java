package com.pabloepedro.despacho.repository;

import com.pabloepedro.despacho.entity.OfficerDock;
import java.util.List;
import java.util.Optional;

// Contrato do domínio para controlar as docas de naves dos oficiais e seus bloqueios atômicos
public interface OfficerDockRepo {
    // Salva a doca e as naves vinculadas
    OfficerDock save(OfficerDock dock);

    // Busca a doca pelo nome de usuário do oficial
    Optional<OfficerDock> findByOfficerUsername(String officerUsername);

    // Retorna todas as docas
    List<OfficerDock> findAll();

    // Trava atomicamente a nave pra ninguém mais conseguir requisitá-la
    boolean lockAssetInstance(String officerUsername, String instanceId);

    // Destrava a nave quando ela volta de missão ou a ordem é cancelada
    void unlockAssetInstance(String officerUsername, String instanceId);

    // Transfere a titularidade da nave de uma doca para outra
    void transferAsset(String fromOfficer, String toOfficer, String instanceId);

    // Adiciona uma nova nave diretamente a uma doca
    void addAssetToDock(String officerUsername, com.pabloepedro.despacho.entity.DockedAsset asset);

    // Remove uma nave de uma doca
    void removeAssetFromDock(String officerUsername, String instanceId);
}
