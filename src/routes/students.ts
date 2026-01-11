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
import { OpenAIService } from '../ai/openaiService';
import dotenv from 'dotenv';

dotenv.config();

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

      // Initialize AI service if OpenAI is configured
      let aiService: OpenAIService | null = null;
      if (process.env.AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
        try {
          aiService = new OpenAIService();
        } catch (error: any) {
          console.warn('OpenAI service initialization failed:', error.message);
        }
      }

      // Generate explanations for each matched scholarship
      const matches = await Promise.all(
        scholarships.map(async (scholarship) => {
          let explanation = 'Explanation pending - AI integration not configured';

          if (aiService) {
            try {
              explanation = await aiService.generateExplanation(
                student,
                scholarship
              );
            } catch (error: any) {
              console.error(
                `Failed to generate explanation for scholarship ${scholarship.id}:`,
                error.message
              );
              explanation =
                'Explanation could not be generated at this time. Please try again later.';
            }
          }

          return {
            scholarship: {
              id: scholarship.id,
              name: scholarship.name,
              amount: scholarship.amount,
              provider: scholarship.provider,
              deadline: scholarship.deadline,
              url: scholarship.url,
            },
            match_reasons: matchReasons.get(scholarship.id) || [],
            explanation,
          };
        })
      );

      // Format response
      const response = {
        student_id: student.id,
        student_name: student.name,
        total_matches: scholarships.length,
        total_potential_aid: totalPotentialAid,
        matches,
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;
