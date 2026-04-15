'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Plus, Home, Trophy, Search } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Library', path: '/', icon: Home },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      {/* Top glowing line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-colors group">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-900/40 group-hover:shadow-violet-600/50 group-hover:scale-105 transition-all duration-300">
            <Gamepad2 size={24} className="text-white drop-shadow-md" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all">
              VIBE DIARY
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase -mt-1">
              Personal Vault
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex items-center p-1 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            {navItems.map((item) => {
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

          {/* Add Game Button (Primary Action) */}
          <Link
            href="/add-game"
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity blur-md" />
            <Plus size={20} strokeWidth={3} className="text-violet-600" />
            <span className="hidden sm:inline">Add Game</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
