CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('MANAGER', 'CASHIER', 'RIDE_OPERATOR')),
    assigned_station VARCHAR(100) NOT NULL DEFAULT 'Main Console',
    duty_status VARCHAR(20) NOT NULL DEFAULT 'ON_DUTY' CHECK (duty_status IN ('ON_DUTY', 'OFF_DUTY')),
    salary NUMERIC(10, 2) NOT NULL CHECK (salary >= 0)
);

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    wristband_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (wristband_balance >= 0),
    loyalty_points INT NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rides (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(40) NOT NULL CHECK (category IN ('ROLLER_COASTER', 'HORROR', 'KIDS', 'WATER', 'FAMILY')),
    capacity INT NOT NULL CHECK (capacity > 0),
    min_age INT NOT NULL CHECK (min_age >= 0),
    min_height_m NUMERIC(4, 2) NOT NULL CHECK (min_height_m >= 0),
    need_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    specific_details VARCHAR(255)
);

CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('FOOD', 'DRINK')),
    sub_category VARCHAR(60) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE offers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    offer_id BIGINT REFERENCES offers(id),
    tx_type VARCHAR(20) NOT NULL CHECK (tx_type IN ('TOPUP', 'TICKET', 'FOOD')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('WRISTBAND', 'CASH')),
    gross_amount NUMERIC(10, 2) NOT NULL CHECK (gross_amount > 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    net_amount NUMERIC(10, 2) NOT NULL CHECK (net_amount > 0),
    points_earned INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    transaction_id BIGINT NOT NULL REFERENCES transactions(id),
    pass_type VARCHAR(30) NOT NULL CHECK (pass_type IN ('REGULAR', 'VIP_FASTPASS', 'FAMILY')),
    price_paid NUMERIC(10, 2) NOT NULL CHECK (price_paid > 0),
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    transaction_id BIGINT NOT NULL REFERENCES transactions(id),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_email VARCHAR(150) NOT NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);