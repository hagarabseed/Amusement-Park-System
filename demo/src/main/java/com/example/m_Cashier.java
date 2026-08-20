package com.example;

public class m_Cashier extends m_Employees {
    private int transactionsCount;

    public m_Cashier(int id, String name, String email, String password, String phone, double salary, String position, int transactionsCount) {
        super(id, name, email, password, phone, salary, position);
        this.transactionsCount = transactionsCount;
    }

    @Override
    public String getSpecificDetails() {
        return String.format("Salary: $%.2f | Txns: %d", getSalary(), transactionsCount);
    }
}
