package com.pabloepedro.despacho.controller.response;

import com.pabloepedro.despacho.entity.DockedAsset;
import java.util.List;

// DTO com as naves que estão ancoradas na baía/doca de um comandante
public record OfficerDockResponse(
        String id,
        String officerUsername,
        List<DockedAsset> ships
) {
    public String dockId() { return id; }
    public List<DockedAsset> assets() { return ships; }
}
