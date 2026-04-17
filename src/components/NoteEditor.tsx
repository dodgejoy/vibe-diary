'use client';

import { useState, useCallback } from 'react';
import { Save, Loader } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface NoteEditorProps {
  initialValue?: string;
  onSave?: (notes: string) => Promise<void>;
  placeholder?: string;
}

export function NoteEditor({ initialValue = '', onSave, placeholder }: NoteEditorProps) {
  const [notes, setNotes] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useTranslation();

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(notes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [notes, onSave]);

  const hasChanges = notes !== initialValue;

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={placeholder || t('noteEditor.placeholder')}
        className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {notes.length} {t('noteEditor.characters')}
        </span>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : isSaving
              ? 'bg-slate-700 text-slate-300 cursor-wait'
              : hasChanges
              ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <Loader size={16} className="animate-spin" />
              {t('noteEditor.saving')}
            </>
          ) : isSaved ? (
            <>
              <Save size={16} />
              {t('noteEditor.saved')}
            </>
          ) : (
            <>
              <Save size={16} />
              {t('noteEditor.save')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
