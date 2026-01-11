import { Router, Request, Response, NextFunction } from 'express';
import { getAllScholarships } from '../services/scholarshipService';

const router = Router();

/**
 * GET /api/scholarships
 * List all available scholarships
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllScholarships();
      res.status(200).json(result);
    } catch (error: any) {
      // Pass errors to error handler middleware
      next(error);
    }
  }
);

export default router;
