package com.example;

public class Offer {

    private int id;
    private String description;
    private double discountPercentage;

    public Offer(int id, String description, double discountPercentage) {
        this.id = id;
        this.description = description;
        this.discountPercentage = discountPercentage;
    }

    public int getId() { return id; }

    public String getDescription() { return description; }

    public double getDiscountPercentage() { return discountPercentage; }

    public double calculateDiscountedPrice(double originalPrice) {
        return originalPrice - (originalPrice * discountPercentage / 100);
    }

    public void displayOffer() {
        System.out.printf("%-5d | %-25s | %.1f%%%n", id, description, discountPercentage);
    }
}
