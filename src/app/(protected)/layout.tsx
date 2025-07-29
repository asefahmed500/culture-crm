import AppShell from '@/components/app-shell';

// This layout is for protected pages that should have the AppShell.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
