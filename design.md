# Design Decisions


## Step 1

## Database Schema Design

### Normalization Strategy

Hybrid normalization with core tables and junction tables for many-to-many relationships.

**Rationale:** Core data in main tables; used junction tables instead of arrays for better indexing//easier querying (SQL IN clauses), and normalized structure.

**Alternatives:** PostgreSQL arrays (TEXT[]) and JSONB columns rejected due to limited indexing and harder query construction.

### Eligibility Criteria

Simple eligibility criteria *(gpa_minimum, first_generation, financial_need, gender, residency, community_service_hours_minimum)* 
Stored as nullable columns. Array-based criteria stored in junction tables.

**Rationale:** Nullable columns allow optional criteria (NULL = not required).

### Data Types
- **IDs:** VARCHAR(50) 
- **GPA:** DECIMAL(3,2) - 4.0 scale with CHECK constraint (0.0-4.0)
- **Amount:** INTEGER -  (can use NUMERIC(10,2) if decimals needed)
- **Dates:** DATE for deadlines, TIMESTAMP for created_at/updated_at
- **Arrays:** TEXT[] for application_requirements (read-only reference data)

### Indexing Strategy

Comprehensive indexing on all matching query fields.
Junction table indexes on both foreign key sides, and composite indexes for common query patterns.

Student fields *(gpa, enrollment_status, citizenship_status, major, financial_need, first_generation, gender, residency, etc.)*
Scholarship fields *(gpa_minimum, first_generation, financial_need, gender, residency, etc.)*


**Rationale:** Matching queries filter on multiple criteria simultaneously. Junction table indexes enable fast subqueries using IN/EXISTS.

### Field Name Conventions

Use snake_case matching JSON field names (e.g., `first_generation`, `citizenship_status`).

**Rationale:** Maintains consistency with JSON structure and PostgreSQL convention.

### Junction Table Design

Composite primary keys (scholarship_id/student_id + value) to prevent duplicates and provide natural keys.

### Empty Array Handling

Empty arrays in JSON result in no rows in junction table (e.g., `fields_of_study: []` = all majors eligible).

**Rationale:** Empty array means "no restrictions". Query logic: No rows = no filter applied.

