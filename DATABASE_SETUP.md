# 🗄️ Database Setup & Migration Guide

## Quick Start: New Installation

If you're setting up Game Diary for the first time, follow these steps:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for initialization (1-2 minutes)

### 2. Get Connection Credentials
1. Go to **Settings → API**
2. Copy **Project URL**
3. Copy **Anon Key** (public key)
4. Store in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Create Database Schema
1. Go to Supabase **SQL Editor**
2. Click **New Query**
3. Copy entire content from `database-schema.sql`
4. Paste into editor
5. Click **Run**

**That's it!** Your database is ready.

---

## Detailed Schema Overview

### Main Table: `games`
```sql
CREATE TABLE public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  cover_url text,
  logo_url text,
  status text DEFAULT 'backlog',
  notes text,
  detailed_ratings jsonb,
  cover_id integer,
  release_date text,
  genres text[],
  rawg_id integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
```

**Columns:**
- `id` - Unique identifier (auto-generated)
- `title` - Game title (required)
- `cover_url` - URL to cover image (from RAWG)
- `logo_url` - URL to game logo (from RAWG)
- `status` - Current status (backlog|playing|completed|on_hold|dropped)
- `notes` - Personal notes (user-written)
- `detailed_ratings` - JSON object with 7-criteria ratings
- `cover_id` - RAWG cover image ID
- `release_date` - Game release date
- `genres` - Array of genre strings
- `rawg_id` - Original RAWG game ID
- `created_at` - Timestamp when added
- `updated_at` - Last modification timestamp

### detailed_ratings Structure
```typescript
{
  gameplay: number;      // 0-20
  visuals: number;       // 0-15
  atmosphere: number;    // 0-15
  sound: number;         // 0-10
  technical: number;     // 0-10
  content: number;       // 0-10
  impression: number;    // 0-10
  // Total max: 90 points
}
```

---

## Migration Guide: v0.x to v1.0

### ⚠️ Breaking Changes
The 5-star rating system has been replaced with a 7-criterion detailed rating system.

### Migration Steps

#### Step 1: Enable Extensions (if not already enabled)
```sql
-- Go to Supabase → SQL Editor → New Query
-- Paste and run:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Step 2: Add New Columns
```sql
-- Backup your data first!
-- Then run:
ALTER TABLE games ADD COLUMN IF NOT EXISTS detailed_ratings JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS logo_url TEXT;
```

#### Step 3: Remove Old Rating Column (Optional)
```sql
-- Only if you want to completely remove old 5-star ratings
-- WARNING: This permanently deletes the rating column
-- ALTER TABLE games DROP COLUMN IF EXISTS rating;
```

#### Step 4: Data Migration (if you want)
```sql
-- Example: Initialize detailed_ratings for all games
-- with a default structure (zeros)
UPDATE games
SET detailed_ratings = jsonb_build_object(
  'gameplay', 0,
  'visuals', 0,
  'atmosphere', 0,
  'sound', 0,
  'technical', 0,
  'content', 0,
  'impression', 0
)
WHERE detailed_ratings IS NULL;
```

#### Step 5: Check Results
```sql
-- Verify everything worked
SELECT COUNT(*) FROM games;
SELECT COUNT(*) FROM games WHERE detailed_ratings IS NOT NULL;
```

---

## Optional: Creating Indexes

For better performance, add indexes to frequently queried columns:

```sql
-- Index on status (for filtering)
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- Index on created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Index on rawg_id (for lookups)
CREATE INDEX IF NOT EXISTS idx_games_rawg_id ON games(rawg_id);

-- Index on genres (for searching)
CREATE INDEX IF NOT EXISTS idx_games_genres ON games USING GIN(genres);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_games_status_created 
  ON games(status, created_at DESC);
```

---

## Authentication Setup (Future)

When adding user authentication:

```sql
-- Add user_id column
ALTER TABLE games ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own games
CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own games
CREATE POLICY "Users can create their own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own games
CREATE POLICY "Users can update their own games"
  ON games FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own games
CREATE POLICY "Users can delete their own games"
  ON games FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Backup & Recovery

### Creating a Backup
```bash
# Using Supabase CLI
supabase db download > backup.sql

# Then store backup.sql safely
```

### Restoring from Backup
```sql
-- In Supabase SQL Editor, run your backup.sql file
-- Or use Supabase CLI:
# supabase db push < backup.sql
```

---

## Common Issues & Solutions

### Issue: "relation 'games' does not exist"
**Solution**: 
1. Check schema creation ran successfully
2. In Supabase, go to **SQL Editor**
3. Run: `SELECT * FROM public.games;`
4. If it fails, delete the table and re-run database-schema.sql

### Issue: "permission denied for schema public"
**Solution**:
1. Go to Supabase **Settings → Database → Roles**
2. Verify your anon role has SELECT, INSERT, UPDATE, DELETE permissions
3. Or temporarily disable RLS in Development:
   ```sql
   ALTER TABLE games DISABLE ROW LEVEL SECURITY;
   ```

### Issue: "JSON parsing error" when saving ratings
**Solution**:
1. Verify the JSON structure matches the types in `src/lib/supabase.ts`
2. Use JSON validation: `SELECT jsonb_valid(...)`
3. Check browser console for actual error message

### Issue: Data shows old 5-star ratings still present
**Solution**:
1. The migration doesn't delete old data automatically
2. Run this to see old ratings:
   ```sql
   SELECT id, title, rating FROM games WHERE rating IS NOT NULL;
   ```
3. Either manually update each game's detailed_ratings, or leave as-is

---

## Testing Queries

### Verify Database
```sql
-- Check table structure
\d games;

-- Count games
SELECT COUNT(*) as total_games FROM games;

-- Count by status
SELECT status, COUNT(*) FROM games GROUP BY status;

-- Find games with ratings
SELECT id, title, detailed_ratings FROM games 
WHERE detailed_ratings IS NOT NULL 
LIMIT 5;

-- Calculate average ratings
SELECT 
  AVG(detailed_ratings->>'gameplay'::int) as avg_gameplay,
  AVG(detailed_ratings->>'visuals'::int) as avg_visuals
FROM games 
WHERE detailed_ratings IS NOT NULL;
```

---

## Performance Tips

### Query Optimization
```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
  SELECT * FROM games WHERE status = 'completed' ORDER BY created_at DESC LIMIT 10;

-- Add indexes before large queries
CREATE INDEX idx_games_status ON games(status);
```

### Monitoring
```sql
-- Check table size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename = 'games';
```

---

## Version History

### v1.0 (Current)
- Detailed ratings (7-criteria, 90-point system)
- Logo support from RAWG API
- Status tracking
- Personal notes
- Full game metadata

### v0.9 (Previous)
- 5-star rating system (deprecated)
- Basic game tracking
- Simple notes

### Migration from v0.9 → v1.0
- See "Migration Guide" section above
- Supports both old and new rating systems during transition
- Old rating column can be dropped anytime

---

## Disaster Recovery

### If Database Gets Corrupted
1. Go to Supabase **Settings → Database → Backup**
2. Restore from available backup point
3. Or contact Supabase support if backups unavailable

### If Schema Gets Accidentally Modified
```sql
-- Restore from database-schema.sql
-- Add new columns only, don't drop existing data:
ALTER TABLE games ADD COLUMN IF NOT EXISTS [column_name] [type];
```

---

## Further Reading

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Basics](https://www.postgresql.org/docs/current/)
- [Game Diary Database Schema](./database-schema.sql)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Last Updated**: Current Session
**For Issues**: Check QUICK-START.md Troubleshooting section
