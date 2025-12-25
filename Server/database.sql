CREATE TABLE residents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visitors (
    id SERIAL PRIMARY KEY,
    visitor_name VARCHAR(100) NOT NULL,
    visitor_email VARCHAR(100) NOT NULL,
    resident_name VARCHAR(100) NOT NULL,
    resident_email VARCHAR(100) NOT NULL,
    visit_reason TEXT NOT NULL,
    car_number VARCHAR(20),
    verification_code VARCHAR(4),
    status VARCHAR(20) DEFAULT 'pending',
    in_date DATE,
    in_time TIME,
    out_date DATE,
    out_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_email) REFERENCES residents(email)
);
