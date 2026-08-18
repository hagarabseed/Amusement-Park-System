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
        park.addFoodItem(new Drink(3, "Cola", 50, "Large"));

        park.addOffer(new Offer(1, "Summer Discount", 20));
        park.addOffer(new Offer(2, "VIP Special", 30));

        List<Person> users = new ArrayList<>();
        Customer customer = new Customer(2, "Sara", "sara@gmail.com", "5678", "01111111111", 100);
        users.add(new Person(1, "Menna", "menna@gmail.com", "1234", "01000000000"));
        users.add(customer);
        users.add(new RideOperator(3, "Ahmed", "ahmed@gmail.com", "1234", "01222222222", 6000.0, "Ride Operator", "Roller Coaster"));
        users.add(new Manager(4, "Omar", "omar@gmail.com", "1234", "01133333333", 10000.0, "Manager", "Full Access"));
        users.add(new Cashier(5, "Khaled", "khaled@gmail.com", "9999", "01555555555", 5000.0, "Cashier", 42));

        Booking activeBooking = null;
        int bookingCounter = 100;
        int paymentCounter = 500;

        boolean exit = false;

        while (!exit) {
            System.out.println("\n========================================================================");
            System.out.println("                 Amusement Park Management System                       ");
            System.out.println("========================================================================");
            System.out.println("1. View System Users Directory");
            System.out.println("2. View Food Court Menu & Offers");
            System.out.println("3. Create New Ticket Booking");
            System.out.println("4. View Current Booking Summary");
            System.out.println("5. Checkout & Process Payment");
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
                    park.displayOffers();
                    break;

                case 3:
                    System.out.println("\n--- Creating New Booking for " + customer.getName() + " ---");
                    int tChoice = -1;

                    while (true) {
                        System.out.println("1. Regular Ticket ($50)");
                        System.out.println("2. VIP Ticket ($75 base + $20 FastPass)");
                        System.out.println("3. Family Ticket (4 Members - 15% discount)");
                        System.out.print("Select ticket type to add (1-3): ");

                        if (scanner.hasNextInt()) {
                            tChoice = scanner.nextInt();
                            if (tChoice >= 1 && tChoice <= 3) {
                                break; 
                            }
                        } else {
                            scanner.next(); 
                        }
                        System.out.println("Invalid ticket selection! Please try again.\n");
                    }

                    bookingCounter++;
                    activeBooking = new Booking(bookingCounter, customer);

                    if (tChoice == 1) {
                        activeBooking.addTicket(new RegularTicket(101, 50.0));
                    } else if (tChoice == 2) {
                        activeBooking.addTicket(new VIPTicket(102, 50.0, true));
                    } else if (tChoice == 3) {
                        activeBooking.addTicket(new FamilyTicket(103, 50.0, 4));
                    }
                    
                    System.out.println("-> Ticket added successfully to Booking #" + activeBooking.getBookingId());
                    break;

                case 4:
                    if (activeBooking == null) {
                        System.out.println("-> No active booking found! Please create a booking first (Option 3).");
                    } else {
                        activeBooking.displayBookingSummary();
                    }
                    break;

                case 5:
                    if (activeBooking == null || activeBooking.getTickets().isEmpty()) {
                        System.out.println("-> Cannot process payment: No active booking found or empty tickets.");
                        break;
                    }
                    if (activeBooking.isPaid()) {
                        System.out.println("-> This booking is already paid!");
                        break;
                    }

                    scanner.nextLine(); 
                    String method = "";

                    while (true) {
                        System.out.println("\nAvailable Payment Methods: [1] Credit Card  |  [2] Cash  |  [3] Vodafone Cash");
                        System.out.print("Enter Payment Method (Name or Number 1-3): ");
                        String input = scanner.nextLine().trim();

                        if (input.equalsIgnoreCase("Credit Card") || input.equals("1")) {
                            method = "Credit Card";
                            break;
                        } else if (input.equalsIgnoreCase("Cash") || input.equals("2")) {
                            method = "Cash";
                            break;
                        } else if (input.equalsIgnoreCase("Vodafone Cash") || input.equalsIgnoreCase("Vodafone") || input.equals("3")) {
                            method = "Vodafone Cash";
                            break;
                        } else {
                            System.out.println("Invalid Payment Method! Please choose from (Credit Card, Cash, Vodafone Cash) or enter numbers (1-3). Try again.");
                        }
                    }

                    paymentCounter++;
                    Payment payment = new Payment(paymentCounter, activeBooking, method);
                    if (payment.processPayment()) {
                        payment.printReceipt();
                    }
                    break;

                case 6:
                    boolean loggedIn = false;

                    while (!loggedIn) {
                        scanner.nextLine(); // clear buffer
                        System.out.print("Enter Email: ");
                        String email = scanner.nextLine().trim();
                        System.out.print("Enter Password: ");
                        String password = scanner.nextLine().trim();

                        for (Person u : users) {
                            if (u.login(email, password)) {
                                System.out.println("-> Welcome back, " + u.getName() + "! Login Successful as " + u.getRole() + ".");
                                loggedIn = true;
                                break;
                            }
                        }

                        if (!loggedIn) {
                            System.out.println("-> Login Failed! Invalid Email or Password. Please try again.\n");
                        }
                    }
                    break;

                case 7:
                    exit = true;
                    System.out.println("Exiting System... Thank you!");
                    break;

                default:
                    System.out.println("Invalid choice! Please enter a number between 1 and 7.");
            }
        }

        scanner.close();
    }
}