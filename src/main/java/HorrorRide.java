/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author sara
 */
public class HorrorRide extends Ride {
    private int horrorLevel;
    private boolean hasSpecialEffects;
     public HorrorRide(String name, int capacity, int ageRequirement,
            double heightRequirement, int yearsInService,
            boolean needMaintenance, boolean available,
            int horrorLevel, boolean hasSpecialEffects) {

        super(name, capacity, ageRequirement, heightRequirement,
                yearsInService, needMaintenance, available);

        this.horrorLevel = horrorLevel;
        this.hasSpecialEffects = hasSpecialEffects;
        
    }
      public int getHorrorLevel() {
        return horrorLevel;
    }

    public void setHorrorLevel(int horrorLevel) {
        this.horrorLevel = horrorLevel;
    }

    public boolean isHasSpecialEffects() {
        return hasSpecialEffects;
    }

    public void setHasSpecialEffects(boolean hasSpecialEffects) {
        this.hasSpecialEffects = hasSpecialEffects;
    }

    
    public void displaySafetyWarning() {
        if (hasSpecialEffects) {
            System.out.println(
                "Warning: This ride contains intense horror effects, loud sounds, and flashing lights."
            );
        } else {
            System.out.println("Warning: This ride contains horror effects.");
        }
    }

    @Override
    public boolean needReplacement() {
        return getYearsInservice() >= 40;
    }

    @Override
    public void startRide() {
        System.out.println("The Horror Ride is starting!");
    }
     @Override
    public void displayInfo() {
        System.out.println("Ride name: " + getName());
        System.out.println("Capacity: " + getCapacity());
        System.out.println("the Age Requirement: " + getAgeRequirment());
        System.out.println("the Height Requirement: " + getHightRequirment());
        System.out.println(" the Years in Service: " + getYearsInservice());
        System.out.println("Needs Maintenance: " + isNeedMaintenance());
    System.out.println("Available: " + isAvailable());
    System.out.println("Horror Level: " + getHorrorLevel());
        System.out.println("Has Special Effects: " + isHasSpecialEffects());
}
}
