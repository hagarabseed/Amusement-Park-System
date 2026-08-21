# <p align="center"><img src="parkPulse logo.jpg" alt="ParkPulse Logo" width="100" style="vertical-align:middle; margin-right:10px;"/><span style="font-size:20px; font-weight:bold;">Amusement Park Management System</span> </p>


<p align="center">
  <img src="https://img.shields.io/badge/Java-8%2B-blue?style=flat-square&logo=java" alt="Java Version"/>
  <img src="https://img.shields.io/badge/DEPI-Software%20Testing%20Track-orange?style=flat-square" alt="DEPI Track"/>
  <img src="https://img.shields.io/badge/Architecture-Modular%20MVC-green?style=flat-square" alt="Architecture"/>
  <img src="https://img.shields.io/badge/Theme-FlatLaf%20Dark-darkpurple?style=flat-square" alt="Theme"/>
</p>

**ParkPulse** (formerly Dream Park) is a comprehensive, enterprise-grade, object-oriented Java application designed to automate the daily operations of a modern amusement park. The system features a highly interactive **GUI (Graphical User Interface)** and a newly refactored, fully synchronized **modular CLI (Command Line Interface)**. 

Both interfaces share a unified business logic layer and state coordinator, tracking real-time park analytics, customer directories, ticketing point-of-sale (POS) systems, food court ordering, ride maintenance lifecycles, and staff duty rosters.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features & Architecture](#key-features--architecture)
3. [Design Patterns & OOP Principles](#design-patterns--oop-principles)
4. [File & Project Structure](#file--project-structure)
5. [Unified CLI vs GUI Parity](#unified-cli-vs-gui-parity)
6. [Getting Started](#getting-started)
7. [Team Members & Acknowledgments](#team-members--acknowledgments)

---

## Project Overview
This project marks our **first major Java project** in the **Software Testing Track** under the **Digital Egypt Pioneers Initiative (DEPI)**. It is supervised by **Dr. Mina Younan** and developed by **Team Mon**.

The primary objective of ParkPulse is to demonstrate a deep, practical understanding of Object-Oriented Programming (OOP) fundamentals, clean code principles, and scalable system design prior to advancing into automated software testing and quality assurance.

---

## Key Features & Architecture

ParkPulse implements a robust, synchronized set of operational tools available in both graphical and command-line formats:

### 1. Unified Dashboard & Live Audit Logs
* **Real-time Analytics:** Tracks live metrics including **Total Gross Revenue Today**, **Active Visitors** (dynamically estimated based on customer logs), **Operational Rides Ratio**, and **Active Staff On Duty**.
* **Audit System:** Displays a live system event logger detailing transactions, ticket issuances, and maintenance cycles.

### 2. POS & RFID Wristband Payments
* **Target Guest Switching:** Allows clerks to dynamically switch the active customer during transaction flows.
* **RFID Balance Payments:** Integrated automated checks for RFID Wristband balances during ticket sales and food court orders.
* **Insufficent Funds Safeguards:** Proactively checks wristband balances and blocks transactions with user-friendly warnings (console errors in CLI and `JOptionPane` alerts in GUI).
* **Loyalty Rewards:** Rewards customers with loyalty points automatically on checkout transactions (e.g., 1 point per $10 spent on tickets; 1 point per $15 spent on food).

### 3. Ticketing Point-of-Sale (POS)
* **Tiered Admissions:** Supports multiple ticket types:
  * **Regular Ticket:** Base admission ($50).
  * **VIP FastPass Ticket:** Premium fast-track entry ($75 base + $20 FastPass fee).
  * **Family Ticket:** Bundle admission (4 members with a 15% discount).
* **Payment Strategy Pattern:** Decouples checkout workflows from hardcoded processors to allow seamless payments via Credit Card, Vodafone Cash, or physical Cash.

### 4. Rides & Maintenance Operations
* **Dynamic Ride Creation:** Managers and administrators can dynamically register custom rides with tailored parameters (category, capacity, minimum age, height requirements).
* **Safety & Maintenance Toggles:** Allows operators to flag a ride status between `OPERATIONAL` and `IN MAINTENANCE`. Active maintenance status immediately suspends park-goer operations on that ride.

### 5. Food Court Cart Order Processing
* **Cart Compilation:** Allows customers to compile multiple items (Burger Meals, Pizza Combos, Sodas) into a single checkout cart.
* **Unified Balance Checkout:** Integrates directly with the active guest's RFID balance map, deducting funds and adding loyalty points automatically.

### 6. Staff Shift & Station Duty
* **Status Updates:** Toggles worker status between `ON DUTY` and `OFF DUTY`.
* **Station Assignments:** Assigns or reassigns staff station locations on-the-fly, instantly updating the central personnel directory.

---

## Design Patterns & OOP Principles

ParkPulse stands on a rigorous object-oriented foundation utilizing industry-standard patterns:

### Object-Oriented Principles
* **Encapsulation:** Protects sensitive fields (emails, passwords, credit card configurations, phone numbers) through private fields, strict getter/setter controls, and automatic data masking utilities.
* **Inheritance:** Implements clean hierarchical inheritance models across core park objects:
  * *Users:* `Person` (Abstract Base) $\rightarrow$ `Customer`, `Employees` $\rightarrow$ `Manager`, `Cashier`, `RideOperator`.
  * *Rides:* `Ride` (Abstract Base) $\rightarrow$ `RollarCoaster`, `HorrorRide`, `KidsRide`, `WaterRide`.
  * *Tickets:* `Ticket` (Abstract Base) $\rightarrow$ `RegularTicket`, `VIPTicket`, `FamilyTicket`.
* **Abstraction:** Core abstract contracts (`Ride`, `Ticket`, `FoodItem`) dictate strict operational rules and custom implementation contracts for all subclasses.
* **Polymorphism:** Leverages dynamic method overriding for ticket pricing calculations, custom ride startup routines, and detailed staff descriptions.

### Design Patterns
* **Strategy Pattern (`PaymentProcessor`):** Bypasses conditional hardcoding by establishing a pluggable interface for payments. Concrete behaviors (`CreditCardPayment`, `VodafoneCashPayment`, `CashPayment`) handle distinct validations and mask outputs autonomously.
* **Single Source of Truth (`AmusementPark`):** Centralizes records of active rides, foods, offers, and park users in a single manager object to prevent state fragmentation.

---

## File & Project Structure

The project has been refactored from a monolithic CLI file into a clean, modular structure mirroring the GUI panels file-for-file:

```text
com.example
│
├── Main.java                      # Central CLI Router, Global State Coordinator & Seeds
├── MainGUI.java                   # Primary GUI Application (Swing-based FlatLaf theme)
├── AmusementPark.java             # Central Data Manager (Single Source of Truth)
│
├── Consoles (CLI Modular UI Panels)
│   ├── OverviewConsole.java       # Real-time KPIs, statistics, & audit logs
│   ├── CustomerConsole.java       # Customer directories, registration, & numeric inputs
│   ├── POSConsole.java            # Ticket booking, target guest switches, & RFID wristbands
│   ├── RidesConsole.java          # Dynamic ride creator, safety controls, & maintenance toggles
│   ├── FoodCourtConsole.java      # Food cart checkouts & dynamic balance deductions
│   ├── StaffConsole.java          # Shift toggles & custom station assignments
│   └── ReportsConsole.java        # Operational text analyzer & file export utility
│
├── Interfaces
│   ├── Maintainable.java          # Maintenance lifecycle contract
│   ├── Discountable.java          # Discount calculations
│   └── PaymentProcessor.java      # Payment Strategy interface
│
├── Payment Strategies
│   ├── CreditCardPayment.java     # Credit card validation & 16-digit card masking
│   ├── VodafoneCashPayment.java   # Vodafone cash validation & telephone-backed routing
│   └── CashPayment.java           # Cash payment handler
│
├── Users & Staff Hierarchy
│   ├── Person.java (Abstract)     # Base person details with sensitive data masking
│   ├── Customer.java              # Loyalty points accumulator & visitor attributes
│   ├── Employees.java             # Base employee salary & positioning attributes
│   ├── Manager.java               # Manager role with full access attributes
│   ├── Cashier.java               # Cashier operations role
│   └── RideOperator.java          # Ride operator assigning specific ride stations
│
├── Rides Hierarchy
│   ├── Ride.java (Abstract)       # Base safety bounds & maintenance schedules
│   ├── RollarCoaster.java         # Roller coaster speed, height, and loop requirements
│   ├── HorrorRide.java            # Age guidelines and scare factor attributes
│   ├── KidsRide.java              # Soft boundaries and height safeties
│   └── WaterRide.java             # Splashing intensity and flume configurations
│
├── Ticketing & Booking
│   ├── Ticket.java (Abstract)     # Base pricing calculations
│   ├── RegularTicket.java         # Base admission rate handler
│   ├── VIPTicket.java             # VIP admission including FastPass add-on
│   ├── FamilyTicket.java          # Bulk group bundle discounts
│   ├── Booking.java               # Historical booking aggregations
│   └── Payment.java               # Process controller integrating payment strategies
│
├── Food Court & Offers
│   ├── FoodItem.java (Abstract)   # Base food cost models
│   ├── Food.java                  # Fast food configurations
│   ├── Drink.java                 # Drink size and serving configurations
│   └── Offer.java                 # Promotion and package deal specifications
│
└── Presentation Views             # Tabular terminal formatters
    ├── UserView.java              # Columns rendering & masking utility for registered users
    └── RideView.java              # Columns rendering for ride statistics & safe requirements
```

---

## Unified CLI vs GUI Parity

The newly updated CLI completely mirrors the visual and functional sections of the GUI:

| GUI Panel / Component | CLI Equivalent Console | Shared State & Features |
| :--- | :--- | :--- |
| **Overview Dashboard Tab** | `OverviewConsole.java` | Real-time revenues, operational ratios, active staff, & mock live audit logs. |
| **Customer Management Tab** | `CustomerConsole.java` | Masked data rendering, new customer creation, numeric validations, & empty-field safety checks. |
| **POS & Wristband Tab** | `POSConsole.java` | Switching active targets, top-ups, ticketing, & RFID balance deductions. |
| **Rides & Maintenance Tab** | `RidesConsole.java` | Dynamic ride creations, index listings, & active safety overrides. |
| **Food Court POS Tab** | `FoodCourtConsole.java` | Menu browsing, active customer switching, order cart compilation, & RFID checkout syncs. |
| **Staff Management Tab** | `StaffConsole.java` | Shift status overrides (`ON DUTY` / `OFF DUTY`) & live station re-allocations. |
| **Reports & Analytics Tab** | `ReportsConsole.java` | Text-based reports & local `.txt` exports (`DreamPark_Financial_Report.txt`). |

---

## Getting Started

### Prerequisites
* **Java Development Kit (JDK):** Version 8 or higher.
* **IDE:** IntelliJ IDEA, Eclipse, NetBeans, or VS Code.
* **GUI Look and Feel Dependecy:** FlatLaf theme (optional for CLI; required for GUI compiling).

### Installation & Execution

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/hagarabseed/Amusement-Park-System.git
   cd amusement-park-management
   ```

2. **Compile all source files:**
   ```bash
   javac -d bin src/com/example/*.java
   ```

3. **Run the Refactored CLI Application:**
   ```bash
   java -cp bin com.example.Main
   ```

4. **Run the GUI Application:**
   ```bash
   # Add FlatLaf library if compilation requires
   java -cp "bin;lib/*" com.example.MainGUI
   ```

---

## Team Members & Acknowledgments

### Developed by **Team Mon** (DEPI / Software Testing Track):
* **Hagar Mahmoud**
* **Menna Habib**
* **Sarah Yusuf**
* **Yara Rabie**

We express our sincere appreciation to our mentor, **Dr. Mina Younan**, for his outstanding supervision, expert feedback, and continuous support throughout the Software Testing Track, and to the **Digital Egypt Pioneers Initiative (DEPI)** for providing this intensive development and QA training path.
