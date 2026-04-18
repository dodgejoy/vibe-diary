'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gamepad2, Loader, LogIn, UserPlus } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase';
import { useAuth } from '@/components';
import { useTranslation } from '@/i18n';
import { useSiteSettings } from '@/lib/siteSettings';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isConfigured } = useAuth();
  const { t } = useTranslation();
  const { settings } = useSiteSettings();

  const isMaintenanceMode = settings.general.maintenanceMode;
  const registrationOpen = settings.general.registrationOpen && !isMaintenanceMode;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const nextPath = searchParams.get('next') || '/';

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath);
    }
  }, [isLoading, nextPath, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (mode === 'signup' && !registrationOpen) {
      setError(t('auth.registrationClosed'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const result = await signInWithEmail(email.trim(), password);
        if (result.error) {
          setError(result.error);
          return;
        }

        router.replace(nextPath);
        return;
      }

      const result = await signUpWithEmail(email.trim(), password);
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(
        result.needsEmailConfirmation
          ? t('auth.accountCreatedConfirmEmail')
          : t('auth.accountCreatedReady')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-10 shadow-2xl">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-indigo-600/15 blur-[120px]" />

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/70 border border-white/10 text-violet-300 text-sm font-semibold">
              <Gamepad2 size={18} />
              {t('auth.accountTitle')}
            </div>

            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {t('auth.keepLibrarySafe')}
                <br />
                {t('auth.ratingsAndProgress')}
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                {t('auth.accountDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-slate-300">
                {t('auth.personalLibrary')}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-slate-300">
                {t('auth.progressTracking')}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-slate-300">
                {t('auth.analyticsSharing')}
              </div>
            </div>

            <Link href="/" className="inline-flex text-sm text-slate-400 hover:text-white transition-colors">
              {t('common.toHome')}
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl">
          {isMaintenanceMode && (
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <div className="font-semibold">{t('authGate.maintenance')}</div>
              <div className="mt-1 text-amber-200/90">{t('authGate.maintenanceDesc')}</div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-950/70 border border-white/5 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold transition-all ${
                mode === 'signin' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.signInTab')}
            </button>
            <button
              onClick={() => setMode('signup')}
              disabled={!registrationOpen}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold transition-all ${
                !registrationOpen
                  ? 'text-slate-600 cursor-not-allowed'
                  : mode === 'signup' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={!registrationOpen ? t('auth.registrationClosed') : undefined}
            >
              {t('auth.createAccountTab')}
            </button>
          </div>

          {!isConfigured ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-100">
              {t('auth.supabaseNotConfigured')}
            </div>
          ) : isLoading ? (
            <div className="min-h-72 flex items-center justify-center">
              <Loader className="animate-spin text-violet-400" size={32} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.passwordLabel')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.confirmPasswordLabel')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-4 text-white font-bold transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    {t('common.processing')}
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn size={18} />
                    {t('auth.signInTab')}
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    {t('auth.createAccountTab')}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader className="animate-spin text-violet-400" size={32} />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}