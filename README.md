# 🎮 Game Diary - Your Personal Gaming Journal

A modern, dark-themed web application built with **Next.js 16**, **Tailwind CSS**, and **Supabase**. Keep track of your gaming journey with style!

## 🌟 Features

- **Game Library**: Beautiful 3D card display with cover images and game logos
- **Game Search**: Integrated search powered by RAWG API (7,000+ games)
- **Detailed Game Pages**: 
  - Full-background image from game screenshots
  - Status tracking (Not Started, Playing, Completed, Abandoned)
  - **7-Criterion Detailed Rating System** (0-90 points):
    - Геймплей (0-20)
    - Визуал (0-15)
    - Атмосфера (0-15)
    - Звук (0-10)
    - Техническое состояние (0-10)
    - Контент/Реиграбельность (0-10)
    - Личное впечатление (0-10)
  - Personal notes editor
  - Screenshots gallery with modal viewer
  - Game metadata (developers, publishers, platforms, ratings)
  - Similar games recommendations
- **3D Effects**: Interactive card animations and drag-and-drop physics
- **Dark Theme**: Modern Slate and Violet color scheme with gradient effects
- **API Integration**: 
  - Game logos and metadata from RAWG API
  - Screenshot gallery from game database
  - Real-time game information updates
- **Responsive Design**: Mobile-first design, fully responsive
- **Real-time Updates**: Instant feedback on all interactions

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React (icons)
- **Database**: Supabase (PostgreSQL)
- **API**: RAWG Video Games Database API
- **Deployment Ready**: Vercel-optimized

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ and npm installed
- A Supabase account (free tier works great)
- (Optional) RAWG API key for game search functionality

## 🚀 Setup Instructions

### 1. Install Dependencies

All dependencies are already included in `package.json`. The project uses:

```
npm install
```

This installs:
- `next` - React framework
- `react` & `react-dom` - UI library
- `tailwindcss` - Styling
- `lucide-react` - Icon library
- `@supabase/supabase-js` - Supabase client
- `axios` - HTTP client for API calls

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Fill in your configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_RAWG_API_KEY=your_rawg_api_key_here
```

#### Getting Supabase Credentials:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy **Project URL** and **Anon Key**
5. Paste them into `.env.local`

#### Getting RAWG API Key (Optional):

1. Visit [rawg.io/api](https://rawg.io/api)
2. Create a free account
3. Generate an API key
4. Add it to `.env.local`

**Note**: The app has mock game data if RAWG API key is not configured, so you can test without it.

### 3. Set up Supabase Database

Run the SQL schema to create the `games` table:

```sql
-- Copy the entire content from database-schema.sql
-- Paste it in Supabase → SQL Editor → New Query
-- Click "Run"
```

**File location**: `database-schema.sql` (in project root)

The schema creates:
- `games` table with columns: id, title, cover_url, status, notes, rating, cover_id, release_date, genres, rawg_id, created_at, updated_at
- Proper indexes for performance
- Row-level security policies

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
game-diary/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── page.tsx           # Home/Library page
│   │   ├── add-game/          # Add game search page
│   │   ├── games/[id]/        # Game detail page
│   │   ├── layout.tsx         # Root layout with header
│   │   └── globals.css        # Global dark theme styles
│   │
│   ├── components/             # React components
│   │   ├── GameCard.tsx       # Individual game card
│   │   ├── GameGrid.tsx       # Games grid layout
│   │   ├── Header.tsx         # Navigation header
│   │   ├── StatusBadge.tsx    # Status display badge
│   │   ├── StatusSelector.tsx # Status edit component
│   │   ├── RatingSelector.tsx # Star rating component
│   │   ├── SearchBar.tsx      # Game search input
│   │   ├── SearchResults.tsx  # Search results display
│   │   ├── NoteEditor.tsx     # Notes textarea editor
│   │   └── index.ts           # Component exports
│   │
│   └── lib/                    # Utilities and services
│       ├── supabase.ts        # Supabase client & DB queries
│       └── rawg.ts            # RAWG API integration
│
├── public/                     # Static assets
├── .env.local.example         # Environment variables template
├── database-schema.sql        # SQL setup script
├── tailwind.config.ts         # Tailwind configuration (auto-generated)
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🎨 Color Scheme

The app uses a dark theme with:

- **Primary Colors**: Slate (50-950) - Cool grays for the main interface
- **Accent Colors**: Violet (400-700) - Vibrant purple for interactive elements
- **Status Colors**:
  - **Not Started**: Slate
  - **Playing**: Violet
  - **Completed**: Emerald (green)
  - **Abandoned**: Red

## 🎯 Key Pages & Features

### Home Page (`/`)
- Displays all games in your library
- Shows stats: total games, completed games, currently playing
- Game cards with cover images, title, and status
- Click any card to view full details

### Add Game Page (`/add-game`)
- Search for games by title
- View search results with ratings and genres
- Click "Add" to add a game to your diary
- Games start with "Not Started" status

### Game Detail Page (`/games/[id]`)
- Large game cover image
- Edit game status (Not Started → Playing → Completed or Abandoned)
- Rate games with 5-star system
- Write personal notes about the game
- View when game was added/last updated
- Remove game from diary

## 📚 Database Schema

The `games` table structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR | Game title |
| cover_url | TEXT | URL to game cover image |
| logo_url | TEXT | URL to game logo from RAWG API |
| status | VARCHAR | Current playthrough status |
| notes | TEXT | Personal notes about the game |
| detailed_ratings | JSONB | 7-criterion rating system (max 90 points) |
| cover_id | INTEGER | RAWG cover image ID |
| release_date | DATE | Game release date |
| genres | TEXT | Game genres (comma-separated) |
| rawg_id | INTEGER | Original RAWG API game ID |
| created_at | TIMESTAMP | When added to diary |
| updated_at | TIMESTAMP | Last modification time |

## 🔄 API Integration

### RAWG API
- **Purpose**: Search for games
- **Endpoint**: `https://api.rawg.io/api/games?search=...`
- **Fallback**: Mock game data included if API key not configured
- **Free Tier**: Adequate for personal use

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Deployment Settings
5. Deploy!

