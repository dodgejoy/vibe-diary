'use client';

import { ClockIcon, PlayCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const statusConfig = {
    'Not Started': {
      bg: 'bg-slate-600',
      text: 'text-slate-100',
      icon: (
        <ClockIcon size={14} />
      ),
      label: t('status.notStarted'),
    },
    'Playing': {
      bg: 'bg-violet-600',
      text: 'text-violet-100',
      icon: (
        <PlayCircleIcon size={14} />
      ),
      label: t('status.playing'),
    },
    'Completed': {
      bg: 'bg-emerald-600',
      text: 'text-emerald-100',
      icon: (
        <CheckCircleIcon size={14} />
      ),
      label: t('status.completed'),
    },
    'Abandoned': {
      bg: 'bg-red-600',
      text: 'text-red-100',
      icon: (
        <XCircleIcon size={14} />
      ),
      label: t('status.abandoned'),
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
