package com.example;

public class y_Drink extends y_FoodItem {
    private String size;

    public y_Drink(int id, String name, double price, String size) {
        super(id, name, price);
        this.size = size;
    }

    @Override
    public String getType() { return "Drink"; }

    @Override
    public String getSpecificDetails() { return "Size: " + size; }
}
