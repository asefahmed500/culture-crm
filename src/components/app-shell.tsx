
'use client';

import { Home, Settings, Users, LineChart, LogOut, LogIn, Upload, Milestone, Download, Zap } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: false, callbackUrl: '/' });
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };
  
  const menuItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/import', icon: Upload, label: 'Customer Import' },
    { href: '/customers', icon: Users, label: 'Customers' },
    { href: '/segments', icon: Milestone, label: 'Segments' },
    { href: '/analytics', icon: LineChart, label: 'Analytics' },
    { href: '/export', icon: Download, label: 'Export Center' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  useEffect(() => {
    // If not authenticated and trying to access a protected page, redirect to login
    if (status === 'unauthenticated' && !['/login', '/signup', '/'].includes(pathname)) {
      router.replace('/login');
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }
  
  // For public pages, render children without the shell
  if (['/login', '/signup', '/'].includes(pathname)) {
      return <>{children}</>;
  }

  // If we are on a protected page but not authenticated, show a loading state
  // while the useEffect above handles the redirect.
  if (status === 'unauthenticated') {
      return <div className="flex h-screen items-center justify-center">Redirecting to login...</div>;
  }
  
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
             <Link href="/dashboard" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Cultural CRM</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton onClick={() => router.push(item.href)} isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                          <item.icon />
                          <span>{item.label}</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-sidebar-accent">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? 'User'} />
                      <AvatarFallback>{session.user?.name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col text-left group-data-[collapsible=icon]:hidden">
                      <span className="font-semibold text-sidebar-foreground">{session.user?.name}</span>
                      <span className="text-xs text-sidebar-foreground/70">{session.user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <Button onClick={handleLogin} variant="ghost" className="w-full justify-start">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Can add breadcrumbs here */}
            </div>
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? 'User'} />
                      <AvatarFallback>{session.user?.name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </header>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
