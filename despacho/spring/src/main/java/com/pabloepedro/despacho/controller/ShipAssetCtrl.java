package com.pabloepedro.despacho.controller;

import com.pabloepedro.despacho.controller.adapter.ShipAssetCtrlAdp;
import com.pabloepedro.despacho.controller.request.ShipAssetRequest;
import com.pabloepedro.despacho.controller.response.AssetCommanderDto;
import com.pabloepedro.despacho.controller.response.ShipAssetResponse;
import com.pabloepedro.despacho.entity.DockedAsset;
import com.pabloepedro.despacho.entity.ShipAsset;
import com.pabloepedro.despacho.repository.OfficerDockRepo;
import com.pabloepedro.despacho.repository.ShipAssetRepo;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/assets", "/hangar/assets"})
public class ShipAssetCtrl {

    private final ShipAssetRepo assetRepo;
    private final OfficerDockRepo dockRepo;

    public ShipAssetCtrl(ShipAssetRepo assetRepo, OfficerDockRepo dockRepo) {
        this.assetRepo = assetRepo;
        this.dockRepo = dockRepo;
    }

    @GetMapping({"/catalog", "/catalogo"})
    public List<ShipAssetResponse> listCatalog() {
        return assetRepo.findAll().stream().map(ShipAssetCtrlAdp::toResponse).toList();
    }

    @GetMapping({"/{id}", "/nave/{id}"})
    public ShipAssetResponse getAsset(@PathVariable String id) {
        ShipAsset asset = assetRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ativo espacial nao encontrado: " + id));
        return ShipAssetCtrlAdp.toResponse(asset);
    }

    @GetMapping({"/{id}/owners", "/{id}/commanders"})
    public List<AssetCommanderDto> getAssetCommanders(@PathVariable String id) {
        return dockRepo.findAll().stream()
                .flatMap(dock -> dock.assets().stream()
                        .filter(c -> c.assetId().equalsIgnoreCase(id))
                        .map(c -> new AssetCommanderDto(
                                dock.officerUsername(),
                                c.instanceId(),
                                Boolean.TRUE.equals(c.lockedForDispatch())
                        ))
                ).toList();
    }

    @GetMapping({"/with-offers", "/disponiveis"})
    public List<String> getAssetsWithOffers() {
        return dockRepo.findAll().stream()
                .flatMap(dock -> dock.assets().stream())
                .filter(c -> !Boolean.TRUE.equals(c.lockedForDispatch()))
                .map(DockedAsset::assetId)
                .distinct()
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping({"/new", "/novo"})
    public ShipAssetResponse createAsset(@RequestBody @Valid ShipAssetRequest request) {
        ShipAsset asset = ShipAssetCtrlAdp.toDomain(request);
        ShipAsset saved = assetRepo.save(asset);
        return ShipAssetCtrlAdp.toResponse(saved);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping({"/{id}", "/nave/{id}", "/deletar/{id}"})
    public void deleteAsset(@PathVariable String id) {
        assetRepo.deleteById(id);
    }
}
