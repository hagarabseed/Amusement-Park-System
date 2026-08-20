package com.example;

import java.util.Scanner;

public class RidesConsole {
    public static void display(Scanner scanner) {
        boolean back = false;
        while (!back) {
            System.out.println("\n========================================================");
            System.out.println("                     RIDES CONSOLE                      ");
            System.out.println("========================================================");
            System.out.println("1. View Park Rides Directory");
            System.out.println("2. Add New Ride");
            System.out.println("3. Toggle Ride Maintenance Status");
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
                    s_RideView.printRideTable(Main.park.getRides());
                    break;
                case 2:
                    addNewRide(scanner);
                    break;
                case 3:
                    toggleMaintenance(scanner);
                    break;
                case 4:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        }
    }

    private static void addNewRide(Scanner scanner) {
        System.out.println("\n--- Add New Amusement Ride ---");
        System.out.print("Enter Ride Name: ");
        String name = scanner.nextLine().trim();
        
        System.out.println("Select Category:");
        System.out.println("1. Roller Coaster");
        System.out.println("2. Horror / Thrill");
        System.out.println("3. Kids Ride");
        System.out.println("4. Water Ride");
        System.out.println("5. Family Ride");
        System.out.print("Choose category (1-5): ");
        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid input! Category must be a number.");
            scanner.next();
            return;
        }
        int catChoice = scanner.nextInt();
        scanner.nextLine(); // consume newline
        
        String cat;
        switch (catChoice) {
            case 1: cat = "Roller Coaster"; break;
            case 2: cat = "Horror / Thrill"; break;
            case 3: cat = "Kids Ride"; break;
            case 4: cat = "Water Ride"; break;
            case 5: cat = "Family Ride"; break;
            default: cat = "Other Ride"; break;
        }

        System.out.print("Enter Capacity: ");
        String capStr = scanner.nextLine().trim();
        System.out.print("Enter Min Age Requirement: ");
        String ageStr = scanner.nextLine().trim();
        System.out.print("Enter Min Height Requirement (m): ");
        String heightStr = scanner.nextLine().trim();

        if (name.isEmpty() || capStr.isEmpty() || ageStr.isEmpty() || heightStr.isEmpty()) {
            System.out.println("[ERROR] All fields are required! Ride creation failed.");
            return;
        }

        try {
            int cap = Integer.parseInt(capStr);
            int age = Integer.parseInt(ageStr);
            double height = Double.parseDouble(heightStr);

            if (cap <= 0 || age < 0 || height < 0) {
                System.out.println("[ERROR] Capacity, Age, and Height must be positive numbers!");
                return;
            }

            // CustomRide defined inline matching the design pattern
            s_Ride newRide = new s_Ride(name, cap, age, height, 0, false, true) {
                @Override
                public boolean needReplacement() {
                    return false;
                }

                @Override
                public void startRide() {
                    System.out.println("-> Starting the custom ride: " + getName());
                }

                @Override
                public String getRideCategory() {
                    return cat;
                }

                @Override
                public String getSpecificDetails() {
                    return "Custom Park Attraction";
                }
            };

            Main.park.addRide(newRide);
            System.out.println("[SUCCESS] New Ride [" + name + "] added successfully under category [" + cat + "]!");
        } catch (NumberFormatException ex) {
            System.out.println("[ERROR] Capacity, Age, and Height must be valid numeric values!");
        }
    }

    private static void toggleMaintenance(Scanner scanner) {
        System.out.println("\n--- Toggle Ride Maintenance Status ---");
        var rides = Main.park.getRides();
        if (rides.isEmpty()) {
            System.out.println("No rides available in the system.");
            return;
        }

        System.out.printf("%-5s | %-20s | %-12s%n", "Index", "Ride Name", "Maintenance");
        System.out.println("----------------------------------------------");
        for (int i = 0; i < rides.size(); i++) {
            s_Ride r = rides.get(i);
            System.out.printf("%-5d | %-20s | %-12s%n", i + 1, r.getName(), (r.isNeedMaintenance() ? "IN REPAIR" : "HEALTHY"));
        }
        System.out.println("----------------------------------------------");
        System.out.print("Select Ride Index to toggle status: ");
        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid selection!");
            scanner.next();
            return;
        }
        int index = scanner.nextInt();
        scanner.nextLine(); // consume newline

        if (index < 1 || index > rides.size()) {
            System.out.println("[ERROR] Invalid Ride Index!");
            return;
        }

        s_Ride r = rides.get(index - 1);
        r.setNeedMaintenance(!r.isNeedMaintenance());
        if (r.isNeedMaintenance()) {
            System.out.println("[SAFETY ALERT] Ride [" + r.getName() + "] marked as IN MAINTENANCE! Operations suspended.");
        } else {
            System.out.println("[SUCCESS] Ride [" + r.getName() + "] is clear and OPERATIONAL.");
        }
    }
}