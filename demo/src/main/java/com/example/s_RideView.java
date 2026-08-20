package com.example;

import java.util.List;

public class s_RideView {
    public static void printRideTable(List<s_Ride> rides) {
        System.out.println("\n================================ Amusement Park Rides Directory ================================");
        System.out.printf("%-18s | %-14s | %-8s | %-8s | %-10s | %-10s | %s%n", 
                "Ride Name", "Category", "Capacity", "Min Age", "Status", "Needs Maint", "Details");
        System.out.println("-----------------------------------------------------------------------------------------------------------------");

        for (s_Ride r : rides) {
            System.out.printf("%-18s | %-14s | %-8d | %-8d | %-10s | %-10s | %s%n",
                    r.getName(), r.getRideCategory(), r.getCapacity(), r.getAgeRequirement(),
                    (r.isAvailable() ? "Available" : "Closed"), (r.isNeedMaintenance() ? "YES" : "No"), r.getSpecificDetails());
        }
        System.out.println("-----------------------------------------------------------------------------------------------------------------");
    }
}
