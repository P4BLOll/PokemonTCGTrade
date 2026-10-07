package com.pabloepedro.relatorio.entity;

import java.time.LocalDateTime;
import java.util.Map;

// Foto geral da estação: naves ativas, saúde do reator e faturamento em créditos galácticos
public class HangarExecutiveReport {
    private String reportId;
    private LocalDateTime generatedAt;
    private String baseStation;
    private int defconLevel;
    private double reactorCoreStability;
    private int totalFleetVessels;
    private int vesselsReady;
    private int vesselsInFlight;
    private int vesselsMaintenance;
    private int vesselsLockedDispatch;
    private double totalFlightHours;
    private double totalFuelBurnRateKgSec;
    private double totalRevenueGalacticCredits;
    private Map<String, Integer> fleetByClass;

    public HangarExecutiveReport() {}

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getBaseStation() { return baseStation; }
    public void setBaseStation(String baseStation) { this.baseStation = baseStation; }

    public int getDefconLevel() { return defconLevel; }
    public void setDefconLevel(int defconLevel) { this.defconLevel = defconLevel; }

    public double getReactorCoreStability() { return reactorCoreStability; }
    public void setReactorCoreStability(double reactorCoreStability) { this.reactorCoreStability = reactorCoreStability; }

    public int getTotalFleetVessels() { return totalFleetVessels; }
    public void setTotalFleetVessels(int totalFleetVessels) { this.totalFleetVessels = totalFleetVessels; }

    public int getVesselsReady() { return vesselsReady; }
    public void setVesselsReady(int vesselsReady) { this.vesselsReady = vesselsReady; }

    public int getVesselsInFlight() { return vesselsInFlight; }
    public void setVesselsInFlight(int vesselsInFlight) { this.vesselsInFlight = vesselsInFlight; }

    public int getVesselsMaintenance() { return vesselsMaintenance; }
    public void setVesselsMaintenance(int vesselsMaintenance) { this.vesselsMaintenance = vesselsMaintenance; }

    public int getVesselsLockedDispatch() { return vesselsLockedDispatch; }
    public void setVesselsLockedDispatch(int vesselsLockedDispatch) { this.vesselsLockedDispatch = vesselsLockedDispatch; }

    public double getTotalFlightHours() { return totalFlightHours; }
    public void setTotalFlightHours(double totalFlightHours) { this.totalFlightHours = totalFlightHours; }

    public double getTotalFuelBurnRateKgSec() { return totalFuelBurnRateKgSec; }
    public void setTotalFuelBurnRateKgSec(double totalFuelBurnRateKgSec) { this.totalFuelBurnRateKgSec = totalFuelBurnRateKgSec; }

    public double getTotalRevenueGalacticCredits() { return totalRevenueGalacticCredits; }
    public void setTotalRevenueGalacticCredits(double totalRevenueGalacticCredits) { this.totalRevenueGalacticCredits = totalRevenueGalacticCredits; }

    public Map<String, Integer> getFleetByClass() { return fleetByClass; }
    public void setFleetByClass(Map<String, Integer> fleetByClass) { this.fleetByClass = fleetByClass; }
}
