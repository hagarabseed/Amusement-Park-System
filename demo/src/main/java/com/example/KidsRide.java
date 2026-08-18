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

    @Override
    public boolean needReplacement() { return getYearsInService() >= 55; }

    @Override
    public void startRide() { System.out.println("The Kids Ride '" + getName() + "' is starting!"); }

    @Override
    public String getRideCategory() { return "Kids Ride"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Type: %s | Indoor: %s | Supervision: %s", subType, isIndoor ? "Yes" : "No", hasParentalSupervision ? "Required" : "Optional");
    }
}