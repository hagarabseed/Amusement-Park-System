package com.example;

import java.util.ArrayList;
import java.util.List;

public class Booking {
    private int bookingId;
    private Customer customer;
    private List<Ticket> tickets = new ArrayList<>();
    private boolean isPaid = false;

    public Booking(int bookingId, Customer customer) {
        this.bookingId = bookingId;
        this.customer = customer;
    }

    public int getBookingId() { return bookingId; }
    public Customer getCustomer() { return customer; }
    public List<Ticket> getTickets() { return tickets; }
    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean paid) { isPaid = paid; }

    public void addTicket(Ticket ticket) { tickets.add(ticket); }

    public double calculateTotalAmount() {
        double total = 0;
        for (Ticket t : tickets) total += t.calculatePrice();
        return total;
    }

    public void displayBookingSummary() {
        System.out.println("\n================================ Booking Summary #" + bookingId + " ================================");
        System.out.println("Customer Name : " + customer.getName());
        System.out.println("Status        : " + (isPaid ? "PAID" : "PENDING PAYMENT"));
        System.out.println("----------------------------------------------------------------------------------");
        System.out.printf("%-5s | %-15s | %-11s | %s%n", "ID", "Type", "Price", "Benefits");
        System.out.println("----------------------------------------------------------------------------------");
        for (Ticket t : tickets) t.displayInfo();
        System.out.println("----------------------------------------------------------------------------------");
        System.out.printf("Total Amount  : $%.2f%n", calculateTotalAmount());
        System.out.println("----------------------------------------------------------------------------------");
    }
}