import { Router, Request, Response, NextFunction } from 'express';
import {
  createStudent,
  CreateStudentRequest,
  getStudentById,
} from '../services/studentService';
import {
  getMatchingDetailsWithReasons,
} from '../services/matchingService';
import { ValidationError } from '../utils/validation';

const router = Router();

/**
 * POST /api/students
 * Create a new student profile
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentData: CreateStudentRequest = req.body;
      const student = await createStudent(studentData);

      res.status(201).json(student);
    } catch (error: any) {
      // Validation errors are already formatted
      if (error instanceof ValidationError) {
        return next(error);
      }

      // Handle duplicate email (PostgreSQL unique violation)
      if (error.code === '23505' && error.constraint === 'students_email_key') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already exists',
        });
      }

      // Handle other database errors
      next(error);
    }
  }
);

/**
 * GET /api/students/:id/matches
 * Get matched scholarships for a student
 */
router.get(
  '/:id/matches',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.params.id;

      // Get student by ID
      const student = await getStudentById(studentId);
      if (!student) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Student not found',
        });
      }

      // Get matching scholarships with details
      const { scholarships, matchReasons } =
        await getMatchingDetailsWithReasons(studentId, student);

      // Calculate total potential aid
      const totalPotentialAid = scholarships.reduce(
        (sum, scholarship) => sum + scholarship.amount,
        0
      );

      // Format response
      const response = {
        student_id: student.id,
        student_name: student.name,
        total_matches: scholarships.length,
        total_potential_aid: totalPotentialAid,
        matches: scholarships.map((scholarship) => ({
          scholarship: {
            id: scholarship.id,
            name: scholarship.name,
            amount: scholarship.amount,
            provider: scholarship.provider,
            deadline: scholarship.deadline,
            url: scholarship.url,
          },
          match_reasons: matchReasons.get(scholarship.id) || [],
          explanation:
            'Explanation pending - AI integration in progress',
        })),
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;
