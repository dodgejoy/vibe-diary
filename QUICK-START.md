# 🔧 Quick Reference Guide

## Getting Started

### Prerequisites
- Node.js 18+ (verify: `node --version`)
- npm or yarn
- Git

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd game-diary

# Install dependencies
npm install

# Create .env.local (copy from .env.example)
# Add your Supabase and RAWG API keys

# Start development server
npm run dev

# Visit http://localhost:3000
```

---

## 📋 Common Commands

### Development
```bash
# Start development server
npm run dev

# Run in production mode (local)
npm run build && npm run start

# Format code (Prettier)
npm run format

# Lint code (ESLint)
npm run lint

# Type check
npx tsc --noEmit
```

### Database
```bash
# Pull current schema from Supabase
npx supabase db pull

# Push migrations to Supabase
npx supabase db push

# View migrations
ls supabase/migrations/

# Seed development data (if exists)
npm run db:seed
```

### Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e

# Check test coverage
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### Issue: Can't connect to Supabase
**Solution:**
```bash
# 1. Check .env.local has correct values
# 2. Verify Supabase project is running in browser console
# 3. Check browser console for CORS errors
# 4. Verify Auth configuration in Supabase dashboard
```

### Issue: RAWG API returning 401
**Solution:**
```bash
# 1. Verify API key in .env.local: NEXT_PUBLIC_RAWG_API_KEY
# 2. Check API key is not expired
# 3. Verify rate limits haven't been exceeded
# 4. Test key: curl -H "User-Agent: GameDiary" 
#    "https://api.rawg.io/api/games?key=YOUR_KEY"
```

### Issue: Images not loading from RAWG
**Solution:**
```bash
# Already configured in next.config.ts for:
# - media.rawg.io
# - *.rawg.io
# - rawg.io
# If still failing, check:
# 1. Network tab in DevTools for blocked requests
# 2. CORS headers in response
# 3. Image URL format validity
```

### Issue: Type errors in TypeScript
**Solution:**
```bash
# 1. Clear cache: rm -rf .next
# 2. Reinstall deps: rm -rf node_modules && npm install
# 3. Type check: npx tsc --noEmit
# 4. Check src/lib/supabase.ts for type definitions
```

### Issue: Database migration failed
**Solution:**
```bash
# 1. Check current schema: 
#    SELECT * FROM information_schema.tables WHERE table_schema='public';
# 2. Rollback failed migration
# 3. Check database-schema.sql for correct SQL
# 4. Run migration step by step
# 5. Check Supabase dashboard for errors
```

### Issue: Build fails with "Cannot find module"
**Solution:**
```bash
# 1. Check path in import statement is correct
# 2. Verify file exists at that location
# 3. Check tsconfig.json paths/baseUrl
# 4. Clear .next cache: rm -rf .next
# 5. Reinstall: npm install --legacy-peer-deps
```

### Issue: Next.js dev server won't start
**Solution:**
```bash
# 1. Kill existing process: lsof -ti:3000 | xargs kill -9
# 2. Clear cache: rm -rf .next
# 3. Clear lock file: rm package-lock.json
# 4. Reinstall: npm install
# 5. Start fresh: npm run dev
```

---

## 🔑 Key Files Quick Reference

| File | Purpose | Edit When |
|------|---------|-----------|
| `.env.local` | Secrets & keys | Adding new API keys |
| `next.config.ts` | Next.js config | Changing image domains |
| `tsconfig.json` | TypeScript config | Changing module paths |
| `src/lib/supabase.ts` | Database types | Changing database schema |
| `src/lib/rawg.ts` | API client | Adding new RAWG endpoints |
| `database-schema.sql` | Database schema | Database changes |
| `CONTRIBUTING.md` | Code guidelines | Updating dev practices |
| `ROADMAP.md` | Future plans | New phase planning |

---

## 📚 Architecture Overview

```
User Request
    ↓
Next.js App Router (src/app)
    ↓
React Component (src/components)
    ↓
API Layer (src/lib)
    ├─ Supabase (Database)
    └─ RAWG (External API)
    ↓
