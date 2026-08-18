package com.example;

public class Payment {
    private int paymentId;
    private Booking booking;
    private String paymentMethod;
    private boolean status;

    public Payment(int paymentId, Booking booking, String paymentMethod) {
        this.paymentId = paymentId;
        this.booking = booking;
        this.paymentMethod = paymentMethod;
        this.status = false;
    }

    public boolean processPayment() {
        if (booking.getTickets().isEmpty()) {
            System.out.println("-> Payment Failed: Booking has no tickets.");
            return false;
        }

        this.status = true;
        booking.setPaid(true);

        int pointsEarned = (int) (booking.calculateTotalAmount() / 10);
        booking.getCustomer().addLoyaltyPoints(pointsEarned);

        System.out.println("-> Payment Processed Successfully via " + paymentMethod + "!");
        System.out.println("-> " + pointsEarned + " Loyalty Points added to " + booking.getCustomer().getName() + ".");
        return true;
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
        System.out.println("Payment Method: " + paymentMethod);
        System.out.printf("Amount Paid   : $%.2f%n", booking.calculateTotalAmount());
        System.out.println("Status        : SUCCESS");
        System.out.println("===========================================================================================");
    }
}