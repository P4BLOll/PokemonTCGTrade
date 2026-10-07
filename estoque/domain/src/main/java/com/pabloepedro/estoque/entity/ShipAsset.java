package com.pabloepedro.estoque.entity;

// Representa uma nave no hangar com toda a telemetria física (combustível, escudos, baia e status)
public class ShipAsset {
    private String id;
    private String code;
    private String name;
    private String bay;
    private String classType; // INTERCEPTOR, FREIGHTER, MINING_DRONE, ASSAULT_MECH, SCOUT, CORVETTE
    private String status;    // READY, DEPARTING, MAINTENANCE, IN_MISSION, QUEUED_LOCK
    private int fuelPercent;
    private int shieldPercent;
    private String warpCore;
    private int flightHours;
    private double contractRateCR;
    private boolean rareSingleUnit;
    private String currentLockHolder;
    private int queueDepth;
    private String armor;
    private String propulsion;
    private int maxCrew;
    private double payloadTon;

    public ShipAsset() {}

    public ShipAsset(String id, String code, String name, String bay, String classType, String status,
                     int fuelPercent, int shieldPercent, String warpCore, int flightHours,
                     double contractRateCR, boolean rareSingleUnit, String currentLockHolder,
                     int queueDepth, String armor, String propulsion, int maxCrew, double payloadTon) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.bay = bay;
        this.classType = classType;
        this.status = status;
        this.fuelPercent = fuelPercent;
        this.shieldPercent = shieldPercent;
        this.warpCore = warpCore;
        this.flightHours = flightHours;
        this.contractRateCR = contractRateCR;
        this.rareSingleUnit = rareSingleUnit;
        this.currentLockHolder = currentLockHolder;
        this.queueDepth = queueDepth;
        this.armor = armor;
        this.propulsion = propulsion;
        this.maxCrew = maxCrew;
        this.payloadTon = payloadTon;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBay() { return bay; }
    public void setBay(String bay) { this.bay = bay; }

    public String getClassType() { return classType; }
    public void setClassType(String classType) { this.classType = classType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getFuelPercent() { return fuelPercent; }
    public void setFuelPercent(int fuelPercent) { this.fuelPercent = fuelPercent; }

    public int getShieldPercent() { return shieldPercent; }
    public void setShieldPercent(int shieldPercent) { this.shieldPercent = shieldPercent; }

    public String getWarpCore() { return warpCore; }
    public void setWarpCore(String warpCore) { this.warpCore = warpCore; }

    public int getFlightHours() { return flightHours; }
    public void setFlightHours(int flightHours) { this.flightHours = flightHours; }

    public double getContractRateCR() { return contractRateCR; }
    public void setContractRateCR(double contractRateCR) { this.contractRateCR = contractRateCR; }

    public boolean isRareSingleUnit() { return rareSingleUnit; }
    public void setRareSingleUnit(boolean rareSingleUnit) { this.rareSingleUnit = rareSingleUnit; }

    public String getCurrentLockHolder() { return currentLockHolder; }
    public void setCurrentLockHolder(String currentLockHolder) { this.currentLockHolder = currentLockHolder; }

    public int getQueueDepth() { return queueDepth; }
    public void setQueueDepth(int queueDepth) { this.queueDepth = queueDepth; }

    public String getArmor() { return armor; }
    public void setArmor(String armor) { this.armor = armor; }

    public String getPropulsion() { return propulsion; }
    public void setPropulsion(String propulsion) { this.propulsion = propulsion; }

    public int getMaxCrew() { return maxCrew; }
    public void setMaxCrew(int maxCrew) { this.maxCrew = maxCrew; }

    public double getPayloadTon() { return payloadTon; }
    public void setPayloadTon(double payloadTon) { this.payloadTon = payloadTon; }
}
