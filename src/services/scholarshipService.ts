import { query } from '../db';

/**
 * Interface for scholarship response
 */
export interface ScholarshipResponse {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  provider: string;
}

/**
 * Interface for scholarships list response
 */
export interface ScholarshipsListResponse {
  scholarships: ScholarshipResponse[];
  total: number;
}

/**
 * Get all scholarships
 */
export async function getAllScholarships(): Promise<ScholarshipsListResponse> {
  // Query all scholarships with only the fields needed for the API response
  const result = await query(
    `SELECT id, name, amount, deadline, provider
     FROM scholarships
     ORDER BY id ASC`
  );

  // Format the response
  const scholarships: ScholarshipResponse[] = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    deadline: row.deadline.toISOString().split('T')[0], // Format as YYYY-MM-DD
    provider: row.provider,
  }));

  return {
    scholarships,
    total: scholarships.length,
  };
}
