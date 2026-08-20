package com.example;

public interface h_PaymentProcessor {
    boolean process(double amount);
    String getMethodName();
}
