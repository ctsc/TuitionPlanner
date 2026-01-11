# TuitionPlanner API

Scholarship matching API that helps students find relevant funding opportunities based on their profile.

## Tech Stack

- **Language:** TypeScript
- **Framework:** Express
- **Database:** PostgreSQL
- **Runtime:** Node.js

## Setup Instructions

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
   - Configure your database connection:
     ```env
     DATABASE_URL=postgresql://username:password@localhost:5432/scholarships
     PORT=3000
     NODE_ENV=development
     AI_PROVIDER=mock
     ```

3. **Create and set up the database:**

   Extract the username and password from your `DATABASE_URL` in `.env` (format: `postgresql://username:password@localhost:5432/scholarships`).

   **Windows PowerShell:**
   ```powershell
   # Set password from your DATABASE_URL (replace with your actual password)
   $env:PGPASSWORD = "your_password"
   
   # Create database (replace 'your_username' with username from DATABASE_URL)
   createdb -U your_username scholarships
   
   # Run schema to create database structure
   psql -U your_username -d scholarships -f schema.sql
   ```

   **Linux/Mac (Bash):**
   ```bash
   # Set password from your DATABASE_URL (replace with your actual password)
   export PGPASSWORD="your_password"
   
   # Create database (replace 'your_username' with username from DATABASE_URL)
   createdb -U your_username scholarships
   
   # Run schema to create database structure
   psql -U your_username -d scholarships -f schema.sql
   ```

   **Alternative (prompt for password):**
   ```bash
   # Will prompt for password when run
   createdb -U your_username scholarships
   psql -U your_username -d scholarships -f schema.sql
   ```

   **Note:** Replace `your_username` and `your_password` with the actual values from your `DATABASE_URL` in `.env`. The `schema.sql` file creates all necessary tables, indexes, and constraints.

4. **Load sample data (optional):**
   - Sample data files are available for reference but not automatically loaded
   - Use the API endpoints to create students and load scholarship data
   - See the API documentation below for endpoint usage

5. **Build the project:**
   ```bash
   npm run build
   ```

6. **Run the server:**
   ```bash
   # Development mode (with ts-node)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Verify the server is running:**
   ```bash
   curl http://localhost:3000/health
   # Expected: {"status":"ok"}
   ```

8. **Test the API endpoints:**
   ```bash
   # Create a student
   curl -X POST http://localhost:3000/api/students \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Student","email":"test@example.com","gpa":3.5,"enrollment_status":"high_school_senior","citizenship_status":"US Citizen"}'

   # Get all scholarships
   curl http://localhost:3000/api/scholarships

   # Get matches for a student (replace stu_001 with actual student ID)
   curl http://localhost:3000/api/students/stu_001/matches
   ```

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
      "explanation": "Explanation pending - AI integration in progress"
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
For detailed design decisions, see `design.md`.

## Assumptions
For detailed assumptions, see `assumptions.md`.

## Time Breakdown

**Stage 1: Database Design**
- Time: ~45 minutes
- Status: ✅ Completed

**Stage 2: API Implementation**
- Step 1-2: Project Setup and Core Infrastructure - ~35 minutes
- Step 3: POST /api/students Endpoint - ~22 minutes
- Step 4: GET /api/scholarships Endpoint - ~15 minutes
- Step 5: Matching Logic Implementation - ~35 minutes
- Step 6: GET /api/students/:id/matches Endpoint - ~35 minutes
- **Total Stage 2:** ~142 minutes (~2.4 hours)
- Status: ✅ Completed

**Stage 3: AI Integration**
- Status: ⏳ Not yet implemented (separate plan created: `ai-integration-plan.md`)
- Current: Placeholder explanation text used ("Explanation pending - AI integration in progress")

## AI Integration

**Current Status:** Placeholder text is used for explanations. AI integration is planned as a separate step (see `ai-integration-plan.md` for details).

**Planned Implementation:** OpenAI API integration (Option 2 from API-KEY-SETUP.md) using `gpt-3.5-turbo` model for personalized explanations.

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
│   └── utils/
│       ├── idGenerator.ts         # Student ID generation
│       └── validation.ts          # Request validation helpers
├── schema.sql                      # Database schema (PostgreSQL)
├── package.json
├── tsconfig.json
├── design.md                       # Detailed design decisions
├── assumptions.md                  # Project assumptions
├── progress.md                     # Development progress tracking
├── implementation-plan.md          # API implementation plan
└── ai-integration-plan.md          # AI integration plan (future)
```

## Known Limitations & Future Improvements

### Current Limitations:
1. **AI Explanations:** Currently using placeholder text. AI integration planned as separate step.
2. **No Pagination:** GET /api/scholarships returns all scholarships (fine for current dataset size).
3. **No Filtering/Sorting:** Scholarships endpoint doesn't support filtering or sorting parameters.
4. **No Authentication:** API endpoints are public (as per assignment requirements).

### Future Improvements:
1. **AI Integration:** Implement OpenAI API for personalized explanations (see `ai-integration-plan.md`).
2. **Pagination:** Add pagination to scholarships endpoint for large datasets.
3. **Caching:** Add caching layer for frequently accessed scholarships.
4. **Rate Limiting:** Implement rate limiting for API endpoints.
5. **Input Validation:** Enhance validation with more comprehensive checks.
6. **Unit Tests:** Add comprehensive unit tests for matching logic and services.
7. **API Documentation:** Generate OpenAPI/Swagger documentation.


## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)
- `npm run dev` - Run TypeScript directly with ts-node (development)



