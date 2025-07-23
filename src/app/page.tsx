
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '@/components/landing-page';
import Dashboard from '@/components/dashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // This will be handled by AppShell now, but as a fallback
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

  if (status === 'authenticated') {
    // This will redirect, but as a fallback render the dashboard
    return <Dashboard />;
  }

  return <LandingPage />;
}
