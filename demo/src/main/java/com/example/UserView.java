package com.example;

import java.util.List;

public class UserView {

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "*****";
        int atIndex = email.indexOf("@");
        if (atIndex <= 2) return "***" + email.substring(atIndex);
        return email.charAt(0) + "***" + email.charAt(atIndex - 1) + email.substring(atIndex);
    }

    private static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return "*****";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    public static void printUserTable(List<Person> users) {
        System.out.println("\n================================ System Users Directory ================================");
        System.out.printf("%-5s | %-12s | %-20s | %-12s | %-15s | %s%n", "ID", "Name", "Email", "Phone", "Role", "Details");
        System.out.println("--------------------------------------------------------------------------------------------------------");
        for (Person u : users) {
            System.out.printf("%-5d | %-12s | %-20s | %-12s | %-15s | %s%n",
                    u.getId(), u.getName(), maskEmail(u.getEmail()), maskPhone(u.getPhone()), u.getRole(), u.getSpecificDetails());
        }
        System.out.println("--------------------------------------------------------------------------------------------------------");
    }
}