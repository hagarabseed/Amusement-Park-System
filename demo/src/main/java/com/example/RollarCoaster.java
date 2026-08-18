package com.example;

public class RollarCoaster extends Ride {

    private double maxSpeed;
    private double trackLength;
    private int numberOfLoops;
    private boolean hasPhotoPoint;

    public RollarCoaster(String name, int capacity, int ageRequirement, double heightRequirement, 
                         int yearsInService, boolean needMaintenance, boolean available, 
                         double maxSpeed, double trackLength, int numberOfLoops, boolean hasPhotoPoint) {
        super(name, capacity, ageRequirement, heightRequirement, yearsInService, needMaintenance, available);
        this.maxSpeed = maxSpeed;
        this.trackLength = trackLength;
        this.numberOfLoops = numberOfLoops;
        this.hasPhotoPoint = hasPhotoPoint;
    }

    public double getMaxSpeed() { return maxSpeed; }
    public void setMaxSpeed(double maxSpeed) { this.maxSpeed = maxSpeed; }

    public double getTrackLength() { return trackLength; }
    public void setTrackLength(double trackLength) { this.trackLength = trackLength; }

    public int getNumberOfLoops() { return numberOfLoops; }
    public void setNumberOfLoops(int numberOfLoops) { this.numberOfLoops = numberOfLoops; }

    public boolean isHasPhotoPoint() { return hasPhotoPoint; }
    public void setHasPhotoPoint(boolean hasPhotoPoint) { this.hasPhotoPoint = hasPhotoPoint; }

    public double calculateRideTime() {
        return maxSpeed > 0 ? trackLength / maxSpeed : 0;
    }

    @Override
    public boolean needReplacement() { return getYearsInService() >= 40; }

    @Override
    public void startRide() {
        System.out.println("The Roller Coaster '" + getName() + "' is starting!");
    }

    @Override
    public String getRideCategory() { return "Roller Coaster"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Speed: %.1f km/h | Loops: %d | Photo: %s", 
                maxSpeed, numberOfLoops, hasPhotoPoint ? "Yes" : "No");
    }
}