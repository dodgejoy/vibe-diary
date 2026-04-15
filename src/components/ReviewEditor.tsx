'use client';

import { useState, useCallback } from 'react';
import { Save, Loader, Plus, X, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface ReviewEditorProps {
  initialTitle?: string;
  initialPros?: string[];
  initialCons?: string[];
  initialNotes?: string;
  onSave: (data: { review_title: string; pros: string[]; cons: string[]; notes: string }) => Promise<void>;
}

export function ReviewEditor({
  initialTitle = '',
  initialPros = [],
  initialCons = [],
  initialNotes = '',
  onSave,
}: ReviewEditorProps) {
  const [title, setTitle] = useState(initialTitle || '');
  const [pros, setPros] = useState<string[]>(initialPros || []);
  const [cons, setCons] = useState<string[]>(initialCons || []);
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave({ review_title: title, pros, cons, notes });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [title, pros, cons, notes, onSave]);

  const addPro = () => {
    if (newPro.trim() && !pros.includes(newPro.trim())) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim() && !cons.includes(newCon.trim())) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Заголовок рецензии</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Отличная игра, но с плохой оптимизацией..."
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium text-lg shadow-inner"
        />
      </div>

      {/* Pros and Cons Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold">
            <ThumbsUp size={18} />
            Плюсы
          </div>
          <div className="space-y-3">
            {pros.map((pro, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-emerald-900/30 text-emerald-200 px-3 py-2 rounded-lg text-sm border border-emerald-800/50 group">
                <span className="flex-1">{pro}</span>
                <button onClick={() => removePro(idx)} className="text-emerald-500 hover:text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addPro)}
                placeholder="Добавить плюс..."
                className="flex-1 bg-slate-900/50 border border-slate-700/50 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
              <button 
                onClick={addPro}
                className="p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded-lg transition-colors border border-emerald-500/30"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Cons */}
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-semibold">
            <ThumbsDown size={18} />
            Минусы
          </div>
          <div className="space-y-3">
            {cons.map((con, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-rose-900/30 text-rose-200 px-3 py-2 rounded-lg text-sm border border-rose-800/50 group">
                <span className="flex-1">{con}</span>
                <button onClick={() => removeCon(idx)} className="text-rose-500 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addCon)}
                placeholder="Добавить минус..."
                className="flex-1 bg-slate-900/50 border border-slate-700/50 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-rose-500"
              />
              <button 
                onClick={addCon}
                className="p-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 rounded-lg transition-colors border border-rose-500/30"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Body */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
          <MessageSquare size={16} />
          Развернутое мнение (необязательно)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Распиши свои мысли о сюжете, геймплее, и общем впечатлении..."
          className="w-full h-48 px-4 py-4 bg-slate-900/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none shadow-inner leading-relaxed"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
            isSaved
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-900/20'
          }`}
        >
          {isSaving ? (
            <>
              <Loader size={18} className="animate-spin" />
              Сохранение...
            </>
          ) : isSaved ? (
            <>
              <Save size={18} />
              Сохранено!
            </>
          ) : (
            <>
              <Save size={18} />
              Сохранить рецензию
            </>
          )}
        </button>
      </div>
    </div>
  );
}
