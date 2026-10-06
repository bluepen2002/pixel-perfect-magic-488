import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/contributions", label: "Contributions" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/transparency", label: "Content" },
  { to: "/admin/stories", label: "Stories" },
  { to: "/admin/media", label: "Media" },
] as const;

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Brand to="/admin" />
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-primary sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/dashboard">Member view</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 pb-2">
          <nav className="flex min-w-max items-center gap-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/admin" }}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <p className="eyebrow">Lift1 administration</p>
        <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
