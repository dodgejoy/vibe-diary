'use client';

import { ClockIcon, PlayCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'Not Started': {
      bg: 'bg-slate-600',
      text: 'text-slate-100',
      icon: (
        <ClockIcon size={14} />
      ),
      label: 'Not Started',
    },
    'Playing': {
      bg: 'bg-violet-600',
      text: 'text-violet-100',
      icon: (
        <PlayCircleIcon size={14} />
      ),
      label: 'Playing',
    },
    'Completed': {
      bg: 'bg-emerald-600',
      text: 'text-emerald-100',
      icon: (
        <CheckCircleIcon size={14} />
      ),
      label: 'Completed',
    },
    'Abandoned': {
      bg: 'bg-red-600',
      text: 'text-red-100',
      icon: (
        <XCircleIcon size={14} />
      ),
      label: 'Abandoned',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Not Started'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </div>
  );
}
