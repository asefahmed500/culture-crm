
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '@/components/landing-page';
import Dashboard from '@/components/dashboard';
import AppShell from '@/components/app-shell';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to the dashboard if they land on the root page
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // If the user is authenticated, we redirect them via useEffect.
  // We can show a loader or the dashboard as a fallback.
  if (status === 'authenticated') {
     return (
        <AppShell>
            <Dashboard />
        </AppShell>
    );
  }

  // If unauthenticated, show the landing page.
  return <LandingPage />;
}
