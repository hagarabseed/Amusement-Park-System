package com.example;

public class Cashier extends Employees {
    private int transactionsCount;

    public Cashier(int id, String name, String email, String password,
                   String phone, double salary, String position, int transactionsCount) {
        super(id, name, email, password, phone, salary, position);
        this.transactionsCount = transactionsCount;
    }

    public int getTransactionsCount() { return transactionsCount; }
    public void setTransactionsCount(int transactionsCount) {
        this.transactionsCount = transactionsCount;
    }

    public void processTranactions(){ transactionsCount++; }

    @Override
    public String getSpecificDetails() {
        return String.format("Salary: $%.2f | Txns: %d", getSalary(), transactionsCount);
    }
}
