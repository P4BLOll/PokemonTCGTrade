package com.pabloepedro.estoque.repository;

/**
 * Contrato agregado de repositório do hangar que combina as portas segregadas
 * de naves, arsenal e docas (Interface Segregation Principle - SOLID).
 */
public interface HangarInventoryRepository extends ShipRepository, ArsenalRepository, DockBayRepository {
}
