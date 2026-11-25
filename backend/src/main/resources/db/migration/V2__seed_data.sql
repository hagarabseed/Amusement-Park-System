-- Default password for all demo staff accounts is: Pass@1234
INSERT INTO users (full_name, email, password_hash, phone, role, assigned_station, duty_status, salary) VALUES
('Omar Ali', 'omar.manager@parkpulse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '01133333333', 'MANAGER', 'Command Center', 'ON_DUTY', 10000.00),
('Khaled Nabil', 'khaled.cashier@parkpulse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '01555555555', 'CASHIER', 'Main Gate POS #1', 'ON_DUTY', 5000.00),
('Ahmed Hassan', 'ahmed.operator@parkpulse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '01222222222', 'RIDE_OPERATOR', 'Thunder Coaster', 'ON_DUTY', 6000.00);

INSERT INTO customers (full_name, email, phone, wristband_balance, loyalty_points) VALUES
('Sara Mahmoud', 'sara@gmail.com', '01111111111', 250.00, 100),
('Ahmed Ali', 'ahmed.ali@gmail.com', '01000000000', 100.00, 50);

INSERT INTO rides (name, category, capacity, min_age, min_height_m, need_maintenance, specific_details) VALUES
('Thunder Coaster', 'ROLLER_COASTER', 24, 14, 1.40, FALSE, 'Track Length: 800m | 3 Inversions'),
('House of Shock', 'HORROR', 12, 16, 1.20, FALSE, 'Scare Level: 9/10 | Live Actors'),
('Mini Carousel', 'KIDS', 16, 3, 0.80, FALSE, 'Merry-Go-Round | Parental Supervision Allowed'),
('Splash Mountain', 'WATER', 20, 10, 1.10, TRUE, 'Flume Ride | Pool Depth: 2.5m');

INSERT INTO menu_items (name, item_type, sub_category, price, available) VALUES
('Burger Meal', 'FOOD', 'Fast Food', 150.00, TRUE),
('Pizza Combo', 'FOOD', 'Italian', 200.00, TRUE),
('Fresh Soda', 'DRINK', 'Large Beverage', 50.00, TRUE);

INSERT INTO offers (code, title, discount_percent, active) VALUES
('SUMMER20', 'Summer Pass Promo', 20, TRUE);