package com.example;

import com.formdev.flatlaf.FlatDarkLaf;

import javax.swing.*;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import java.awt.*;

public class MainGUI extends JFrame {

    private AmusementPark park;
    private Customer defaultCustomer;
    private Booking activeBooking;
    private int bookingCounter = 100;
    private int paymentCounter = 500;

    private CardLayout cardLayout;
    private JPanel mainContentPanel;
    private JLabel statusLabel;

    public MainGUI() {
        setupTheme();
        initData();
        setupFrame();
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

    private void initData() {
        park = new AmusementPark("Dream Park");

        park.addFoodItem(new Food(1, "Burger", 150, "Fast Food"));
        park.addFoodItem(new Food(2, "Pizza", 200, "Italian"));
        park.addFoodItem(new Drink(3, "Cola", 50, "Large"));

        park.addOffer(new Offer(1, "Summer Discount", 20));
        park.addOffer(new Offer(2, "VIP Special", 30));

        park.addRide(new RollarCoaster("Thunder Coaster", 24, 14, 1.4, 5, false, true, 800.0, 3, true));
        park.addRide(new HorrorRide("House of Shock", 12, 16, 1.2, 2, false, true, 9, true));
        park.addRide(new KidsRide("Mini Carousel", 16, 3, 0.8, 1, false, true, true, true, "Merry-Go-Round"));
        park.addRide(new WaterRide("Splash Mountain", 20, 10, 1.1, 4, true, false, 2.5, 15.0, "Flume Ride"));

        defaultCustomer = new Customer(2, "Sara", "sara@gmail.com", "5678", "01111111111", 100);
        park.addUser(new Person(1, "Menna", "menna@gmail.com", "1234", "01000000000"));
        park.addUser(defaultCustomer);
        park.addUser(new RideOperator(3, "Ahmed", "ahmed@gmail.com", "1234", "01222222222", 6000.0, "Ride Operator", "Thunder Coaster"));
        park.addUser(new Manager(4, "Omar", "omar@gmail.com", "1234", "01133333333", 10000.0, "Manager", "Full Access"));
        park.addUser(new Cashier(5, "Khaled", "khaled@gmail.com", "9999", "01555555555", 5000.0, "Cashier", 42));
    }

    private void setupFrame() {
        setTitle("Dream Park Management System 🎢");
        setSize(1200, 720);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBackground(new Color(22, 26, 34));
        sidebar.setPreferredSize(new Dimension(250, 0)); 
        sidebar.setBorder(BorderFactory.createEmptyBorder(20, 15, 20, 15));

        JLabel logoLabel = new JLabel("DREAM PARK", SwingConstants.CENTER);
        logoLabel.setFont(new Font("SansSerif", Font.BOLD, 22));
        logoLabel.setForeground(new Color(0, 191, 255));
        logoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel subLogo = new JLabel("Management Dashboard", SwingConstants.CENTER);
        subLogo.setFont(new Font("SansSerif", Font.PLAIN, 12));
        subLogo.setForeground(new Color(140, 150, 165));
        subLogo.setAlignmentX(Component.CENTER_ALIGNMENT);

        sidebar.add(logoLabel);
        sidebar.add(subLogo);
        sidebar.add(Box.createRigidArea(new Dimension(0, 25)));

        JButton btnUsers = createSidebarButton("👥   Users Directory");
        JButton btnRides = createSidebarButton("🎢   Park Rides");
        JButton btnFood = createSidebarButton("🍔   Food & Offers");
        JButton btnBook = createSidebarButton("🎟️   Book Ticket");
        JButton btnSummary = createSidebarButton("📋   Booking Summary");
        JButton btnPay = createSidebarButton("💳   Checkout & Pay");
        JButton btnExit = createSidebarButton("❌   Exit");

        sidebar.add(btnUsers); sidebar.add(Box.createRigidArea(new Dimension(0, 8)));
        sidebar.add(btnRides); sidebar.add(Box.createRigidArea(new Dimension(0, 8)));
        sidebar.add(btnFood); sidebar.add(Box.createRigidArea(new Dimension(0, 8)));
        sidebar.add(btnBook); sidebar.add(Box.createRigidArea(new Dimension(0, 8)));
        sidebar.add(btnSummary); sidebar.add(Box.createRigidArea(new Dimension(0, 8)));
        sidebar.add(btnPay);
        sidebar.add(Box.createVerticalGlue());
        sidebar.add(btnExit);

        cardLayout = new CardLayout();
        mainContentPanel = new JPanel(cardLayout);
        mainContentPanel.setBackground(new Color(28, 32, 42));

        mainContentPanel.add(createUsersPanel(), "USERS");
        mainContentPanel.add(createRidesPanel(), "RIDES");
        mainContentPanel.add(createFoodPanel(), "FOOD");
        mainContentPanel.add(createBookingPanel(), "BOOK");
        mainContentPanel.add(createSummaryPanel(), "SUMMARY");

        btnUsers.addActionListener(e -> cardLayout.show(mainContentPanel, "USERS"));
        btnRides.addActionListener(e -> cardLayout.show(mainContentPanel, "RIDES"));
        btnFood.addActionListener(e -> cardLayout.show(mainContentPanel, "FOOD"));
        btnBook.addActionListener(e -> cardLayout.show(mainContentPanel, "BOOK"));
        btnSummary.addActionListener(e -> {
            mainContentPanel.add(createSummaryPanel(), "SUMMARY");
            cardLayout.show(mainContentPanel, "SUMMARY");
        });
        btnPay.addActionListener(e -> openPaymentDialog());
        btnExit.addActionListener(e -> System.exit(0));

        statusLabel = new JLabel("  Ready | Active Customer: " + defaultCustomer.getName() + " (Loyalty Points: " + defaultCustomer.getLoyaltyPoints() + ")");
        statusLabel.setForeground(new Color(180, 190, 205));
        statusLabel.setFont(new Font("SansSerif", Font.BOLD, 12));

        JPanel statusBarPanel = new JPanel(new BorderLayout());
        statusBarPanel.setBackground(new Color(18, 20, 26));
        statusBarPanel.setPreferredSize(new Dimension(0, 28));
        statusBarPanel.add(statusLabel, BorderLayout.WEST);

        add(sidebar, BorderLayout.WEST);
        add(mainContentPanel, BorderLayout.CENTER);
        add(statusBarPanel, BorderLayout.SOUTH);
    }

    private JButton createSidebarButton(String text) {
        JButton button = new JButton(text);
        button.setMaximumSize(new Dimension(Integer.MAX_VALUE, 42));
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
        lblValue.setFont(new Font("SansSerif", Font.BOLD, 28));
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

    private JPanel createUsersPanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 15));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JPanel statsPanel = new JPanel(new GridLayout(1, 3, 15, 0));
        statsPanel.setOpaque(false);
        statsPanel.setPreferredSize(new Dimension(0, 90));

