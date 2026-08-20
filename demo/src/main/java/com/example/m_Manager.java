package com.example;

public class m_Manager extends m_Employees {
    private String accessLevel;

    public m_Manager(int id, String name, String email, String password, String phone, double salary, String position, String accessLevel) {
        super(id, name, email, password, phone, salary, position);
        this.accessLevel = accessLevel;
    }

    public String getAccessLevel() { return accessLevel; }

    @Override
    public String getSpecificDetails() {
        return String.format("Salary: $%.2f | Access: %s", getSalary(), accessLevel);
    }
}
