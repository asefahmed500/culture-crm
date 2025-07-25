
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = ['/login', '/signup', '/'].includes(pathname);

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    );
}
