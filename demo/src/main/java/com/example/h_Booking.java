package com.example;

import java.util.ArrayList;
import java.util.List;

public class h_Booking {
    private int bookingId;
    private m_Customer customer;
    private List<h_Ticket> tickets = new ArrayList<>();
    private boolean isPaid = false;

    public h_Booking(int bookingId, m_Customer customer) {
        this.bookingId = bookingId;
        this.customer = customer;
    }

    public int getBookingId() { return bookingId; }
    public m_Customer getCustomer() { return customer; }
    public List<h_Ticket> getTickets() { return tickets; }
    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean paid) { isPaid = paid; }

    public void addTicket(h_Ticket ticket) { tickets.add(ticket); }

    public double calculateTotalAmount() {
        double total = 0;
        for (h_Ticket t : tickets) total += t.calculatePrice();
        return total;
    }

    public void displayBookingSummary() {
        System.out.println("\n================================ Booking Summary #" + bookingId + " ================================");
        System.out.println("Customer Name : " + customer.getName());
        System.out.println("Status        : " + (isPaid ? "PAID" : "PENDING PAYMENT"));
        System.out.println("----------------------------------------------------------------------------------");
        System.out.printf("%-5s | %-15s | %-11s | %s%n", "ID", "Type", "Price", "Benefits");
        System.out.println("----------------------------------------------------------------------------------");
        for (h_Ticket t : tickets) t.displayInfo();
        System.out.println("----------------------------------------------------------------------------------");
        System.out.printf("Total Amount  : $%.2f%n", calculateTotalAmount());
        System.out.println("----------------------------------------------------------------------------------");
    }
}
