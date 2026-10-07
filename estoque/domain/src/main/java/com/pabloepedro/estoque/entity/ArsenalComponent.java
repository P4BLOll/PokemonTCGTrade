package com.pabloepedro.estoque.entity;

import java.util.List;

// Peça sobressalente ou módulo de armamento armazenado no arsenal do hangar
public class ArsenalComponent {
    private String id;
    private String code;
    private String name;
    private String category; // PROPULSION, SHIELDS, POWER, AUTOMATION, WEAPONS
    private int stockUnits;
    private int minThreshold;
    private String storageBay;
    private List<String> compatibleClasses;
    private double unitPriceCR;
    private int healthConditionPercent;

    public ArsenalComponent() {}

    public ArsenalComponent(String id, String code, String name, String category, int stockUnits,
                            int minThreshold, String storageBay, List<String> compatibleClasses,
                            double unitPriceCR, int healthConditionPercent) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.category = category;
        this.stockUnits = stockUnits;
        this.minThreshold = minThreshold;
        this.storageBay = storageBay;
        this.compatibleClasses = compatibleClasses;
        this.unitPriceCR = unitPriceCR;
        this.healthConditionPercent = healthConditionPercent;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getStockUnits() { return stockUnits; }
    public void setStockUnits(int stockUnits) { this.stockUnits = stockUnits; }

    public int getMinThreshold() { return minThreshold; }
    public void setMinThreshold(int minThreshold) { this.minThreshold = minThreshold; }

    public String getStorageBay() { return storageBay; }
    public void setStorageBay(String storageBay) { this.storageBay = storageBay; }

    public List<String> getCompatibleClasses() { return compatibleClasses; }
    public void setCompatibleClasses(List<String> compatibleClasses) { this.compatibleClasses = compatibleClasses; }

    public double getUnitPriceCR() { return unitPriceCR; }
    public void setUnitPriceCR(double unitPriceCR) { this.unitPriceCR = unitPriceCR; }

    public int getHealthConditionPercent() { return healthConditionPercent; }
    public void setHealthConditionPercent(int healthConditionPercent) { this.healthConditionPercent = healthConditionPercent; }

    public boolean isBelowThreshold() {
        return stockUnits <= minThreshold;
    }
}
