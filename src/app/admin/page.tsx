'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shield, Star, UserCircle2, Users, Gamepad2, Trophy, Loader, Crown, RefreshCcw, Search, Trash2, Medal } from 'lucide-react';
import { useAuth } from '@/components';
import {
  deleteAnyGameAsAdmin,
  fetchAdminAchievementStats,
  fetchAdminGames,
  fetchAdminProfiles,
  fetchAdminUserAchievements,
  type AchievementStats,
  type AdminUserAchievement,
  type Game,
  type UserProfile,
  updateUserRole,
} from '@/lib/supabase';

type UserSummary = UserProfile & {
  gameCount: number;
  completedCount: number;
  ratedCount: number;
  achievementCount: number;
  totalXp: number;
  lastAchievedAt?: string;
};

export default function AdminPage() {
  const { profile, user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [achievementStats, setAchievementStats] = useState<AchievementStats[]>([]);
  const [userAchievements, setUserAchievements] = useState<AdminUserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [gameSearch, setGameSearch] = useState('');

  const loadDashboard = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);
    try {
      const [profileRows, gameRows, achievementStatRows, userAchievementRows] = await Promise.all([
        fetchAdminProfiles(),
        fetchAdminGames(),
        fetchAdminAchievementStats(),
        fetchAdminUserAchievements(),
      ]);

      setProfiles(profileRows);
      setGames(gameRows);
      setAchievementStats(achievementStatRows);
      setUserAchievements(userAchievementRows);
    } catch (loadError) {
      console.error(loadError);
      setError('Failed to load admin dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const userSummaries = useMemo<UserSummary[]>(() => {
    return profiles.map((profileItem) => {
      const userGames = games.filter((game) => game.user_id === profileItem.user_id);
      const stats = achievementStats.find((statsItem) => statsItem.user_id === profileItem.user_id);
      const unlocked = userAchievements.filter((achievement) => achievement.user_id === profileItem.user_id).length;

      return {
        ...profileItem,
        gameCount: userGames.length,
        completedCount: userGames.filter((game) => game.status === 'Completed').length,
        ratedCount: userGames.filter((game) => Boolean(game.detailed_ratings)).length,
        achievementCount: unlocked,
        totalXp: stats?.total_reward_points || 0,
        lastAchievedAt: stats?.last_achieved_at,
      };
    });
  }, [achievementStats, games, profiles, userAchievements]);

  const filteredUsers = useMemo(() => {
    return userSummaries.filter((profileItem) => {
      const matchesSearch = profileItem.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' ? true : profileItem.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, userSearch, userSummaries]);

  const totalUsers = userSummaries.length;
  const totalAdmins = userSummaries.filter((profileItem) => profileItem.role === 'admin').length;
  const totalGames = games.length;
  const totalCompletedGames = games.filter((game) => game.status === 'Completed').length;
  const totalUnlockedAchievements = userAchievements.length;
  const totalXp = achievementStats.reduce((sum, statsItem) => sum + (statsItem.total_reward_points || 0), 0);

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const ownerEmail = profiles.find((profileItem) => profileItem.user_id === game.user_id)?.email || 'Unknown user';
        const query = gameSearch.toLowerCase();
        return game.title.toLowerCase().includes(query) || ownerEmail.toLowerCase().includes(query);
      })
      .slice(0, 12)
      .map((game) => ({
      ...game,
      ownerEmail: profiles.find((profileItem) => profileItem.user_id === game.user_id)?.email || 'Unknown user',
    }));
  }, [gameSearch, games, profiles]);

  const topAchievementUsers = useMemo(() => {
    return [...userSummaries]
      .sort((left, right) => right.totalXp - left.totalXp || right.achievementCount - left.achievementCount)
      .slice(0, 5);
  }, [userSummaries]);

  const handleRoleChange = async (targetUserId: string, nextRole: UserProfile['role']) => {
    setUpdatingRoleId(targetUserId);
    try {
      const result = await updateUserRole(targetUserId, nextRole);
      if (result.error) {
        setError(result.error);
        return;
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profileItem) =>
          profileItem.user_id === targetUserId
            ? { ...profileItem, role: nextRole, updated_at: new Date().toISOString() }
            : profileItem
        )
      );
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    const confirmed = confirm('Delete this game from the database for its owner?');
    if (!confirmed) {
      return;
    }

    setDeletingGameId(gameId);
    try {
      const result = await deleteAnyGameAsAdmin(gameId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setGames((currentGames) => currentGames.filter((game) => game.id !== gameId));
    } finally {
      setDeletingGameId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader className="animate-spin text-amber-400" size={34} />
          <p className="text-slate-300 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-500/10 blur-[90px]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-300 text-sm font-semibold mb-5">
              <Shield size={18} />
              Admin Control Center
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-3">Control users, roles, and collection health</h1>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              This area is visible only to accounts whose profile role is set to <span className="text-slate-200 font-semibold">admin</span>. From here you can review all user profiles and promote trusted accounts.
            </p>
            <div className="mt-6">
              <button
                onClick={() => loadDashboard(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-60"
              >
                <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh data'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Users size={16} className="text-violet-400" />
              Users
            </div>
            <div className="text-3xl font-extrabold text-white">{totalUsers}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Crown size={16} className="text-amber-400" />
              Admins
            </div>
            <div className="text-3xl font-extrabold text-amber-300">{totalAdmins}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Gamepad2 size={16} className="text-sky-400" />
              Games tracked
            </div>
            <div className="text-3xl font-extrabold text-white">{totalGames}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Trophy size={16} className="text-emerald-400" />
              Completed
            </div>
            <div className="text-3xl font-extrabold text-emerald-300">{totalCompletedGames}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Medal size={16} className="text-fuchsia-400" />
              Unlocked
            </div>
            <div className="text-3xl font-extrabold text-fuchsia-300">{totalUnlockedAchievements}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Star size={16} className="text-yellow-400" />
              XP total
            </div>
            <div className="text-3xl font-extrabold text-yellow-300">{totalXp}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-slate-400 text-sm mb-2">Role</div>
            <div className="text-2xl font-extrabold text-amber-300 uppercase">{profile?.role ?? 'unknown'}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-slate-400 text-sm mb-2">Email</div>
            <div className="text-lg font-bold text-white break-all">{profile?.email || user?.email || 'unknown'}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-slate-400 text-sm mb-2">Status</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 font-semibold">
              <Star size={14} />
              Verified in app
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-5 text-white font-bold text-xl">
            <UserCircle2 size={20} className="text-violet-400" />
            Users and roles
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by email..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'all' | 'admin' | 'user')}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:outline-none focus:border-violet-500"
            >
              <option value="all">All roles</option>
              <option value="admin">Admins only</option>
              <option value="user">Users only</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Games</th>
                  <th className="pb-3 font-semibold">Completed</th>
                  <th className="pb-3 font-semibold">Rated</th>
                  <th className="pb-3 font-semibold">Achievements</th>
                  <th className="pb-3 font-semibold">XP</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((profileItem) => {
                  const isCurrentAdmin = profileItem.user_id === user?.id;
                  const nextRole = profileItem.role === 'admin' ? 'user' : 'admin';

                  return (
                    <tr key={profileItem.user_id} className="border-b border-white/5 last:border-0">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-white break-all">{profileItem.email}</div>
                        {isCurrentAdmin && (
                          <div className="text-xs text-slate-500 mt-1">Current session</div>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border ${
                          profileItem.role === 'admin'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800 text-slate-300'
                        }`}>
                          {profileItem.role}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{profileItem.gameCount}</td>
                      <td className="py-4 pr-4 text-slate-300">{profileItem.completedCount}</td>
                      <td className="py-4 pr-4 text-slate-300">{profileItem.ratedCount}</td>
                      <td className="py-4 pr-4 text-fuchsia-300 font-semibold">{profileItem.achievementCount}</td>
                      <td className="py-4 pr-4 text-yellow-300 font-semibold">{profileItem.totalXp}</td>
                      <td className="py-4">
                        <button
                          onClick={() => handleRoleChange(profileItem.user_id, nextRole)}
                          disabled={updatingRoleId === profileItem.user_id || (isCurrentAdmin && profileItem.role === 'admin')}
                          className={`rounded-xl px-4 py-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            profileItem.role === 'admin'
                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                          }`}
                        >
                          {updatingRoleId === profileItem.user_id
                            ? 'Updating...'
                            : profileItem.role === 'admin'
                            ? (isCurrentAdmin ? 'Current admin' : 'Make user')
                            : 'Make admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3 mb-5 text-white font-bold text-xl">
            <Trophy size={20} className="text-fuchsia-400" />
            Achievement leaders
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topAchievementUsers.length === 0 ? (
              <div className="text-slate-500">No achievement data yet.</div>
            ) : (
              topAchievementUsers.map((profileItem) => (
                <div key={profileItem.user_id} className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <div className="text-white font-semibold break-all mb-2">{profileItem.email}</div>
                  <div className="text-sm text-fuchsia-300">{profileItem.achievementCount} unlocked</div>
                  <div className="text-sm text-yellow-300 mt-1">{profileItem.totalXp} XP</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3 mb-5 text-white font-bold text-xl">
            <Gamepad2 size={20} className="text-sky-400" />
            Game moderation
          </div>

          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={gameSearch}
              onChange={(event) => setGameSearch(event.target.value)}
              placeholder="Search by game title or owner email..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-3">
            {filteredGames.length === 0 ? (
              <div className="text-slate-500">No games tracked yet.</div>
            ) : (
              filteredGames.map((game) => (
                <div key={game.id} className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{game.title}</div>
                    <div className="text-sm text-slate-500">Owner: {game.ownerEmail}</div>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-slate-300">
                      {game.status}
                    </span>
                    {game.detailed_ratings && (
                      <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-violet-300">
                        Rated
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      disabled={deletingGameId === game.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingGameId === game.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}