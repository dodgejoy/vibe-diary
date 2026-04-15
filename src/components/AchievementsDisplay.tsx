'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import {
  fetchAchievements,
  fetchUserAchievements,
  fetchAchievementStats,
  Achievement,
  UserAchievement,
  AchievementStats,
} from '@/lib/supabase';
import { AchievementBadge, AchievementGrid } from './AchievementBadge';

interface AchievementsDisplayProps {
  userId?: string;
  showStats?: boolean;
  compact?: boolean;
}

export function AchievementsDisplay({
  userId = 'test_user', // Default for development
  showStats = true,
  compact = false,
}: AchievementsDisplayProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allAchievements, userAchieved, userStats] = await Promise.all([
          fetchAchievements(),
          fetchUserAchievements(userId),
          fetchAchievementStats(userId),
        ]);

        setAchievements(allAchievements);
        setUserAchievements(userAchieved);
        setStats(userStats);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const getAchievementWithStatus = (achievement: Achievement) => ({
    ...achievement,
    unlocked: userAchievements.some(ua => ua.achievement_id === achievement.id),
    progress: userAchievements.find(ua => ua.achievement_id === achievement.id)?.progress || 0,
  });

  const enrichedAchievements = achievements.map(getAchievementWithStatus);
  const unlockedCount = enrichedAchievements.filter(a => a.unlocked).length;
  const totalPoints = stats?.total_reward_points || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Trophy className="w-8 h-8 text-violet-400" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Achievements
          </h3>
          <p className="text-xs text-slate-400">
            {unlockedCount} / {achievements.length}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {enrichedAchievements.slice(0, 5).map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={achievement.unlocked}
              progress={achievement.progress}
              showLabel={false}
              size="sm"
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>

        {achievements.length > 5 && (
          <p className="text-xs text-slate-500">
            +{achievements.length - 5} more achievements
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Achievements Unlocked</p>
            <p className="text-2xl font-bold text-violet-400">
              {unlockedCount}
              <span className="text-sm text-slate-400 ml-1">/ {achievements.length}</span>
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Total XP</p>
            <p className="text-2xl font-bold text-yellow-400">{totalPoints}</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Completion</p>
            <p className="text-2xl font-bold text-emerald-400">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      {enrichedAchievements.length > 0 && (
        <div className="space-y-6">
          {['games', 'ratings', 'playtime', 'collections'].map((category) => {
            const categoryAchievements = enrichedAchievements.filter(a => a.category === category);
            if (categoryAchievements.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 capitalize">
                  {category.replace('_', ' ')} Achievements
                </h4>

                <AchievementGrid
                  achievements={categoryAchievements}
                  columns={3}
                  size="md"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedAchievement.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {selectedAchievement.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedAchievement.rarity.charAt(0).toUpperCase() + selectedAchievement.rarity.slice(1)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              {selectedAchievement.description}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Reward</span>
                <span className="text-sm font-semibold text-yellow-400">
                  +{selectedAchievement.reward_points} XP
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Category</span>
                <span className="text-xs text-slate-300 capitalize">
                  {selectedAchievement.category.replace('_', ' ')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Unlock Requirement</p>
                <p className="text-sm text-slate-300">
                  {selectedAchievement.trigger_type === 'game_count' &&
                    `Add ${selectedAchievement.trigger_requirement.count} games`}
                  {selectedAchievement.trigger_type === 'status_change' &&
                    `Complete ${selectedAchievement.trigger_requirement.count} games`}
                  {selectedAchievement.trigger_type === 'rating_count' &&
                    `Rate ${selectedAchievement.trigger_requirement.count} games`}
                  {selectedAchievement.trigger_type === 'perfect_rating' &&
                    `Achieve a perfect 90/90 rating`}
                  {selectedAchievement.trigger_type === 'concurrent_playing' &&
                    `Have ${selectedAchievement.trigger_requirement.count} games being played`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementsDisplay;