Database / External API
    ↓
Response back to Component
```

### Data Flow Example: Adding a Game
```
1. User searches (SearchBar)
   ↓
2. Call rawg.searchGames(query)
   ↓
3. Display results (SearchResults)
   ↓
4. User clicks game
   ↓
5. Call addGame (Supabase)
   ↓
6. Save to database
   ↓
7. Redirect to game detail
```

---

## 🎨 Component Hierarchy

```
layout.tsx (Root)
├── Header
├── Main Content
│   ├── page.tsx (Home)
│   ├── add-game/page.tsx
│   │   └── SearchBar
│   │       └── SearchResults
│   │           └── GameCard
│   └── games/[id]/page.tsx
│       ├── DetailedRatingSelector
│       ├── RatingSelector
│       ├── StatusSelector
│       ├── ScreenshotGallery
│       ├── GameInfoPanel
│       └── SimilarGames
└── Footer (if exists)
```

---

## 🔄 State Management Patterns

### Local State (useState)
```typescript
// For component-specific state
const [games, setGames] = useState<Game[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

### Side Effects (useEffect)
```typescript
// For data fetching
useEffect(() => {
  fetchGames();
}, [dependencies]);
```

### Context (if needed future)
```typescript
// For global state (user, theme, etc.)
export const AppContext = createContext<AppContextType | null>(null);
```

---

## 📊 Database Quick Reference

### Main Table: `games`
```sql
-- Check schema
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'games';

-- Count games
SELECT COUNT(*) FROM games;

-- Find by status
SELECT * FROM games WHERE status = 'Playing';

-- Find by date
SELECT * FROM games 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Detailed Ratings Structure
```typescript
interface DetailedRatings {
  gameplay: number;      // 0-20
  visuals: number;       // 0-15
  atmosphere: number;    // 0-15
  sound: number;         // 0-10
  technical: number;     // 0-10
  content: number;       // 0-10
  impression: number;    // 0-10
}
```

---

## 🌐 API Endpoints

### RAWG Video Games Database
```
GET /games?search={query}              → Search games
GET /games/{id}                        → Get game details
GET /games/{id}/screenshots            → Get screenshots
GET /games/{id}/similar-games          → Get similar games
GET /games/{id}/stores                 → Get store links
GET /platforms                         → List platforms
GET /genres                            → List genres
```

### Supabase REST API
```
GET    /rest/v1/games                  → List all games
GET    /rest/v1/games?id=eq.{id}       → Get game
POST   /rest/v1/games                  → Create game
PATCH  /rest/v1/games?id=eq.{id}       → Update game
DELETE /rest/v1/games?id=eq.{id}       → Delete game
```

---

## 🚀 Performance Tips

### For Development
```bash
# Enable React DevTools Profiler
# Cmd+Shift+J → Components tab → Profiler

# Monitor Network requests
# DevTools → Network tab → throttle to simulate slow network
```

### Code Optimization
```typescript
// ❌ Bad: Re-renders on every parent update
export function GameCard({ game }) { ... }

// ✅ Good: Memoized, only re-renders if props change
export const GameCard = memo(({ game }: Props) => { ... });
```

### Image Optimization
```typescript
// ✅ Good: Let Next.js optimize
<Image 
  src={url} 
  alt="game" 
  width={400} 
  height={300}
  quality={75}
  priority={false}
/>
```

---

## 🧠 Remember

- **Always type your code** - catch errors early
- **Handle errors gracefully** - users appreciate feedback
- **Optimize images** - they're usually the bottleneck
- **Test before deployment** - in staging if possible
- **Keep it simple** - future you will thank you
- **Document as you code** - comments for why, not what
- **Use git branches** - one feature per branch
- **Review before merging** - catch issues early

---

## 📞 Need Help?

1. Check this guide first
2. Check CONTRIBUTING.md for best practices
3. Check ROADMAP.md for planned features
4. Check MODERNIZATION.md for implementation details
5. Search GitHub issues
6. Check Next.js + Supabase documentation

---

**Last Updated**: Current Session
**For Issues**: Check browser console and network tab first
