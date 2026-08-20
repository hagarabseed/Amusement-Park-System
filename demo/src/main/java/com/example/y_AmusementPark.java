package com.example;

import java.util.ArrayList;
import java.util.List;

public class y_AmusementPark {
    private String parkName;
    private List<y_FoodItem> foodItems = new ArrayList<>();
    private List<y_Offer> offers = new ArrayList<>();
    private List<s_Ride> rides = new ArrayList<>();
    private List<m_Person> users = new ArrayList<>();

    public y_AmusementPark(String parkName) { this.parkName = parkName; }

    public void addFoodItem(y_FoodItem item) { foodItems.add(item); }
    public void addOffer(y_Offer offer) { offers.add(offer); }
    public void addRide(s_Ride ride) { rides.add(ride); }
    public void addUser(m_Person person) { users.add(person); }

    public List<s_Ride> getRides() { return rides; }
    public List<m_Person> getUsers() { return users; }

    public void displayFoodItems() {
        System.out.println("\n================================ " + parkName + " Food Court Menu ================================");
        System.out.printf("%-5s | %-15s | %-9s | %-10s | %s%n", "ID", "Name", "Price", "Type", "Details");
        System.out.println("---------------------------------------------------------------------------------------");
        for (y_FoodItem item : foodItems) item.displayInfo();
        System.out.println("---------------------------------------------------------------------------------------");
    }

    public void displayOffers() {
        System.out.println("\n================================ " + parkName + " Offers ================================");
        System.out.printf("%-5s | %-25s | %s%n", "ID", "Description", "Discount");
        System.out.println("------------------------------------------------------------------");
        for (y_Offer offer : offers) offer.displayOffer();
        System.out.println("------------------------------------------------------------------");
    }
}
