package com.example;

public class s_RollarCoaster extends s_Ride {
    private double maxSpeed;
    private int numberOfLoops;
    private boolean hasPhotoPoint;

    public s_RollarCoaster(String name, int capacity, int ageRequirement, double heightRequirement, 
                         int yearsInService, boolean needMaintenance, boolean available, 
                         double maxSpeed, int numberOfLoops, boolean hasPhotoPoint) {
        super(name, capacity, ageRequirement, heightRequirement, yearsInService, needMaintenance, available);
        this.maxSpeed = maxSpeed;
        this.numberOfLoops = numberOfLoops;
        this.hasPhotoPoint = hasPhotoPoint;
    }

    @Override
    public boolean needReplacement() { return getYearsInService() >= 40; }

    @Override
    public void startRide() { System.out.println("The Roller Coaster '" + getName() + "' is starting!"); }

    @Override
    public String getRideCategory() { return "Roller Coaster"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Speed: %.1f km/h | Loops: %d | Photo: %s", maxSpeed, numberOfLoops, hasPhotoPoint ? "Yes" : "No");
    }
}
