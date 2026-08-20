package com.example;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Main {
    // Centralized Data Model matching MainGUI's global variables
    static y_AmusementPark park;
    static m_Customer activeCustomer;
    static Map<Integer, Double> customerBalances = new HashMap<>(); // tracking RFID Wristband balances
    static double totalRevenue = 1450.00;
    static double foodRevenue = 350.00;
    static double ticketRevenue = 1100.00;

    public static void main(String[] args) {
        initData();
        Scanner scanner = new Scanner(System.in);
        boolean exit = false;

        while (!exit) {
            System.out.println("\n========================================================================");
            System.out.println("             🎡 Amusement Park Management System (Dream Park)           ");
            System.out.println("========================================================================");
            System.out.println("1. Overview Dashboard");
            System.out.println("2. Customer Management");
            System.out.println("3. POS & Wristband");
            System.out.println("4. Rides Console");
            System.out.println("5. Food Court POS");
            System.out.println("6. Staff Management");
            System.out.println("7. Reports & Analytics");
            System.out.println("8. Exit System");
            System.out.print("Choose an option (1-8): ");

            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input! Please enter a number between 1 and 8.");
                scanner.next();
                continue;
            }
            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    h_OverviewConsole.display();
                    break;
                case 2:
                    h_CustomerConsole.display(scanner);
                    break;
                case 3:
                    h_POSConsole.display(scanner);
                    break;
                case 4:
                    h_RidesConsole.display(scanner);
                    break;
                case 5:
                    h_FoodCourtConsole.display(scanner);
                    break;
                case 6:
                    StaffConsole.display(scanner);
                    break;
                case 7:
                    h_ReportsConsole.display(scanner);
                    break;
                case 8:
                    exit = true;
                    System.out.println("Exiting System... Thank you!");
                    break;
                default:
                    System.out.println("Invalid choice! Please enter a number between 1 and 8.");
            }
        }
        scanner.close();
    }

    private static void initData() {
        park = new y_AmusementPark("Dream Park");
        
        // Food & Drinks
        park.addFoodItem(new y_Food(1, "Burger Meal", 150, "Fast Food"));
        park.addFoodItem(new y_Food(2, "Pizza Combo", 200, "Italian"));
        park.addFoodItem(new y_Drink(3, "Fresh Soda", 50, "Large"));
        
        // Offers
        park.addOffer(new y_Offer(1, "Summer Pass", 20));
        
        // Rides
        park.addRide(new s_RollarCoaster("Thunder Coaster", 24, 14, 1.4, 5, false, true, 800.0, 3, true));
        park.addRide(new s_HorrorRide("House of Shock", 12, 16, 1.2, 2, false, true, 9, true));
        park.addRide(new s_KidsRide("Mini Carousel", 16, 3, 0.8, 1, false, true, true, true, "Merry-Go-Round"));
        park.addRide(new s_WaterRide("Splash Mountain", 20, 10, 1.1, 4, true, false, 2.5, 15.0, "Flume Ride"));
        
        // Customers & Initial Balances
        m_Customer c1 = new m_Customer(1, "Sara Mahmoud", "sara@gmail.com", "5678", "01111111111", 100);
        m_Customer c2 = new m_Customer(2, "Ahmed Ali", "ahmed.ali@gmail.com", "1234", "01000000000", 50);
        park.addUser(c1);
        park.addUser(c2);
        customerBalances.put(c1.getId(), 250.00);
        customerBalances.put(c2.getId(), 100.00);
        activeCustomer = c1;
        
        // Staff
        park.addUser(new m_RideOperator(3, "Ahmed Hassan", "ahmed@gmail.com", "1234", "01222222222", 6000.0, "Ride Operator", "Thunder Coaster"));
        park.addUser(new m_Manager(4, "Omar Ali", "omar@gmail.com", "1234", "01133333333", 10000.0, "Manager", "Full Access"));
        park.addUser(new m_Cashier(5, "Khaled Nabil", "khaled@gmail.com", "9999", "01555555555", 5000.0, "Cashier", 42));
    }
}