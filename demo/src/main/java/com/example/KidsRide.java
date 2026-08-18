package com.example;

public class KidsRide extends Ride {

    private boolean hasParentalSupervision;
    private boolean isIndoor;
    private String subType;

    public KidsRide(String name, int capacity, int ageRequirement, double heightRequirement, 
                    int yearsInService, boolean needMaintenance, boolean available, 
                    boolean hasParentalSupervision, boolean isIndoor, String subType) {
        super(name, capacity, ageRequirement, heightRequirement, yearsInService, needMaintenance, available);
        this.hasParentalSupervision = hasParentalSupervision;
        this.isIndoor = isIndoor;
        this.subType = subType;
    }

    public boolean isHasParentalSupervision() { return hasParentalSupervision; }
    public void setHasParentalSupervision(boolean hasParentalSupervision) { this.hasParentalSupervision = hasParentalSupervision; }

    public boolean isIndoor() { return isIndoor; }
    public void setIsIndoor(boolean isIndoor) { this.isIndoor = isIndoor; }

    public String getSubType() { return subType; }
    public void setSubType(String subType) { this.subType = subType; }

    public void checkParentalSupervision(int kidsAge) {
        if (kidsAge <= 5) {
            System.out.println("Children under 5 years old must be accompanied by an adult.");
        }
    }

    @Override
    public boolean needReplacement() { return getYearsInService() >= 55; }

    @Override
    public void startRide() {
        System.out.println("The Kids Ride '" + getName() + "' is starting!");
    }

    @Override
    public String getRideCategory() { return "Kids Ride"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Type: %s | Indoor: %s | Supervision: %s", 
                subType, isIndoor ? "Yes" : "No", hasParentalSupervision ? "Required" : "Optional");
    }
}