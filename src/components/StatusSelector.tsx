'use client';

import { useState } from 'react';

interface StatusSelectorProps {
  value: string;
  onChange?: (status: string) => Promise<void>;
}

const STATUSES = ['Not Started', 'Playing', 'Completed', 'Abandoned'];

const STATUS_LABELS: Record<string, string> = {
  'Not Started': 'Не начата',
  'Playing': 'Играю',
  'Completed': 'Пройдена',
  'Abandoned': 'Заброшена',
};

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!onChange || newStatus === value) return;

    setIsSaving(true);
    try {
      await onChange(newStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        Статус
      </label>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value === status
                ? 'bg-violet-600 text-white border-2 border-violet-400'
                : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-violet-500'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {STATUS_LABELS[status] || status}
          </button>
        ))}
      </div>
    </div>
  );
}
