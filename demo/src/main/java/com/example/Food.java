package com.example;

public class Food extends FoodItem {
    private String category;

    public Food(int id, String name, double price, String category) {
        super(id, name, price);
        this.category = category;
    }

    @Override
    public String getType() { return "Food"; }

    @Override
    public String getSpecificDetails() { return "Category: " + category; }
}