-- PostgreSQL Database Schema
-- 
-- This schema normalizes student and scholarship data with proper indexes and relationships.
-- 
--
-- Design decisions:
-- - normalized data stored in main tables (students, scholarships)
-- - Many-to-many relationships use junction tables for efficient querying
-- - Eligibility criteria flattened into scholarship table for simplicity
-- - Arrays stored in junction tables for better indexing and query performance

-- Drop all tables if they exist (for clean setup on re-run)
DROP TABLE IF EXISTS scholarship_tags CASCADE;
DROP TABLE IF EXISTS scholarship_ethnicity_eligibility CASCADE;
DROP TABLE IF EXISTS scholarship_military_affiliation_eligibility CASCADE;
DROP TABLE IF EXISTS scholarship_fields_of_study CASCADE;
DROP TABLE IF EXISTS scholarship_enrollment_status_eligibility CASCADE;
DROP TABLE IF EXISTS scholarship_citizenship_eligibility CASCADE;
DROP TABLE IF EXISTS student_ethnicities CASCADE;
DROP TABLE IF EXISTS scholarships CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Students table
-- Stores student academic, demographic, and financial information
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL CHECK (gpa >= 0.0 AND gpa <= 4.0),
    enrollment_status VARCHAR(50) NOT NULL,
    major VARCHAR(255),
    graduation_year INTEGER,
    gender VARCHAR(50),
    citizenship_status VARCHAR(100) NOT NULL,
    household_income INTEGER,
    financial_need BOOLEAN NOT NULL DEFAULT FALSE,
    first_generation BOOLEAN NOT NULL DEFAULT FALSE,
    military_affiliation VARCHAR(50),
    residency VARCHAR(50),
    community_service_hours INTEGER,
    state VARCHAR(2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scholarships table
-- Eligibility criteria are flattened as nullable columns (only set when required)
CREATE TABLE scholarships (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    amount_type VARCHAR(50) NOT NULL,
    deadline DATE NOT NULL,
    description TEXT,
    url VARCHAR(500),
    renewable BOOLEAN NOT NULL DEFAULT FALSE,
    renewable_conditions TEXT,
    application_requirements TEXT[],
    
    -- Eligibility criteria (flattened, nullable when not required)
    gpa_minimum DECIMAL(3,2) NOT NULL CHECK (gpa_minimum >= 0.0 AND gpa_minimum <= 4.0),
    first_generation BOOLEAN,
    financial_need BOOLEAN,
    gender VARCHAR(50),
    residency VARCHAR(50),
    community_service_hours_minimum INTEGER CHECK (community_service_hours_minimum >= 0),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


------------------------------------------------------------------------------------------------
-- JUNCTION TABLES (Many-to-Many Relationships) 
------------------------------------------------------------------------------------------------

-- Students can have multiple ethnicities
CREATE TABLE student_ethnicities (
    student_id VARCHAR(50) NOT NULL,
    ethnicity VARCHAR(100) NOT NULL,
    PRIMARY KEY (student_id, ethnicity),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Scholarships can accept multiple citizenship statuses
CREATE TABLE scholarship_citizenship_eligibility (
    scholarship_id VARCHAR(50) NOT NULL,
    citizenship_status VARCHAR(100) NOT NULL,
    PRIMARY KEY (scholarship_id, citizenship_status),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- Scholarships can accept multiple enrollment statuses
CREATE TABLE scholarship_enrollment_status_eligibility (
    scholarship_id VARCHAR(50) NOT NULL,
    enrollment_status VARCHAR(50) NOT NULL,
    PRIMARY KEY (scholarship_id, enrollment_status),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- Scholarships can target specific majors/fields
-- Empty array in JSON = no rows (all majors eligible)
CREATE TABLE scholarship_fields_of_study (
    scholarship_id VARCHAR(50) NOT NULL,
    field_of_study VARCHAR(255) NOT NULL,
    PRIMARY KEY (scholarship_id, field_of_study),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- Scholarships can accept multiple military affiliations
CREATE TABLE scholarship_military_affiliation_eligibility (
    scholarship_id VARCHAR(50) NOT NULL,
    military_affiliation VARCHAR(50) NOT NULL,
    PRIMARY KEY (scholarship_id, military_affiliation),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- Scholarships can target specific ethnicities
CREATE TABLE scholarship_ethnicity_eligibility (
    scholarship_id VARCHAR(50) NOT NULL,
    ethnicity VARCHAR(100) NOT NULL,
    PRIMARY KEY (scholarship_id, ethnicity),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- Tags for metadata and search functionality
CREATE TABLE scholarship_tags (
    scholarship_id VARCHAR(50) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (scholarship_id, tag),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);


------------------------------------------------------------------------------------------------
-- INDEXES
------------------------------------------------------------------------------------------------


-- Student indexes for matching queries
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_gpa ON students(gpa);
CREATE INDEX idx_students_enrollment_status ON students(enrollment_status);
CREATE INDEX idx_students_citizenship_status ON students(citizenship_status);
CREATE INDEX idx_students_major ON students(major);
CREATE INDEX idx_students_financial_need ON students(financial_need);
CREATE INDEX idx_students_first_generation ON students(first_generation);
CREATE INDEX idx_students_gender ON students(gender);
CREATE INDEX idx_students_residency ON students(residency);
CREATE INDEX idx_students_state ON students(state);
CREATE INDEX idx_students_community_service_hours ON students(community_service_hours);
CREATE INDEX idx_students_military_affiliation ON students(military_affiliation);


-- Scholarship indexes for matching queries
CREATE INDEX idx_scholarships_gpa_minimum ON scholarships(gpa_minimum);
CREATE INDEX idx_scholarships_first_generation ON scholarships(first_generation);
CREATE INDEX idx_scholarships_financial_need ON scholarships(financial_need);
CREATE INDEX idx_scholarships_gender ON scholarships(gender);
CREATE INDEX idx_scholarships_residency ON scholarships(residency);
CREATE INDEX idx_scholarships_community_service_hours_minimum ON scholarships(community_service_hours_minimum);
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarships_renewable ON scholarships(renewable);


-- Junction table indexes for efficient joins
CREATE INDEX idx_student_ethnicities_student_id ON student_ethnicities(student_id);
CREATE INDEX idx_student_ethnicities_ethnicity ON student_ethnicities(ethnicity);

CREATE INDEX idx_scholarship_citizenship_scholarship_id ON scholarship_citizenship_eligibility(scholarship_id);
CREATE INDEX idx_scholarship_citizenship_status ON scholarship_citizenship_eligibility(citizenship_status);

CREATE INDEX idx_scholarship_enrollment_scholarship_id ON scholarship_enrollment_status_eligibility(scholarship_id);
CREATE INDEX idx_scholarship_enrollment_status ON scholarship_enrollment_status_eligibility(enrollment_status);

CREATE INDEX idx_scholarship_fields_scholarship_id ON scholarship_fields_of_study(scholarship_id);
CREATE INDEX idx_scholarship_fields_field_of_study ON scholarship_fields_of_study(field_of_study);

CREATE INDEX idx_scholarship_military_scholarship_id ON scholarship_military_affiliation_eligibility(scholarship_id);
CREATE INDEX idx_scholarship_military_affiliation ON scholarship_military_affiliation_eligibility(military_affiliation);

CREATE INDEX idx_scholarship_ethnicity_scholarship_id ON scholarship_ethnicity_eligibility(scholarship_id);
CREATE INDEX idx_scholarship_ethnicity_ethnicity ON scholarship_ethnicity_eligibility(ethnicity);

CREATE INDEX idx_scholarship_tags_scholarship_id ON scholarship_tags(scholarship_id);
CREATE INDEX idx_scholarship_tags_tag ON scholarship_tags(tag);



-- Composite indexes for common query patterns


-- Query: Find scholarships matching student GPA and enrollment status
CREATE INDEX idx_scholarships_gpa_enrollment ON scholarships(gpa_minimum, id);

-- Query: Match students by GPA range and financial need
CREATE INDEX idx_students_gpa_financial ON students(gpa, financial_need, first_generation);
