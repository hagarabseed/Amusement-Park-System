-- V4: Customer portal login accounts table
-- Customers can self-register and log in to book tickets online.
-- Separate from the staff 'users' table; linked 1-to-1 with the existing 'customers' table.

CREATE TABLE customer_accounts (
    id           BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT UNIQUE REFERENCES customers(id),
    email        VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name    VARCHAR(120) NOT NULL,
    phone        VARCHAR(20)  NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER'
                     CHECK (role IN ('CUSTOMER')),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_accounts_email ON customer_accounts(email);

-- Demo customer portal account (password: Pass@1234, same BCrypt hash as staff demo)
-- Links to the first seeded customer record
INSERT INTO customers (full_name, email, phone, wristband_balance, loyalty_points)
VALUES ('Sara Demo', 'sara.demo@example.com', '+201001234567', 150.00, 10)
ON CONFLICT DO NOTHING;

INSERT INTO customer_accounts (customer_id, email, password_hash, full_name, phone)
SELECT c.id,
       'sara.demo@example.com',
       '$2a$10$G1LxX4w5nlsBlzjdXw9kW.E.fso.m0exhMigaWtb6OL0vIzp1Zw2i',
       'Sara Demo',
       '+201001234567'
FROM customers c
WHERE c.email = 'sara.demo@example.com'
ON CONFLICT DO NOTHING;
