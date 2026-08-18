package com.example;

public class HorrorRide extends Ride {
    private int horrorLevel;
    private boolean hasSpecialEffects;

    public HorrorRide(String name, int capacity, int ageRequirement, double heightRequirement, 
                      int yearsInService, boolean needMaintenance, boolean available, 
                      int horrorLevel, boolean hasSpecialEffects) {
        super(name, capacity, ageRequirement, heightRequirement, yearsInService, needMaintenance, available);
        this.horrorLevel = horrorLevel;
        this.hasSpecialEffects = hasSpecialEffects;
    }

    @Override
    public boolean needReplacement() { return getYearsInService() >= 40; }

    @Override
    public void startRide() { System.out.println("The Horror Ride '" + getName() + "' is starting..."); }

    @Override
    public String getRideCategory() { return "Horror Ride"; }

    @Override
    public String getSpecificDetails() {
        return String.format("Horror Level: %d/10 | Special Effects: %s", horrorLevel, hasSpecialEffects ? "Yes" : "No");
    }
}