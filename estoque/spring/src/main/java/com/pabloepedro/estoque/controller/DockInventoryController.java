package com.pabloepedro.estoque.controller;

import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.service.HangarInventoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST secundário para consulta das docas do hangar:
 * Depende da interface HangarInventoryService pertencente ao Domínio (Clean Architecture / DIP).
 */
@RestController
@RequestMapping("/hangar")
public class DockInventoryController {

    private final HangarInventoryService service;

    public DockInventoryController(HangarInventoryService service) {
        this.service = service;
    }

    // Endpoint GET /hangar/docas: devolve todas as docas (baías) e seus status
    @GetMapping("/docas")
    public List<DockBay> getDocas() {
        return service.listDockBays();
    }
}
