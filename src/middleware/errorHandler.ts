import { Request, Response, NextFunction } from 'express';
import { QueryResult } from 'pg';

/**
 * Error handling middleware for Express
 * Handles database errors, validation errors, and generic errors
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle PostgreSQL errors
  if (err.code && err.code.startsWith('23')) {
    // Unique violation (e.g., duplicate email)
    res.status(409).json({
      error: 'Conflict',
      message: err.detail || 'Duplicate entry',
    });
    return;
  }

  if (err.code && err.code.startsWith('22')) {
    // Data exception (e.g., invalid data type)
    res.status(400).json({
      error: 'Bad Request',
      message: err.message || 'Invalid data',
    });
    return;
  }

  // Handle validation errors (custom error with statusCode)
  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
    return;
  }

  // Handle generic errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
}