        statsPanel.add(createStatCard("Total Users", String.format("%03d", park.getUsers().size()), new Color(13, 110, 253)));
        statsPanel.add(createStatCard("Active Customers", "001", new Color(25, 135, 84)));
        statsPanel.add(createStatCard("Staff Members", "003", new Color(220, 53, 69)));

        String[] columns = {"ID", "Name", "Email", "Phone", "Role", "Details"};
        DefaultTableModel model = new DefaultTableModel(columns, 0);

        for (Person u : park.getUsers()) {
            model.addRow(new Object[]{u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole(), u.getSpecificDetails()});
        }

        JTable table = new JTable(model);
        styleTable(table);

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.getViewport().setBackground(new Color(28, 32, 42));
        scrollPane.setBorder(BorderFactory.createEmptyBorder());

        panel.add(statsPanel, BorderLayout.NORTH);
        panel.add(scrollPane, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createRidesPanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 15));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JPanel statsPanel = new JPanel(new GridLayout(1, 3, 15, 0));
        statsPanel.setOpaque(false);
        statsPanel.setPreferredSize(new Dimension(0, 90));

        statsPanel.add(createStatCard("Total Rides", String.format("%03d", park.getRides().size()), new Color(13, 110, 253)));
        statsPanel.add(createStatCard("Available Rides", "003", new Color(25, 135, 84)));
        statsPanel.add(createStatCard("Maintenance Required", "001", new Color(255, 193, 7)));

        String[] columns = {"Name", "Category", "Capacity", "Min Age", "Status", "Maintenance", "Details"};
        DefaultTableModel model = new DefaultTableModel(columns, 0);

        for (Ride r : park.getRides()) {
            model.addRow(new Object[]{
                    r.getName(), r.getRideCategory(), r.getCapacity(), r.getAgeRequirement(),
                    (r.isAvailable() ? "Available" : "Closed"), (r.isNeedMaintenance() ? "YES" : "No"), r.getSpecificDetails()
            });
        }

        JTable table = new JTable(model);
        styleTable(table);

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.getViewport().setBackground(new Color(28, 32, 42));
        scrollPane.setBorder(BorderFactory.createEmptyBorder());

        panel.add(statsPanel, BorderLayout.NORTH);
        panel.add(scrollPane, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createFoodPanel() {
        JPanel panel = new JPanel(new GridLayout(2, 1, 15, 15));
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        String[] menuCols = {"ID", "Item Name", "Price", "Type", "Details"};
        DefaultTableModel menuModel = new DefaultTableModel(menuCols, 0);

        menuModel.addRow(new Object[]{1, "Burger", "$150.00", "Food", "Category: Fast Food"});
        menuModel.addRow(new Object[]{2, "Pizza", "$200.00", "Food", "Category: Italian"});
        menuModel.addRow(new Object[]{3, "Cola", "$50.00", "Drink", "Size: Large"});

        JTable menuTable = new JTable(menuModel);
        styleTable(menuTable);
        JScrollPane menuScroll = new JScrollPane(menuTable);
        menuScroll.getViewport().setBackground(new Color(28, 32, 42));
        menuScroll.setBorder(BorderFactory.createTitledBorder(BorderFactory.createLineBorder(new Color(0, 191, 255)), "🍔 Food Court Menu", 0, 0, new Font("SansSerif", Font.BOLD, 14), new Color(0, 191, 255)));

        String[] offerCols = {"ID", "Offer Description", "Discount"};
        DefaultTableModel offerModel = new DefaultTableModel(offerCols, 0);
        offerModel.addRow(new Object[]{1, "Summer Discount", "20.0%"});
        offerModel.addRow(new Object[]{2, "VIP Special", "30.0%"});

        JTable offerTable = new JTable(offerModel);
        styleTable(offerTable);
        JScrollPane offerScroll = new JScrollPane(offerTable);
        offerScroll.getViewport().setBackground(new Color(28, 32, 42));
        offerScroll.setBorder(BorderFactory.createTitledBorder(BorderFactory.createLineBorder(new Color(0, 191, 255)), "🎁 Active Offers", 0, 0, new Font("SansSerif", Font.BOLD, 14), new Color(0, 191, 255)));

        panel.add(menuScroll);
        panel.add(offerScroll);
        return panel;
    }

    private JPanel createBookingPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBackground(new Color(28, 32, 42));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(12, 12, 12, 12);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel lblTitle = new JLabel("🎟️ Create New Ticket Booking", SwingConstants.CENTER);
        lblTitle.setFont(new Font("SansSerif", Font.BOLD, 22));
        lblTitle.setForeground(new Color(0, 191, 255));

        String[] tickets = {"Regular Ticket ($50)", "VIP Ticket ($75 + FastPass)", "Family Ticket (4 Members - 15% Off)"};
        JComboBox<String> ticketCombo = new JComboBox<>(tickets);
        ticketCombo.setFont(new Font("SansSerif", Font.PLAIN, 14));
        ticketCombo.setPreferredSize(new Dimension(320, 40));

        JButton btnAddBooking = new JButton("Confirm Booking");
        btnAddBooking.setFont(new Font("SansSerif", Font.BOLD, 14));
        btnAddBooking.setPreferredSize(new Dimension(320, 45));
        btnAddBooking.setBackground(new Color(13, 110, 253));
        btnAddBooking.setForeground(Color.WHITE);

        btnAddBooking.addActionListener(e -> {
            bookingCounter++;
            activeBooking = new Booking(bookingCounter, defaultCustomer);

            int selected = ticketCombo.getSelectedIndex();
            if (selected == 0) activeBooking.addTicket(new RegularTicket(101, 50.0));
            else if (selected == 1) activeBooking.addTicket(new VIPTicket(102, 50.0, true));
            else if (selected == 2) activeBooking.addTicket(new FamilyTicket(103, 50.0, 4));

            JOptionPane.showMessageDialog(this, "Ticket added successfully to Booking #" + activeBooking.getBookingId(), "Success", JOptionPane.INFORMATION_MESSAGE);
        });

        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2; panel.add(lblTitle, gbc);
        gbc.gridy = 1; panel.add(ticketCombo, gbc);
        gbc.gridy = 2; panel.add(btnAddBooking, gbc);

        return panel;
    }

    private JPanel createSummaryPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(new Color(28, 32, 42));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JTextArea area = new JTextArea();
        area.setFont(new Font("Monospaced", Font.PLAIN, 14));
        area.setBackground(new Color(22, 26, 34));
        area.setForeground(new Color(0, 230, 150));
        area.setEditable(false);
        area.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        if (activeBooking == null) {
            area.setText("\n  No active booking found! Please create a booking first.");
        } else {
            StringBuilder sb = new StringBuilder();
            sb.append("====================================================\n");
            sb.append("             BOOKING SUMMARY #").append(activeBooking.getBookingId()).append("\n");
            sb.append("====================================================\n");
            sb.append(" Customer : ").append(activeBooking.getCustomer().getName()).append("\n");
            sb.append(" Status   : ").append(activeBooking.isPaid() ? "PAID" : "PENDING PAYMENT").append("\n");
            sb.append("----------------------------------------------------\n");
            for (Ticket t : activeBooking.getTickets()) {
                sb.append(String.format(" %-15s | $%-8.2f | %s\n", t.getTicketType(), t.calculatePrice(), t.getBenefits()));
            }
            sb.append("----------------------------------------------------\n");
            sb.append(String.format(" Total Amount : $%.2f\n", activeBooking.calculateTotalAmount()));
            sb.append("====================================================\n");
            area.setText(sb.toString());
        }

        panel.add(new JScrollPane(area), BorderLayout.CENTER);
        return panel;
    }

    private void openPaymentDialog() {
        if (activeBooking == null || activeBooking.getTickets().isEmpty()) {
            triggerErrorAlert("No active booking to pay for!", "Payment Error");
            return;
        }
        if (activeBooking.isPaid()) {
            triggerErrorAlert("This booking is already paid!", "Payment Error");
            return;
        }

        String[] options = {"Credit Card 💳", "Cash 💵", "Vodafone Cash 📱"};
        int choice = JOptionPane.showOptionDialog(this, "Select Payment Method:", "Checkout & Pay",
                JOptionPane.DEFAULT_OPTION, JOptionPane.PLAIN_MESSAGE, null, options, options[0]);

        PaymentProcessor processor = null;

        if (choice == 0) {
            String card = JOptionPane.showInputDialog(this, "Enter Card Number:");
            if (card != null && !card.isEmpty()) {
                processor = new CreditCardPayment(card);
            } else {
                triggerErrorAlert("Invalid Card Number!", "Input Error");
                return;
            }
        } else if (choice == 1) {
            processor = new CashPayment();
        } else if (choice == 2) {
            String phone = JOptionPane.showInputDialog(this, "Enter Vodafone Cash Number:");
            if (phone != null && !phone.isEmpty()) {
                processor = new VodafoneCashPayment(phone);
            } else {
                triggerErrorAlert("Invalid Phone Number!", "Input Error");
                return;
            }
        }

        if (processor != null) {
            paymentCounter++;
            Payment payment = new Payment(paymentCounter, activeBooking, processor);
            if (payment.processPayment()) {
                JOptionPane.showMessageDialog(this, "Payment Processed Successfully!\n" +
                        "Loyalty Points Updated: " + defaultCustomer.getLoyaltyPoints(), "Success", JOptionPane.INFORMATION_MESSAGE);
                statusLabel.setText("  Ready | Active Customer: " + defaultCustomer.getName() + " (Loyalty Points: " + defaultCustomer.getLoyaltyPoints() + ")");
            }
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new MainGUI().setVisible(true));
    }
}