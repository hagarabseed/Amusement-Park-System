package com.example;

import java.util.Scanner;

public class CustomerConsole {
    public static void display(Scanner scanner) {
        boolean back = false;
        while (!back) {
            System.out.println("\n========================================================");
            System.out.println("                   CUSTOMER MANAGEMENT                  ");
            System.out.println("========================================================");
            System.out.println("1. View Registered Park Visitors");
            System.out.println("2. Register New Customer");
            System.out.println("3. Back to Main Menu");
            System.out.print("Choose an option (1-3): ");
            
            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input! Please enter a number between 1 and 3.");
                scanner.next();
                continue;
            }
            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline
            
            switch (choice) {
                case 1:
                    printCustomerTable();
                    break;
                case 2:
                    registerCustomer(scanner);
                    break;
                case 3:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        }
    }

    public static void printCustomerTable() {
        System.out.println("\n================================ Registered Park Visitors ================================");
        System.out.printf("%-5s | %-18s | %-25s | %-12s | %-21s | %s%n", "ID", "Customer Name", "Email", "Phone", "Wristband Balance ($)", "Loyalty Points");
        System.out.println("---------------------------------------------------------------------------------------------------------");
        for (m_Person p : Main.park.getUsers()) {
            if (p instanceof m_Customer) {
                m_Customer c = (m_Customer) p;
                double bal = Main.customerBalances.getOrDefault(c.getId(), 0.0);
                System.out.printf("%-5d | %-18s | %-25s | %-12s | $%-20.2f | %d%n",
                    c.getId(), c.getName(), c.getEmail(), c.getPhone(), bal, c.getLoyaltyPoints());
            }
        }
        System.out.println("---------------------------------------------------------------------------------------------------------");
    }

    private static void registerCustomer(Scanner scanner) {
        System.out.println("\n--- Register New Customer ---");
        System.out.print("Enter Full Name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter Email Address: ");
        String email = scanner.nextLine().trim();
        System.out.print("Enter Phone Number: ");
        String phone = scanner.nextLine().trim();
        System.out.print("Enter Initial Wristband Deposit ($): ");
        String depStr = scanner.nextLine().trim();

        if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || depStr.isEmpty()) {
            System.out.println("[ERROR] All fields are required! Registration failed.");
            return;
        }
        if (!email.contains("@") || !email.contains(".")) {
            System.out.println("[ERROR] Please enter a valid email address (e.g. user@domain.com)!");
            return;
        }
        if (!phone.matches("\\d{8,15}")) {
            System.out.println("[ERROR] Phone number must contain between 8 and 15 digits!");
            return;
        }

        double deposit;
        try {
            deposit = Double.parseDouble(depStr);
            if (deposit < 0) {
                System.out.println("[ERROR] Initial deposit cannot be negative!");
                return;
            }
        } catch (NumberFormatException ex) {
            System.out.println("[ERROR] Initial deposit must be a valid numeric value!");
            return;
        }

        int newId = Main.park.getUsers().size() + 1;
        m_Customer newCust = new m_Customer(newId, name, email, "1234", phone, 10); // 10 welcome loyalty points
        Main.park.addUser(newCust);
        Main.customerBalances.put(newId, deposit);
        Main.activeCustomer = newCust;
        System.out.println("[SUCCESS] Customer [" + name + "] registered with ID: " + newId + " and Wristband Balance: $" + deposit);
    }
}