package com.example;

public class h_CreditCardPayment implements h_PaymentProcessor {
    private String cardNumber;

    public h_CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public boolean process(double amount) {
        System.out.printf("-> Processing $%.2f via Credit Card (%s)... SUCCESS!%n", amount, maskCardNumber());
        return true;
    }

    @Override
    public String getMethodName() { return "Credit Card"; }

    private String maskCardNumber() {
        if (cardNumber != null && cardNumber.length() >= 4) {
            return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
        }
        return "****";
    }
}

