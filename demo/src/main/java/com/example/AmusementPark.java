package com.example;

import java.util.ArrayList;
import java.util.List;

public class AmusementPark {
    private String parkName;
    private List<FoodItem> foodItems = new ArrayList<>();
    private List<Offer> offers = new ArrayList<>();
    private List<Ride> rides = new ArrayList<>();
    private List<Person> users = new ArrayList<>();

    public AmusementPark(String parkName) { this.parkName = parkName; }

    public void addFoodItem(FoodItem item) { foodItems.add(item); }
    public void addOffer(Offer offer) { offers.add(offer); }
    public void addRide(Ride ride) { rides.add(ride); }
    public void addUser(Person person) { users.add(person); }

    public List<Ride> getRides() { return rides; }
    public List<Person> getUsers() { return users; }

    public void displayFoodItems() {
        System.out.println("\n================================ " + parkName + " Food Court Menu ================================");
        System.out.printf("%-5s | %-15s | %-9s | %-10s | %s%n", "ID", "Name", "Price", "Type", "Details");
        System.out.println("---------------------------------------------------------------------------------------");
        for (FoodItem item : foodItems) item.displayInfo();
        System.out.println("---------------------------------------------------------------------------------------");
    }

    public void displayOffers() {
        System.out.println("\n================================ " + parkName + " Offers ================================");
        System.out.printf("%-5s | %-25s | %s%n", "ID", "Description", "Discount");
        System.out.println("------------------------------------------------------------------");
        for (Offer offer : offers) offer.displayOffer();
        System.out.println("------------------------------------------------------------------");
    }
}