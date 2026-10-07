package com.pabloepedro.estoque.entity;

// Representa uma baia física no hangar e indica qual nave está atracada nela
public class DockBay {
    private String bayCode;
    private String section;
    private boolean occupied;
    private String vesselCode;
    private String vesselName;
    private String assignedOfficer;
    private String bayStatus; // OPERATIONAL, REFUELING, MAINTENANCE, LOCKED_DISPATCH, IN_FLIGHT

    public DockBay() {}

    public DockBay(String bayCode, String section, boolean occupied, String vesselCode,
                   String vesselName, String assignedOfficer, String bayStatus) {
        this.bayCode = bayCode;
        this.section = section;
        this.occupied = occupied;
        this.vesselCode = vesselCode;
        this.vesselName = vesselName;
        this.assignedOfficer = assignedOfficer;
        this.bayStatus = bayStatus;
    }

    public String getBayCode() { return bayCode; }
    public void setBayCode(String bayCode) { this.bayCode = bayCode; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public boolean isOccupied() { return occupied; }
    public void setOccupied(boolean occupied) { this.occupied = occupied; }

    public String getVesselCode() { return vesselCode; }
    public void setVesselCode(String vesselCode) { this.vesselCode = vesselCode; }

    public String getVesselName() { return vesselName; }
    public void setVesselName(String vesselName) { this.vesselName = vesselName; }

    public String getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; }

    public String getBayStatus() { return bayStatus; }
    public void setBayStatus(String bayStatus) { this.bayStatus = bayStatus; }
}
