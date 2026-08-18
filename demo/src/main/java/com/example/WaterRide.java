package com.example;

public class WaterRide extends Ride {
    private double waterDepth;
    private double dropHeight;
    private String subType;

    public WaterRide(String name, int capacity, int ageRequirement, double heightRequirement, 
                     int yearsInService, boolean needMaintenance, boolean available, 
                     double waterDepth, double dropHeight, String subType) {
        super(name, capacity, ageRequirement, heightRequirement, yearsInService, needMaintenance, available);
        this.waterDepth = waterDepth;
        this.dropHeight = dropHeight;
        this.subType = subType;
    }

    @Override
    public boolean needReplacement() { return getYearsInService() >= 10; }

    @Override
    public void startRide() { System.out.println("The Water Ride '" + getName() + "' is starting!"); }

    @Override
    public String getRideCategory() { return "Water Ride"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Type: %s | Water Depth: %.1fm | Drop: %.1fm", subType, waterDepth, dropHeight);
    }
}