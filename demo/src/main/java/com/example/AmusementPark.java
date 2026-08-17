package com.example;
import java.util.ArrayList;

public class AmusementPark {

    private String parkName;
    private ArrayList<FoodItem> foodItems;
    private ArrayList<Offer> offers;

    public AmusementPark(String parkName) {
        this.parkName = parkName;
        this.foodItems = new ArrayList<>();
        this.offers = new ArrayList<>(); 
    }

    public String getParkName() { return parkName; }

    public void addFoodItem(FoodItem item) { foodItems.add(item); }

    public void addOffer(Offer offer) { offers.add(offer); }

    public void displayFoodItems() {
        System.out.println("\n================================ " + parkName + " Food Court Menu ================================");
        System.out.printf("%-5s | %-15s | %-9s | %-10s | %s%n", "ID", "Name", "Price", "Type", "Details");
        System.out.println("---------------------------------------------------------------------------------------");
        for (FoodItem item : foodItems) {
            item.displayInfo();
        }
        System.out.println("---------------------------------------------------------------------------------------");
    }

    public void displayOffers() {
        System.out.println("\n================================ " + parkName + " Offers ================================");
        System.out.printf("%-5s | %-25s | %s%n", "ID", "Description", "Discount");
        System.out.println("------------------------------------------------------------------");
        for (Offer offer : offers) {
            offer.displayOffer();
        }
        System.out.println("------------------------------------------------------------------");
    }
}