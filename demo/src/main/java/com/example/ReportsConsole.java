package com.example;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class ReportsConsole {
    public static void display(Scanner scanner) {
        boolean back = false;
        while (!back) {
            System.out.println("\n========================================================");
            System.out.println("                   REPORTS & ANALYTICS                  ");
            System.out.println("========================================================");
            System.out.println("1. View Financial & Operations Report");
            System.out.println("2. Export Report to File (.txt)");
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
                    System.out.println("\n" + generateReportContent());
                    break;
                case 2:
                    exportReport();
                    break;
                case 3:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        }
    }

    public static String generateReportContent() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");
        long customerCount = Main.park.getUsers().stream().filter(u -> u instanceof m_Customer).count();
        long operationalRides = Main.park.getRides().stream().filter(r -> !r.isNeedMaintenance()).count();

        StringBuilder sb = new StringBuilder();
        sb.append("=========================================================\n");
        sb.append("              FINANCIAL & OPERATIONS REPORT             \n");
        sb.append(" Generated at: ").append(dtf.format(LocalDateTime.now())).append("\n");
        sb.append("=========================================================\n");
        sb.append(String.format(" Ticket Sales Revenue : $%.2f\n", Main.ticketRevenue));
        sb.append(String.format(" Food Court Revenue   : $%.2f\n", Main.foodRevenue));
        sb.append("---------------------------------------------------------\n");
        sb.append(String.format(" TOTAL GROSS REVENUE  : $%.2f\n", Main.totalRevenue));
        sb.append("=========================================================\n\n");
        sb.append(" PARK CAPACITY ANALYTICS:\n");
        sb.append(" - Total Park Capacity : 1,000 Visitors\n");
        sb.append(" - Registered Customers: ").append(customerCount).append("\n");
        sb.append(" - Total Rides Count   : ").append(Main.park.getRides().size()).append("\n");
        sb.append(" - Operational Rides   : ").append(operationalRides).append("\n");
        return sb.toString();
    }

    private static void exportReport() {
        try {
            File file = new File("DreamPark_Financial_Report.txt");
            FileWriter writer = new FileWriter(file);
            writer.write(generateReportContent());
            writer.close();
            System.out.println("[SUCCESS] Report exported successfully to file:");
            System.out.println(file.getAbsolutePath());
        } catch (IOException ex) {
            System.out.println("[ERROR] Error writing report file: " + ex.getMessage());
        }
    }
}