package com.example;

public class Customer extends Person {
    private int loyaltyPoints;

    public Customer(int id, String name, String email, String password, String phone,int loyaltyPoints) {
        super(id, name, email, password, phone);
        this.loyaltyPoints = loyaltyPoints;
    }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }


    public void addLoyaltyPoints(int points) { loyaltyPoints += points; }

    @Override
    public String getRole() { return "Customer"; }

    @Override
    public String getSpecificDetails() { return "Loyalty Points: " + loyaltyPoints; }
}