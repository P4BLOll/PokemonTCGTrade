package com.pabloepedro.relatorio.entity;

import java.util.List;

// Guarda os dados de consumo de combustível do hangar e setores
public class FuelConsumptionReport {
    private String cycleId;
    private double totalConsumptionTons;
    private double currentBurnRateKgSec;
    private List<SectorConsumption> sectorBreakdown;

    // Construtor vazio padrão
    public FuelConsumptionReport() {}

    // Construtor completo com todos os dados calculados
    public FuelConsumptionReport(String cycleId, double totalConsumptionTons, double currentBurnRateKgSec, List<SectorConsumption> sectorBreakdown) {
        this.cycleId = cycleId;
        this.totalConsumptionTons = totalConsumptionTons;
        this.currentBurnRateKgSec = currentBurnRateKgSec;
        this.sectorBreakdown = sectorBreakdown;
    }

    // Getters e Setters básicos pra ler e alterar os campos
    public String getCycleId() { return cycleId; }
    public void setCycleId(String cycleId) { this.cycleId = cycleId; }

    public double getTotalConsumptionTons() { return totalConsumptionTons; }
    public void setTotalConsumptionTons(double totalConsumptionTons) { this.totalConsumptionTons = totalConsumptionTons; }

    public double getCurrentBurnRateKgSec() { return currentBurnRateKgSec; }
    public void setCurrentBurnRateKgSec(double currentBurnRateKgSec) { this.currentBurnRateKgSec = currentBurnRateKgSec; }

    public List<SectorConsumption> getSectorBreakdown() { return sectorBreakdown; }
    public void setSectorBreakdown(List<SectorConsumption> sectorBreakdown) { this.sectorBreakdown = sectorBreakdown; }

    // Representa o gasto de combustível setor por setor (ex: Alpha, Beta)
    public static class SectorConsumption {
        private String sectorName;
        private double consumptionKgSec;
        private int activeVessels;
        private String riskLevel;

        public SectorConsumption() {}

        public SectorConsumption(String sectorName, double consumptionKgSec, int activeVessels, String riskLevel) {
            this.sectorName = sectorName;
            this.consumptionKgSec = consumptionKgSec;
            this.activeVessels = activeVessels;
            this.riskLevel = riskLevel;
        }

        public String getSectorName() { return sectorName; }
        public void setSectorName(String sectorName) { this.sectorName = sectorName; }

        public double getConsumptionKgSec() { return consumptionKgSec; }
        public void setConsumptionKgSec(double consumptionKgSec) { this.consumptionKgSec = consumptionKgSec; }

        public int getActiveVessels() { return activeVessels; }
        public void setActiveVessels(int activeVessels) { this.activeVessels = activeVessels; }

        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    }
}

