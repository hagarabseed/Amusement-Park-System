package com.example;

public abstract class Ride {

    private String name;
    private int capacity;
    private int ageRequirment;
    private double hightRequirment;
    private int yearsInservice;
    private boolean needMaintenance;
    private boolean available;

    public Ride() {
        this("", 0, 0, 0.0, 0, false, false);
    }

    public Ride(String name, int capacity, int ageRequirment, double hightRequirment, int yearsInservice, boolean needMaintenance,
            boolean available) {
        this.name = name;
        this.capacity = capacity;
        this.ageRequirment = ageRequirment;
        this.hightRequirment = hightRequirment;
        this.yearsInservice = yearsInservice;
        this.needMaintenance = needMaintenance;
        this.available = available;
    }

    public void setNeedsMaintenance(boolean needMaintenance) {
        this.needMaintenance = needMaintenance;
    }

    public boolean isNeedMaintenance() {
        return needMaintenance;
    }

    public void checkMaintenance() {
        if (needMaintenance) {
            System.out.println("this ride needs maintenance");
        }
    }

    public int getAgeRequirment() {
        return ageRequirment;
    }

    public void setAgeRequirment(int ageRequirment) {
        this.ageRequirment = ageRequirment;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public double getHightRequirment() {
        return hightRequirment;
    }

    public void setHightRequirment(double hightRequirment) {
        this.hightRequirment = hightRequirment;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getYearsInservice() {
        return yearsInservice;
    }

    public void setYearsInservice(int yearsInservice) {
        this.yearsInservice = yearsInservice;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isAllowed(int age, double hight) {
        return age >= ageRequirment && hight >= hightRequirment;

    }

    public abstract boolean needReplacement();

    public abstract void startRide();

    public abstract void displayInfo();
}
