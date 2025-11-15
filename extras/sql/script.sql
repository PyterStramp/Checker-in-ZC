/* DDL */
--Gin Index
CREATE EXTENSION pg_trgm;

CREATE TABLE volunteers (
    volunteer_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE attendees (
    attendee_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    uni_name VARCHAR(100) NOT NULL,
    uni_id VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    ieee_membership VARCHAR(50),
    
    status VARCHAR(15) DEFAULT 'Pending' NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    checked_in_by INTEGER REFERENCES volunteers(volunteer_id)
);

-- Index for Fast Search
-- GIN Index for fast full-text/partial name searching (optimized for LIKE/ILKE queries)
CREATE INDEX idx_attendees_full_name_gin ON attendees USING GIN (full_name gin_trgm_ops);

-- B-Tree Index for quick exact matches on the unique ID
CREATE UNIQUE INDEX idx_attendees_uni_id ON attendees (uni_id);

CREATE TABLE issue_logs (
    log_id SERIAL PRIMARY KEY,
    issue_type VARCHAR(50) NOT NULL,
    issue_details TEXT NOT NULL,
    student_reference VARCHAR(100),
    
    reported_by INTEGER REFERENCES volunteers(volunteer_id) NOT NULL,
    report_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

