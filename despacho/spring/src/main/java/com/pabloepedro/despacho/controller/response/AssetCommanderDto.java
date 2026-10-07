package com.pabloepedro.despacho.controller.response;

public record AssetCommanderDto(
        String officerUsername,
        String instanceId,
        boolean lockedForDispatch
) {
}
