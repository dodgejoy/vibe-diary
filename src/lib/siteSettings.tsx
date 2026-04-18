'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchSiteSettings } from '@/lib/supabase';

export interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationOpen: boolean;
    maxGamesPerUser: number;
    defaultLanguage: 'ru' | 'en';
  };
  appearance: {
    accentColor: string;
    headerStyle: 'default' | 'compact' | 'minimal';
    cardStyle: 'default' | '3d' | 'flat';
    showAnimations: boolean;
    showParticles: boolean;
    borderRadius: 'small' | 'medium' | 'large';
  };
  features: {
    communityRatings: boolean;
    discussions: boolean;
    steamDeck: boolean;
    screenshots: boolean;
    reviews: boolean;
    sharing: boolean;
    similarGames: boolean;
    popularPage: boolean;
    interactiveDemo: boolean;
  };
  announcements: {
    enabled: boolean;
    text: string;
    type: 'info' | 'warning' | 'success';
    dismissible: boolean;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: 'Vibe Diary',
    siteDescription: 'Твой игровой дневник',
    maintenanceMode: false,
    registrationOpen: true,
    maxGamesPerUser: 500,
    defaultLanguage: 'ru',
  },
  appearance: {
    accentColor: '#8b5cf6',
    headerStyle: 'default',
    cardStyle: 'default',
    showAnimations: true,
    showParticles: true,
    borderRadius: 'large',
  },
  features: {
    communityRatings: true,
    discussions: true,
    steamDeck: true,
    screenshots: true,
    reviews: true,
    sharing: true,
    similarGames: true,
    popularPage: true,
    interactiveDemo: true,
  },
  announcements: {
    enabled: false,
    text: '',
    type: 'info',
    dismissible: true,
  },
};

const CACHE_KEY = 'vibe-diary-settings-cache';

export function deepMerge(defaults: any, overrides: any): any {
  if (!overrides) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (key in overrides) {
      if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
        result[key] = deepMerge(defaults[key], overrides[key]);
      } else {
        result[key] = overrides[key];
      }
    }
  }
  return result;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isFeatureEnabled: (feature: keyof SiteSettings['features']) => boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isFeatureEnabled: () => true,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const loadSettings = useCallback(async () => {
    // 1. Try localStorage cache first for instant render
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setSettings(deepMerge(DEFAULT_SETTINGS, JSON.parse(cached)));
      }
    } catch {
      // ignore
    }

    // 2. Fetch from Supabase (source of truth)
    const remote = await fetchSiteSettings();
    if (remote) {
      const merged = deepMerge(DEFAULT_SETTINGS, remote);
      setSettings(merged);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(remote));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();

    // Listen for admin saves in the same tab
    const handleUpdate = () => { loadSettings(); };
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, [loadSettings]);

  // Apply appearance settings as CSS custom properties
  useEffect(() => {
    const { accentColor, showAnimations, showParticles, borderRadius } = settings.appearance;
    const root = document.documentElement;

    root.style.setProperty('--accent-color', accentColor);
    // Generate lighter/darker shades from hex
    root.style.setProperty('--accent-color-light', accentColor + '99'); // 60% opacity
    root.style.setProperty('--accent-color-dim', accentColor + '33');   // 20% opacity

    // Border radius presets
    const radiusMap = { small: '0.5rem', medium: '0.75rem', large: '1rem' };
    root.style.setProperty('--site-radius', radiusMap[borderRadius]);

    // Animation & particles toggles via body classes
    document.body.classList.toggle('no-animations', !showAnimations);
    document.body.classList.toggle('no-particles', !showParticles);
  }, [settings.appearance]);

  const isFeatureEnabled = useCallback(
    (feature: keyof SiteSettings['features']) => settings.features[feature],
    [settings.features]
  );

  return (
    <SiteSettingsContext.Provider value={{ settings, isFeatureEnabled, refresh: loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
