'use client';

import Link from 'next/link';
import { ExternalLink, Heart, Globe, MessageCircle, Gamepad2, GitBranch, Sparkles, Tag } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative border-t border-slate-800/60 bg-slate-950 overflow-hidden pt-16 pb-8">
      {/* Background ambient glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group inline-flex mb-6">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-violet-500/50 transition-colors">
                <Gamepad2 size={28} className="text-violet-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white">VIBE DIARY</span>
              </div>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
            
            <div className="flex items-center gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500 hover:bg-violet-500/10 transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-500 hover:bg-sky-500/10 transition-all">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
              Навигация
            </h3>
            <ul className="space-y-4 font-medium">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-[1px] bg-violet-400 group-hover:w-4 transition-all duration-300" />
                  {t('header.library')}
                </Link>
              </li>
              <li>
                <Link href="/add-game" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-[1px] bg-violet-400 group-hover:w-4 transition-all duration-300" />
                  {t('common.addGame')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Credits & Tech */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Работает на
            </h3>
            <div className="space-y-3">
              <a
                href="https://rawg.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-white font-bold">RAWG API</span>
                  <span className="text-xs text-slate-500 font-medium">{t('footer.rawgDesc')}</span>
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-emerald-400 font-bold">Supabase</span>
                  <span className="text-xs text-slate-500 font-medium">{t('footer.supabaseDesc')}</span>
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                    <GitBranch size={14} /> GitHub
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{t('footer.githubDesc')}</span>
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </a>
              <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-xl border border-violet-500/20 hover:border-violet-500/50 transition-all">
                <div className="flex flex-col">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-black flex items-center gap-1.5 drop-shadow-md">
                    <Sparkles size={14} className="text-fuchsia-400" /> Antigravity
                  </span>
                  <span className="text-[10px] uppercase font-bold text-violet-400/80 tracking-wider">{t('footer.antigravityDesc')}</span>
                </div>
                <Heart size={16} className="text-fuchsia-500/50 group-hover:text-fuchsia-500 group-hover:fill-fuchsia-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-500 font-medium text-sm flex items-center">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Tag size={12} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
            <span className="text-[10px] text-emerald-500/70 font-semibold uppercase tracking-wider">{t('footer.release')}</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800/80 text-sm font-medium text-slate-400">
            {t('footer.madeWith')}
            <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(243,24,103,0.5)]" /> 
            {t('footer.forGamers')}
          </div>
        </div>
      </div>
    </footer>
  );
}
