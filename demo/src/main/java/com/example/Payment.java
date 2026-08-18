package com.example;

public class Payment {
    private int paymentId;
    private Booking booking;
    private PaymentProcessor paymentProcessor;
    private boolean status = false;

    public Payment(int paymentId, Booking booking, PaymentProcessor paymentProcessor) {
        this.paymentId = paymentId;
        this.booking = booking;
        this.paymentProcessor = paymentProcessor;
    }

    public boolean processPayment() {
        if (booking == null || booking.getTickets().isEmpty()) {
            System.out.println("-> Payment Failed: Booking has no tickets.");
            return false;
        }

        double total = booking.calculateTotalAmount();
        this.status = paymentProcessor.process(total);

        if (this.status) {
            booking.setPaid(true);
            int pointsEarned = (int) (total / 10);
            booking.getCustomer().addLoyaltyPoints(pointsEarned);
            System.out.println("-> " + pointsEarned + " Loyalty Points added to " + booking.getCustomer().getName() + ".");
        }

        return this.status;
    }

    public void printReceipt() {
        if (!status) {
            System.out.println("-> Cannot print receipt: Payment has not been processed yet.");
            return;
        }

        System.out.println("\n================================ Official Payment Receipt ================================");
        System.out.println("Payment ID    : PAY-" + paymentId);
        System.out.println("Booking ID    : #" + booking.getBookingId());
        System.out.println("Customer      : " + booking.getCustomer().getName());
        System.out.println("Payment Method: " + paymentProcessor.getMethodName());
        System.out.printf("Amount Paid   : $%.2f%n", booking.calculateTotalAmount());
        System.out.println("Status        : SUCCESS");
        System.out.println("===========================================================================================");
    }
}