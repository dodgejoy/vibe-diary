'use client';

import { useState, useEffect } from 'react';
import { StickyNote, Save, Check } from 'lucide-react';

export function GameScratchpad({ gameId }: { gameId: string }) {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem(`scratchpad_${gameId}`);
    if (saved) setNotes(saved);
  }, [gameId]);

  const handleSave = () => {
    localStorage.setItem(`scratchpad_${gameId}`, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl overflow-hidden shadow-lg shadow-amber-500/5 group">
      <div className="bg-amber-500/20 px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
          <StickyNote size={16} />
          Быстрые Заметки
        </div>
        <button
          onClick={handleSave}
          className="text-amber-500/70 hover:text-amber-400 transition-colors"
          title="Сохранить заметки (также сохраняется в браузере)"
        >
          {isSaved ? <Check size={16} className="text-emerald-400" /> : <Save size={16} />}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          if (isSaved) setIsSaved(false);
        }}
        onBlur={handleSave} // Auto-save on blur
        placeholder="Где я остановился? Какие квесты сделать дальше? Пароль от того сейфа 0451..."
        className="w-full h-40 bg-slate-950/50 p-4 text-amber-100/90 placeholder-amber-500/30 resize-none focus:outline-none focus:bg-slate-950/80 transition-colors font-mono text-sm custom-scrollbar"
        spellCheck={false}
      />
    </div>
  );
}
