# Amusement Park Management System (Dream Park)

[![Java Version](https://img.shields.io/badge/Java-8%2B-orange.svg)](https://www.oracle.com/java/)
[![Track](https://img.shields.io/badge/Track-Software%20Testing-blue.svg)](#)
[![DEPI](https://img.shields.io/badge/Initiative-DEPI%20Egypt-green.svg)](#)

A comprehensive, object-oriented Java Console Application designed to automate the daily operations of an amusement park. The system handles user management, ride maintenance tracking, ticketing, food court ordering, and flexible payment processing using advanced OOP principles and Design Patterns.

---

## Project Overview

This project marks our **first Java project** in the **Software Testing Track** under the **Digital Egypt Pioneers Initiative (DEPI)**. 

It aims to demonstrate a solid understanding of Object-Oriented Programming (OOP) fundamentals, clean code principles, and scalable system design prior to advancing into automated software testing.

* **Supervised by:** **Dr.Mina Younan**
* **Developed by:** **Team Mon**

### Team Members 
- **Hagar Mahmoud** 
- **Menna Habib** 
- **Sara Yusuf** 
- **Yara Rabie**

---

## Key Features & Architecture

### 1. Object-Oriented Principles (OOP)
* **Encapsulation:** All model properties are private with strictly controlled getters, setters, and sensitive data masking (Emails, Card Numbers, Phone Numbers).
* **Inheritance:** Hierarchical structure for Users (`Person` → `Customer`, `Employees`), Rides (`Ride` → `RollarCoaster`, `HorrorRide`, etc.), and Tickets (`Ticket` → `RegularTicket`, `VIPTicket`, `FamilyTicket`).
* **Abstraction:** Abstract base classes (`Ride`, `Ticket`, `FoodItem`) defining core contracts for derived classes.
* **Polymorphism:** Dynamic behavior execution for ticket pricing, ride replacements, and custom role descriptions.

### 2. Core Interfaces
* **`PaymentProcessor`:** Decouples payment behavior from the `Payment` class using the **Strategy Design Pattern**.
* **`Maintainable`:** Enforces maintenance check and execution capabilities across rides and assets.
* **`Discountable`:** Shared interface across `Ticket` and `FoodItem` hierarchies to calculate custom percentage discounts.

### 3. Payment Strategy Options
The system supports multiple payment methods seamlessly:
* **Credit Card Payment** (with automatic 16-digit card masking for privacy)
* **Vodafone Cash Payment** (phone-number-backed transaction)
* **Cash Payment**

### 4. Interactive CLI Management
* System Directory Views for Users & Rides formatted in clean tabular structures.
* Complete Booking Workflow: Select customer → Add tickets → Calculate total → Process Payment → Issue Official Receipt.
* Loyalty Points system rewarding customers on successful payments.
* Robust Input Buffer & Validation Handling for CLI user inputs.

---

## Project Structure

```text
com.example
│
├── Main.java                  # CLI Menu and Application Loop
├── AmusementPark.java         # Central Data Manager (Single Source of Truth)
│
├── Interfaces
│   ├── Maintainable.java         # Maintenance lifecycle contract
│   ├── Discountable.java         # Discount calculation contract
│   └── PaymentProcessor.java     # Payment strategy interface
│
├── Payment Strategies
│   ├── CreditCardPayment.java    # Credit card implementation
│   ├── VodafoneCashPayment.java  # Vodafone Cash implementation
│   └── CashPayment.java          # Cash payment implementation
│
├── Users & Staff Hierarchy
│   ├── Person.java (Abstract)
│   ├── Customer.java
│   ├── Employees.java
│   ├── Manager.java
│   ├── Cashier.java
│   └── RideOperator.java
│
├── Rides Hierarchy
│   ├── Ride.java (Abstract)
│   ├── RollarCoaster.java
│   ├── HorrorRide.java
│   ├── KidsRide.java
│   └── WaterRide.java
│
├── Ticketing & Booking
│   ├── Ticket.java (Abstract)
│   ├── RegularTicket.java
│   ├── VIPTicket.java
│   ├── FamilyTicket.java
│   ├── Booking.java
│   └── Payment.java
│
├── Food Court & Offers
│   ├── FoodItem.java (Abstract)
│   ├── Food.java
│   ├── Drink.java
│   └── Offer.java
│
└── Presentation Views
    ├── UserView.java             # Tabular User directory rendering & masking
    └── RideView.java             # Tabular Ride directory rendering

Getting Started

Prerequisites:
- Java Development Kit (JDK): Version 8 or higher installed.
- IDE: IntelliJ IDEA, Eclipse, NetBeans, or VS Code.

Installation & Execution

Clone the Repository:
(Bash)
git clone https://github.com/hagarabseed/Amusement-Park-System.git
cd amusement-park-management

Compile the Project:
(Bash)
javac -d bin src/com/example/*.java

Run the Application:
(Bash)
java -cp bin com.example.Main


->Acknowledgments
    Special thanks to Dr.Mina for his guidance and continuous support throughout the Software Testing Track, and to the Digital Egypt Pioneers Initiative (DEPI) for providing this learning opportunity.