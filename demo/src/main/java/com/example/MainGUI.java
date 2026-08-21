package com.example;

import com.formdev.flatlaf.FlatDarkLaf;

import javax.swing.*;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import javax.swing.table.TableRowSorter;
import java.awt.*;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MainGUI extends JFrame {

    private y_AmusementPark park;
    private m_Customer activeCustomer;
    private Map<Integer, Double> customerBalances = new HashMap<>(); // tracking RFID Wristband balances

    private double totalRevenue = 1450.00;
    private double foodRevenue = 350.00;
    private double ticketRevenue = 1100.00;
    private List<String> cartItems = new ArrayList<>();
    private double cartTotal = 0.0;

    // GUI Components
    private CardLayout cardLayout;
    private JPanel mainContentPanel;
    private JLabel statusLabel;

    // Table Models & Sorters
    private DefaultTableModel ridesTableModel;
    private TableRowSorter<DefaultTableModel> ridesSorter;

    private DefaultTableModel staffTableModel;
    private TableRowSorter<DefaultTableModel> staffSorter;

    private DefaultTableModel customerTableModel;
    private TableRowSorter<DefaultTableModel> customerSorter;

    private DefaultListModel<String> cartListModel;
    private JLabel lblCartTotal;

    // Active Customer Selectors
    private JComboBox<CustomerWrapper> posCustomerCombo;
    private JComboBox<CustomerWrapper> foodCustomerCombo;

    public MainGUI() {
        setupTheme();
        initData();
        setupFrame();
    }

    // Custom class to display customers neatly in JComboBox
    private static class CustomerWrapper {
        private m_Customer customer;
        public CustomerWrapper(m_Customer c) { this.customer = c; }
        public m_Customer getCustomer() { return customer; }
        @Override
        public String toString() {
            return customer.getId() + " - " + customer.getName() + " (" + customer.getPhone() + ")";
        }
    }

    // Concrete Ride implementation for dynamically created rides
    private static class CustomRide extends s_Ride {
        private String category;
        public CustomRide(String name, int capacity, int ageReq, double heightReq, int years, boolean needMaint, boolean avail, String category) {
            super(name, capacity, ageReq, heightReq, years, needMaint, avail);
            this.category = category;
        }
        @Override public boolean needReplacement() { return false; }
        @Override public void startRide() {}
        @Override public String getRideCategory() { return category; }
        @Override public String getSpecificDetails() { return "Custom Park Attraction"; }
    }

    private void setupTheme() {
        try {
            UIManager.setLookAndFeel(new FlatDarkLaf());
            UIManager.put("Button.arc", 12);
            UIManager.put("Component.arc", 12);
            UIManager.put("ProgressBar.arc", 12);
            UIManager.put("TextComponent.arc", 10);
            UIManager.put("Table.alternateRowColor", new Color(36, 40, 52));
        } catch (Exception ex) {
            System.err.println("Failed to initialize FlatLaf theme.");
        }
    }

    private void triggerErrorAlert(String message, String title) {
        Toolkit.getDefaultToolkit().beep();
        JOptionPane.showMessageDialog(this, message, title, JOptionPane.ERROR_MESSAGE);
    }

    private void triggerSuccessAlert(String message, String title) {
        JOptionPane.showMessageDialog(this, message, title, JOptionPane.INFORMATION_MESSAGE);
    }

    private void initData() {
        park = new y_AmusementPark("ParkPulse");

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

    private void setupFrame() {
        setTitle("🎢 ParkPulse Management System");
        setSize(1280, 780);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Sidebar Navigation
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBackground(new Color(22, 26, 34));
        sidebar.setPreferredSize(new Dimension(250, 0));
        sidebar.setBorder(BorderFactory.createEmptyBorder(20, 15, 20, 15));

        JLabel logoLabel = new JLabel("ParkPulse", SwingConstants.CENTER);
        logoLabel.setFont(new Font("SansSerif", Font.BOLD, 22));
        logoLabel.setForeground(new Color(0, 191, 255));
        logoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel subLogo = new JLabel("Management System", SwingConstants.CENTER);
        subLogo.setFont(new Font("SansSerif", Font.PLAIN, 12));
        subLogo.setForeground(new Color(140, 150, 165));
        subLogo.setAlignmentX(Component.CENTER_ALIGNMENT);

        sidebar.add(logoLabel);
        sidebar.add(subLogo);
        sidebar.add(Box.createRigidArea(new Dimension(0, 20)));

        JButton btnOverview = createSidebarButton("📊   Overview Dashboard");
        JButton btnCustomers = createSidebarButton("👤   Customer Management");
        JButton btnPOS = createSidebarButton("🎟️   POS & Wristband");
        JButton btnRides = createSidebarButton("🎢   Rides & Maintenance");
        JButton btnFoodPOS = createSidebarButton("🍔   Food Court POS");
        JButton btnStaff = createSidebarButton("👥   Staff Management");
        JButton btnReports = createSidebarButton("📋   Reports & Analytics");
        JButton btnExit = createSidebarButton("❌   Exit System");

        sidebar.add(btnOverview); sidebar.add(Box.createRigidArea(new Dimension(0, 6)));
        sidebar.add(btnCustomers); sidebar.add(Box.createRigidArea(new Dimension(0, 6)));
        sidebar.add(btnPOS); sidebar.add(Box.createRigidArea(new Dimension(0, 6)));
        sidebar.add(btnRides); sidebar.add(Box.createRigidArea(new Dimension(0, 6)));
        sidebar.add(btnFoodPOS); sidebar.add(Box.createRigidArea(new Dimension(0, 6)));
        sidebar.add(btnStaff); sidebar.add(Box.createRigidArea(new Dimension(0, 6)));
        sidebar.add(btnReports);
        sidebar.add(Box.createVerticalGlue());
        sidebar.add(btnExit);

        // Main Content Area
        cardLayout = new CardLayout();
        mainContentPanel = new JPanel(cardLayout);
        mainContentPanel.setBackground(new Color(28, 32, 42));

        posCustomerCombo = new JComboBox<>();
        foodCustomerCombo = new JComboBox<>();
        refreshCustomerComboBoxes();

        mainContentPanel.add(createOverviewPanel(), "OVERVIEW");
        mainContentPanel.add(createCustomerPanel(), "CUSTOMERS");
        mainContentPanel.add(createTicketingPOSPanel(), "POS");
        mainContentPanel.add(createRidesConsolePanel(), "RIDES");
        mainContentPanel.add(createFoodPOSPanel(), "FOOD_POS");
        mainContentPanel.add(createStaffPanel(), "STAFF");
        mainContentPanel.add(createReportsPanel(), "REPORTS");

        btnOverview.addActionListener(e -> {
            mainContentPanel.add(createOverviewPanel(), "OVERVIEW");
            cardLayout.show(mainContentPanel, "OVERVIEW");
        });
        btnCustomers.addActionListener(e -> cardLayout.show(mainContentPanel, "CUSTOMERS"));
        btnPOS.addActionListener(e -> cardLayout.show(mainContentPanel, "POS"));
        btnRides.addActionListener(e -> cardLayout.show(mainContentPanel, "RIDES"));
        btnFoodPOS.addActionListener(e -> cardLayout.show(mainContentPanel, "FOOD_POS"));
        btnStaff.addActionListener(e -> cardLayout.show(mainContentPanel, "STAFF"));
        btnReports.addActionListener(e -> {
            mainContentPanel.add(createReportsPanel(), "REPORTS");
            cardLayout.show(mainContentPanel, "REPORTS");
        });
        btnExit.addActionListener(e -> System.exit(0));

        updateStatusBar();

        JPanel statusBarPanel = new JPanel(new BorderLayout());
        statusBarPanel.setBackground(new Color(18, 20, 26));
        statusBarPanel.setPreferredSize(new Dimension(0, 28));
        statusBarPanel.add(statusLabel, BorderLayout.WEST);

        add(sidebar, BorderLayout.WEST);
        add(mainContentPanel, BorderLayout.CENTER);
        add(statusBarPanel, BorderLayout.SOUTH);
    }

    private void updateStatusBar() {
        if (statusLabel == null) {
            statusLabel = new JLabel();
            statusLabel.setForeground(new Color(180, 190, 205));
            statusLabel.setFont(new Font("SansSerif", Font.BOLD, 12));
        }
        double activeBal = customerBalances.getOrDefault(activeCustomer.getId(), 0.0);
        statusLabel.setText(String.format("  System Operational | Active Customer: %s | Balance: $%.2f | Points: %d | Total Rev: $%.2f",
                activeCustomer.getName(), activeBal, activeCustomer.getLoyaltyPoints(), totalRevenue));
    }

    private JButton createSidebarButton(String text) {
        JButton button = new JButton(text);
        button.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        button.setAlignmentX(Component.CENTER_ALIGNMENT);
        button.setFont(new Font("SansSerif", Font.BOLD, 13));
        button.setForeground(new Color(220, 225, 235));
        button.setBackground(new Color(32, 38, 50));
        button.setHorizontalAlignment(SwingConstants.LEFT);
        button.setFocusPainted(false);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));
        button.setBorder(BorderFactory.createEmptyBorder(0, 15, 0, 0));
        return button;
    }

    private JPanel createStatCard(String title, String value, Color color) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(color);
        card.setBorder(BorderFactory.createEmptyBorder(15, 18, 15, 18));

        JLabel lblTitle = new JLabel(title);
        lblTitle.setFont(new Font("SansSerif", Font.BOLD, 13));
        lblTitle.setForeground(Color.WHITE);

        JLabel lblValue = new JLabel(value);
        lblValue.setFont(new Font("SansSerif", Font.BOLD, 26));
        lblValue.setForeground(Color.WHITE);

        card.add(lblTitle, BorderLayout.NORTH);
        card.add(lblValue, BorderLayout.CENTER);
        return card;
    }

    private void styleTable(JTable table) {
        table.setRowHeight(38);
        table.setFont(new Font("SansSerif", Font.PLAIN, 13));
        table.setBackground(new Color(28, 32, 42));
        table.setForeground(new Color(230, 235, 245));
        table.setGridColor(new Color(45, 52, 66));
        table.setShowVerticalLines(false);

        JTableHeader header = table.getTableHeader();
        header.setFont(new Font("SansSerif", Font.BOLD, 13));
        header.setBackground(new Color(40, 47, 60));
        header.setForeground(new Color(0, 191, 255));
        header.setPreferredSize(new Dimension(0, 38));

        DefaultTableCellRenderer centerRenderer = new DefaultTableCellRenderer();
        centerRenderer.setHorizontalAlignment(JLabel.CENTER);
        for (int i = 0; i < table.getColumnCount(); i++) {
            table.getColumnModel().getColumn(i).setCellRenderer(centerRenderer);
        }
    }

    private void refreshCustomerComboBoxes() {
        posCustomerCombo.removeAllItems();
        foodCustomerCombo.removeAllItems();
        for (m_Person p : park.getUsers()) {
            if (p instanceof m_Customer) {
                CustomerWrapper cw = new CustomerWrapper((m_Customer) p);
                posCustomerCombo.addItem(cw);
                foodCustomerCombo.addItem(cw);
            }
        }
    }

    private JTextField createSearchField(TableRowSorter<DefaultTableModel> sorter) {
        JTextField searchField = new JTextField();
        searchField.setPreferredSize(new Dimension(220, 32));
        searchField.setToolTipText("Type to filter records...");
        searchField.putClientProperty("JTextField.placeholderText", "🔍 Search...");

        searchField.getDocument().addDocumentListener(new DocumentListener() {
            private void filter() {
                String text = searchField.getText().trim();
                if (text.isEmpty()) {
                    sorter.setRowFilter(null);
                } else {
                    sorter.setRowFilter(RowFilter.regexFilter("(?i)" + text));
                }
            }
            @Override public void insertUpdate(DocumentEvent e) { filter(); }
            @Override public void removeUpdate(DocumentEvent e) { filter(); }
            @Override public void changedUpdate(DocumentEvent e) { filter(); }
        });
        return searchField;
    }

    // --- 1. OVERVIEW DASHBOARD PANEL ---
    private JPanel createOverviewPanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 20));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JPanel statsGrid = new JPanel(new GridLayout(1, 4, 15, 0));
        statsGrid.setOpaque(false);
        statsGrid.setPreferredSize(new Dimension(0, 95));

        long operationalRides = park.getRides().stream().filter(r -> !r.isNeedMaintenance()).count();

        statsGrid.add(createStatCard("Total Revenue Today", String.format("$%.2f", totalRevenue), new Color(25, 135, 84)));
        statsGrid.add(createStatCard("Active Visitors Inside", String.valueOf(park.getUsers().stream().filter(u -> u instanceof m_Customer).count() * 12), new Color(13, 110, 253)));
        statsGrid.add(createStatCard("Operational Rides", operationalRides + " / " + park.getRides().size(), new Color(255, 193, 7)));
        statsGrid.add(createStatCard("Active Staff On Duty", String.valueOf(park.getUsers().stream().filter(u -> !(u instanceof m_Customer)).count()), new Color(111, 66, 193)));

        JTextArea activityArea = new JTextArea();
        activityArea.setFont(new Font("Monospaced", Font.PLAIN, 13));
        activityArea.setBackground(new Color(22, 26, 34));
        activityArea.setForeground(new Color(0, 230, 150));
        activityArea.setEditable(false);
        activityArea.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        StringBuilder sb = new StringBuilder();
        sb.append("LIVE SYSTEM AUDIT LOG\n");
        sb.append("=========================================================\n");
        sb.append("[10:15 AM] Ticket #101 issued - Regular Pass ($50.00)\n");
        sb.append("[11:30 AM] Food Court Sale: Burger Combo ($150.00)\n");
        sb.append("[01:45 PM] Maintenance check completed for Thunder Coaster\n");
        sb.append("[03:20 PM] New Customer Registered & RFID Wristband assigned\n");
        sb.append("[04:10 PM] Wristband Balance Top-up: +$100.00\n");
        sb.append("=========================================================\n");
        activityArea.setText(sb.toString());

        panel.add(statsGrid, BorderLayout.NORTH);
        panel.add(new JScrollPane(activityArea), BorderLayout.CENTER);
        return panel;
    }

    // --- 2. CUSTOMER MANAGEMENT PANEL WITH SEARCH & VALIDATION ---
    private JPanel createCustomerPanel() {
        JPanel panel = new JPanel(new BorderLayout(20, 0));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Table & Search Top Bar
        String[] cols = {"ID", "Customer Name", "Email", "Phone", "Wristband Balance ($)", "Loyalty Points"};
        customerTableModel = new DefaultTableModel(cols, 0);
        customerSorter = new TableRowSorter<>(customerTableModel);

        JTable table = new JTable(customerTableModel);
        table.setRowSorter(customerSorter);
        styleTable(table);

        refreshCustomerTable();

        JPanel tableHeaderPanel = new JPanel(new BorderLayout());
        tableHeaderPanel.setOpaque(false);
        JLabel lblTableTitle = new JLabel("👥 Registered Park Visitors");
        lblTableTitle.setFont(new Font("SansSerif", Font.BOLD, 16));
        lblTableTitle.setForeground(new Color(0, 191, 255));

        tableHeaderPanel.add(lblTableTitle, BorderLayout.WEST);
        tableHeaderPanel.add(createSearchField(customerSorter), BorderLayout.EAST);
        tableHeaderPanel.setBorder(BorderFactory.createEmptyBorder(0, 0, 10, 0));

        JPanel tableContainer = new JPanel(new BorderLayout());
        tableContainer.setOpaque(false);
        tableContainer.add(tableHeaderPanel, BorderLayout.NORTH);
        tableContainer.add(new JScrollPane(table), BorderLayout.CENTER);

        // Form Registration Panel (Right Side)
        JPanel formPanel = new JPanel();
        formPanel.setLayout(new BoxLayout(formPanel, BoxLayout.Y_AXIS));
        formPanel.setPreferredSize(new Dimension(320, 0));
        formPanel.setOpaque(false);
        formPanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createTitledBorder(null, "➕ Register New Customer",
                        javax.swing.border.TitledBorder.DEFAULT_JUSTIFICATION,
                        javax.swing.border.TitledBorder.DEFAULT_POSITION,
                        new Font("SansSerif", Font.BOLD, 14), new Color(0, 191, 255)),
                BorderFactory.createEmptyBorder(10, 10, 10, 10)
        ));

        JTextField txtName = new JTextField();
        JTextField txtEmail = new JTextField();
        JTextField txtPhone = new JTextField();
        JTextField txtInitialDeposit = new JTextField("50.00");

        Dimension fieldSize = new Dimension(Integer.MAX_VALUE, 35);
        txtName.setMaximumSize(fieldSize);
        txtEmail.setMaximumSize(fieldSize);
        txtPhone.setMaximumSize(fieldSize);
        txtInitialDeposit.setMaximumSize(fieldSize);

        formPanel.add(new JLabel("Full Name:"));
        formPanel.add(Box.createRigidArea(new Dimension(0, 4)));
        formPanel.add(txtName);
        formPanel.add(Box.createRigidArea(new Dimension(0, 10)));

        formPanel.add(new JLabel("Email Address:"));
        formPanel.add(Box.createRigidArea(new Dimension(0, 4)));
        formPanel.add(txtEmail);
        formPanel.add(Box.createRigidArea(new Dimension(0, 10)));

        formPanel.add(new JLabel("Phone Number:"));
        formPanel.add(Box.createRigidArea(new Dimension(0, 4)));
        formPanel.add(txtPhone);
        formPanel.add(Box.createRigidArea(new Dimension(0, 10)));

        formPanel.add(new JLabel("Initial Wristband Deposit ($):"));
        formPanel.add(Box.createRigidArea(new Dimension(0, 4)));
        formPanel.add(txtInitialDeposit);
        formPanel.add(Box.createRigidArea(new Dimension(0, 20)));

        JButton btnAddCustomer = new JButton("Register Customer");
        btnAddCustomer.setFont(new Font("SansSerif", Font.BOLD, 14));
        btnAddCustomer.setBackground(new Color(25, 135, 84));
        btnAddCustomer.setForeground(Color.WHITE);
        btnAddCustomer.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        btnAddCustomer.setCursor(new Cursor(Cursor.HAND_CURSOR));

        btnAddCustomer.addActionListener(e -> {
            String name = txtName.getText().trim();
            String email = txtEmail.getText().trim();
            String phone = txtPhone.getText().trim();
            String depStr = txtInitialDeposit.getText().trim();

            // Validation
            if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || depStr.isEmpty()) {
                triggerErrorAlert("All fields are required! Please complete the form.", "Validation Error");
                return;
            }

            if (!email.contains("@") || !email.contains(".")) {
                triggerErrorAlert("Please enter a valid email address (e.g. user@domain.com)!", "Validation Error");
                return;
            }

            if (!phone.matches("\\d{8,15}")) {
                triggerErrorAlert("Phone number must contain between 8 and 15 digits!", "Validation Error");
                return;
            }

            double deposit;
            try {
                deposit = Double.parseDouble(depStr);
                if (deposit < 0) {
                    triggerErrorAlert("Initial deposit cannot be negative!", "Validation Error");
                    return;
                }
            } catch (NumberFormatException ex) {
                triggerErrorAlert("Initial deposit must be a valid numeric value!", "Validation Error");
                return;
            }

            int newId = park.getUsers().size() + 1;
            m_Customer newCust = new m_Customer(newId, name, email, "1234", phone, 10); // 10 welcome points
            park.addUser(newCust);
            customerBalances.put(newId, deposit);
            activeCustomer = newCust;

            refreshCustomerTable();
            refreshCustomerComboBoxes();
            updateStatusBar();

            txtName.setText(""); txtEmail.setText(""); txtPhone.setText(""); txtInitialDeposit.setText("50.00");
            triggerSuccessAlert("Customer [" + name + "] registered with Wristband Balance: $" + deposit, "Customer Registered");
        });

        formPanel.add(btnAddCustomer);
        formPanel.add(Box.createVerticalGlue());

        panel.add(tableContainer, BorderLayout.CENTER);
        panel.add(formPanel, BorderLayout.EAST);
        return panel;
    }

    private void refreshCustomerTable() {
        customerTableModel.setRowCount(0);
        for (m_Person p : park.getUsers()) {
            if (p instanceof m_Customer) {
                m_Customer c = (m_Customer) p;
                double bal = customerBalances.getOrDefault(c.getId(), 0.0);
                customerTableModel.addRow(new Object[]{
                        c.getId(), c.getName(), c.getEmail(), c.getPhone(), String.format("$%.2f", bal), c.getLoyaltyPoints()
                });
            }
        }
    }

    // --- 3. POS & WRISTBAND PANEL WITH ACTIVE CUSTOMER & BALANCE PAYMENT ---
    private JPanel createTicketingPOSPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBackground(new Color(28, 32, 42));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 15, 10, 15);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel lblTitle = new JLabel("🎟️ Point of Sales & Wristband Top-Up", SwingConstants.CENTER);
        lblTitle.setFont(new Font("SansSerif", Font.BOLD, 22));
        lblTitle.setForeground(new Color(0, 191, 255));

        // Customer Selection
        JLabel lblSelectCustomer = new JLabel("Select Target Visitor:");
        lblSelectCustomer.setFont(new Font("SansSerif", Font.BOLD, 13));

        posCustomerCombo.setPreferredSize(new Dimension(320, 38));
        posCustomerCombo.addActionListener(e -> {
            CustomerWrapper selected = (CustomerWrapper) posCustomerCombo.getSelectedItem();
            if (selected != null) {
                activeCustomer = selected.getCustomer();
                updateStatusBar();
            }
        });

        // Ticket Sales Section
        String[] tickets = {"Regular Pass ($50.00)", "VIP FastPass ($75.00)", "Family Pass ($160.00)"};
        JComboBox<String> ticketCombo = new JComboBox<>(tickets);
        ticketCombo.setPreferredSize(new Dimension(320, 38));

        JCheckBox chkPayWithWristband = new JCheckBox("Deduct payment from Wristband Balance");
        chkPayWithWristband.setOpaque(false);
        chkPayWithWristband.setForeground(new Color(200, 210, 225));

        JButton btnIssueTicket = new JButton("🎟️ Issue Ticket Pass");
        btnIssueTicket.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnIssueTicket.setBackground(new Color(13, 110, 253));
        btnIssueTicket.setForeground(Color.WHITE);
        btnIssueTicket.setPreferredSize(new Dimension(320, 40));

        // Top-Up Section
        JTextField txtTopup = new JTextField();
        txtTopup.setPreferredSize(new Dimension(320, 42));
        txtTopup.setBorder(BorderFactory.createTitledBorder("Top-Up Wristband Amount ($)"));

        JButton btnTopupWristband = new JButton("💳 Top-Up Customer Wristband");
        btnTopupWristband.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnTopupWristband.setBackground(new Color(25, 135, 84));
        btnTopupWristband.setForeground(Color.WHITE);
        btnTopupWristband.setPreferredSize(new Dimension(320, 40));

        btnIssueTicket.addActionListener(e -> {
            CustomerWrapper cw = (CustomerWrapper) posCustomerCombo.getSelectedItem();
            if (cw == null) {
                triggerErrorAlert("Please select a customer first!", "Selection Error");
                return;
            }
            m_Customer targetCust = cw.getCustomer();
            double price = ticketCombo.getSelectedIndex() == 0 ? 50.0 : (ticketCombo.getSelectedIndex() == 1 ? 75.0 : 160.0);

            if (chkPayWithWristband.isSelected()) {
                double currentBal = customerBalances.getOrDefault(targetCust.getId(), 0.0);
                if (currentBal < price) {
                    triggerErrorAlert(String.format("Insufficient wristband balance! Required: $%.2f, Current: $%.2f", price, currentBal), "Balance Error");
                    return;
                }
                customerBalances.put(targetCust.getId(), currentBal - price);
            }

            ticketRevenue += price;
            totalRevenue += price;
            targetCust.addLoyaltyPoints((int) (price / 10));

            refreshCustomerTable();
            updateStatusBar();
            triggerSuccessAlert(String.format("Ticket issued successfully for %s!\nPrice: $%.2f | Points Added.", targetCust.getName(), price), "Ticket Issued");
        });

        btnTopupWristband.addActionListener(e -> {
            CustomerWrapper cw = (CustomerWrapper) posCustomerCombo.getSelectedItem();
            if (cw == null) {
                triggerErrorAlert("Please select a customer first!", "Selection Error");
                return;
            }
            m_Customer targetCust = cw.getCustomer();

            String amtStr = txtTopup.getText().trim();
            if (amtStr.isEmpty()) {
                triggerErrorAlert("Please enter top-up amount!", "Input Error");
                return;
            }

            try {
                double amt = Double.parseDouble(amtStr);
                if (amt <= 0) {
                    triggerErrorAlert("Top-up amount must be greater than zero!", "Validation Error");
                    return;
                }

                double currentBal = customerBalances.getOrDefault(targetCust.getId(), 0.0);
                customerBalances.put(targetCust.getId(), currentBal + amt);

                totalRevenue += amt;
                targetCust.addLoyaltyPoints((int) (amt / 20));

                refreshCustomerTable();
                updateStatusBar();
                txtTopup.setText("");
                triggerSuccessAlert(String.format("Wristband Top-Up Successful!\nAdded: $%.2f | New Balance: $%.2f", amt, currentBal + amt), "Top-Up Success");

            } catch (NumberFormatException ex) {
                triggerErrorAlert("Please enter a valid monetary amount!", "Input Error");
            }
        });

        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2; panel.add(lblTitle, gbc);
        gbc.gridy = 1; gbc.gridwidth = 1; panel.add(lblSelectCustomer, gbc);
        gbc.gridx = 1; panel.add(posCustomerCombo, gbc);
        gbc.gridx = 0; gbc.gridy = 2; gbc.gridwidth = 2; panel.add(new JSeparator(), gbc);
        gbc.gridy = 3; panel.add(ticketCombo, gbc);
        gbc.gridy = 4; panel.add(chkPayWithWristband, gbc);
        gbc.gridy = 5; panel.add(btnIssueTicket, gbc);
        gbc.gridy = 6; panel.add(new JSeparator(), gbc);
        gbc.gridy = 7; panel.add(txtTopup, gbc);
        gbc.gridy = 8; panel.add(btnTopupWristband, gbc);

        return panel;
    }

    // --- 4. RIDES CONSOLE WITH ADD RIDE & LIVE SEARCH ---
    private JPanel createRidesConsolePanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 15));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        String[] columns = {"Ride Name", "Category", "Capacity", "Min Age Req", "Min Height (m)", "Status", "Maintenance"};
        ridesTableModel = new DefaultTableModel(columns, 0);
        ridesSorter = new TableRowSorter<>(ridesTableModel);

        refreshRidesTableData();

        JTable table = new JTable(ridesTableModel);
        table.setRowSorter(ridesSorter);
        styleTable(table);

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setOpaque(false);
        JLabel lblHeader = new JLabel("🎢 Park Rides Operations & Safety");
        lblHeader.setFont(new Font("SansSerif", Font.BOLD, 16));
        lblHeader.setForeground(new Color(0, 191, 255));

        topBar.add(lblHeader, BorderLayout.WEST);
        topBar.add(createSearchField(ridesSorter), BorderLayout.EAST);

        JPanel controlsPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 0));
        controlsPanel.setOpaque(false);

        JButton btnAddRide = new JButton("➕ Add New Ride");
        btnAddRide.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnAddRide.setBackground(new Color(25, 135, 84));
        btnAddRide.setForeground(Color.WHITE);

        JButton btnToggleStatus = new JButton("⚠️ Report Issue / Toggle Maintenance");
        btnToggleStatus.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnToggleStatus.setBackground(new Color(220, 53, 69));
        btnToggleStatus.setForeground(Color.WHITE);

        btnAddRide.addActionListener(e -> showAddRideDialog());

        btnToggleStatus.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row != -1) {
                int modelRow = table.convertRowIndexToModel(row);
                s_Ride r = park.getRides().get(modelRow);
                r.setNeedMaintenance(!r.isNeedMaintenance());

                if (r.isNeedMaintenance()) {
                    triggerErrorAlert("Ride [" + r.getName() + "] marked as IN MAINTENANCE! Operations suspended.", "Safety Alert");
                } else {
                    triggerSuccessAlert("Ride [" + r.getName() + "] is clear and OPERATIONAL.", "Maintenance Update");
                }
                refreshRidesTableData();
            } else {
                triggerErrorAlert("Please select a ride from the table first!", "Selection Required");
            }
        });

        controlsPanel.add(btnAddRide);
        controlsPanel.add(btnToggleStatus);

        panel.add(topBar, BorderLayout.NORTH);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);
        panel.add(controlsPanel, BorderLayout.SOUTH);
        return panel;
    }

    private void showAddRideDialog() {
        JDialog dialog = new JDialog(this, "➕ Add New Amusement Ride", true);
        dialog.setSize(380, 450);
        dialog.setLocationRelativeTo(this);
        dialog.setLayout(new GridBagLayout());

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 12, 8, 12);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JTextField txtName = new JTextField(15);
        String[] categories = {"Roller Coaster", "Horror / Thrill", "Kids Ride", "Water Ride", "Family Ride"};
        JComboBox<String> comboCategory = new JComboBox<>(categories);
        JTextField txtCapacity = new JTextField("20", 15);
        JTextField txtAge = new JTextField("10", 15);
        JTextField txtHeight = new JTextField("1.2", 15);

        JButton btnSave = new JButton("Save Ride");
        btnSave.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnSave.setBackground(new Color(13, 110, 253));
        btnSave.setForeground(Color.WHITE);

        gbc.gridx = 0; gbc.gridy = 0; dialog.add(new JLabel("Ride Name:"), gbc);
        gbc.gridx = 1; dialog.add(txtName, gbc);

        gbc.gridx = 0; gbc.gridy = 1; dialog.add(new JLabel("Category:"), gbc);
        gbc.gridx = 1; dialog.add(comboCategory, gbc);

        gbc.gridx = 0; gbc.gridy = 2; dialog.add(new JLabel("Capacity:"), gbc);
        gbc.gridx = 1; dialog.add(txtCapacity, gbc);

        gbc.gridx = 0; gbc.gridy = 3; dialog.add(new JLabel("Min Age:"), gbc);
        gbc.gridx = 1; dialog.add(txtAge, gbc);

        gbc.gridx = 0; gbc.gridy = 4; dialog.add(new JLabel("Min Height (m):"), gbc);
        gbc.gridx = 1; dialog.add(txtHeight, gbc);

        gbc.gridx = 0; gbc.gridy = 5; gbc.gridwidth = 2;
        dialog.add(Box.createRigidArea(new Dimension(0, 15)), gbc);
        gbc.gridy = 6; dialog.add(btnSave, gbc);

        btnSave.addActionListener(ev -> {
            String name = txtName.getText().trim();
            String cat = (String) comboCategory.getSelectedItem();

            if (name.isEmpty()) {
                triggerErrorAlert("Please enter a valid Ride Name!", "Validation Error");
                return;
            }

            try {
                int cap = Integer.parseInt(txtCapacity.getText().trim());
                int age = Integer.parseInt(txtAge.getText().trim());
                double height = Double.parseDouble(txtHeight.getText().trim());

                if (cap <= 0 || age < 0 || height < 0) {
                    triggerErrorAlert("Capacity, Age, and Height must be positive numbers!", "Validation Error");
                    return;
                }

                CustomRide newRide = new CustomRide(name, cap, age, height, 0, false, true, cat);
                park.addRide(newRide);
                refreshRidesTableData();
                dialog.dispose();
                triggerSuccessAlert("New Ride [" + name + "] added successfully!", "Ride Created");

            } catch (NumberFormatException ex) {
                triggerErrorAlert("Capacity, Age, and Height must be valid numeric values!", "Validation Error");
            }
        });

        dialog.setVisible(true);
    }

    private void refreshRidesTableData() {
        ridesTableModel.setRowCount(0);
        for (s_Ride r : park.getRides()) {
            ridesTableModel.addRow(new Object[]{
                    r.getName(), r.getRideCategory(), r.getCapacity(),
                    r.getAgeRequirement() + " yrs", r.getHeightRequirement() + " m",
                    (r.isNeedMaintenance() ? "CLOSED" : "OPEN"),
                    (r.isNeedMaintenance() ? "IN REPAIR" : "HEALTHY")
            });
        }
    }

    // --- 5. FOOD COURT POS PANEL WITH CUSTOMER SELECTION & WRISTBAND ---
    private JPanel createFoodPOSPanel() {
        JPanel panel = new JPanel(new GridLayout(1, 2, 20, 0));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Menu Left Side
        JPanel menuPanel = new JPanel(new BorderLayout(0, 10));
        menuPanel.setOpaque(false);

        String[] cols = {"ID", "Item", "Price ($)"};
        DefaultTableModel menuModel = new DefaultTableModel(cols, 0);
        menuModel.addRow(new Object[]{1, "Burger Meal", 150.00});
        menuModel.addRow(new Object[]{2, "Pizza Combo", 200.00});
        menuModel.addRow(new Object[]{3, "Fresh Soda", 50.00});

        JTable menuTable = new JTable(menuModel);
        styleTable(menuTable);

        JButton btnAddToCart = new JButton("🛒 Add Selected Item to Order");
        btnAddToCart.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnAddToCart.setBackground(new Color(13, 110, 253));
        btnAddToCart.setForeground(Color.WHITE);

        btnAddToCart.addActionListener(e -> {
            int row = menuTable.getSelectedRow();
            if (row != -1) {
                String item = (String) menuModel.getValueAt(row, 1);
                double price = (Double) menuModel.getValueAt(row, 2);
                cartItems.add(item + " - $" + price);
                cartTotal += price;
                cartListModel.addElement(item + " ($" + price + ")");
                lblCartTotal.setText(String.format("Total: $%.2f", cartTotal));
            } else {
                triggerErrorAlert("Please select a food item to add!", "Selection Error");
            }
        });

        menuPanel.add(new JLabel("🍔 Food & Beverage Menu"), BorderLayout.NORTH);
        menuPanel.add(new JScrollPane(menuTable), BorderLayout.CENTER);
        menuPanel.add(btnAddToCart, BorderLayout.SOUTH);

        // Cart Right Side
        JPanel cartPanel = new JPanel(new BorderLayout(0, 10));
        cartPanel.setOpaque(false);

        JPanel customerSelectPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        customerSelectPanel.setOpaque(false);
        customerSelectPanel.add(new JLabel("Customer:"));
        foodCustomerCombo.setPreferredSize(new Dimension(200, 32));
        customerSelectPanel.add(foodCustomerCombo);

        cartListModel = new DefaultListModel<>();
        JList<String> cartList = new JList<>(cartListModel);
        cartList.setFont(new Font("SansSerif", Font.PLAIN, 14));
        cartList.setBackground(new Color(22, 26, 34));

        lblCartTotal = new JLabel("Total: $0.00", SwingConstants.RIGHT);
        lblCartTotal.setFont(new Font("SansSerif", Font.BOLD, 18));
        lblCartTotal.setForeground(new Color(0, 230, 150));

        JCheckBox chkPayWristbandFood = new JCheckBox("Pay with Wristband");
        chkPayWristbandFood.setOpaque(false);

        JButton btnCheckoutFood = new JButton("💳 Checkout Food Order");
        btnCheckoutFood.setFont(new Font("SansSerif", Font.BOLD, 14));
        btnCheckoutFood.setBackground(new Color(25, 135, 84));
        btnCheckoutFood.setForeground(Color.WHITE);

        btnCheckoutFood.addActionListener(e -> {
            if (cartTotal <= 0) {
                triggerErrorAlert("Cart is empty! Add items before checkout.", "Checkout Error");
                return;
            }

            CustomerWrapper cw = (CustomerWrapper) foodCustomerCombo.getSelectedItem();
            if (cw == null) {
                triggerErrorAlert("Please select a customer for the order!", "Selection Error");
                return;
            }

            m_Customer c = cw.getCustomer();

            if (chkPayWristbandFood.isSelected()) {
                double bal = customerBalances.getOrDefault(c.getId(), 0.0);
                if (bal < cartTotal) {
                    triggerErrorAlert(String.format("Insufficient wristband balance! Required: $%.2f, Available: $%.2f", cartTotal, bal), "Payment Error");
                    return;
                }
                customerBalances.put(c.getId(), bal - cartTotal);
            }

            foodRevenue += cartTotal;
            totalRevenue += cartTotal;
            c.addLoyaltyPoints((int) (cartTotal / 15));

            refreshCustomerTable();
            updateStatusBar();

            triggerSuccessAlert(String.format("Food Order Processed for %s!\nTotal Paid: $%.2f", c.getName(), cartTotal), "Checkout Success");
            cartListModel.clear();
            cartItems.clear();
            cartTotal = 0.0;
            lblCartTotal.setText("Total: $0.00");
        });

        JPanel cartTop = new JPanel(new BorderLayout());
        cartTop.setOpaque(false);
        cartTop.add(new JLabel("🛍️ Current Order Cart"), BorderLayout.NORTH);
        cartTop.add(customerSelectPanel, BorderLayout.SOUTH);

        cartPanel.add(cartTop, BorderLayout.NORTH);
        cartPanel.add(new JScrollPane(cartList), BorderLayout.CENTER);

        JPanel bottomCart = new JPanel(new GridLayout(3, 1, 5, 5));
        bottomCart.setOpaque(false);
        bottomCart.add(lblCartTotal);
        bottomCart.add(chkPayWristbandFood);
        bottomCart.add(btnCheckoutFood);

        cartPanel.add(bottomCart, BorderLayout.SOUTH);

        panel.add(menuPanel);
        panel.add(cartPanel);
        return panel;
    }

    // --- 6. STAFF MANAGEMENT WITH SHIFT STATUS TOGGLE & SEARCH ---
    private JPanel createStaffPanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 15));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        String[] cols = {"ID", "Staff Name", "Role", "Assigned Station", "Shift Status"};
        staffTableModel = new DefaultTableModel(cols, 0);
        staffSorter = new TableRowSorter<>(staffTableModel);

        refreshStaffTable();

        JTable staffTable = new JTable(staffTableModel);
        staffTable.setRowSorter(staffSorter);
        styleTable(staffTable);

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setOpaque(false);
        JLabel lblHeader = new JLabel("👥 Park Staff & Operations Duty");
        lblHeader.setFont(new Font("SansSerif", Font.BOLD, 16));
        lblHeader.setForeground(new Color(0, 191, 255));

        topBar.add(lblHeader, BorderLayout.WEST);
        topBar.add(createSearchField(staffSorter), BorderLayout.EAST);

        JPanel controlsPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        controlsPanel.setOpaque(false);

        JButton btnToggleShift = new JButton("🔄 Toggle Shift Duty");
        btnToggleShift.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnToggleShift.setBackground(new Color(13, 110, 253));
        btnToggleShift.setForeground(Color.WHITE);

        JButton btnAssignStation = new JButton("📍 Assign Station");
        btnAssignStation.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnAssignStation.setBackground(new Color(25, 135, 84));
        btnAssignStation.setForeground(Color.WHITE);

        btnToggleShift.addActionListener(e -> {
            int row = staffTable.getSelectedRow();
            if (row != -1) {
                int modelRow = staffTable.convertRowIndexToModel(row);
                String currentStatus = (String) staffTableModel.getValueAt(modelRow, 4);
                String newStatus = currentStatus.equals("ON DUTY") ? "OFF DUTY" : "ON DUTY";
                staffTableModel.setValueAt(newStatus, modelRow, 4);
                triggerSuccessAlert("Shift status updated to: " + newStatus, "Staff Updated");
            } else {
                triggerErrorAlert("Please select a staff member first!", "Selection Error");
            }
        });

        btnAssignStation.addActionListener(e -> {
            int row = staffTable.getSelectedRow();
            if (row != -1) {
                int modelRow = staffTable.convertRowIndexToModel(row);
                String newStation = JOptionPane.showInputDialog(this, "Enter new assigned station:", "Assign Station", JOptionPane.PLAIN_MESSAGE);
                if (newStation != null && !newStation.trim().isEmpty()) {
                    staffTableModel.setValueAt(newStation.trim(), modelRow, 3);
                    triggerSuccessAlert("Assigned station updated to: " + newStation.trim(), "Station Assigned");
                }
            } else {
                triggerErrorAlert("Please select a staff member first!", "Selection Error");
            }
        });

        controlsPanel.add(btnToggleShift);
        controlsPanel.add(btnAssignStation);

        panel.add(topBar, BorderLayout.NORTH);
        panel.add(new JScrollPane(staffTable), BorderLayout.CENTER);
        panel.add(controlsPanel, BorderLayout.SOUTH);
        return panel;
    }

    private void refreshStaffTable() {
        staffTableModel.setRowCount(0);
        for (m_Person p : park.getUsers()) {
            if (!(p instanceof m_Customer)) {
                staffTableModel.addRow(new Object[]{
                        p.getId(), p.getName(), p.getRole(), "Main Park Console", "ON DUTY"
                });
            }
        }
    }

    // --- 7. REPORTS & ANALYTICS PANEL WITH FILE EXPORT ---
    private JPanel createReportsPanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 15));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JTextArea area = new JTextArea();
        area.setFont(new Font("Monospaced", Font.PLAIN, 14));
        area.setBackground(new Color(22, 26, 34));
        area.setForeground(new Color(0, 191, 255));
        area.setEditable(false);
        area.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        String reportText = generateReportContent();
        area.setText(reportText);

        JButton btnExport = new JButton("💾 Export Report (.txt)");
        btnExport.setFont(new Font("SansSerif", Font.BOLD, 14));
        btnExport.setBackground(new Color(25, 135, 84));
        btnExport.setForeground(Color.WHITE);

        btnExport.addActionListener(e -> {
            try {
                File file = new File("DreamPark_Financial_Report.txt");
                FileWriter writer = new FileWriter(file);
                writer.write(generateReportContent());
                writer.close();
                triggerSuccessAlert("Report exported successfully to file:\n" + file.getAbsolutePath(), "Export Success");
            } catch (IOException ex) {
                triggerErrorAlert("Error writing report file: " + ex.getMessage(), "Export Error");
            }
        });

        JPanel bottomPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        bottomPanel.setOpaque(false);
        bottomPanel.add(btnExport);

        panel.add(new JScrollPane(area), BorderLayout.CENTER);
        panel.add(bottomPanel, BorderLayout.SOUTH);
        return panel;
    }

    private String generateReportContent() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================================\n");
        sb.append("            FINANCIAL & OPERATIONS REPORT                \n");
        sb.append(" Generated at: ").append(dtf.format(LocalDateTime.now())).append("\n");
        sb.append("=========================================================\n");
        sb.append(String.format(" Ticket Sales Revenue : $%.2f\n", ticketRevenue));
        sb.append(String.format(" Food Court Revenue   : $%.2f\n", foodRevenue));
        sb.append("---------------------------------------------------------\n");
        sb.append(String.format(" TOTAL GROSS REVENUE  : $%.2f\n", totalRevenue));
        sb.append("=========================================================\n\n");
        sb.append(" PARK CAPACITY ANALYTICS:\n");
        sb.append(" - Total Park Capacity : 1,000 Visitors\n");
        sb.append(" - Registered Customers: ").append(park.getUsers().stream().filter(u -> u instanceof m_Customer).count()).append("\n");
        sb.append(" - Total Rides Count   : ").append(park.getRides().size()).append("\n");
        sb.append(" - Operational Rides   : ").append(park.getRides().stream().filter(r -> !r.isNeedMaintenance()).count()).append("\n");
        return sb.toString();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new MainGUI().setVisible(true));
    }
}