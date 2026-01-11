# Assumptions

## Database Schema Assumptions

### ID Format Preservation
IDs maintain existing format ("stu_001", "sch_001"). VARCHAR(50) provides sufficient length. Application code generates IDs.

### GPA Range
GPA values use 4.0 scale (maximum 4.0). CHECK constraint ensures 0.0-4.0 range.

### Financial Need Calculation
Financial need is boolean but can be calculated from household_income ($50,000 threshold per matching guide). Database stores both for flexibility.

### Nullable Eligibility Fields
NULL in scholarship eligibility means "not required" (not a filter). Matching queries must check for NULL before applying filter.

### Empty Fields of Study Array
Empty `fields_of_study` array means scholarship is open to all majors. Junction table has no rows; matching query handles "no rows = all eligible" case.

### Amount Storage
Amounts stored as whole dollars (INTEGER), not cents. Can change to NUMERIC(10,2) if decimals needed.

### Email Uniqueness
Student emails are unique (UNIQUE constraint). Application must validate uniqueness before insert.

### Timestamps
`created_at` and `updated_at` managed by application code or database triggers. UTC recommended for timezone consistency.

### Data Value Standards
- **Citizenship status:** Consistent strings ("US Citizen", "Permanent Resident", "DACA")
- **Enrollment status:** Standardized values ("high_school_senior", "undergraduate", "graduate")
- **Military affiliation:** "veteran", "active_duty", "dependent", or NULL
- **Ethnicity:** Free-form strings; students can have multiple
- **Residency:** "urban", "suburban", "rural", or NULL

**Implications:** Application must ensure consistent capitalization/spelling. Consider enums or lookup tables if values expand.

### Application Requirements Storage
Stored as PostgreSQL TEXT[] array (read-only reference data, simpler than junction table).

### Database Migration Strategy
Schema applied fresh using DROP TABLE IF EXISTS (take-home context). Production would need proper migration strategy.
