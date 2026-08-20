package com.example;

public class m_Customer extends m_Person {
    private int loyaltyPoints;

    public m_Customer(int id, String name, String email, String password, String phone, int loyaltyPoints) {
        super(id, name, email, password, phone);
        this.loyaltyPoints = loyaltyPoints;
    }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public void addLoyaltyPoints(int points) { this.loyaltyPoints += points; }

    @Override
    public String getRole() { return "Customer"; }

    @Override
    public String getSpecificDetails() { return "Loyalty Points: " + loyaltyPoints; }
}

