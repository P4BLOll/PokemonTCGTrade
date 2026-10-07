package com.pabloepedro.despacho.entity;

import java.util.List;

// Agrupa as naves que pertencem a um piloto ou que estão disponíveis na base estelar
public record OfficerDock(
        String id,
        String officerUsername,
        List<DockedAsset> assets
) {
    public String dockId() { return id; }
    public List<DockedAsset> ships() { return assets; }
}
