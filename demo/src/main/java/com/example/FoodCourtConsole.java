package com.example;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class FoodCourtConsole {
    private static List<String> cartItems = new ArrayList<>();
    private static double cartTotal = 0.0;

    public static void display(Scanner scanner) {
        boolean back = false;
        while (!back) {
            System.out.println("\n========================================================");
            System.out.println("                    FOOD COURT CONSOLE                  ");
            System.out.println("========================================================");
            System.out.printf("Customer: %s [ID: %d]%n", Main.activeCustomer.getName(), Main.activeCustomer.getId());
            System.out.printf("Current Cart Items: %d | Total: $%.2f%n", cartItems.size(), cartTotal);
            System.out.println("--------------------------------------------------------");
            System.out.println("1. View Food & Beverage Menu");
            System.out.println("2. Add Item to Order Cart");
            System.out.println("3. View Cart Details");
            System.out.println("4. Checkout Food Order");
            System.out.println("5. Select Active Customer");
            System.out.println("6. Back to Main Menu");
            System.out.print("Choose an option (1-6): ");

            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input! Please enter a number between 1 and 6.");
                scanner.next();
                continue;
            }
            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    Main.park.displayFoodItems();
                    break;
                case 2:
                    addItemToCart(scanner);
                    break;
                case 3:
                    viewCart();
                    break;
                case 4:
                    checkoutFoodOrder(scanner);
                    break;
                case 5:
                    selectCustomer(scanner);
                    break;
                case 6:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        }
    }

    private static void selectCustomer(Scanner scanner) {
        System.out.println("\n--- Select Customer ---");
        CustomerConsole.printCustomerTable();
        System.out.print("Enter Customer ID: ");
        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid ID!");
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
            System.out.println("[SUCCESS] Active customer for food order switched to: " + found.getName());
        } else {
            System.out.println("[ERROR] Customer ID not found!");
        }
    }

    private static void addItemToCart(Scanner scanner) {
        System.out.println("\n--- Add Item to Cart ---");
        System.out.println("1. Burger Meal ($150.00)");
        System.out.println("2. Pizza Combo ($200.00)");
        System.out.println("3. Fresh Soda ($50.00)");
        System.out.print("Select item index (1-3): ");

        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid choice!");
            scanner.next();
            return;
        }
        int itemChoice = scanner.nextInt();
        scanner.nextLine(); // consume newline

        String itemName;
        double itemPrice;
        if (itemChoice == 1) {
            itemName = "Burger Meal";
            itemPrice = 150.00;
        } else if (itemChoice == 2) {
            itemName = "Pizza Combo";
            itemPrice = 200.00;
        } else if (itemChoice == 3) {
            itemName = "Fresh Soda";
            itemPrice = 50.00;
        } else {
            System.out.println("[ERROR] Invalid selection!");
            return;
        }

        cartItems.add(itemName + " - $" + itemPrice);
        cartTotal += itemPrice;
        System.out.println("[SUCCESS] Added [" + itemName + " ($" + itemPrice + ")] to cart.");
    }

    private static void viewCart() {
        System.out.println("\n--- Current Order Cart ---");
        if (cartItems.isEmpty()) {
            System.out.println("Your cart is empty!");
            return;
        }
        for (String item : cartItems) {
            System.out.println(" - " + item);
        }
        System.out.println("--------------------------");
        System.out.printf("Total Cart Value: $%.2f%n", cartTotal);
    }

    private static void checkoutFoodOrder(Scanner scanner) {
        System.out.println("\n--- Checkout Food Order ---");
        if (cartTotal <= 0 || cartItems.isEmpty()) {
            System.out.println("[ERROR] Cart is empty! Add items before checkout.");
            return;
        }

        System.out.printf("Customer: %s%n", Main.activeCustomer.getName());
        System.out.printf("Total Amount: $%.2f%n", cartTotal);
        System.out.print("Pay with Wristband Balance? (y/n): ");
        String payWithWristbandStr = scanner.nextLine().trim().toLowerCase();
        boolean payWithWristband = payWithWristbandStr.equals("y") || payWithWristbandStr.equals("yes");

        if (payWithWristband) {
            double bal = Main.customerBalances.getOrDefault(Main.activeCustomer.getId(), 0.0);
            if (bal < cartTotal) {
                System.out.printf("[ERROR] Insufficient wristband balance! Required: $%.2f, Available: $%.2f%n", cartTotal, bal);
                return;
            }
            Main.customerBalances.put(Main.activeCustomer.getId(), bal - cartTotal);
            System.out.printf("[SUCCESS] Paid $%.2f via Wristband. Remaining Balance: $%.2f%n", cartTotal, bal - cartTotal);
        } else {
            System.out.printf("[SUCCESS] Paid directly ($%.2f charged).%n", cartTotal);
        }

        Main.foodRevenue += cartTotal;
        Main.totalRevenue += cartTotal;
        int pointsAdded = (int) (cartTotal / 15);
        Main.activeCustomer.addLoyaltyPoints(pointsAdded);

        System.out.println("[SUCCESS] Food order successfully processed!");
        System.out.println("Added loyalty points: +" + pointsAdded);

        // Clear Cart
        cartItems.clear();
        cartTotal = 0.0;
    }
}