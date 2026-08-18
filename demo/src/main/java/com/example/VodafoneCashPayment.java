package com.example;

public class VodafoneCashPayment implements PaymentProcessor {
    private String phoneNumber;

    public VodafoneCashPayment(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public boolean process(double amount) {
        System.out.printf("-> Processing $%.2f via Vodafone Cash (%s)... SUCCESS!%n", amount, phoneNumber);
        return true;
    }

    @Override
    public String getMethodName() { return "Vodafone Cash"; }
}