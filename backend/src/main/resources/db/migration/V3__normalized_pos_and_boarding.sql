-- V3: Normalize Tickets, Food Orders, Loyalty Redemptions, Ride Boardings, Optimistic Locking & Operator Station Links

ALTER TABLE customers ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE rides ADD COLUMN maintenance_reason VARCHAR(255);
ALTER TABLE rides ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE users ADD COLUMN assigned_ride_id BIGINT REFERENCES rides(id);

ALTER TABLE offers ADD COLUMN min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (min_spend >= 0);
ALTER TABLE offers ADD COLUMN expires_at TIMESTAMP;

ALTER TABLE transactions ADD COLUMN processed_by_id BIGINT REFERENCES users(id);
ALTER TABLE transactions ADD COLUMN reference_note VARCHAR(255);

ALTER TABLE tickets ADD COLUMN ticket_code VARCHAR(32);
ALTER TABLE tickets ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE tickets ADD COLUMN valid_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE tickets ADD COLUMN boardings_count INT NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD CONSTRAINT uq_tickets_code UNIQUE (ticket_code);
ALTER TABLE tickets ADD CONSTRAINT chk_tickets_status CHECK (status IN ('ACTIVE', 'USED', 'CANCELLED'));

CREATE TABLE ride_boardings (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id),
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    operator_id BIGINT NOT NULL REFERENCES users(id),
    guest_age INT NOT NULL CHECK (guest_age >= 0),
    guest_height_m NUMERIC(4, 2) NOT NULL CHECK (guest_height_m >= 0),
    boarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loyalty_redemptions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    processed_by_id BIGINT NOT NULL REFERENCES users(id),
    points_redeemed INT NOT NULL CHECK (points_redeemed >= 100),
    credit_amount NUMERIC(10, 2) NOT NULL CHECK (credit_amount > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_transactions_processed_by ON transactions(processed_by_id);
CREATE INDEX idx_ride_boardings_ride ON ride_boardings(ride_id);
CREATE INDEX idx_loyalty_redemptions_customer ON loyalty_redemptions(customer_id);

-- Link seeded Ride Operator to Thunder Coaster, fix demo BCrypt hash for Pass@1234, and populate initial maintenance reason
UPDATE users
SET password_hash = '$2a$10$G1LxX4w5nlsBlzjdXw9kW.E.fso.m0exhMigaWtb6OL0vIzp1Zw2i'
WHERE email IN ('omar.manager@parkpulse.com', 'khaled.cashier@parkpulse.com', 'ahmed.operator@parkpulse.com');

UPDATE users
SET assigned_ride_id = (SELECT id FROM rides WHERE name = 'Thunder Coaster')
WHERE email = 'ahmed.operator@parkpulse.com';

UPDATE rides
SET maintenance_reason = 'Scheduled hydraulic pump inspection'
WHERE name = 'Splash Mountain' AND need_maintenance = TRUE;

-- Additional realistic seed data for POS testing (promo bounds & food variety)
INSERT INTO menu_items (name, item_type, sub_category, price, available) VALUES
('Artisan Gelato Cup', 'FOOD', 'Desserts', 45.00, TRUE),
('Iced Berry Smoothie', 'DRINK', 'Cold Beverages', 65.00, TRUE);

INSERT INTO offers (code, title, discount_percent, active, min_spend) VALUES
('VIP10', 'Spend $50+ Save 10%', 10, TRUE, 50.00),
('EXPIRED15', 'Off-Season Inactive Promo', 15, FALSE, 0.00);
