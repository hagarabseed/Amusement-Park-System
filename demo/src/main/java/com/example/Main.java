package com.example;

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

        park.addRide(new RollarCoaster("Thunder Coaster", 24, 14, 1.4, 5, false, true, 120.0, 800.0, 3, true));
        park.addRide(new HorrorRide("House of Shock", 12, 16, 1.2, 2, false, true, 9, true));
        park.addRide(new KidsRide("Mini Carousel", 16, 3, 0.8, 1, false, true, true, true, "Merry-Go-Round"));
        park.addRide(new WaterRide("Splash Mountain", 20, 10, 1.1, 4, true, false, 2.5, 15.0, "Flume Ride"));

        Customer defaultCustomer = new Customer(2, "Sara", "sara@gmail.com", "5678", "01111111111", 100);
        park.addUser(new Person(1, "Menna", "menna@gmail.com", "1234", "01000000000"));
        park.addUser(defaultCustomer);
        park.addUser(new RideOperator(3, "Ahmed", "ahmed@gmail.com", "1234", "01222222222", 6000.0, "Ride Operator", "Thunder Coaster"));
        park.addUser(new Manager(4, "Omar", "omar@gmail.com", "1234", "01133333333", 10000.0, "Manager", "Full Access"));
        park.addUser(new Cashier(5, "Khaled", "khaled@gmail.com", "9999", "01555555555", 5000.0, "Cashier", 42));

        Booking activeBooking = null;
        int bookingCounter = 100;
        int paymentCounter = 500;

        boolean exit = false;

        while (!exit) {
            System.out.println("\n========================================================================");
            System.out.println("                 Amusement Park Management System                       ");
            System.out.println("========================================================================");
            System.out.println("1. View System Users Directory");
            System.out.println("2. View Park Rides Directory");
            System.out.println("3. View Food Court Menu & Offers");
            System.out.println("4. Create New Ticket Booking");
            System.out.println("5. View Current Booking Summary");
            System.out.println("6. Checkout & Process Payment");
            System.out.println("7. Test User Login");
            System.out.println("8. Exit");
            System.out.print("Choose an option (1-8): ");

            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input! Please enter a number between 1 and 8.");
                scanner.next();
                continue;
            }

            int choice = scanner.nextInt();

            switch (choice) {
                case 1:
                    UserView.printUserTable(park.getUsers());
                    break;

                case 2:
                    RideView.printRideTable(park.getRides());
                    break;

                case 3:
                    park.displayFoodItems();
                    park.displayOffers();
                    break;

                case 4:
                    System.out.println("\n--- Creating New Booking for " + defaultCustomer.getName() + " ---");
                    int tChoice = -1;

                    while (true) {
                        System.out.println("1. Regular Ticket ($50)");
                        System.out.println("2. VIP Ticket ($75 base + $20 FastPass)");
                        System.out.println("3. Family Ticket (4 Members - 15% discount)");
                        System.out.print("Select ticket type to add (1-3): ");

                        if (scanner.hasNextInt()) {
                            tChoice = scanner.nextInt();
                            if (tChoice >= 1 && tChoice <= 3) break;
                        } else {
                            scanner.next();
                        }
                        System.out.println("Invalid ticket selection! Please try again.\n");
                    }

                    bookingCounter++;
                    activeBooking = new Booking(bookingCounter, defaultCustomer);

                    if (tChoice == 1) activeBooking.addTicket(new RegularTicket(101, 50.0));
                    else if (tChoice == 2) activeBooking.addTicket(new VIPTicket(102, 50.0, true));
                    else if (tChoice == 3) activeBooking.addTicket(new FamilyTicket(103, 50.0, 4));

                    System.out.println("-> Ticket added successfully to Booking #" + activeBooking.getBookingId());
                    break;

                case 5:
                    if (activeBooking == null) System.out.println("-> No active booking found! Create one first (Option 4).");
                    else activeBooking.displayBookingSummary();
                    break;

                case 6:
                    if (activeBooking == null || activeBooking.getTickets().isEmpty()) {
                        System.out.println("-> Cannot process payment: No active booking found or empty tickets.");
                        break;
                    }
                    if (activeBooking.isPaid()) {
                        System.out.println("-> This booking is already paid!");
                        break;
                    }

                    scanner.nextLine();
                    PaymentProcessor processor = null;

                    while (true) {
                        System.out.println("\nAvailable Payment Methods: [1] Credit Card  |  [2] Cash  |  [3] Vodafone Cash");
                        System.out.print("Enter Payment Method (1-3): ");
                        String input = scanner.nextLine().trim();

                        if (input.equals("1") || input.equalsIgnoreCase("Credit Card")) {
                            System.out.print("Enter Card Number: ");
                            String cardNum = scanner.nextLine().trim();
                            processor = new CreditCardPayment(cardNum);
                            break;
                        } else if (input.equals("2") || input.equalsIgnoreCase("Cash")) {
                            processor = new CashPayment();
                            break;
                        } else if (input.equals("3") || input.equalsIgnoreCase("Vodafone Cash")) {
                            System.out.print("Enter Vodafone Cash Phone Number: ");
                            String phoneNum = scanner.nextLine().trim();
                            processor = new VodafoneCashPayment(phoneNum);
                            break;
                        } else {
                            System.out.println("Invalid Payment Method! Please enter numbers (1-3) or valid names. Try again.");
                        }
                    }

                    paymentCounter++;
                    Payment payment = new Payment(paymentCounter, activeBooking, processor);
                    if (payment.processPayment()) {
                        payment.printReceipt();
                    }
                    break;

                case 7:
                    boolean loggedIn = false;

                    while (!loggedIn) {
                        scanner.nextLine();
                        System.out.print("Enter Email: ");
                        String email = scanner.nextLine().trim();
                        System.out.print("Enter Password: ");
                        String password = scanner.nextLine().trim();

                        for (Person u : park.getUsers()) {
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
}