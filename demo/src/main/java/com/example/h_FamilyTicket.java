package com.example;

public class h_FamilyTicket extends h_Ticket {
    private int memberCount;

    public h_FamilyTicket(int id, double basePrice, int memberCount) {
        super(id, basePrice);
        this.memberCount = memberCount;
    }

    @Override
    public String getTicketType() { return "Family Ticket"; }

    @Override
    public double calculatePrice() { return (getBasePrice() * memberCount) * 0.85; }

    @Override
    public String getBenefits() { return "Group entry for " + memberCount + " members (15% off)"; }
}

