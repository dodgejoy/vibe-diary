# 🏆 Achievement System Implementation Guide

## Overview

A comprehensive achievement and badge system has been implemented for Game Diary. Players can unlock achievements as they track their gaming journey and earn XP points for various milestones.

---

## What Was Added

### 1. Database Schema
New tables added to `database-schema.sql`:

#### `achievements` Table
Stores all available achievement definitions.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,           -- Emoji or icon name
  category VARCHAR(50) NOT NULL,        -- 'games', 'ratings', etc.
  trigger_type VARCHAR(50) NOT NULL,    -- What causes achievement
  trigger_requirement JSONB NOT NULL,   -- Requirements JSON
  rarity VARCHAR(50) DEFAULT 'common',   -- common, rare, epic, legendary
  reward_points INTEGER DEFAULT 10,     -- XP for unlocking
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `user_achievements` Table
Tracks which achievements each user has unlocked.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  achievement_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  unlocked_at TIMESTAMP,
  progress INTEGER DEFAULT 0,            -- 0-100% progress
  created_at TIMESTAMP
);
```

#### `achievement_stats` Table
Stores aggregate statistics for each user.

```sql
CREATE TABLE achievement_stats (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  total_achievements INTEGER DEFAULT 0,
  total_reward_points INTEGER DEFAULT 0,
  last_achieved_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. Default Achievements (9 Available)

All achievements are automatically inserted when you run the schema:

#### Game Milestones
| Name | Description | Trigger | Reward | Rarity |
|------|-------------|---------|--------|--------|
| First Entry | Add your first game | game_count: 1 | 5 XP | Common |
| Collector | Add 10 games | game_count: 10 | 10 XP | Common |
| Completionist | Complete 5 games | complete 5 games | 20 XP | Rare |
| Explorer | Add 50 games | game_count: 50 | 50 XP | Epic |
| Marathon Runner | Add 100 games | game_count: 100 | 100 XP | Legendary |

#### Rating Milestones
| Name | Description | Trigger | Reward | Rarity |
|------|-------------|---------|--------|--------|
| Critic | Rate 10 games | rate 10 games | 10 XP | Common |
| Perfectionist | Get 90/90 rating | perfect_rating: 90 | 30 XP | Epic |
| Harsh Critic | Give low rating | rating < 20 | 15 XP | Rare |

#### Status Milestones
| Name | Description | Trigger | Reward | Rarity |
|------|-------------|---------|--------|--------|
| On a Roll | Have 5 games playing | concurrent: 5 | 25 XP | Rare |

---

## TypeScript Types

Added to `src/lib/supabase.ts`:

```typescript
export type Achievement = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'games' | 'ratings' | 'playtime' | 'collections';
  trigger_type: string;
  trigger_requirement: Record<string, any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward_points: number;
  created_at: string;
  updated_at: string;
};

export type UserAchievement = {
  id: string;
  achievement_id: string;
  user_id: string;
  unlocked_at: string;
  progress: number; // 0-100
  created_at: string;
};

export type AchievementStats = {
  id: string;
  user_id: string;
  total_achievements: number;
  total_reward_points: number;
  last_achieved_at?: string;
  created_at: string;
  updated_at: string;
};
```

---

## API Functions

### Reading Data
```typescript
// Get all available achievements
await fetchAchievements(): Promise<Achievement[]>

// Get user's unlocked achievements
await fetchUserAchievements(userId: string): Promise<UserAchievement[]>

// Get user's stats
await fetchAchievementStats(userId: string): Promise<AchievementStats | null>
```

### Modifying Data
```typescript
// Unlock an achievement for a user
await unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null>

// Update progress towards an achievement
await updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number  // 0-100
): Promise<UserAchievement | null>

// Auto-check and unlock achievements based on stats
await checkAchievements(userId: string): Promise<string[]>
```

---

## UI Components

### AchievementBadge
Displays a single achievement badge.

```typescript
interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

// Usage
<AchievementBadge
  achievement={achievement}
  unlocked={true}
  progress={100}
  size="md"
/>
```

**Features:**
- Color-coded by rarity (common/blue/purple/gold)
- Shows progress before unlock
- Displays unlock checkmark when earned
- Shows XP reward amount
- Responsive sizing

### AchievementGrid
Displays multiple achievements in a grid.

```typescript
interface AchievementGridProps {
  achievements: (Achievement & { unlocked: boolean; progress?: number })[];
  columns?: 2 | 3 | 4 | 5;
  size?: 'sm' | 'md' | 'lg';
}

// Usage
<AchievementGrid
  achievements={enrichedAchievements}
  columns={3}
  size="md"
/>
```

### AchievementShowcase
Shows achievements by category with completion %

```typescript
interface AchievementShowcaseProps {
  title: string;
  achievements: (Achievement & { unlocked: boolean; progress?: number })[];
  maxDisplay?: number;
}

// Usage
<AchievementShowcase
  title="Game Milestones"
  achievements={gameAchievements}
  maxDisplay={6}
/>
```

### AchievementsDisplay
Full-featured achievement display with stats modal.

```typescript
interface AchievementsDisplayProps {
  userId?: string;
  showStats?: boolean;
  compact?: boolean;
}

// Usage
<AchievementsDisplay
  userId="user123"
  showStats={true}
  compact={false}
/>
```

**Features:**
- Header stats (achievements unlocked, total XP, completion %)
- Categorized achievement display
- Interactive achievement detail modal
- Responsive layout
- Compact mode for sidebars

---

## New Routes

### `/achievements` Page
Dedicated achievements showcase page with:
- Full achievement grid with all categories
- User statistics dashboard
- Tips for unlocking achievements
- Achievement rarity explanation
- How achievements work guide

Browse at: `http://localhost:3000/achievements`

---

## Integration Points

### 1. Header Navigation
Added Trophy icon to header navigation:
```typescript
<Link href="/achievements">
  <Trophy size={18} />
  Achievements
</Link>
```

### 2. Game Detail Page (Ready to integrate)
Can add AchievementsDisplay to game detail page:
```typescript
<AchievementsDisplay
  userId={currentUser}
  compact={true}
/>
```

### 3. Auto-Achievement Checking
Hook into `addGame` and `updateGame` to check achievements:
```typescript
const newGame = await addGame(gameData);
if (newGame) {
  const unlockedIds = await checkAchievements(userId);
  if (unlockedIds.length > 0) {
    // Show toast: "New achievement unlocked!"
  }
}
```

---

## Database Migration

### For New Installations
Run `database-schema.sql` once - it includes all achievement tables and default achievements.

### For Existing Installations
Run just the achievement section:
```sql
-- From database-schema.sql lines 57-110 (Achievement System Tables)
CREATE TABLE achievements (...)
CREATE TABLE user_achievements (...)
CREATE TABLE achievement_stats (...)
CREATE INDEX idx_achievements_category ON achievements(category);
-- ... and all INSERT statements
```

---

## Achievement Trigger Types

### Implemented
- `game_count` - Total games added
- `status_change` - Games marked with specific status
- `rating_count` - Games given detailed ratings
- `perfect_rating` - Achieve score of 90/90
- `concurrent_playing` - Multiple games in "Playing" status

### Future Additions
- `genre_complete` - Complete X games in a genre
- `playtime_hours` - Track total playtime (when feature added)
- `monthly_streak` - Add games each month
- `note_milestone` - Write extensive notes
- `custom_events` - Custom achievement triggers

---

## Rarity & Colors

### Color Scheme
```
Common:    Gray    (bg-slate-600)
Rare:      Blue    (bg-blue-600)
Epic:      Purple  (bg-purple-600)
Legendary: Gold    (bg-yellow-600)
```

### Icon Codes
```
Common:    🔥 (Flame)
Rare:      ⚡ (Zap)
Epic:      ⭐ (Star)
Legendary: 🏆 (Trophy)
```

---

## Usage Examples

### Example 1: Display All Achievements
```typescript
import { AchievementsDisplay } from '@/components';

export default function Page() {
  return (
    <AchievementsDisplay userId="user123" showStats={true} />
  );
}
```

### Example 2: Show Compact Achievement List
```typescript
import { AchievementBadge } from '@/components';

export default function GameCard({ game }) {
  const achievements = [achievement1, achievement2];
  
  return (
    <div className="grid grid-cols-5 gap-2">
      {achievements.map(a => (
        <AchievementBadge
          key={a.id}
          achievement={a}
          unlocked={true}
          size="sm"
          showLabel={false}
        />
      ))}
    </div>
  );
}
```

### Example 3: Auto-Check & Unlock
```typescript
import { addGame, checkAchievements } from '@/lib/supabase';

async function handleAddGame(gameData) {
  const game = await addGame(gameData);
  if (game) {
    // Check for newly unlocked achievements
    const unlockedIds = await checkAchievements(userId);
    
    if (unlockedIds.length > 0) {
      // Show toast notification
      toast.success(`🎉 New achievement unlocked!`);
    }
  }
}
```

---

## Future Enhancements

### Phase 2 (v1.2)
- [ ] Toast notifications when achievements unlock
- [ ] Achievement progress bar system
- [ ] Share achievements on social media
- [ ] Achievement badges on user profile
- [ ] Statistics graphs for achievement data

### Phase 3 (v2.0)
- [ ] User authentication (per-user achievements)
- [ ] Leaderboard system (who has most XP?)
- [ ] Team achievements (group-based)
- [ ] Achievement trading/gifting
- [ ] Custom achievement creation for premium users

---

## Performance Notes

- All queries use proper indexes
- Achievement checking is O(n) where n = number of achievements (small set)
- Consider debouncing achievement checks if called frequently
- Use `compact={true}` for sidebar/card displays to reduce rendering

---

## Testing the System

### Manually Test Achievements
1. Navigate to `/achievements` page
2. Add games to trigger "First Entry", "Collector" achievements
3. Rate games to trigger "Critic", "Perfectionist" achievements
4. Mark games as "Completed" to trigger "Completionist"
5. Check Header Trophy link - should show unlocked count

### Test Specific Achievement
```typescript
// In browser console (development mode)
import { unlockAchievement } from '@/lib/supabase';
await unlockAchievement('test_user', 'achievement-id');
```

---

## Configuration

### Add New Built-in Achievement
Add to the INSERT statement in `database-schema.sql`:

```sql
INSERT INTO achievements (slug, name, description, icon, category, trigger_type, trigger_requirement, rarity, reward_points) VALUES
('new_achievement', 'Name', 'Description', '🎮', 'games', 'game_count', '{"count": 5}'::jsonb, 'rare', 20);
```

### Modify Trigger Requirements
Edit the JSON in `trigger_requirement` column:
```json
{"count": 10}
{"status": "completed", "count": 5}
{"score": 90}
{"hours": 100}
```

---

## Files Modified/Created

### New Files
- `src/components/AchievementBadge.tsx` (200 lines)
- `src/components/AchievementsDisplay.tsx` (240 lines)
- `src/app/achievements/page.tsx` (90 lines)
- `achievements-schema.sql` (Schema documentation)

### Modified Files
- `database-schema.sql` (Added achievement tables)
- `src/lib/supabase.ts` (Added types and functions)
- `src/components/Header.tsx` (Added achievements link)
- `src/components/index.ts` (Added component exports)

### Total Lines Added
- Components: ~530 lines
- API Functions: ~200 lines
- Database: ~60 lines
- Documentation: This file

---

## Troubleshooting

### Achievements Not Appearing
- Verify `achievements` table was created in Supabase
- Check that achievements were inserted (run `SELECT * FROM achievements;`)
- Confirm userId is being passed correctly

### Progress Not Updating
- Check that `user_achievements` table exists
- Verify achievement_id matches database entries
- Check browser console for network errors

### Unlock Animation Not Showing
- Ensure `unlocked` prop is set to true
- Check tailwind CSS is loading correctly
- Verify className syntax in AchievementBadge

---

**Last Updated**: Current Session
**Status**: ✅ Complete and Ready for Use
**Next Steps**: Integrate with game detail page, add toast notifications
