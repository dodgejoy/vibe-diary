'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader, LockKeyhole, ShieldAlert, ShieldX } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, isConfigured } = useAuth();

  const isAuthRoute = pathname === '/auth';
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (!isAuthRoute && !isLoading && isConfigured && !user) {
      router.replace(`/auth?next=${encodeURIComponent(pathname || '/')}`);
    }
  }, [isAuthRoute, isConfigured, isLoading, pathname, router, user]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!isConfigured) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full bg-slate-900/60 border border-amber-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Supabase is not configured</h1>
          <p className="text-slate-400 leading-relaxed">
            Accounts require <span className="text-slate-200 font-semibold">NEXT_PUBLIC_SUPABASE_URL</span> and
            <span className="text-slate-200 font-semibold"> NEXT_PUBLIC_SUPABASE_ANON_KEY</span> in your environment.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader className="animate-spin text-violet-400" size={32} />
          <div className="space-y-2">
            <p className="text-white font-semibold">Checking your account...</p>
            {!isLoading && !user && (
              <Link href="/auth" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
                <LockKeyhole size={16} />
                Open sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isAdminRoute && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full bg-slate-900/60 border border-rose-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
            <ShieldX size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Admin access required</h1>
          <p className="text-slate-400 leading-relaxed">
            This area is visible only for accounts with the <span className="text-slate-200 font-semibold">admin</span> role.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}