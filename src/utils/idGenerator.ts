import { query } from '../db';

/**
 * Generate the next sequential student ID (stu_001, stu_002, etc.)
 * @returns Promise<string> - The next student ID
 */
export async function generateStudentId(): Promise<string> {
  try {
    // Query for the maximum existing student ID
    const result = await query(
      `SELECT id FROM students 
       WHERE id LIKE 'stu_%' 
       ORDER BY CAST(SUBSTRING(id FROM 5) AS INTEGER) DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      // No students exist yet, start at stu_001
      return 'stu_001';
    }

    // Extract the number from the ID ("stu_001" -> 1)
    const maxId = result.rows[0].id;
    const numberPart = parseInt(maxId.substring(4), 10);

    if (isNaN(numberPart)) {
      // Fallback if parsing fails
      return 'stu_001';
    }

    // Increment and format with zero-padding
    const nextNumber = numberPart + 1;
    const formattedId = `stu_${nextNumber.toString().padStart(3, '0')}`;

    return formattedId;
  } catch (error) {
    console.error('Error generating student ID:', error);
    throw new Error('Failed to generate student ID');
  }
}
