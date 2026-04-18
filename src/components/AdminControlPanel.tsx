'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Palette, Layout, Eye, EyeOff,
  Save, RotateCcw, Monitor, Smartphone,
  Image, Link2, Bell, Shield, Sparkles, Star, Gamepad2,
  Check, AlertTriangle, Sliders, FileText, MessageSquare,
  PaintBucket, Megaphone, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { type SiteSettings, DEFAULT_SETTINGS, deepMerge } from '@/lib/siteSettings';
import { fetchSiteSettings, saveSiteSettings } from '@/lib/supabase';

const ACCENT_COLORS = [
  { value: '#8b5cf6', label: 'Violet', class: 'bg-violet-500' },
  { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#10b981', label: 'Emerald', class: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', class: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#f97316', label: 'Orange', class: 'bg-orange-500' },
];

// --- Sub-components ---

function Toggle({ enabled, onChange, label, description }: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/60 transition-all group"
    >
      <div className="text-left">
        <div className="text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">
          {label}
        </div>
        {description && (
          <div className="text-xs text-slate-500 mt-0.5">{description}</div>
        )}
      </div>
      {enabled ? (
        <ToggleRight size={28} className="text-emerald-400 shrink-0" />
      ) : (
        <ToggleLeft size={28} className="text-slate-600 shrink-0" />
      )}
    </button>
  );
}

