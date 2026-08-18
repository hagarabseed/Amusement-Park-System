package com.example;

public class CashPayment implements PaymentProcessor {
    @Override
    public boolean process(double amount) {
        System.out.printf("-> Processing $%.2f in Cash... SUCCESS!%n", amount);
        return true;
    }

    @Override
    public String getMethodName() { return "Cash"; }
}