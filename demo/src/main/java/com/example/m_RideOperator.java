package com.example;

public class m_RideOperator extends m_Employees {
    private String assignedRide;

    public m_RideOperator(int id, String name, String email, String password, String phone, double salary, String position, String assignedRide) {
        super(id, name, email, password, phone, salary, position);
        this.assignedRide = assignedRide;
    }

    @Override
    public String getSpecificDetails() {
        return String.format("Salary: $%.2f | Ride: %s", getSalary(), assignedRide);
    }
}
