'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Plus, Home, LogOut, UserCircle2, Shield, Flame } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTranslation } from '@/i18n';
import { useSiteSettings } from '@/lib/siteSettings';

export function Header() {
  const pathname = usePathname();
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const showPopularPage = settings.features.popularPage;

  const navItems = [
    { name: t('header.library'), path: '/', icon: Home },
    ...(showPopularPage ? [{ name: t('header.popular'), path: '/popular', icon: Flame }] : []),
    ...(isAdmin ? [{ name: t('header.admin'), path: '/admin', icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const headerStyle = settings.appearance.headerStyle;
  const isCompact = headerStyle === 'compact';
  const isMinimal = headerStyle === 'minimal';

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
      {/* Top glowing line — hidden in minimal */}
      {!isMinimal && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      )}
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between ${isCompact || isMinimal ? 'h-14' : 'h-20'}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-colors group">
          {!isMinimal && (
            <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-900/40 group-hover:shadow-violet-600/50 group-hover:scale-105 transition-all duration-300 ${isCompact ? 'w-9 h-9' : 'w-12 h-12'}`}>
              <Gamepad2 size={isCompact ? 18 : 24} className="text-white drop-shadow-md" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
            </div>
          )}
          <div className="hidden sm:flex flex-col">
            <span className={`font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all ${isCompact || isMinimal ? 'text-base' : 'text-xl'}`}>
              {settings.general.siteName.toUpperCase()}
            </span>
            {!isCompact && !isMinimal && (
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase -mt-1">
                {t('header.subtitle')}
              </span>
            )}
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {/* Nav links — show Популярное to everyone, Библиотека/Админ only to authenticated */}
          <div className="hidden md:flex items-center p-1 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            {navItems
              .filter(item => item.path !== '/popular' || showPopularPage)
              .filter(item => item.path === '/popular' || user)
              .map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-violet-400' : ''} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </div>

          {!isLoading && !user && (
            <Link
              href="/auth"
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <UserCircle2 size={20} strokeWidth={2.5} className="text-violet-600" />
              <span>{t('common.signIn')}</span>
            </Link>
          )}

          {user && (
            <>
              <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300">
                <UserCircle2 size={18} className="text-violet-400" />
                <span className="max-w-52 truncate text-sm font-medium">{profile?.email || user.email}</span>
                {isAdmin && (
                  <span className="ml-1 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Admin
                  </span>
                )}
              </div>

              <Link
                href="/add-game"
                className="group relative flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity blur-md" />
                <Plus size={20} strokeWidth={3} className="text-violet-600" />
                <span className="hidden sm:inline">{t('common.addGame')}</span>
              </Link>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all disabled:opacity-60"
              >
                <LogOut size={18} className="text-rose-400" />
                <span className="hidden sm:inline">{isSigningOut ? t('common.signingOut') : t('common.signOut')}</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
