package com.example;

public abstract class y_FoodItem implements h_Discountable {
    private int id;
    private String name;
    private double price;

    public y_FoodItem(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }

    @Override
    public double applyDiscount(double percentage) {
        return price - (price * (percentage / 100.0));
    }

    public abstract String getType();
    public abstract String getSpecificDetails();

    public void displayInfo() {
        System.out.printf("%-5d | %-15s | $%-8.2f | %-10s | %s%n", id, name, price, getType(), getSpecificDetails());
    }
}