function SectionCard({ icon: Icon, title, children, accent = 'violet' }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: 'violet' | 'amber' | 'sky' | 'emerald' | 'rose';
}) {
  const accentMap = {
    violet: 'text-violet-400',
    amber: 'text-amber-400',
    sky: 'text-sky-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex items-center gap-3 mb-5">
        <Icon size={20} className={accentMap[accent]} />
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// --- Tabs ---

type TabId = 'general' | 'appearance' | 'features' | 'announcements';

// --- Main Component ---

export function AdminControlPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Load saved settings from Supabase
  useEffect(() => {
    async function load() {
      const remote = await fetchSiteSettings();
      if (remote) {
        const merged = deepMerge(DEFAULT_SETTINGS, remote) as SiteSettings;
        setSettings(merged);
        setSavedSettings(merged);
      }
    }
    load();
  }, []);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setSaveError(null);
    const result = await saveSiteSettings(settings);
    if (result.error) {
      setSaveStatus('error');
      setSaveError(result.error);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSavedSettings(settings);
      window.dispatchEvent(new Event('site-settings-updated'));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [settings]);

  const handleReset = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    setSaveStatus('saving');
    const result = await saveSiteSettings(DEFAULT_SETTINGS);
    if (!result.error) {
      setSavedSettings(DEFAULT_SETTINGS);
      window.dispatchEvent(new Event('site-settings-updated'));
    }
    setSaveStatus('idle');
  }, []);

  const updateGeneral = <K extends keyof SiteSettings['general']>(key: K, value: SiteSettings['general'][K]) => {
    setSettings(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));
  };

  const updateAppearance = <K extends keyof SiteSettings['appearance']>(key: K, value: SiteSettings['appearance'][K]) => {
    setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
  };

  const updateFeature = (key: keyof SiteSettings['features'], value: boolean) => {
    setSettings(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));
  };

  const updateAnnouncement = <K extends keyof SiteSettings['announcements']>(key: K, value: SiteSettings['announcements'][K]) => {
    setSettings(prev => ({ ...prev, announcements: { ...prev.announcements, [key]: value } }));
  };

  const tabs: { id: TabId; icon: React.ElementType; label: string }[] = [
    { id: 'general', icon: Settings, label: t('controlPanel.tabs.general') },
    { id: 'appearance', icon: Palette, label: t('controlPanel.tabs.appearance') },
    { id: 'features', icon: Sliders, label: t('controlPanel.tabs.features') },
    { id: 'announcements', icon: Megaphone, label: t('controlPanel.tabs.announcements') },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-violet-500/20 border border-violet-500/30 text-violet-200'
                : 'bg-slate-900/40 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Save Bar */}
      {(hasChanges || saveStatus === 'error') && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in ${
          saveStatus === 'error'
            ? 'border-rose-500/20 bg-rose-500/10'
            : 'border-amber-500/20 bg-amber-500/10'
        }`}>
          <AlertTriangle size={18} className={saveStatus === 'error' ? 'text-rose-400 shrink-0' : 'text-amber-400 shrink-0'} />
          <span className={`text-sm font-medium flex-1 ${saveStatus === 'error' ? 'text-rose-200' : 'text-amber-200'}`}>
            {saveStatus === 'error' ? (saveError || 'Error') : t('controlPanel.unsavedChanges')}
          </span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white text-sm font-semibold transition-all"
          >
            <RotateCcw size={14} />
            {t('controlPanel.resetDefaults')}
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all disabled:opacity-60"
          >
            {saveStatus === 'saving' ? (
              <RotateCcw size={14} className="animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {saveStatus === 'saving'
              ? t('controlPanel.saving')
              : saveStatus === 'saved'
              ? t('controlPanel.saved')
              : t('common.save')}
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="animate-in">
        {activeTab === 'general' && (
          <GeneralTab
            settings={settings.general}
            onUpdate={updateGeneral}
            t={t}
          />
        )}
        {activeTab === 'appearance' && (
          <AppearanceTab
            settings={settings.appearance}
            onUpdate={updateAppearance}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            t={t}
          />
        )}
        {activeTab === 'features' && (
          <FeaturesTab
            settings={settings.features}
            onUpdate={updateFeature}
            t={t}
          />
        )}
        {activeTab === 'announcements' && (
          <AnnouncementsTab
            settings={settings.announcements}
            onUpdate={updateAnnouncement}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

// --- General Tab ---

function GeneralTab({ settings, onUpdate, t }: {
  settings: SiteSettings['general'];
  onUpdate: <K extends keyof SiteSettings['general']>(key: K, value: SiteSettings['general'][K]) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard icon={FileText} title={t('controlPanel.general.siteInfo')} accent="violet">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {t('controlPanel.general.siteName')}
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => onUpdate('siteName', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {t('controlPanel.general.siteDescription')}
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => onUpdate('siteDescription', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {t('controlPanel.general.maxGames')}
            </label>
            <input
              type="number"
              value={settings.maxGamesPerUser}
              onChange={(e) => onUpdate('maxGamesPerUser', Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={10000}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Shield} title={t('controlPanel.general.access')} accent="amber">
        <Toggle
          enabled={settings.maintenanceMode}
          onChange={(val) => onUpdate('maintenanceMode', val)}
          label={t('controlPanel.general.maintenance')}
          description={t('controlPanel.general.maintenanceDesc')}
        />
        <Toggle
          enabled={settings.registrationOpen}
          onChange={(val) => onUpdate('registrationOpen', val)}
          label={t('controlPanel.general.registration')}
          description={t('controlPanel.general.registrationDesc')}
        />
      </SectionCard>
    </div>
  );
}

// --- Appearance Tab ---

function AppearanceTab({ settings, onUpdate, previewMode, setPreviewMode, t }: {
  settings: SiteSettings['appearance'];
  onUpdate: <K extends keyof SiteSettings['appearance']>(key: K, value: SiteSettings['appearance'][K]) => void;
  previewMode: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard icon={PaintBucket} title={t('controlPanel.appearance.accentColor')} accent="violet">
        <div className="grid grid-cols-4 gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onUpdate('accentColor', color.value)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                settings.accentColor === color.value
                  ? 'border-white/30 bg-white/5 scale-105'
                  : 'border-white/5 hover:border-white/15 hover:bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${color.class} shadow-lg`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {color.label}
              </span>
              {settings.accentColor === color.value && (
                <Check size={12} className="absolute top-2 right-2 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Layout} title={t('controlPanel.appearance.layout')} accent="sky">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            {t('controlPanel.appearance.headerStyle')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['default', 'compact', 'minimal'] as const).map((style) => (
              <button
                key={style}
                onClick={() => onUpdate('headerStyle', style)}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  settings.headerStyle === style
                    ? 'bg-sky-500/20 border border-sky-500/30 text-sky-200'
                    : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t(`controlPanel.appearance.header_${style}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            {t('controlPanel.appearance.cardStyle')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['default', '3d', 'flat'] as const).map((style) => (
              <button
                key={style}
                onClick={() => onUpdate('cardStyle', style)}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  settings.cardStyle === style
                    ? 'bg-sky-500/20 border border-sky-500/30 text-sky-200'
                    : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t(`controlPanel.appearance.card_${style}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            {t('controlPanel.appearance.corners')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onUpdate('borderRadius', size)}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  settings.borderRadius === size
                    ? 'bg-sky-500/20 border border-sky-500/30 text-sky-200'
                    : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t(`controlPanel.appearance.radius_${size}`)}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Sparkles} title={t('controlPanel.appearance.effects')} accent="emerald">
        <Toggle
          enabled={settings.showAnimations}
          onChange={(val) => onUpdate('showAnimations', val)}
          label={t('controlPanel.appearance.animations')}
          description={t('controlPanel.appearance.animationsDesc')}
        />
        <Toggle
          enabled={settings.showParticles}
          onChange={(val) => onUpdate('showParticles', val)}
          label={t('controlPanel.appearance.particles')}
          description={t('controlPanel.appearance.particlesDesc')}
        />
      </SectionCard>

      {/* Live Preview */}
      <SectionCard icon={Eye} title={t('controlPanel.appearance.preview')} accent="rose">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>

        <div className={`border border-white/10 rounded-2xl bg-slate-950 overflow-hidden transition-all ${
          previewMode === 'mobile' ? 'max-w-[280px] mx-auto' : ''
        }`}>
          {/* Mini header preview */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5" style={{ borderColor: `${settings.accentColor}30` }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md" style={{ backgroundColor: settings.accentColor }} />
              <span className="text-xs font-bold text-white">Vibe Diary</span>
            </div>
            <div className="flex gap-2">
              {settings.headerStyle !== 'minimal' && (
                <>
                  <div className="w-10 h-2 rounded bg-slate-700" />
                  <div className="w-10 h-2 rounded bg-slate-700" />
                </>
              )}
              {settings.headerStyle === 'default' && (
                <div className="w-10 h-2 rounded bg-slate-700" />
              )}
            </div>
          </div>

          {/* Mini content preview */}
          <div className="p-4 space-y-3">
            <div className={`bg-slate-900/80 border border-white/5 p-3 ${
              settings.borderRadius === 'small' ? 'rounded-lg' :
              settings.borderRadius === 'medium' ? 'rounded-xl' : 'rounded-2xl'
            } ${settings.showAnimations ? 'transition-all hover:scale-[1.02]' : ''}`}>
              <div className="flex gap-3">
                <div className={`w-10 h-14 bg-slate-700 shrink-0 ${
                  settings.borderRadius === 'small' ? 'rounded' :
                  settings.borderRadius === 'medium' ? 'rounded-lg' : 'rounded-xl'
                }`} />
                <div className="space-y-2 flex-1">
                  <div className="w-3/4 h-2.5 rounded bg-slate-600" />
                  <div className="w-1/2 h-2 rounded bg-slate-700" />
                  <div
                    className="w-16 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white/80"
                    style={{ backgroundColor: `${settings.accentColor}30` }}
                  >
                    Playing
                  </div>
                </div>
              </div>
            </div>
            <div className={`bg-slate-900/80 border border-white/5 p-3 ${
              settings.borderRadius === 'small' ? 'rounded-lg' :
              settings.borderRadius === 'medium' ? 'rounded-xl' : 'rounded-2xl'
            }`}>
              <div className="flex gap-3">
                <div className={`w-10 h-14 bg-slate-700 shrink-0 ${
                  settings.borderRadius === 'small' ? 'rounded' :
                  settings.borderRadius === 'medium' ? 'rounded-lg' : 'rounded-xl'
                }`} />
                <div className="space-y-2 flex-1">
                  <div className="w-2/3 h-2.5 rounded bg-slate-600" />
                  <div className="w-1/3 h-2 rounded bg-slate-700" />
                  <div className="w-20 h-4 rounded-full bg-emerald-500/20 text-[8px] font-bold flex items-center justify-center text-emerald-300">
                    Completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// --- Features Tab ---

function FeaturesTab({ settings, onUpdate, t }: {
  settings: SiteSettings['features'];
  onUpdate: (key: keyof SiteSettings['features'], value: boolean) => void;
  t: (key: string) => string;
}) {
  const featureList: { key: keyof SiteSettings['features']; icon: React.ElementType; labelKey: string; descKey: string }[] = [
    { key: 'communityRatings', icon: Star, labelKey: 'controlPanel.features.communityRatings', descKey: 'controlPanel.features.communityRatingsDesc' },
    { key: 'discussions', icon: MessageSquare, labelKey: 'controlPanel.features.discussions', descKey: 'controlPanel.features.discussionsDesc' },
    { key: 'steamDeck', icon: Gamepad2, labelKey: 'controlPanel.features.steamDeck', descKey: 'controlPanel.features.steamDeckDesc' },
    { key: 'screenshots', icon: Image, labelKey: 'controlPanel.features.screenshots', descKey: 'controlPanel.features.screenshotsDesc' },
    { key: 'reviews', icon: FileText, labelKey: 'controlPanel.features.reviews', descKey: 'controlPanel.features.reviewsDesc' },
    { key: 'sharing', icon: Link2, labelKey: 'controlPanel.features.sharing', descKey: 'controlPanel.features.sharingDesc' },
    { key: 'similarGames', icon: Sparkles, labelKey: 'controlPanel.features.similarGames', descKey: 'controlPanel.features.similarGamesDesc' },
    { key: 'popularPage', icon: Star, labelKey: 'controlPanel.features.popularPage', descKey: 'controlPanel.features.popularPageDesc' },
    { key: 'interactiveDemo', icon: Monitor, labelKey: 'controlPanel.features.interactiveDemo', descKey: 'controlPanel.features.interactiveDemoDesc' },
  ];

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="text-sm text-slate-400">{t('controlPanel.features.active')}:</div>
          <div className="text-lg font-extrabold text-emerald-400">{enabledCount}</div>
          <div className="text-sm text-slate-500">/ {featureList.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ key, icon: Icon, labelKey, descKey }) => (
          <button
            key={key}
            onClick={() => onUpdate(key, !settings[key])}
            className={`relative p-5 rounded-2xl border text-left transition-all group ${
              settings[key]
                ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                : 'border-white/5 bg-slate-950/40 hover:bg-slate-950/60 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${
                settings[key] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                <Icon size={18} />
              </div>
              {settings[key] ? (
                <ToggleRight size={24} className="text-emerald-400" />
              ) : (
                <ToggleLeft size={24} className="text-slate-600" />
              )}
            </div>
            <div className="font-semibold text-white text-sm mb-1">{t(labelKey)}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{t(descKey)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Announcements Tab ---

function AnnouncementsTab({ settings, onUpdate, t }: {
  settings: SiteSettings['announcements'];
  onUpdate: <K extends keyof SiteSettings['announcements']>(key: K, value: SiteSettings['announcements'][K]) => void;
  t: (key: string) => string;
}) {
  const typeStyles = {
    info: { border: 'border-sky-500/20', bg: 'bg-sky-500/10', text: 'text-sky-300', icon: Bell },
    warning: { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-300', icon: AlertTriangle },
    success: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-300', icon: Check },
  };

  const currentStyle = typeStyles[settings.type];
  const CurrentIcon = currentStyle.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard icon={Megaphone} title={t('controlPanel.announcements.settings')} accent="amber">
        <Toggle
          enabled={settings.enabled}
          onChange={(val) => onUpdate('enabled', val)}
          label={t('controlPanel.announcements.showBanner')}
          description={t('controlPanel.announcements.showBannerDesc')}
        />

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {t('controlPanel.announcements.text')}
            </label>
            <textarea
              value={settings.text}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder={t('controlPanel.announcements.textPlaceholder')}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {t('controlPanel.announcements.type')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['info', 'warning', 'success'] as const).map((type) => {
                const style = typeStyles[type];
                return (
                  <button
                    key={type}
                    onClick={() => onUpdate('type', type)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      settings.type === type
                        ? `${style.bg} ${style.border} border ${style.text}`
                        : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t(`controlPanel.announcements.type_${type}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <Toggle
            enabled={settings.dismissible}
            onChange={(val) => onUpdate('dismissible', val)}
            label={t('controlPanel.announcements.dismissible')}
            description={t('controlPanel.announcements.dismissibleDesc')}
          />
        </div>
      </SectionCard>

      {/* Preview */}
      <SectionCard icon={Eye} title={t('controlPanel.announcements.preview')} accent="sky">
        {settings.enabled && settings.text ? (
          <div className={`p-4 rounded-2xl border ${currentStyle.border} ${currentStyle.bg} flex items-start gap-3`}>
            <CurrentIcon size={18} className={`${currentStyle.text} shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${currentStyle.text}`}>{settings.text}</p>
            </div>
            {settings.dismissible && (
              <button className="text-slate-500 hover:text-white transition-colors shrink-0">✕</button>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
            <EyeOff size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {!settings.enabled
                ? t('controlPanel.announcements.disabled')
                : t('controlPanel.announcements.emptyText')}
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

