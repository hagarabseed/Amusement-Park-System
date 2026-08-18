package com.example;

public class Employees extends Person {
    private double salary;
    private String position;

    public Employees(int id, String name, String email, String password, String phone, double salary, String position) {
        super(id, name, email, password, phone);
        this.salary = salary;
        this.position = position;
    }

    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    @Override
    public String getRole() { return position; }

    @Override
    public String getSpecificDetails() { return String.format("Salary: $%.2f", salary); }
}