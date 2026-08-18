package com.example;

public abstract class Ticket {
    private int id;
    private double basePrice;

    public Ticket(int id, double basePrice) {
        this.id = id;
        this.basePrice = basePrice;
    }

    public int getId() { return id; }
    public double getBasePrice() { return basePrice; }

    public abstract String getTicketType();
    public abstract double calculatePrice();
    public abstract String getBenefits();

    public void displayInfo() {
        System.out.printf("%-5d | %-15s | $%-10.2f | %s%n", 
                id, getTicketType(), calculatePrice(), getBenefits());
    }
}