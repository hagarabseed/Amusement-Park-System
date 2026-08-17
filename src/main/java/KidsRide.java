/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author sara
 */
public class KidsRide extends Ride{
 private boolean hasParentalSupervision;
private boolean isIndoor;
private String rideType;
private int kidsAge;//
public KidsRide(String name, int capacity, int ageRequirment, double hightRequirment, int yearsInservice, boolean needMaintenance,
            boolean available,boolean hasParentalSupervision,boolean isIndoor,String rideType,int kidsAge){
super(name, capacity, ageRequirment, hightRequirment, yearsInservice, needMaintenance, available);
this.hasParentalSupervision=hasParentalSupervision;
this.isIndoor=isIndoor;
this.rideType=rideType;
this.kidsAge=kidsAge;

}
    public boolean isHasParentalSupervision() {
        return hasParentalSupervision;
    }

    public void setHasParentalSupervision(boolean hasParentalSupervision) {
        this.hasParentalSupervision = hasParentalSupervision;
    }

    public boolean isIndoor() {
        return isIndoor;
    }

    public void setIsIndoor(boolean isIndoor) {
        this.isIndoor = isIndoor;
    }

    public String getRideType() {
        return rideType;
    }

    public void setRideType(String rideType) {
        this.rideType = rideType;
    }
public void checkParentalSupervision(){
if(kidsAge<=5)
        System.out.println("Children under 5 years old must be accompanied by an adult");
}
    @Override
    public boolean needReplacement() {
        return getYearsInservice() >= 55;
    }

    @Override
    public void startRide() {
      System.out.println("The kidsRide starting!");
    }

    @Override
    public void displayInfo() {
         System.out.println("Ride name: " + getName());
        System.out.println("Capacity: " + getCapacity());
        System.out.println("the Age Requirement: " + getAgeRequirment());
        System.out.println("the Height Requirement: " + getHightRequirment());
        System.out.println(" the Years in Service: " + getYearsInservice());
         System.out.println(" the Years in Service: " + getYearsInservice());
        System.out.println("Needs Maintenance: " + isNeedMaintenance());
        System.out.println("Available: " + isAvailable());
    System.out.println("Parental Supervision Required: " + isHasParentalSupervision());
System.out.println("Indoor Ride: " + isIndoor());
System.out.println("Ride Type: " + getRideType());
}
    }
    

