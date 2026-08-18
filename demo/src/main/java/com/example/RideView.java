package com.example;

import java.util.List;

public class RideView {

    public static void printRideTable(List<Ride> rides) {
        System.out.println("\n================================ Amusement Park Rides Directory ================================");
        System.out.printf("%-18s | %-14s | %-8s | %-8s | %-10s | %-10s | %s%n", 
                "Ride Name", "Category", "Capacity", "Min Age", "Status", "Needs Maint", "Details");
        System.out.println("-----------------------------------------------------------------------------------------------------------------");

        for (Ride r : rides) {
            String status = r.isAvailable() ? "Available" : "Closed";
            String maint = r.isNeedMaintenance() ? "YES" : "No";

            System.out.printf("%-18s | %-14s | %-8d | %-8d | %-10s | %-10s | %s%n",
                    r.getName(),
                    r.getRideCategory(),
                    r.getCapacity(),
                    r.getAgeRequirement(),
                    status,
                    maint,
                    r.getSpecificDetails());
        }
        System.out.println("-----------------------------------------------------------------------------------------------------------------");
    }
}