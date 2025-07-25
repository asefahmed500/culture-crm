
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppShell from './app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = ['/login', '/signup', '/'].includes(pathname);

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <AppShell>
                {children}
            </AppShell>
        </SidebarProvider>
    );
}