```bash
npm run build  # Build for production
npm start      # Run production server
```

## 📝 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```
## 📚 Documentation

This project includes comprehensive documentation for different needs:

### For New Developers
- **[QUICK-START.md](./QUICK-START.md)** - Quick reference with common commands, troubleshooting, and architecture overview
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Code style guide, best practices, and contribution workflow

### For Project Management
- **[ROADMAP.md](./ROADMAP.md)** - Feature roadmap, planned improvements, and implementation timeline
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history, completed features, and upgrade guides
- **[MODERNIZATION.md](./MODERNIZATION.md)** - Code audit report and technical improvements made

### Quick Navigation
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [QUICK-START.md](./QUICK-START.md) | Commands, troubleshooting, architecture | 5 min |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Code guidelines and best practices | 10 min |
| [ROADMAP.md](./ROADMAP.md) | Future features and phases | 10 min |
| [CHANGELOG.md](./CHANGELOG.md) | What's been done and version history | 5 min |
| [MODERNIZATION.md](./MODERNIZATION.md) | Technical audit and improvements | 15 min |
## � Database Migration Guide

If you're upgrading from an older version with the "5-star rating" system to the new "7-criterion detailed rating" system, run these SQL migrations in your Supabase SQL Editor:

### Migration Steps:

```sql
-- Add new columns if they don't exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS detailed_ratings JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Remove old rating column if present (WARNING: This deletes data!)
-- Only run if you're sure you want to remove old ratings
-- ALTER TABLE games DROP COLUMN IF EXISTS rating;
```

After running migrations:
1. Your existing games will still have their old data
2. Add the new migrations: you can now add detailed ratings to completed games
3. Game logos will be fetched automatically when you add new games

## �🐛 Troubleshooting

### Games Not Loading
- **Problem**: See "Connection Error" on home page
- **Solution**: Check your `.env.local` file for correct Supabase URL and API key

### Search Not Working
- **Problem**: Search returns no results or errors
- **Solution**: 
  - If using RAWG API, verify your API key is correct
  - Try the app without API key (uses mock data instead)
  - Check browser console for error messages

### Database Error When Adding Game
- **Problem**: Can't add games to database (401 Unauthorized / RLS policy error)
- **Solution**: 
  - Verify `games` table exists in Supabase
  - For development: Disable Row Level Security (RLS) on the `games` table:
    ```sql
    ALTER TABLE games DISABLE ROW LEVEL SECURITY;
    ```
  - Check your Supabase credentials in `.env.local`

## 📊 Data Attribution

This application uses game data and images from the **RAWG Video Games Database API**.

**RAWG API**: [https://rawg.io/api](https://rawg.io/api)

All game information, cover images, and metadata are sourced from RAWG and are owned by their respective game publishers and developers. This application is for personal use only and respects all copyright and intellectual property rights.
  - Check Row Level Security policies are enabled
  - Ensure database schema SQL was run correctly

### Tailwind CSS Not Working
- **Problem**: Styling appears broken
- **Solution**: 
  ```bash
  rm -rf .next
  npm run dev
  ```

## 🔐 Security Notes

- API keys are prefixed with `NEXT_PUBLIC_` so they're safe to expose (Supabase public API key, not secret)
- Database access is restricted via Row Level Security (RLS)
- Modify RLS policies in Supabase if you want to add authentication

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [RAWG API](https://rawg.io/api)
- [Lucide React Icons](https://lucide.dev)

## 📄 License

This project is open source and available under the MIT License.

## 🎮 Happy Gaming!

Track your gaming journey and never forget your epic moments. Enjoy! 🚀

---

**Have questions or found an issue?** Feel free to create an issue in the repository or check the troubleshooting section above.

