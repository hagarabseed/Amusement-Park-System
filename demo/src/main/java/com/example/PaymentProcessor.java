package com.example;

public interface PaymentProcessor {
    boolean process(double amount);
    String getMethodName();
}