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

    public void displayOffer() {
        System.out.printf("%-5d | %-25s | %.1f%%%n", id, description, discountPercentage);
    }
}