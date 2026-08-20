package com.example;

public abstract class s_Ride implements h_Maintainable {
    private String name;
    private int capacity;
    private int ageRequirement;
    private double heightRequirement;
    private int yearsInService;
    private boolean needMaintenance;
    private boolean available;

    public s_Ride(String name, int capacity, int ageRequirement, double heightRequirement, 
                int yearsInService, boolean needMaintenance, boolean available) {
        this.name = name;
        this.capacity = capacity;
        this.ageRequirement = ageRequirement;
        this.heightRequirement = heightRequirement;
        this.yearsInService = yearsInService;
        this.needMaintenance = needMaintenance;
        this.available = available;
    }

    public String getName() { return name; }
    
    public int getCapacity() { return capacity; }
   
    public int getAgeRequirement() { return ageRequirement; }
   
    public double getHeightRequirement() { return heightRequirement; }
   
    public int getYearsInService() { return yearsInService; }
   
    public boolean isNeedMaintenance() { return needMaintenance; }
    public void setNeedMaintenance(boolean needMaintenance) { this.needMaintenance = needMaintenance; }
    
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    @Override
    public void performMaintenance() {
        System.out.println("-> Performing full maintenance check on ride: " + name);
        this.needMaintenance = false;
    }

    @Override
    public boolean needsMaintenanceCheck() {
        return this.needMaintenance;
    }

    public abstract boolean needReplacement();
    public abstract void startRide();
    public abstract String getRideCategory();
    public abstract String getSpecificDetails();
}
