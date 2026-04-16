'use client';

import { AchievementsDisplay } from '@/components';
import { useAuth } from '@/components';

export default function AchievementsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            🏆 Achievements
          </h1>
          <p className="text-slate-400">
            Unlock badges and earn XP points as you track your gaming journey
          </p>
        </div>

        {/* Achievements Display */}
        {user && (
          <AchievementsDisplay
            userId={user.id}
            showStats={true}
            compact={false}
          />
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 bg-slate-800/40 border border-slate-700/50 rounded-lg">
          <h2 className="text-lg font-bold text-slate-100 mb-4">How Achievements Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Unlock New Achievements</h3>
              <p>
                Achievements unlock automatically as you track your games. Add games, rate them, complete
                them, and watch your achievement collection grow!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Earn XP Points</h3>
              <p>
                Each achievement comes with XP points. Common achievements give 5-10 XP, while Legendary
                achievements can give up to 100 XP!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Achievement Rarities</h3>
              <p>
                Achievements come in four rarities: Common (gray), Rare (blue), Epic (purple), and Legendary
                (gold). Rare achievements are harder to unlock!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Track Your Progress</h3>
              <p>
                See your stats at the top: total achievements unlocked, XP earned, and completion
                percentage. Share your progress with friends!
              </p>
            </div>
          </div>
        </div>

        {/* Achievement Tips */}
        <div className="mt-8 space-y-3">
          <h3 className="font-bold text-slate-100">Tips to Unlock More Achievements:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
            <li>First Entry: Add your first game to start your achievement journey</li>
            <li>
              Collector: Build your library with 10+ games and earn the Collector badge
            </li>
            <li>
              Completionist: Mark 5 games as completed to show you&apos;re a true finisher
            </li>
            <li>
              Critic: Rate 10 games with detailed ratings to become a Critic
            </li>
            <li>
              Perfectionist: Challenge yourself to achieve a perfect 90/90 rating on a game
            </li>
            <li>
              Explorer: Add 50+ games to your library for the Explorer achievement
            </li>
            <li>
              Marathon Runner: Ultimate collector - track 100 games and become a Marathon Runner
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
