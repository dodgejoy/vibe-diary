'use client';

import React from 'react';
import { Trophy, Star, Zap, Flame } from 'lucide-react';
import { Achievement } from '@/lib/supabase';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const rarityColors = {
  common: 'bg-slate-600 border-slate-500 text-slate-300',
  rare: 'bg-blue-600 border-blue-500 text-blue-100',
  epic: 'bg-purple-600 border-purple-500 text-purple-100',
  legendary: 'bg-yellow-600 border-yellow-500 text-yellow-100',
};

const rarityIconStyles = {
  common: 'text-slate-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
  legendary: 'text-yellow-300',
};

const sizeClasses = {
  sm: 'w-12 h-12 text-sm p-1',
  md: 'w-16 h-16 text-base p-2',
  lg: 'w-20 h-20 text-lg p-3',
};

function getRarityIcon(rarity: string) {
  switch (rarity) {
    case 'legendary':
      return <Trophy className="w-full h-full" />;
    case 'epic':
      return <Star className="w-full h-full" />;
    case 'rare':
      return <Zap className="w-full h-full" />;
    default:
      return <Flame className="w-full h-full" />;
  }
}

export function AchievementBadge({
  achievement,
  unlocked,
  progress = 0,
  showLabel = true,
  size = 'md',
  onClick,
}: AchievementBadgeProps) {
  const iconRarity = unlocked ? achievement.rarity : 'common';

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
      <div
        className={`relative flex items-center justify-center rounded-lg border-2 transition-all
          ${unlocked ? rarityColors[achievement.rarity as keyof typeof rarityColors] : 'bg-slate-800 border-slate-600 text-slate-500 opacity-50'}
          ${sizeClasses[size]}
          ${unlocked ? 'hover:shadow-lg hover:scale-105' : 'hover:opacity-70'}
        `}
      >
        {/* Icon */}
        <div
          className={`absolute ${rarityIconStyles[iconRarity as keyof typeof rarityIconStyles]}`}
          style={{ opacity: 0.15 }}
        >
          {getRarityIcon(iconRarity)}
        </div>

        {/* Achievement Icon/Emoji */}
        <div className="relative z-10 text-center font-bold">
          {achievement.icon}
        </div>

        {/* Progress Ring (if locked) */}
        {!unlocked && progress > 0 && (
          <div
            className="absolute inset-0 rounded-lg border-2 border-transparent border-t-violet-400 border-r-violet-400"
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
            }}
          />
        )}

        {/* Unlock Checkmark */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border border-emerald-400">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
      </div>

      {showLabel && (
        <div className="text-center">
          <p className={`text-xs font-semibold ${unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
            {achievement.name}
          </p>
          {!unlocked && progress > 0 && (
            <p className="text-xs text-slate-400">
              {progress}%
            </p>
          )}
          {unlocked && (
            <p className="text-xs text-yellow-400 font-semibold">
              +{achievement.reward_points} XP
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface AchievementGridProps {
  achievements: (Achievement & { unlocked: boolean; progress?: number })[];
  columns?: 2 | 3 | 4 | 5;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementGrid({
  achievements,
  columns = 3,
  size = 'md',
}: AchievementGridProps) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-6`}>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlocked={achievement.unlocked}
          progress={achievement.progress}
          showLabel={true}
          size={size}
        />
      ))}
    </div>
  );
}

interface AchievementShowcaseProps {
  title: string;
  achievements: (Achievement & { unlocked: boolean; progress?: number })[];
  maxDisplay?: number;
}

export function AchievementShowcase({
  title,
  achievements,
  maxDisplay = 6,
}: AchievementShowcaseProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const displayAchievements = achievements.slice(0, maxDisplay);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">
          {unlockedCount} / {achievements.length}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {displayAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={achievement.unlocked}
            progress={achievement.progress}
            showLabel={true}
            size="sm"
          />
        ))}
      </div>

      {achievements.length > maxDisplay && (
        <p className="text-xs text-slate-400">
          +{achievements.length - maxDisplay} more achievements available
        </p>
      )}
    </div>
  );
}
