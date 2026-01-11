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
   ```bash
   # Create database
   createdb -U postgres scholarships

   # insert username at postgres
   
   # Run schema
   psql -U your_username -d scholarships -f schema.sql
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Run the server:**
   ```bash
   # Development mode (with ts-node)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify the server is running:**
   ```bash
   curl http://localhost:3000/health
   # Expected: {"status":"ok"}
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

### Additional endpoints (coming soon)
- `POST /api/students` - Create student profile
- `GET /api/scholarships` - List all scholarships
- `GET /api/students/:id/matches` - Get matched scholarships for a student

## Design Decisions
For detailed design decisions, see `design.md`.

## Assumptions
For detailed assumptions, see `assumptions.md`.

## Time Breakdown

**Stage 1: Database Design** | ~45 minutes | ✅ Completed |

**Stage 2: API Implementation** 


## AI Integration

**Option Chosen:**


## Project Structure

```
tuitionplanner/
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── db.ts                    # Database connection module
│   ├── middleware/
│   │   └── errorHandler.ts     # Error handling middleware
│   └── utils/
│       ├── idGenerator.ts       # Student ID generation
│       └── validation.ts        # Request validation helpers
├── schema.sql                   # Database schema
├── package.json
├── tsconfig.json
├── design.md                    # Detailed design decisions
├── assumptions.md               # Project assumptions
└── progress.md                  # Development progress tracking
```

## Known Limitations & Future Improvements


## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)
- `npm run dev` - Run TypeScript directly with ts-node (development)



