import { query } from '../db';
import { generateStudentId } from '../utils/idGenerator';
import {
  validateRequired,
  validateGPA,
  validateEmail,
  validatePositiveInteger,
} from '../utils/validation';

/**
 * Interface for student creation request
 */
export interface CreateStudentRequest {
  name: string;
  email: string;
  gpa: number;
  enrollment_status: string;
  citizenship_status: string;
  major?: string;
  graduation_year?: number;
  gender?: string;
  ethnicity?: string[];
  household_income?: number;
  first_generation?: boolean;
  military_affiliation?: string;
  residency?: string;
  community_service_hours?: number;
  state?: string;
}

/**
 * Interface for student response
 */
export interface StudentResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

/**
 * Calculate financial need from household income
 * Threshold: $50,000
 */
function calculateFinancialNeed(householdIncome?: number): boolean {
  if (householdIncome === undefined || householdIncome === null) {
    return false;
  }
  return householdIncome < 50000;
}

/**
 * Create a new student profile
 */
export async function createStudent(
  studentData: CreateStudentRequest
): Promise<StudentResponse> {
  // Validate required fields
  validateRequired(studentData, [
    'name',
    'email',
    'gpa',
    'enrollment_status',
    'citizenship_status',
  ]);

  // Validate data types
  validateEmail(studentData.email);
  validateGPA(studentData.gpa);

  // Validate optional numeric fields if provided
  if (studentData.household_income !== undefined) {
    validatePositiveInteger(studentData.household_income, 'household_income');
  }
  if (studentData.community_service_hours !== undefined) {
    validatePositiveInteger(
      studentData.community_service_hours,
      'community_service_hours'
    );
  }
  if (studentData.graduation_year !== undefined) {
    validatePositiveInteger(studentData.graduation_year, 'graduation_year');
  }

  // Calculate financial need
  const financialNeed = calculateFinancialNeed(studentData.household_income);

  // Generate student ID
  const studentId = await generateStudentId();

  // Insert student into database
  const insertQuery = `
    INSERT INTO students (
      id, email, name, gpa, enrollment_status, citizenship_status,
      major, graduation_year, gender, household_income, financial_need,
      first_generation, military_affiliation, residency,
      community_service_hours, state, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    RETURNING id, name, email, created_at
  `;

  const result = await query(insertQuery, [
    studentId,
    studentData.email,
    studentData.name,
    studentData.gpa,
    studentData.enrollment_status,
    studentData.citizenship_status,
    studentData.major || null,
    studentData.graduation_year || null,
    studentData.gender || null,
    studentData.household_income || null,
    financialNeed,
    studentData.first_generation || false,
    studentData.military_affiliation || null,
    studentData.residency || null,
    studentData.community_service_hours || null,
    studentData.state || null,
  ]);

  const student = result.rows[0];

  // Handle ethnicity array if provided
  if (studentData.ethnicity && studentData.ethnicity.length > 0) {
    // Insert each ethnicity separately for simplicity and safety
    for (const ethnicity of studentData.ethnicity) {
      await query(
        `INSERT INTO student_ethnicities (student_id, ethnicity)
         VALUES ($1, $2)
         ON CONFLICT (student_id, ethnicity) DO NOTHING`,
        [studentId, ethnicity]
      );
    }
  }

  // Format response
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    created_at: student.created_at.toISOString(),
  };
}

/**
 * Get student by ID
 */
export async function getStudentById(studentId: string): Promise<any> {
  const result = await query(
    `SELECT id, name, email, gpa, enrollment_status, citizenship_status,
            major, gender, financial_need, first_generation, residency,
            community_service_hours, military_affiliation, state
     FROM students
     WHERE id = $1`,
    [studentId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Get student ethnicities
  const ethnicityResult = await query(
    `SELECT ethnicity FROM student_ethnicities WHERE student_id = $1`,
    [studentId]
  );

  const student = result.rows[0];
  return {
    ...student,
    ethnicity: ethnicityResult.rows.map((row) => row.ethnicity),
  };
}
