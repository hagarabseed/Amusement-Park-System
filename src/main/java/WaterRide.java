/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author sara
 */
public class WaterRide extends Ride {
 private double meterWaterDepth ;
 private double dropHeight ;
 private String rideType ;
      public WaterRide(String name, int capacity, int ageRequirment, double hightRequirment, int yearsInservice, boolean needMaintenance,
            boolean available,double waterDepth,double     dropHeight , String rideType ){
      this.meterWaterDepth=meterWaterDepth;
      this.dropHeight=dropHeight;
      this.rideType=rideType;
      }          

    public double getWaterDepth() {
        return meterWaterDepth;
    }
public void setWaterDepth(double waterDepth) {
        this.meterWaterDepth = meterWaterDepth ;
    }
    public double getDropHeight() {
        return dropHeight;
    }
   public void setDropHeight(double dropHeight) {
        this.dropHeight = dropHeight;
    }
    public String getRideType() {
        return rideType;
    }

    public void setRideType(String rideType) {
        this.rideType = rideType;
    }
public void checkWaterSafety(){
if(meterWaterDepth > 2){
        System.out.println("Water depth is too deep. Additional safety measures are required");}
else{System.out.println("Water depth is safe for this ride");}
}
    @Override
    public boolean needReplacement() {
       return getYearsInservice() >= 10;
    }

    @Override
    public void startRide() {
      System.out.println("The WaterRide starting!");
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
          System.out.println("Water Depth: " +getWaterDepth() );
    System.out.println("Drop Height: " +getDropHeight() );
    System.out.println("Ride Type: " + getRideType());
    }
}
