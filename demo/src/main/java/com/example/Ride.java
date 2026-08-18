package com.example;

public abstract class Ride {

    private String name;
    private int capacity;
    private int ageRequirement;
    private double heightRequirement;
    private int yearsInService;
    private boolean needMaintenance;
    private boolean available;

    public Ride() {
        this("", 0, 0, 0.0, 0, false, false);
    }

    public Ride(String name, int capacity, int ageRequirement, double heightRequirement, 
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
    public void setName(String name) { this.name = name; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getAgeRequirement() { return ageRequirement; }
    public void setAgeRequirement(int ageRequirement) { this.ageRequirement = ageRequirement; }

    public double getHeightRequirement() { return heightRequirement; }
    public void setHeightRequirement(double heightRequirement) { this.heightRequirement = heightRequirement; }

    public int getYearsInService() { return yearsInService; }
    public void setYearsInService(int yearsInService) { this.yearsInService = yearsInService; }

    public boolean isNeedMaintenance() { return needMaintenance; }
    public void setNeedsMaintenance(boolean needMaintenance) { this.needMaintenance = needMaintenance; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public boolean isAllowed(int age, double height) {
        return age >= ageRequirement && height >= heightRequirement;
    }

    public void checkMaintenance() {
        if (needMaintenance) {
            System.out.println("Warning: Ride '" + name + "' needs maintenance!");
        }
    }

    public abstract boolean needReplacement();
    public abstract void startRide();
    public abstract String getRideCategory();
    public abstract String getSpecificDetails();
}