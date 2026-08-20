package com.example;

public class h_RegularTicket extends h_Ticket {
    public h_RegularTicket(int id, double basePrice) { super(id, basePrice); }

    @Override
    public String getTicketType() { return "Regular Ticket"; }

    @Override
    public double calculatePrice() { return getBasePrice(); }

    @Override
    public String getBenefits() { return "Access to standard rides"; }
}
