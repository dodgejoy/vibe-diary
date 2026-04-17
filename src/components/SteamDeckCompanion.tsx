'use client';

import { useState, useCallback } from 'react';
import { Gamepad2, Settings2, CheckCircle2, AlertCircle, XCircle, HelpCircle, Save, Loader } from 'lucide-react';
import { useTranslation } from '@/i18n';

type SteamDeckStatus = 'verified' | 'playable' | 'unsupported' | 'unknown';

interface SteamDeckCompanionProps {
  status?: SteamDeckStatus;
  settings?: string;
  onSave: (data: { steam_deck_status: SteamDeckStatus; steam_deck_settings: string }) => Promise<void>;
}

export function SteamDeckCompanion({ status = 'unknown', settings = '', onSave }: SteamDeckCompanionProps) {
  const [currentStatus, setCurrentStatus] = useState<SteamDeckStatus>(status || 'unknown');
  const [currentSettings, setCurrentSettings] = useState(settings || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useTranslation();

  const statuses = [
    { id: 'verified', label: t('steamDeck.verified'), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20', activeBg: 'bg-emerald-500/30 border-emerald-500/50 ring-1 ring-emerald-500' },
    { id: 'playable', label: t('steamDeck.playable'), icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20', activeBg: 'bg-yellow-500/30 border-yellow-500/50 ring-1 ring-yellow-500' },
    { id: 'unsupported', label: t('steamDeck.unsupported'), icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20', activeBg: 'bg-rose-500/30 border-rose-500/50 ring-1 ring-rose-500' },
    { id: 'unknown', label: t('steamDeck.unknown'), icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700 hover:bg-slate-700', activeBg: 'bg-slate-700 border-slate-500 ring-1 ring-slate-400' },
  ];

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave({ steam_deck_status: currentStatus, steam_deck_settings: currentSettings });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [currentStatus, currentSettings, onSave]);

  const hasChanges = currentStatus !== status || currentSettings !== settings;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative group shadow-2xl">
      {/* Cool Header matching Steam OS vibes */}
      <div className="bg-gradient-to-r from-sky-600/20 via-indigo-600/10 to-transparent p-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform duration-300">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white tracking-tight">{t('steamDeck.title')}</h3>
            <p className="text-sm text-sky-400/80 font-bold uppercase tracking-widest mt-0.5">{t('steamDeck.settingsVault')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Status Selection */}
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('steamDeck.deckCompatibility')}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentStatus(s.id as SteamDeckStatus)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                  currentStatus === s.id 
                    ? s.activeBg + ' scale-105' 
                    : s.bg + ' grayscale-[0.5] hover:grayscale-0'
                }`}
              >
                <s.icon className={s.color} size={24} />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Settings Config */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Settings2 size={16} className="text-sky-400" />
            {t('steamDeck.settingsLabel')}
          </label>
          <div className="relative">
            <textarea
              value={currentSettings}
              onChange={(e) => setCurrentSettings(e.target.value)}
              placeholder={t('steamDeck.settingsPlaceholder')}
              className="w-full h-32 bg-slate-950/50 border border-white/5 p-4 text-slate-200 placeholder-slate-600 rounded-2xl focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all resize-none shadow-inner font-mono text-sm"
            />
            <div className="absolute bottom-3 right-3 opacity-20 pointer-events-none font-black text-sky-500 text-[10px]">CONFIG_FILE_v1</div>
          </div>
        </div>
      </div>

      {/* Save Footer */}
      <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
            isSaved
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : isSaving
              ? 'bg-slate-800 text-slate-500'
              : hasChanges
              ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-900/40 active:scale-95'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5'
          }`}
        >
          {isSaving ? (
            <><Loader size={16} className="animate-spin" /> {t('steamDeck.syncing')}</>
          ) : isSaved ? (
            <><CheckCircle2 size={16} /> {t('steamDeck.savedToCloud')}</>
          ) : (
            <><Save size={16} /> {t('steamDeck.applySettings')}</>
          )}
        </button>
      </div>
    </div>
  );
}
