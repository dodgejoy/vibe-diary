'use client';

import { useState } from 'react';
import { Bell, AlertTriangle, Check, X } from 'lucide-react';
import { useSiteSettings } from '@/lib/siteSettings';

export function AnnouncementBanner() {
  const { settings } = useSiteSettings();
  const [dismissed, setDismissed] = useState(false);
  const { announcements } = settings;

  if (!announcements.enabled || !announcements.text || dismissed) return null;

  const styles = {
    info: { border: 'border-sky-500/30', bg: 'bg-sky-500/10', text: 'text-sky-200', icon: Bell },
    warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-200', icon: AlertTriangle },
    success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-200', icon: Check },
  };

  const style = styles[announcements.type];
  const Icon = style.icon;

  return (
    <div className={`border-b ${style.border} ${style.bg} px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Icon size={18} className={`${style.text} shrink-0`} />
        <p className={`text-sm font-medium ${style.text} flex-1`}>{announcements.text}</p>
        {announcements.dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-white transition-colors shrink-0 p-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
