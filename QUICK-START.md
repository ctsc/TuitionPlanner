# Quick Start Guide

A fast setup guide to get the TuitionPlanner API running on your machine.

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## Step 1: Install Dependencies

```bash
cd tuitionplanner
npm install
```

## Step 2: Configure Environment

1. Copy `ENV-EXAMPLE.txt` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item ENV-EXAMPLE.txt .env
   
   # Linux/Mac
   cp ENV-EXAMPLE.txt .env
   ```

2. Edit `.env` and set your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/scholarships
   PORT=3000
   NODE_ENV=development
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```
   
   **Note:** Replace `username` and `password` with your PostgreSQL credentials. The `OPENAI_API_KEY` is optional - the API will work without it (explanations will show fallback messages).

## Step 3: Set Up Database

### Windows PowerShell:

```powershell
# Extract username and password from your DATABASE_URL in .env
# Then run:

# Set PostgreSQL password (replace with your actual password)
$env:PGPASSWORD = "your_password"

# If database already exists and you want to recreate it, drop it first:
# dropdb -U your_username scholarships

# Create database (replace 'your_username' with your PostgreSQL username)
createdb -U your_username scholarships

# Apply schema
psql -U your_username -d scholarships -f schema.sql
```

### Linux/Mac:

```bash
# Extract username and password from your DATABASE_URL in .env
# Then run:

# Set PostgreSQL password (replace with your actual password)
export PGPASSWORD="your_password"

# Create database (replace 'your_username' with your PostgreSQL username)
createdb -U your_username scholarships

# Apply schema
psql -U your_username -d scholarships -f schema.sql
```

**Alternative (will prompt for password):**
```bash
createdb -U your_username scholarships
psql -U your_username -d scholarships -f schema.sql
```

## Step 4: Build the Project

```bash
npm run build
```

## Step 5: Start the Server

```bash
# Development mode (auto-reload on changes)
npm run dev

# OR Production mode
npm start
```

You should see: `Server running on port 3000`

## Step 6: Test It Works

### Windows PowerShell:

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:3000/health

# Create a student
$body = @{
    name = "Test Student"
    email = "test@example.com"
    gpa = 3.5
    enrollment_status = "high_school_senior"
    citizenship_status = "US Citizen"
} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/students -Method POST -Body $body -ContentType "application/json"

# Get scholarships
Invoke-RestMethod -Uri http://localhost:3000/api/scholarships -Method GET
```

### Linux/Mac:

```bash
# Health check
curl http://localhost:3000/health

# Create a student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"test@example.com","gpa":3.5,"enrollment_status":"high_school_senior","citizenship_status":"US Citizen"}'

# Get scholarships
curl http://localhost:3000/api/scholarships
```

## Common Issues

### Database already exists when creating

If you get `database "scholarships" already exists`:

**Windows PowerShell:**
```powershell
$env:PGPASSWORD = "your_password"
dropdb -U your_username scholarships
createdb -U your_username scholarships
psql -U your_username -d scholarships -f schema.sql
```

**Linux/Mac:**
```bash
export PGPASSWORD="your_password"
dropdb -U your_username scholarships
createdb -U your_username scholarships
psql -U your_username -d scholarships -f schema.sql
```

### PostgreSQL not found in PATH

**Windows:**
- PostgreSQL is typically installed at: `C:\Program Files\PostgreSQL\[version]\bin`
- Add this to your system PATH, or use full path:
  ```powershell
  & "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U your_username scholarships
  ```

**Linux/Mac:**
- Ensure PostgreSQL bin directory is in your PATH
- Check with: `which psql`

### Database connection errors

- Verify PostgreSQL is running: `pg_isready`
- Check your `.env` file has correct `DATABASE_URL`
- Ensure database exists: `psql -U your_username -l` (should list `scholarships`)

### Port already in use

- Change `PORT` in `.env` to a different number (e.g., 3001)
- Or stop the process using port 3000

## Next Steps

- Read `README.md` for detailed API documentation
- Check `docs/design.md` for design decisions
- See `docs/assumptions.md` for project assumptions

## Need Help?

- Check the main `README.md` for detailed setup instructions
- Review error messages - they usually indicate what's missing
- Ensure all prerequisites are installed and configured
