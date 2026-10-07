package com.pabloepedro.despacho.controller;

import com.pabloepedro.despacho.controller.response.OfficerDockResponse;
import com.pabloepedro.despacho.entity.DockedAsset;
import com.pabloepedro.despacho.entity.OfficerDock;
import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;
import com.pabloepedro.despacho.repository.OfficerDockRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/docks", "/hangar/docks"})
public class DockCtrl {

    private final OfficerDockRepo dockRepo;

    public DockCtrl(OfficerDockRepo dockRepo) {
        this.dockRepo = dockRepo;
    }

    @GetMapping({"/{username}", "/oficial/{username}"})
    public OfficerDockResponse getDock(@PathVariable String username) {
        String user = username.toLowerCase();
        if ("admin".equals(user)) {
            // Admin não pilota nem reserva naves; atua apenas como supervisor da estação
            return new OfficerDockResponse("dock-admin", "admin", List.of());
        }
        OfficerDock dock = dockRepo.findByOfficerUsername(user)
                .orElseGet(() -> dockRepo.save(new OfficerDock(UUID.randomUUID().toString(), user, List.of())));

        return new OfficerDockResponse(dock.id(), dock.officerUsername(), dock.assets());
    }
}
