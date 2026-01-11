/**
 * Validation error class
 */
export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * Validate that required fields are present
 */
export function validateRequired(
  data: any,
  fields: string[]
): void {
  const missing: string[] = [];

  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validate GPA is in valid range (0.0 - 4.0)
 */
export function validateGPA(gpa: number): void {
  if (typeof gpa !== 'number' || isNaN(gpa)) {
    throw new ValidationError('GPA must be a number');
  }

  if (gpa < 0.0 || gpa > 4.0) {
    throw new ValidationError('GPA must be between 0.0 and 4.0');
  }
}

/**
 * Validate email format (basic validation)
 */
export function validateEmail(email: string): void {
  if (typeof email !== 'string') {
    throw new ValidationError('Email must be a string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

/**
 * Validate that a value is a positive integer
 */
export function validatePositiveInteger(value: number, fieldName: string): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }

  if (value < 0 || !Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
}
