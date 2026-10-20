package com.pabloepedro.estoque.repository;

import com.pabloepedro.estoque.entity.DockBay;
import java.util.List;

/**
 * Porta de persistência segregada para baias e docas de contenção do hangar (ISP - SOLID).
 */
public interface DockBayRepository {
    List<DockBay> findAllDockBays();
    DockBay saveDockBay(DockBay bay);
}
