// This layout ensures that all pages within the /dashboard route group are protected.
// The AppShell handles the actual session checking and redirection.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
