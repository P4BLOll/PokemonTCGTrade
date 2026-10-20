package com.pabloepedro.estoque.repository;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import java.util.List;
import java.util.Optional;

/**
 * Porta de persistência segregada para operações com componentes e suprimentos do arsenal técnico (ISP - SOLID).
 */
public interface ArsenalRepository {
    List<ArsenalComponent> findAllComponents();
    Optional<ArsenalComponent> findComponentByCode(String code);
    ArsenalComponent saveComponent(ArsenalComponent comp);
}
