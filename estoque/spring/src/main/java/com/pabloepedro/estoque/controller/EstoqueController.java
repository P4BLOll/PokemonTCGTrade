package com.pabloepedro.estoque.controller;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;
import com.pabloepedro.estoque.service.HangarInventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/estoque")
public class EstoqueController {

    private final HangarInventoryService service;

    public EstoqueController(HangarInventoryService service) {
        this.service = service;
    }

    // Lista as naves com filtros opcionais de classe e status
    @GetMapping("/naves")
    public List<ShipAsset> listNaves(
            @RequestParam(required = false) String classType,
            @RequestParam(required = false) String status
    ) {
        return service.listAllShips(classType, status);
    }

    // Busca os detalhes técnicos de uma nave pelo código
    @GetMapping("/naves/{code}")
    public ResponseEntity<ShipAsset> getNave(@PathVariable String code) {
        return service.getShip(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Aplica a trava (lock atômico) em uma nave específica
    @PostMapping("/naves/{code}/travar")
    public ResponseEntity<?> travarNave(
            @PathVariable String code,
            @RequestParam(defaultValue = "UNKNOWN_PILOT") String pilot
    ) {
        try {
            ShipAsset updated = service.lockShipForDispatch(code, pilot);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", "CONFLITO_LOCK_ATÔMICO", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", "NAO_ENCONTRADO", "message", e.getMessage()));
        }
    }

    // Libera a trava da nave após a missão
    @PostMapping("/naves/{code}/liberar")
    public ResponseEntity<?> liberarNave(@PathVariable String code) {
        try {
            ShipAsset updated = service.releaseShip(code);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", "NAO_ENCONTRADO", "message", e.getMessage()));
        }
    }

    // Lista a ocupação de todas as baias de ancoragem do hangar
    @GetMapping("/docas")
    public List<DockBay> listDocas() {
        return service.listDockBays();
    }

    // Lista todas as peças de reposição do arsenal
    @GetMapping("/arsenal")
    public List<ArsenalComponent> listArsenal() {
        return service.listArsenal();
    }

    // Lista apenas as peças com estoque perigosamente baixo
    @GetMapping("/arsenal/criticos")
    public List<ArsenalComponent> listArsenalCritico() {
        return service.listCriticalArsenal();
    }

    // Reabastece o estoque de peças sobressalentes
    @PostMapping("/arsenal/{code}/repor")
    public ResponseEntity<?> reporPecas(
            @PathVariable String code,
            @RequestParam(defaultValue = "10") int quantidade
    ) {
        try {
            ArsenalComponent updated = service.replenishStock(code, quantidade);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", "NAO_ENCONTRADO", "message", e.getMessage()));
        }
    }

    // Traz estatísticas gerais de prontidão e ocupação do hangar
    @GetMapping("/metricas")
    public Map<String, Object> getMetricas() {
        return service.getHangarMetrics();
    }
}
