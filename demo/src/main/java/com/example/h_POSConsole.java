package com.example;

import java.util.Scanner;

public class h_POSConsole {
    public static void display(Scanner scanner) {
        boolean back = false;
        while (!back) {
            double activeBal = Main.customerBalances.getOrDefault(Main.activeCustomer.getId(), 0.0);
            System.out.println("\n========================================================");
            System.out.println("                 POS & WRISTBAND CONSOLE                ");
            System.out.println("========================================================");
            System.out.printf("Target Visitor: %s [ID: %d]%n", Main.activeCustomer.getName(), Main.activeCustomer.getId());
            System.out.printf("Wristband Balance: $%.2f | Loyalty Points: %d%n", activeBal, Main.activeCustomer.getLoyaltyPoints());
            System.out.println("--------------------------------------------------------");
            System.out.println("1. Select Target Visitor (Switch Active Customer)");
            System.out.println("2. Issue Ticket Pass");
            System.out.println("3. Top-Up Customer Wristband");
            System.out.println("4. Back to Main Menu");
            System.out.print("Choose an option (1-4): ");

            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input! Please enter a number between 1 and 4.");
                scanner.next();
                continue;
            }
            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    selectCustomer(scanner);
                    break;
                case 2:
                    issueTicket(scanner);
                    break;
                case 3:
                    topupWristband(scanner);
                    break;
                case 4:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        }
    }

    private static void selectCustomer(Scanner scanner) {
        System.out.println("\n--- Select Active Visitor ---");
        h_CustomerConsole.printCustomerTable();
        System.out.print("Enter Customer ID to make active: ");
        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid input! ID must be a number.");
            scanner.next();
            return;
        }
        int id = scanner.nextInt();
        scanner.nextLine(); // consume newline

        m_Customer found = null;
        for (m_Person p : Main.park.getUsers()) {
            if (p instanceof m_Customer && p.getId() == id) {
                found = (m_Customer) p;
                break;
            }
        }

        if (found != null) {
            Main.activeCustomer = found;
            System.out.println("[SUCCESS] Active customer switched to: " + found.getName());
        } else {
            System.out.println("[ERROR] Customer ID not found!");
        }
    }

    private static void issueTicket(Scanner scanner) {
        System.out.println("\n--- Issue Ticket Pass ---");
        System.out.println("1. Regular Pass ($50.00)");
        System.out.println("2. VIP FastPass ($75.00)");
        System.out.println("3. Family Pass ($160.00)");
        System.out.print("Select Ticket Type (1-3): ");

        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid ticket selection!");
            scanner.next();
            return;
        }
        int typeChoice = scanner.nextInt();
        scanner.nextLine(); // consume newline

        double price;
        String ticketName;
        if (typeChoice == 1) {
            price = 50.0;
            ticketName = "Regular Pass";
        } else if (typeChoice == 2) {
            price = 75.0;
            ticketName = "VIP FastPass";
        } else if (typeChoice == 3) {
            price = 160.0;
            ticketName = "Family Pass";
        } else {
            System.out.println("[ERROR] Invalid option selected!");
            return;
        }

        System.out.print("Deduct payment from Wristband Balance? (y/n): ");
        String payWithWristbandStr = scanner.nextLine().trim().toLowerCase();
        boolean payWithWristband = payWithWristbandStr.equals("y") || payWithWristbandStr.equals("yes");

        if (payWithWristband) {
            double currentBal = Main.customerBalances.getOrDefault(Main.activeCustomer.getId(), 0.0);
            if (currentBal < price) {
                System.out.printf("[ERROR] Insufficient wristband balance! Required: $%.2f, Current: $%.2f%n", price, currentBal);
                return;
            }
            Main.customerBalances.put(Main.activeCustomer.getId(), currentBal - price);
            System.out.printf("[SUCCESS] Paid $%.2f via Wristband. New Balance: $%.2f%n", price, currentBal - price);
        } else {
            System.out.printf("[SUCCESS] Ticket paid directly ($%.2f charged).%n", price);
        }

        Main.ticketRevenue += price;
        Main.totalRevenue += price;
        int pointsAdded = (int) (price / 10);
        Main.activeCustomer.addLoyaltyPoints(pointsAdded);
        System.out.println("[SUCCESS] Ticket issued: " + ticketName + " for " + Main.activeCustomer.getName());
        System.out.println("Added loyalty points: +" + pointsAdded);
    }

    private static void topupWristband(Scanner scanner) {
        System.out.println("\n--- Top-Up Wristband ---");
        System.out.print("Enter Top-Up Amount ($): ");
        String amtStr = scanner.nextLine().trim();
        if (amtStr.isEmpty()) {
            System.out.println("[ERROR] Please enter a top-up amount!");
            return;
        }

        try {
            double amt = Double.parseDouble(amtStr);
            if (amt <= 0) {
                System.out.println("[ERROR] Top-up amount must be greater than zero!");
                return;
            }

            double currentBal = Main.customerBalances.getOrDefault(Main.activeCustomer.getId(), 0.0);
            Main.customerBalances.put(Main.activeCustomer.getId(), currentBal + amt);
            Main.totalRevenue += amt;
            int pointsAdded = (int) (amt / 20);
            Main.activeCustomer.addLoyaltyPoints(pointsAdded);

            System.out.printf("[SUCCESS] Top-Up Successful! Added: $%.2f | New Balance: $%.2f%n", amt, currentBal + amt);
            System.out.println("Added loyalty points: +" + pointsAdded);
        } catch (NumberFormatException ex) {
            System.out.println("[ERROR] Please enter a valid monetary amount!");
        }
    }
}