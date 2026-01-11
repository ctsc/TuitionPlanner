import { query } from '../db';

/**
 * Interface for matched scholarship (basic)
 */
export interface MatchedScholarship {
  id: string;
  name: string;
  amount: number;
  provider: string;
  deadline: string;
  url: string | null;
}

/**
 * Interface for match with details (includes eligibility criteria)
 */
interface ScholarshipMatchDetails extends MatchedScholarship {
  gpa_minimum: number;
  first_generation: boolean | null;
  financial_need: boolean | null;
  gender: string | null;
  residency: string | null;
  community_service_hours_minimum: number | null;
}

/**
 * Find all scholarships that match a student's profile
 * @param studentId - The student's ID
 * @returns Array of matching scholarships
 */
export async function findMatchingScholarships(
  studentId: string
): Promise<MatchedScholarship[]> {
  // Complex matching query that filters scholarships by ALL eligibility criteria
  const matchingQuery = `
    SELECT DISTINCT s.id, s.name, s.amount, s.provider, s.deadline, s.url
    FROM scholarships s
    INNER JOIN students st ON st.id = $1
    WHERE 
      -- GPA requirement
      st.gpa >= s.gpa_minimum
      
      -- Enrollment status: student status must be in scholarship's allowed list
      AND EXISTS (
        SELECT 1 FROM scholarship_enrollment_status_eligibility ses
        WHERE ses.scholarship_id = s.id
        AND ses.enrollment_status = st.enrollment_status
      )
      
      -- Citizenship: student status must be in scholarship's allowed list
      AND EXISTS (
        SELECT 1 FROM scholarship_citizenship_eligibility sc
        WHERE sc.scholarship_id = s.id
        AND sc.citizenship_status = st.citizenship_status
      )
      
      -- Major/Field of Study: 
      -- Either scholarship has no fields_of_study (empty = all eligible)
      -- OR student's major is in scholarship's fields_of_study
      AND (
        NOT EXISTS (
          SELECT 1 FROM scholarship_fields_of_study sf
          WHERE sf.scholarship_id = s.id
        )
        OR EXISTS (
          SELECT 1 FROM scholarship_fields_of_study sf
          WHERE sf.scholarship_id = s.id
          AND sf.field_of_study = st.major
        )
      )
      
      -- First generation: NULL = not required, otherwise must match
      AND (s.first_generation IS NULL OR s.first_generation = st.first_generation)
      
      -- Financial need: NULL = not required, otherwise must match
      AND (s.financial_need IS NULL OR s.financial_need = st.financial_need)
      
      -- Gender: NULL = not required, otherwise must match
      AND (s.gender IS NULL OR s.gender = st.gender)
      
      -- Residency: NULL = not required, otherwise must match
      AND (s.residency IS NULL OR s.residency = st.residency)
      
      -- Community service hours: NULL = not required, otherwise student must meet minimum
      AND (s.community_service_hours_minimum IS NULL 
           OR st.community_service_hours IS NOT NULL 
           AND st.community_service_hours >= s.community_service_hours_minimum)
      
      -- Military affiliation: 
      -- Either scholarship has no military requirements (empty = not required)
      -- OR student's military_affiliation is in scholarship's allowed list
      AND (
        NOT EXISTS (
          SELECT 1 FROM scholarship_military_affiliation_eligibility sm
          WHERE sm.scholarship_id = s.id
        )
        OR (st.military_affiliation IS NOT NULL 
            AND EXISTS (
              SELECT 1 FROM scholarship_military_affiliation_eligibility sm
              WHERE sm.scholarship_id = s.id
              AND sm.military_affiliation = st.military_affiliation
            ))
      )
      
      -- Ethnicity:
      -- Either scholarship has no ethnicity requirements (empty = not required)
      -- OR student has at least one ethnicity that matches scholarship's allowed list
      AND (
        NOT EXISTS (
          SELECT 1 FROM scholarship_ethnicity_eligibility se
          WHERE se.scholarship_id = s.id
        )
        OR EXISTS (
          SELECT 1 FROM student_ethnicities ste
          INNER JOIN scholarship_ethnicity_eligibility se 
            ON se.scholarship_id = s.id 
            AND se.ethnicity = ste.ethnicity
          WHERE ste.student_id = st.id
        )
      )
    
    ORDER BY s.id ASC
  `;

  const result = await query(matchingQuery, [studentId]);

  // Format the response
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    provider: row.provider,
    deadline: row.deadline.toISOString().split('T')[0], // Format as YYYY-MM-DD
    url: row.url,
  }));
}

/**
 * Get detailed matching information with match_reasons
 */
