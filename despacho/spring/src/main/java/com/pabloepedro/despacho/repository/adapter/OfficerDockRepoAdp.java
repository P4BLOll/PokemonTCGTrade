package com.pabloepedro.despacho.repository.adapter;

import com.pabloepedro.despacho.entity.DockedAsset;
import com.pabloepedro.despacho.entity.OfficerDock;
import com.pabloepedro.despacho.repository.orm.DockedAssetOrm;
import com.pabloepedro.despacho.repository.orm.OfficerDockOrm;

import java.util.ArrayList;
import java.util.List;

// Adaptador: converte os registros de baías e naves ancoradas entre MongoDB e Domínio
public class OfficerDockRepoAdp {
    private OfficerDockRepoAdp() {}

    // Converte documento de baía de docas do Mongo para entidade de domínio
    public static OfficerDock toDomain(OfficerDockOrm orm) {
        if (orm == null) return null;
        List<DockedAsset> items = orm.assets() != null
                ? orm.assets().stream().map(OfficerDockRepoAdp::toItemDomain).toList()
                : new ArrayList<>();
        return new OfficerDock(orm.id(), orm.officerUsername(), items);
    }

    // Converte entidade de baía de docas para documento do Mongo
    public static OfficerDockOrm toOrm(OfficerDock domain) {
        if (domain == null) return null;
        List<DockedAssetOrm> items = domain.assets() != null
                ? domain.assets().stream().map(OfficerDockRepoAdp::toItemOrm).toList()
                : new ArrayList<>();
        return new OfficerDockOrm(domain.id(), domain.officerUsername(), items);
    }

    // Converte item de nave individual do banco para domínio
    public static DockedAsset toItemDomain(DockedAssetOrm orm) {
        return new DockedAsset(
                orm.instanceId(),
                orm.assetId(),
                orm.assetName(),
                orm.type(),
                orm.rarity(),
                orm.ownerUsername(),
                Boolean.TRUE.equals(orm.lockedForDispatch()),
                orm.marketPrice(),
                orm.hp()
        );
    }

    // Converte item de nave individual do domínio para documento do banco
    public static DockedAssetOrm toItemOrm(DockedAsset domain) {
        return new DockedAssetOrm(
                domain.instanceId(),
                domain.assetId(),
                domain.assetName(),
                domain.type(),
                domain.rarity(),
                domain.ownerUsername(),
                Boolean.TRUE.equals(domain.lockedForDispatch()),
                domain.marketPrice(),
                domain.hp()
        );
    }
}
