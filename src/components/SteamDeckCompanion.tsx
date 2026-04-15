'use client';

import { useState, useCallback } from 'react';
import { Gamepad2, Settings2, CheckCircle2, AlertCircle, XCircle, HelpCircle, Save, Loader } from 'lucide-react';

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

  const statuses = [
    { id: 'verified', label: 'Verified', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20', activeBg: 'bg-emerald-500/30 border-emerald-500/50 ring-1 ring-emerald-500' },
    { id: 'playable', label: 'Playable', icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20', activeBg: 'bg-yellow-500/30 border-yellow-500/50 ring-1 ring-yellow-500' },
    { id: 'unsupported', label: 'Unsupported', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20', activeBg: 'bg-rose-500/30 border-rose-500/50 ring-1 ring-rose-500' },
    { id: 'unknown', label: 'Unknown', icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700 hover:bg-slate-700', activeBg: 'bg-slate-700 border-slate-500 ring-1 ring-slate-400' },
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
    <div className="bg-slate-900 shadow-xl border border-slate-800 rounded-2xl overflow-hidden relative group">
      {/* Cool Header matching Steam OS vibes */}
      <div className="bg-gradient-to-r from-[#1a9fff]/10 to-transparent p-5 border-b border-[#1a9fff]/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a9fff]/20 rounded-lg text-[#1a9fff]">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Steam Deck Companion</h3>
            <p className="text-sm text-[#1a9fff]/80 font-medium">Оптимизация и настройки консоли</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Status Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-300">Совместимость с Deck</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentStatus(s.id as SteamDeckStatus)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  currentStatus === s.id ? s.activeBg : s.bg
                }`}
              >
                <s.icon className={s.color} size={24} />
                <span className="text-xs font-bold text-slate-200">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Settings Config */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Settings2 size={16} className="text-slate-400" />
            Лучшие настройки (TDP, Proton, FSR)
          </label>
          <textarea
            value={currentSettings}
            onChange={(e) => setCurrentSettings(e.target.value)}
            placeholder="Например: Proton GE 8-3, TDP Limit 10W, 40 FPS / 40 Hz, FSR включен на 3 резкость..."
            className="w-full h-32 bg-slate-950/80 border border-slate-700 p-4 text-slate-300 placeholder-slate-600 rounded-xl focus:outline-none focus:border-[#1a9fff] focus:ring-1 focus:ring-[#1a9fff] transition-all resize-none shadow-inner"
          />
        </div>
      </div>

      {/* Save Footer */}
      <div className="px-5 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : isSaving
              ? 'bg-slate-700 text-slate-400'
              : hasChanges
              ? 'bg-[#1a9fff] hover:bg-[#118ae0] text-white shadow-lg shadow-[#1a9fff]/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isSaving ? (
            <><Loader size={18} className="animate-spin" /> Сохранение...</>
          ) : isSaved ? (
            <><CheckCircle2 size={18} /> Сохранено!</>
          ) : (
            <><Save size={18} /> Сохранить настройки</>
          )}
        </button>
      </div>
    </div>
  );
}
