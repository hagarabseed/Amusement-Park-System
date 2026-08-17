package com.example;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        AmusementPark park = new AmusementPark("Dream Park");

        park.addFoodItem(new Food(1, "Burger", 150, "Fast Food"));
        park.addFoodItem(new Food(2, "Pizza", 200, "Italian"));
        park.addFoodItem(new Drink(3, "v7", 50, "Large"));

        park.addOffer(new Offer(1, "Summer Discount", 20));
        park.addOffer(new Offer(2, "VIP Special", 30));

        List<Person> users = new ArrayList<>();
        Person person = new Person(1, "Menna", "menna@gmail.com", "1234", "01000000000");
        Customer customer = new Customer(2, "Sara", "sara@gmail.com", "5678", "01111111111", 100);
        RideOperator operator = new RideOperator(3, "Hagar", "hagar@gmail.com", "1234", "01222222222", 6000.0, "Ride Operator", "Roller Coaster");
        Manager manager = new Manager(4, "Yara", "yara@gmail.com", "1234", "01133333333", 10000.0, "Manager", "Full Access");
        Cashier cashier = new Cashier(5, "Anas", "anas@gmail.com", "9999", "01555555555", 5000.0, "Cashier", 42);

        users.add(person);
        users.add(customer);
        users.add(operator);
        users.add(manager);
        users.add(cashier);

        boolean exit = false;

        while (!exit) {
            System.out.println("\n========================================================================");
            System.out.println("                 Amusement Park Management System                       ");
            System.out.println("========================================================================");
            System.out.println("1. View System Users Directory");
            System.out.println("2. View Food Court Menu");
            System.out.println("3. View Special Offers");
            System.out.println("4. Calculate Food Price After Offer");
            System.out.println("5. Add Loyalty Points to Customer");
            System.out.println("6. Test User Login");
            System.out.println("7. Exit");
            System.out.print("Choose an option: ");

            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input! Please enter a number between 1 and 7.");
                scanner.next(); 
                continue;
            }

            int choice = scanner.nextInt();

            switch (choice) {
                case 1:
                    UserView.printUserTable(users);
                    break;

                case 2:
                    park.displayFoodItems();
                    break;

                case 3:
                    park.displayOffers();
                    break;

                case 4:
                    System.out.print("Enter Food Price ($): ");
                    if (!scanner.hasNextDouble()) {
                        System.out.println("Error: Invalid price entered!");
                        scanner.next();
                        break;
                    }
                    double price = scanner.nextDouble();

                    System.out.print("Enter Discount Percentage (%): ");
                    if (!scanner.hasNextDouble()) {
                        System.out.println("Error: Invalid discount entered!");
                        scanner.next();
                        break;
                    }
                    double discount = scanner.nextDouble();

                    Offer tempOffer = new Offer(0, "Custom Discount", discount);
                    double finalPrice = tempOffer.calculateDiscountedPrice(price);
                    System.out.printf("-> Original Price: $%.2f | Discounted Price: $%.2f%n", price, finalPrice);
                    break;

                case 5:
                    System.out.print("Enter points to add to " + customer.getName() + " (Current: " + customer.getLoyaltyPoints() + "): ");
                    if (!scanner.hasNextInt()) {
                        System.out.println("Error: Please enter a valid number of points!");
                        scanner.next();
                        break;
                    }
                    int points = scanner.nextInt();
                    customer.addLoyaltyPoints(points);
                    System.out.println("-> Success! New Loyalty Points Balance for " + customer.getName() + ": " + customer.getLoyaltyPoints());
                    break;

                case 6:
                    scanner.nextLine(); 
                    System.out.print("Enter Email: ");
                    String email = scanner.nextLine();
                    System.out.print("Enter Password: ");
                    String password = scanner.nextLine();

                    boolean loggedIn = false;
                    for (Person u : users) {
                        if (u.login(email, password)) {
                            System.out.println("-> Welcome back, " + u.getName() + "! Login Successful as " + u.getRole() + ".");
                            loggedIn = true;
                            break;
                        }
                    }
                    if (!loggedIn) {
                        System.out.println("-> Login Failed! Invalid Email or Password.");
                    }
                    break;

                case 7:
                    exit = true;
                    System.out.println("Exiting System... Thank you!");
                    break;

                default:
                    System.out.println("Invalid choice! Please choose an option between 1 and 7.");
            }
        }

        scanner.close();
    }
}