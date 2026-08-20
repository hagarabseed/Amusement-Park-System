package com.example;

public class h_CashPayment implements h_PaymentProcessor {
    @Override
    public boolean process(double amount) {
        System.out.printf("-> Processing $%.2f in Cash... SUCCESS!%n", amount);
        return true;
    }

    @Override
    public String getMethodName() { return "Cash"; }
}
