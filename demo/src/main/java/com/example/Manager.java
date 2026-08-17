package com.example;

public class Manager extends Employees {
    private String accessLevel;

    public Manager(int id, String name, String email, String password,
                   String phone, double salary, String position,String accessLevel) {
        super(id, name, email, password, phone, salary, position);
        this.accessLevel = accessLevel;
    }

    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }

    public void manageSystem() {
        System.out.println("Manager is managing the system.");
    }
    
    @Override
    public String getSpecificDetails() {
        return String.format("Salary: $%.2f | Access: %s", getSalary(), accessLevel);
    }
}