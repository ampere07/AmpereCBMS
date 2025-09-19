-- Database schema setup for AmpereCBMS
-- First create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS cbms;

-- Switch to the cbms database
USE cbms;

-- Create APP_REGIONS table
CREATE TABLE IF NOT EXISTS APP_REGIONS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create APP_CITIES table
CREATE TABLE IF NOT EXISTS APP_CITIES (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (region_id) REFERENCES APP_REGIONS(id)
);

-- Create APP_BARANGAYS table
CREATE TABLE IF NOT EXISTS APP_BARANGAYS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES APP_CITIES(id)
);

-- Create APP_VILLAGES table
CREATE TABLE IF NOT EXISTS APP_VILLAGES (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    barangay_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (barangay_id) REFERENCES APP_BARANGAYS(id)
);

-- Create APP_PLANS table
CREATE TABLE IF NOT EXISTS APP_PLANS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2)
);

-- Create APP_PARTNERS table
CREATE TABLE IF NOT EXISTS APP_PARTNERS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50)
);

-- Create APP_GROUPS table
CREATE TABLE IF NOT EXISTS APP_GROUPS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create the main APP_APPLICATIONS table with all foreign keys
CREATE TABLE IF NOT EXISTS APP_APPLICATIONS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Timestamps (as shown in diagram)
    create_date DATE,
    create_time TIME,
    update_date DATE,
    update_time TIME,
    
    -- Personal information
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(10),
    last_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    mobile_alt VARCHAR(20),
    
    -- Foreign keys for location (FK)
    region_id BIGINT,
    city_id BIGINT,
    borough_id BIGINT,   -- Equivalent to barangay_id in diagram
    village_id BIGINT,
    
    -- Address information
    address_line TEXT,
    landmark VARCHAR(255),
    nearest_landmark1 VARCHAR(255),
    nearest_landmark2 VARCHAR(255),
    
    -- Plan information
    plan_id BIGINT,
    promo_id BIGINT,
    
    -- Document paths
    proof_of_billing VARCHAR(255),
    gov_id_primary VARCHAR(255),
    gov_id_secondary VARCHAR(255),
    house_front_pic VARCHAR(255),
    room_pic VARCHAR(255),
    
    -- Consent information
    primary_consent BOOLEAN DEFAULT FALSE,
    primary_consent_at DATETIME,
    
    -- Tracking information
    source VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    status VARCHAR(50),
    
    -- Foreign keys for business logic (FK)
    portal_id BIGINT,
    group_id BIGINT,
    
    -- Foreign key constraints
    FOREIGN KEY (region_id) REFERENCES APP_REGIONS(id),
    FOREIGN KEY (city_id) REFERENCES APP_CITIES(id),
    FOREIGN KEY (borough_id) REFERENCES APP_BARANGAYS(id),
    FOREIGN KEY (village_id) REFERENCES APP_VILLAGES(id),
    FOREIGN KEY (plan_id) REFERENCES APP_PLANS(id),
    FOREIGN KEY (group_id) REFERENCES APP_GROUPS(id)
);

-- Create personal_access_tokens table for Laravel Sanctum
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE INDEX personal_access_tokens_token_unique (token),
    INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
);

-- Add indexes for improved query performance
CREATE INDEX idx_app_email ON APP_APPLICATIONS(email);
CREATE INDEX idx_app_region ON APP_APPLICATIONS(region_id);
CREATE INDEX idx_app_city ON APP_APPLICATIONS(city_id);
CREATE INDEX idx_app_borough ON APP_APPLICATIONS(borough_id);
CREATE INDEX idx_app_village ON APP_APPLICATIONS(village_id);
CREATE INDEX idx_app_plan ON APP_APPLICATIONS(plan_id);
CREATE INDEX idx_app_group ON APP_APPLICATIONS(group_id);
