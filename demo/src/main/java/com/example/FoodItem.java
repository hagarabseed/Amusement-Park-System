package com.example;

public abstract class FoodItem {

    private int id;
    private String name;
    private double price;

    public FoodItem(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public int getId() { return id; }

    public String getName() { return name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public abstract String getType();
    public abstract String getSpecificDetails();

    public void displayInfo() {
        System.out.printf("%-5d | %-15s | $%-8.2f | %-10s | %s%n", 
                id, name, price, getType(), getSpecificDetails());
    }
}