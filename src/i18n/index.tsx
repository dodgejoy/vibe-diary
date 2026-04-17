'use client';

import { createContext, useContext, useCallback } from 'react';
import { defaultLocale, type Locale } from './config';
import ru from './locales/ru.json';

const locales: Partial<Record<Locale, typeof ru>> = { ru };

type TranslationDict = typeof ru;

// Flatten nested keys: "landing.heroTitle1" → value
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}

function createTranslator(locale: Locale) {
  const dict = locales[locale] ?? locales[defaultLocale];

  return function t(key: string, params?: Record<string, string | number>): string {
    let value = getNestedValue(dict as unknown as Record<string, unknown>, key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  };
}

type TFunction = ReturnType<typeof createTranslator>;

const I18nContext = createContext<{ t: TFunction; locale: Locale }>({
  t: createTranslator(defaultLocale),
  locale: defaultLocale,
});

export function I18nProvider({
  locale = defaultLocale,
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => createTranslator(locale)(key, params),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ t, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

// Static helper for non-component usage
export const t = createTranslator(defaultLocale);
