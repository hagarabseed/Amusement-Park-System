package com.example;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class StaffConsole {
    private static Map<Integer, String> shiftStatus = new HashMap<>();
    private static Map<Integer, String> stations = new HashMap<>();

    static {
        // Initialize default stations and shift status for employees
        shiftStatus.put(3, "ON DUTY"); // RideOperator
        shiftStatus.put(4, "ON DUTY"); // Manager
        shiftStatus.put(5, "ON DUTY"); // Cashier
        
        stations.put(3, "Thunder Coaster");
        stations.put(4, "Main Park Console");
        stations.put(5, "Main Park Console");
    }

    public static void display(Scanner scanner) {
        boolean back = false;
        while (!back) {
            System.out.println("\n========================================================");
            System.out.println("                     STAFF CONSOLE                      ");
            System.out.println("========================================================");
            System.out.println("1. View Staff Duty Directory");
            System.out.println("2. Toggle Shift Duty Status");
            System.out.println("3. Assign/Update Station");
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
                    printStaffTable();
                    break;
                case 2:
                    toggleShiftDuty(scanner);
                    break;
                case 3:
                    assignStation(scanner);
                    break;
                case 4:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        }
    }

    public static void printStaffTable() {
        System.out.println("\n============================= Park Staff & Operations Duty =============================");
        System.out.printf("%-5s | %-18s | %-15s | %-20s | %-12s%n", "ID", "Staff Name", "Role", "Assigned Station", "Shift Status");
        System.out.println("----------------------------------------------------------------------------------------");
        for (m_Person p : Main.park.getUsers()) {
            if (!(p instanceof m_Customer)) {
                int id = p.getId();
                String status = shiftStatus.computeIfAbsent(id, k -> "ON DUTY");
                String station = stations.computeIfAbsent(id, k -> "Main Park Console");
                System.out.printf("%-5d | %-18s | %-15s | %-20s | %-12s%n",
                    id, p.getName(), p.getRole(), station, status);
            }
        }
        System.out.println("----------------------------------------------------------------------------------------");
    }

    private static void toggleShiftDuty(Scanner scanner) {
        System.out.println("\n--- Toggle Shift Duty Status ---");
        printStaffTable();
        System.out.print("Enter Staff ID to toggle shift status: ");
        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid Staff ID!");
            scanner.next();
            return;
        }
        int id = scanner.nextInt();
        scanner.nextLine(); // consume newline

        boolean found = false;
        for (m_Person p : Main.park.getUsers()) {
            if (!(p instanceof m_Customer) && p.getId() == id) {
                found = true;
                String current = shiftStatus.computeIfAbsent(id, k -> "ON DUTY");
                String newStatus = current.equals("ON DUTY") ? "OFF DUTY" : "ON DUTY";
                shiftStatus.put(id, newStatus);
                System.out.println("[SUCCESS] Shift status for [" + p.getName() + "] updated to: " + newStatus);
                break;
            }
        }

        if (!found) {
            System.out.println("[ERROR] Staff ID not found!");
        }
    }

    private static void assignStation(Scanner scanner) {
        System.out.println("\n--- Assign Station ---");
        printStaffTable();
        System.out.print("Enter Staff ID to assign station: ");
        if (!scanner.hasNextInt()) {
            System.out.println("[ERROR] Invalid Staff ID!");
            scanner.next();
            return;
        }
        int id = scanner.nextInt();
        scanner.nextLine(); // consume newline

        boolean found = false;
        for (m_Person p : Main.park.getUsers()) {
            if (!(p instanceof m_Customer) && p.getId() == id) {
                found = true;
                System.out.print("Enter new assigned station: ");
                String newStation = scanner.nextLine().trim();
                if (newStation.isEmpty()) {
                    System.out.println("[ERROR] Assigned station cannot be empty!");
                    return;
                }
                stations.put(id, newStation);
                System.out.println("[SUCCESS] Assigned station for [" + p.getName() + "] updated to: " + newStation);
                break;
            }
        }

        if (!found) {
            System.out.println("[ERROR] Staff ID not found!");
        }
    }
}