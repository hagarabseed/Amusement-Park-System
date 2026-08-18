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

    public double getWaterDepth() { return waterDepth; }
    public void setWaterDepth(double waterDepth) { this.waterDepth = waterDepth; }

    public double getDropHeight() { return dropHeight; }
    public void setDropHeight(double dropHeight) { this.dropHeight = dropHeight; }

    public String getSubType() { return subType; }
    public void setSubType(String subType) { this.subType = subType; }

    public void checkWaterSafety() {
        if (waterDepth > 2.0) {
            System.out.println("Water depth is too deep. Additional safety measures are required.");
        } else {
            System.out.println("Water depth is safe for this ride.");
        }
    }

    @Override
    public boolean needReplacement() { return getYearsInService() >= 10; }

    @Override
    public void startRide() {
        System.out.println("The Water Ride '" + getName() + "' is starting! Get ready to get wet!");
    }

    @Override
    public String getRideCategory() { return "Water Ride"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Type: %s | Water Depth: %.1fm | Drop: %.1fm", 
                subType, waterDepth, dropHeight);
    }
}