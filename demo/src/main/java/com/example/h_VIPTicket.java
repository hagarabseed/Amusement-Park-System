package com.example;

public class h_VIPTicket extends h_Ticket {
    private boolean fastPassIncluded;

    public h_VIPTicket(int id, double basePrice, boolean fastPassIncluded) {
        super(id, basePrice);
        this.fastPassIncluded = fastPassIncluded;
    }

    @Override
    public String getTicketType() { return "VIP Ticket"; }

    @Override
    public double calculatePrice() {
        double price = getBasePrice() * 1.5;
        if (fastPassIncluded) price += 20.0;
        return price;
    }

    @Override
    public String getBenefits() {
        return "Priority access to all rides" + (fastPassIncluded ? " + FastPass" : "");
    }
}
