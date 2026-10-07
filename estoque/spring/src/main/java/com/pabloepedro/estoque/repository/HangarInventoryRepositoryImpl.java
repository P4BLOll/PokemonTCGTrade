package com.pabloepedro.estoque.repository;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

// Repositório em memória do hangar: guarda naves em doca, peças do arsenal e baias de ancoragem
@Repository
public class HangarInventoryRepositoryImpl implements HangarInventoryRepository {

    private final Map<String, ShipAsset> ships = new ConcurrentHashMap<>();
    private final Map<String, ArsenalComponent> components = new ConcurrentHashMap<>();
    private final Map<String, DockBay> dockBays = new ConcurrentHashMap<>();

    public HangarInventoryRepositoryImpl() {
        seedInitialHangarData();
    }

    // Carrega dados iniciais das naves, componentes e baias para testes e demonstração
    private void seedInitialHangarData() {
        // Naves Estacionadas no Hangar
        saveShip(new ShipAsset(
                "ship-01", "INT-VALK-9", "Valkyrie-IX", "DCK-A01", "INTERCEPTOR", "READY",
                98, 100, "CALIBRATED // MK-IV", 342, 1250.0, false, null, 0,
                "Liga Titânio-Cerâmica 120mm", "Propulsores de Íons Duplos", 1, 4.5
        ));

        saveShip(new ShipAsset(
                "ship-02", "FRG-TITAN-7", "Goliath-Titan", "DCK-A02", "FREIGHTER", "DEPARTING",
                82, 95, "ONLINE // DURA-3", 1840, 2800.0, false, null, 1,
                "Blindagem Modular Composta", "4x Propulsores Sub-Luz Quádruplos", 6, 2400.0
        ));

        saveShip(new ShipAsset(
                "ship-03", "DRN-MINER-07", "Excavator-Prime", "DCK-A03", "MINING_DRONE", "MAINTENANCE",
                65, 70, "N/A // AUTONOMOUS", 920, 750.0, false, null, 0,
                "Carcaça de Aço Reforçado", "Micromotores de Vetorização", 0, 180.0
        ));

        saveShip(new ShipAsset(
                "ship-04", "MCH-GEIST-04", "Mk-IV Assault Mech", "DCK-B01", "ASSAULT_MECH", "READY",
                91, 88, "PLASMA CORE 500MW", 128, 3400.0, false, null, 0,
                "Placas Reativas de Nanocarbono", "Pernas Hidráulicas + Jump Jets", 1, 12.0
        ));

        saveShip(new ShipAsset(
                "ship-05", "PROTO-STARHAWK", "StarHawk Prototype X-1", "DCK-B02", "INTERCEPTOR", "READY",
                94, 98, "PROTOTYPE // TACHYON-X", 42, 6200.0, true, null, 0,
                "Fusão de Grafeno Quântico", "Hiperpropulsor Experimental Taquiônico", 2, 6.0
        ));

        saveShip(new ShipAsset(
                "ship-06", "SCT-PHANTOM-3", "Phantom Stealth Scout", "DCK-B03", "SCOUT", "READY",
                100, 92, "ONLINE // SILENT-II", 512, 1650.0, false, null, 0,
                "Camuflagem de Absorção Radar/Óptica", "Impulso Térmico Suprimido", 2, 8.0
        ));

        saveShip(new ShipAsset(
                "ship-07", "CRV-SOLARIS-1", "Solaris Patrol Corvette", "DCK-C01", "CORVETTE", "READY",
                44, 80, "WARP MK-III // ENGAGED", 2410, 4500.0, false, null, 0,
                "Blindagem Pesada de Frota", "Motores Sub-Luz Duplos de Alta Saída", 14, 650.0
        ));

        saveShip(new ShipAsset(
                "ship-08", "DRN-DRONE-88", "Asteroid Scraper Unit 8", "DCK-C02", "MINING_DRONE", "READY",
                88, 65, "N/A // AUTOMATED", 480, 820.0, false, null, 0,
                "Liga Reforçada Anti-Impacto", "Micropropulsores Iônicos", 0, 220.0
        ));

        // Arsenal Técnico & Peças de Reposição
        saveComponent(new ArsenalComponent(
                "comp-01", "WARP-CORE-MK4", "Motor de Dobra Taquiônica MK-IV", "PROPULSION",
                7, 3, "BAY-P01", List.of("INTERCEPTOR", "CORVETTE", "SCOUT"), 4200.0, 100
        ));

        saveComponent(new ArsenalComponent(
                "comp-02", "PLASMA-SHIELD-GEN", "Gerador de Escudos de Plasma 1.2GW", "SHIELDS",
                14, 4, "BAY-S02", List.of("INTERCEPTOR", "FREIGHTER", "ASSAULT_MECH", "CORVETTE"), 2800.0, 98
        ));

        saveComponent(new ArsenalComponent(
                "comp-03", "ENERGY-CELL-500", "Bateria de Célula de Fusão 500MW", "POWER",
                38, 10, "BAY-E04", List.of("ALL"), 650.0, 100
        ));

        saveComponent(new ArsenalComponent(
                "comp-04", "ASTRO-DROID-R4", "Droide de Reparo Astromecânico R-4", "AUTOMATION",
                3, 5, "BAY-D01", List.of("INTERCEPTOR", "ASSAULT_MECH", "FREIGHTER"), 3100.0, 85
        ));

        saveComponent(new ArsenalComponent(
                "comp-05", "TITAN-ARMOR-PLATE", "Placa de Blindagem Titânio-Carbeto", "SHIELDS",
                22, 6, "BAY-A03", List.of("FREIGHTER", "CORVETTE", "ASSAULT_MECH"), 1100.0, 100
        ));

        saveComponent(new ArsenalComponent(
                "comp-06", "RAILGUN-SLUG-88", "Munição Magnética Slug de Ferro 88mm", "WEAPONS",
                64, 15, "BAY-W09", List.of("CORVETTE", "ASSAULT_MECH"), 340.0, 100
        ));

        // Docas do Hangar - Sem oficiais simulados; apenas oficiais autenticados que atracarem aparecerão
        saveDockBay(new DockBay("DCK-A01", "ALFA", true, "INT-VALK-9", "Valkyrie-IX", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-A02", "ALFA", true, "FRG-TITAN-7", "Goliath-Titan", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-A03", "ALFA", true, "DRN-MINER-07", "Excavator-Prime", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-B01", "BRAVO", true, "MCH-GEIST-04", "Mk-IV Assault Mech", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-B02", "BRAVO", true, "PROTO-STARHAWK", "StarHawk Prototype X-1", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-B03", "BRAVO", true, "SCT-PHANTOM-3", "Phantom Stealth Scout", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-C01", "CHARLIE", true, "CRV-SOLARIS-1", "Solaris Patrol Corvette", null, "OPERATIONAL"));
        saveDockBay(new DockBay("DCK-C02", "CHARLIE", true, "DRN-DRONE-88", "Asteroid Scraper Unit 8", null, "OPERATIONAL"));
    }

    @Override
    public List<ShipAsset> findAllShips() {
        return new ArrayList<>(ships.values());
    }

    @Override
    public Optional<ShipAsset> findShipByCode(String code) {
        return ships.values().stream()
                .filter(s -> s.getCode().equalsIgnoreCase(code) || s.getId().equalsIgnoreCase(code))
                .findFirst();
    }

    @Override
    public ShipAsset saveShip(ShipAsset ship) {
        ships.put(ship.getCode(), ship);
        return ship;
    }

    @Override
    public List<ArsenalComponent> findAllComponents() {
        return new ArrayList<>(components.values());
    }

    @Override
    public Optional<ArsenalComponent> findComponentByCode(String code) {
        return Optional.ofNullable(components.get(code));
    }

    @Override
    public ArsenalComponent saveComponent(ArsenalComponent comp) {
        components.put(comp.getCode(), comp);
        return comp;
    }

    @Override
    public List<DockBay> findAllDockBays() {
        return new ArrayList<>(dockBays.values());
    }

    @Override
    public DockBay saveDockBay(DockBay bay) {
        dockBays.put(bay.getBayCode(), bay);
        return bay;
    }
}