export async function getMatchingDetailsWithReasons(
  studentId: string,
  student: any
): Promise<{
  scholarships: ScholarshipMatchDetails[];
  matchReasons: Map<string, string[]>;
}> {
  // Get matched scholarships with eligibility criteria
  const matchingQuery = `
    SELECT DISTINCT s.id, s.name, s.amount, s.provider, s.deadline, s.url,
           s.gpa_minimum, s.first_generation, s.financial_need, s.gender,
           s.residency, s.community_service_hours_minimum
    FROM scholarships s
    INNER JOIN students st ON st.id = $1
    WHERE 
      st.gpa >= s.gpa_minimum
      AND EXISTS (
        SELECT 1 FROM scholarship_enrollment_status_eligibility ses
        WHERE ses.scholarship_id = s.id
        AND ses.enrollment_status = st.enrollment_status
      )
      AND EXISTS (
        SELECT 1 FROM scholarship_citizenship_eligibility sc
        WHERE sc.scholarship_id = s.id
        AND sc.citizenship_status = st.citizenship_status
      )
      AND (
        NOT EXISTS (
          SELECT 1 FROM scholarship_fields_of_study sf
          WHERE sf.scholarship_id = s.id
        )
        OR EXISTS (
          SELECT 1 FROM scholarship_fields_of_study sf
          WHERE sf.scholarship_id = s.id
          AND sf.field_of_study = st.major
        )
      )
      AND (s.first_generation IS NULL OR s.first_generation = st.first_generation)
      AND (s.financial_need IS NULL OR s.financial_need = st.financial_need)
      AND (s.gender IS NULL OR s.gender = st.gender)
      AND (s.residency IS NULL OR s.residency = st.residency)
      AND (s.community_service_hours_minimum IS NULL 
           OR st.community_service_hours IS NOT NULL 
           AND st.community_service_hours >= s.community_service_hours_minimum)
      AND (
        NOT EXISTS (
          SELECT 1 FROM scholarship_military_affiliation_eligibility sm
          WHERE sm.scholarship_id = s.id
        )
        OR (st.military_affiliation IS NOT NULL 
            AND EXISTS (
              SELECT 1 FROM scholarship_military_affiliation_eligibility sm
              WHERE sm.scholarship_id = s.id
              AND sm.military_affiliation = st.military_affiliation
            ))
      )
      AND (
        NOT EXISTS (
          SELECT 1 FROM scholarship_ethnicity_eligibility se
          WHERE se.scholarship_id = s.id
        )
        OR EXISTS (
          SELECT 1 FROM student_ethnicities ste
          INNER JOIN scholarship_ethnicity_eligibility se 
            ON se.scholarship_id = s.id 
            AND se.ethnicity = ste.ethnicity
          WHERE ste.student_id = st.id
        )
      )
    ORDER BY s.id ASC
  `;

  const result = await query(matchingQuery, [studentId]);
  const scholarships: ScholarshipMatchDetails[] = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    provider: row.provider,
    deadline: row.deadline.toISOString().split('T')[0],
    url: row.url,
    gpa_minimum: parseFloat(row.gpa_minimum),
    first_generation: row.first_generation,
    financial_need: row.financial_need,
    gender: row.gender,
    residency: row.residency,
    community_service_hours_minimum: row.community_service_hours_minimum,
  }));

  // Generate match_reasons for each scholarship
  const matchReasons = new Map<string, string[]>();

  for (const scholarship of scholarships) {
    const reasons: string[] = [];

    // GPA (always required)
    reasons.push(
      `GPA requirement met (${student.gpa} >= ${scholarship.gpa_minimum})`
    );

    // First generation
    if (scholarship.first_generation !== null) {
      if (student.first_generation) {
        reasons.push('First-generation student status');
      }
    }

    // Financial need
    if (scholarship.financial_need !== null) {
      if (student.financial_need) {
        reasons.push('Financial need demonstrated');
      }
    }

    // Gender
    if (scholarship.gender !== null && student.gender === scholarship.gender) {
      reasons.push(`${scholarship.gender} student requirement met`);
    }

    // Residency
    if (
      scholarship.residency !== null &&
      student.residency === scholarship.residency
    ) {
      reasons.push(`${scholarship.residency} residency requirement met`);
    }

    // Community service
    if (scholarship.community_service_hours_minimum !== null) {
      if (
        student.community_service_hours !== null &&
        student.community_service_hours >= scholarship.community_service_hours_minimum
      ) {
        reasons.push(
          `${student.community_service_hours} hours of community service (exceeds ${scholarship.community_service_hours_minimum} minimum)`
        );
      }
    }

    // Major/Field of study - check if scholarship has specific fields
    const fieldsResult = await query(
      `SELECT field_of_study FROM scholarship_fields_of_study WHERE scholarship_id = $1`,
      [scholarship.id]
    );
    if (fieldsResult.rows.length > 0 && student.major) {
      reasons.push(`${student.major} major alignment`);
    }

    // Military affiliation - check if scholarship has requirements
    const militaryResult = await query(
      `SELECT military_affiliation FROM scholarship_military_affiliation_eligibility WHERE scholarship_id = $1`,
      [scholarship.id]
    );
    if (
      militaryResult.rows.length > 0 &&
      student.military_affiliation !== null
    ) {
      reasons.push('Military affiliation requirement met');
    }

    // Ethnicity - check if scholarship has requirements
    const ethnicityResult = await query(
      `SELECT ethnicity FROM scholarship_ethnicity_eligibility WHERE scholarship_id = $1`,
      [scholarship.id]
    );
    if (ethnicityResult.rows.length > 0 && student.ethnicity) {
      reasons.push('Ethnicity requirement met');
    }

    matchReasons.set(scholarship.id, reasons);
  }

  return { scholarships, matchReasons };
}
