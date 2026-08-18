package com.example;

public class Drink extends FoodItem {
    private String size;

    public Drink(int id, String name, double price, String size) {
        super(id, name, price);
        this.size = size;
    }

    @Override
    public String getType() { return "Drink"; }

    @Override
    public String getSpecificDetails() { return "Size: " + size; }
}