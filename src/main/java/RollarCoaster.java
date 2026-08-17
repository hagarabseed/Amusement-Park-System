/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author sara
 */
public class RollarCoaster extends Ride {

    private double maxSpeed;
    private double trackLenght;
    private int numberOfloops;
    private boolean hasaPhotoPoint;

    public RollarCoaster(String name, int capacity, int ageRequirment, double hightRequirment, int yearsInservice, boolean needMaintenance,
            boolean available, double maxSpeed, double trackLenght, int numberOfloops, boolean hasaPhotoPoint) {
        super(name, capacity, ageRequirment, hightRequirment, yearsInservice, needMaintenance, available);
        this.maxSpeed = maxSpeed;
        this.trackLenght = trackLenght;
        this.numberOfloops = numberOfloops;
        this.hasaPhotoPoint = hasaPhotoPoint;
    }

    public double getMaxSpeed() {
        return maxSpeed;
    }

    public void setMaxSpeed(double maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    public double getTrackLenght() {
        return trackLenght;
    }

    public void setTrackLenght(double trackLenght) {
        this.trackLenght = trackLenght;
    }

    public int getNumberOfloops() {
        return numberOfloops;
    }

    public void setNumberOfloops(int numberOfloops) {
        this.numberOfloops = numberOfloops;
    }

    public boolean isHasaPhotoPoint() {
        return hasaPhotoPoint;
    }

    public void setHasaPhotoPoint(boolean hasaPhotoPoint) {
        this.hasaPhotoPoint = hasaPhotoPoint;
    }

    public double calculateRideTime() {
        return trackLenght / maxSpeed;
    }

    @Override
    public boolean needReplacement() {
        return getYearsInservice() >= 40;
    }

    @Override
    public void startRide() {
        System.out.println("The Rollar Coaster  starting!");
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
        System.out.println(" maxSpeed: " + getMaxSpeed());
        System.out.println("trackLenght: " + getTrackLenght());
        System.out.println("numberOfloops: " + getNumberOfloops());
        System.out.println(" Is this Rollar Coaster has hasaPhotoPoint: " +isHasaPhotoPoint());
    }

}
