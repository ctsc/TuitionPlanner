# TuitionPlanner API

A scholarship matching API that helps students find relevant funding opportunities based on their academic profile, demographics, and financial situation. The API matches students with eligible scholarships and provides personalized explanations for each match.

## Tech Stack

- **Language:** TypeScript
- **Framework:** Express
- **Database:** PostgreSQL
- **Runtime:** Node.js

## Setup Instructions

> **💡 Quick Start:** For a fast setup guide, see [`QUICK-START.md`](QUICK-START.md)

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd tuitionplanner
   npm install
   ```

2. **Set up environment variables:**
   - Copy `ENV-EXAMPLE.txt` to `.env` (or create `.env` manually)
   - Configure your database connection and AI provider:
     ```env
     DATABASE_URL=postgresql://username:password@localhost:5432/scholarships
     PORT=3000
     NODE_ENV=development
     AI_PROVIDER=openai
     OPENAI_API_KEY=sk-your-openai-key-here
     ```
     **Note:** For AI explanations, set `AI_PROVIDER=openai` and add your `OPENAI_API_KEY`. See `API-KEY-SETUP.md` Option 2 for OpenAI setup instructions. If not configured, the API will return fallback messages for explanations.



## API Endpoints

### `GET /health`
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /api/students`
Create a new student profile.

**Request Body:**
```json
{
  "name": "Maria Garcia",
  "email": "maria@email.com",
  "gpa": 3.6,
  "enrollment_status": "high_school_senior",
  "citizenship_status": "US Citizen",
  "major": "Computer Science",
  "household_income": 42000,
  "first_generation": true,
  "state": "CA",
  "ethnicity": ["Hispanic", "Latino"]
}
```

**Response:** `201 Created`
```json
{
  "id": "stu_001",
  "name": "Maria Garcia",
  "email": "maria@email.com",
  "created_at": "2025-01-06T10:00:00Z"
}
```

### `GET /api/scholarships`
List all available scholarships.

**Response:** `200 OK`
```json
{
  "scholarships": [
    {
      "id": "sch_001",
      "name": "First Generation College Student Award",
      "amount": 5000,
      "deadline": "2025-03-15",
      "provider": "National Education Foundation"
    }
  ],
  "total": 12
}
```

### `GET /api/students/:id/matches`
Get matched scholarships for a student.

**Response:** `200 OK`
```json
{
  "student_id": "stu_001",
  "student_name": "Maria Garcia",
  "total_matches": 4,
  "total_potential_aid": 21500,
  "matches": [
    {
      "scholarship": {
        "id": "sch_001",
        "name": "First Generation College Student Award",
        "amount": 5000,
        "provider": "National Education Foundation",
        "deadline": "2025-03-15",
        "url": "https://example.org/first-gen-award"
      },
      "match_reasons": [
        "GPA requirement met (3.6 >= 2.5)",
        "First-generation student status",
        "Financial need demonstrated"
      ],
      "explanation": "The First Generation College Student Award is an excellent match for you. Your 3.6 GPA exceeds the 2.5 minimum requirement, and as a first-generation college student with demonstrated financial need, you embody this scholarship's mission. This $5,000 award from National Education Foundation could significantly support your educational goals."
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Student not found
- `400 Bad Request` - Invalid request data
- `409 Conflict` - Duplicate email
- `500 Internal Server Error` - Server error

## Design Decisions
For detailed design decisions, see `docs/design.md`.

## Assumptions
For detailed assumptions, see `docs/assumptions.md`.

## Project Documentation

All project documentation is located in the `docs/` directory:
- **`docs/design.md`** - Detailed design decisions for database schema and API implementation
- **`docs/assumptions.md`** - Project assumptions and data standards
- **`docs/progress.md`** - Development progress tracking with time breakdown

## Time Breakdown

**Stage 1: Database Design**
- Time: ~45 minutes
- Status: ✅ Completed

**Stage 2: API Implementation**
- Step 1-2: Project Setup and Core Infrastructure - ~35 minutes
- Step 3: POST /api/students Endpoint - ~25 minutes
- Step 4: GET /api/scholarships Endpoint - ~15 minutes
- Step 5: Matching Logic Implementation - ~35 minutes
- Step 6: GET /api/students/:id/matches Endpoint - ~35 minutes
- **Total Stage 2:** ~ (~2.5 hours)
- Status: ✅ Completed

**Stage 3: AI Integration**
- Time: ~45 minutes
- Status: ✅ Completed
- Implementation: Uses OpenAI API integration for personalized explanation generation

## AI Integration

**Implementation Status:** ✅ Complete

The API integrates with OpenAI's GPT-3.5-turbo model to generate personalized, 2-3 sentence explanations for why each scholarship matches a student. 

**Configuration:**
- Set `AI_PROVIDER=openai` in `.env`
- Add your `OPENAI_API_KEY` to `.env` (see `API-KEY-SETUP.md` Option 2 for setup instructions)
- When configured, explanations are generated automatically for each matched scholarship
- Falls back gracefully if API key is missing or API requests fail

**Features:**
- Personalized explanations referencing specific student qualifications (GPA, major, demographics, financial need, etc.)
- Comprehensive error handling (invalid keys, rate limits, network failures)
- Fallback messages when AI service is unavailable or not configured

## Project Structure

```
tuitionplanner/
├── src/
│   ├── index.ts                    # Express app entry point
│   ├── db.ts                       # Database connection module
│   ├── middleware/
│   │   └── errorHandler.ts        # Error handling middleware
│   ├── routes/
│   │   ├── students.ts            # Student routes (POST /api/students, GET /api/students/:id/matches)
│   │   └── scholarships.ts        # Scholarship routes (GET /api/scholarships)
│   ├── services/
│   │   ├── studentService.ts      # Student business logic
│   │   ├── scholarshipService.ts  # Scholarship business logic
│   │   └── matchingService.ts     # Matching logic
│   ├── ai/
│   │   └── openaiService.ts       # OpenAI service for explanation generation
│   └── utils/
│       ├── idGenerator.ts         # Student ID generation
│       └── validation.ts          # Request validation helpers
├── schema.sql                      # Database schema (PostgreSQL)
├── package.json
├── tsconfig.json
├── ENV-EXAMPLE.txt                 # Environment variables template
├── docs/
│   ├── design.md                   # Detailed design decisions
│   ├── assumptions.md              # Project assumptions
│   ├── progress.md                 # Development progress tracking
```

## Known Limitations & Future Improvements

### Current Limitations:
1. **No Pagination:** GET /api/scholarships returns all scholarships (acceptable for current dataset size of 12 scholarships).
2. **No Filtering/Sorting:** Scholarships endpoint doesn't support filtering or sorting parameters.
3. **No Authentication:** API endpoints are public (as per assignment requirements).
4. **AI Configuration Required:** OpenAI API key must be configured in `.env` for personalized explanations (falls back to error message if not configured).

### Future Improvements:
1. **Pagination:** Add pagination to scholarships endpoint for scalability with larger datasets.
2. **Caching:** Implement caching layer for frequently accessed scholarships to improve performance.
3. **Rate Limiting:** Add rate limiting for API endpoints to prevent abuse.
4. **Enhanced Validation:** Expand input validation with more comprehensive field-level checks.
5. **Tests:** Add even further comprehensive tests for matching logic, services, and API endpoints.
6. **API Documentation:** Generate OpenAPI/Swagger documentation for easier integration.
7. **Multiple AI Providers:** Support additional AI providers (Anthropic, HuggingFace) with provider switching.


## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)
- `npm run dev` - Run TypeScript directly with ts-node (development)



