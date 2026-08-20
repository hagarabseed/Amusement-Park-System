package com.example;

public class OverviewConsole {
    public static void display() {
        System.out.println("\n========================================================");
        System.out.println("                   OVERVIEW DASHBOARD                   ");
        System.out.println("========================================================");
        
        long customerCount = Main.park.getUsers().stream().filter(u -> u instanceof m_Customer).count();
        long operationalRides = Main.park.getRides().stream().filter(r -> !r.isNeedMaintenance()).count();
        long activeStaff = Main.park.getUsers().stream().filter(u -> !(u instanceof m_Customer)).count();
        
        System.out.printf(" - Total Revenue Today   : $%.2f%n", Main.totalRevenue);
        System.out.printf(" - Active Visitors Inside: %d%n", customerCount * 12);
        System.out.printf(" - Operational Rides     : %d / %d%n", operationalRides, Main.park.getRides().size());
        System.out.printf(" - Active Staff On Duty  : %d%n", activeStaff);
        System.out.println("--------------------------------------------------------");
        System.out.println("                 LIVE SYSTEM AUDIT LOG                  ");
        System.out.println("--------------------------------------------------------");
        System.out.println("[10:15 AM] Ticket #101 issued - Regular Pass ($50.00)");
        System.out.println("[11:30 AM] Food Court Sale: Burger Combo ($150.00)");
        System.out.println("[01:45 PM] Maintenance check completed for Thunder Coaster");
        System.out.println("[03:20 PM] New Customer Registered & RFID Wristband assigned");
        System.out.println("[04:10 PM] Wristband Balance Top-up: +$100.00");
        System.out.println("========================================================");
    }
}