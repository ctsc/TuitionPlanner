import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenAI service for generating personalized scholarship explanations
 */
export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is required. Please set it in your .env file.'
      );
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate a personalized explanation for why a scholarship matches a student
   * @param student - Student data
   * @param scholarship - Scholarship data
   * @returns Promise<string> - Personalized explanation (2-3 sentences)
   */
  async generateExplanation(
    student: any,
    scholarship: any
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(student, scholarship);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful scholarship advisor who writes personalized, encouraging explanations for why scholarships match students. Keep responses to 2-3 sentences and reference specific student qualifications.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const explanation =
        completion.choices[0].message.content?.trim() ||
        'Explanation could not be generated.';

      return explanation;
    } catch (error: any) {
      console.error('OpenAI API error:', error);

      // Handle specific error types
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env');
      }
      if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
      if (error.status === 503) {
        throw new Error('OpenAI API service is temporarily unavailable.');
      }

      // Generic error
      throw new Error(
        `Failed to generate explanation: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Build prompt for OpenAI API with student and scholarship details
   */
  private buildPrompt(student: any, scholarship: any): string {
    const studentDetails: string[] = [
      `Student: ${student.name}`,
      `GPA: ${student.gpa}`,
    ];

    if (student.major) {
      studentDetails.push(`Major: ${student.major}`);
    }
    studentDetails.push(`Enrollment Status: ${student.enrollment_status}`);

    if (student.first_generation) {
      studentDetails.push('First-generation college student');
    }
    if (student.financial_need) {
      studentDetails.push('Demonstrates financial need');
    }
    if (student.gender) {
      studentDetails.push(`Gender: ${student.gender}`);
    }
    if (student.residency) {
      studentDetails.push(`Residency: ${student.residency}`);
    }
    if (student.ethnicity && student.ethnicity.length > 0) {
      studentDetails.push(`Ethnicity: ${student.ethnicity.join(', ')}`);
    }
    if (student.military_affiliation) {
      studentDetails.push(`Military affiliation: ${student.military_affiliation}`);
    }
    if (student.community_service_hours) {
      studentDetails.push(
        `Community service: ${student.community_service_hours} hours`
      );
    }

    const scholarshipDetails: string[] = [
      `Scholarship: ${scholarship.name}`,
      `Amount: $${scholarship.amount.toLocaleString()}`,
      `Provider: ${scholarship.provider}`,
      `Minimum GPA: ${scholarship.gpa_minimum}`,
    ];

    if (scholarship.first_generation !== null) {
      scholarshipDetails.push(
        `First-generation required: ${scholarship.first_generation}`
      );
    }
    if (scholarship.financial_need !== null) {
      scholarshipDetails.push(
        `Financial need required: ${scholarship.financial_need}`
      );
    }
    if (scholarship.gender) {
      scholarshipDetails.push(`Gender requirement: ${scholarship.gender}`);
    }

    return `Explain why the "${scholarship.name}" scholarship is a good match for this student:

Student Qualifications:
${studentDetails.join('\n')}

Scholarship Details:
${scholarshipDetails.join('\n')}

Write an encouraging 2-3 sentence explanation that references specific student qualifications and explains why this scholarship is a good fit.`;
  }
}
