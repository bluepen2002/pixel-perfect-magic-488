import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Lift1" },
      { name: "description", content: "Updates on your Lift1 assistance requests." },
      { property: "og:title", content: "Notifications — Lift1" },
      { property: "og:description", content: "Follow every update on your requests." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const queryClient = useQueryClient();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please sign in again.");
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const unread = (notifications.data ?? []).filter((n) => !n.read_at).length;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">Updates for you</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Every step on your assistance requests, in one place.
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="surface-card mt-5 divide-y divide-border">
        {(notifications.data ?? []).length === 0 && (
          <p className="p-4 text-sm text-muted-foreground sm:p-5">
            Nothing yet. When a request you submitted changes status, you'll see it here.
          </p>
        )}
        {(notifications.data ?? []).map((n) => {
          const inner = (
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.read_at ? "bg-border" : "bg-primary"
                }`}
              />
              <div className="min-w-0">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("en-KE")}
                </p>
              </div>
            </div>
          );
          return n.link ? (
            <Link key={n.id} to={n.link} className="block transition-colors hover:bg-muted/50">
              {inner}
            </Link>
          ) : (
            <div key={n.id}>{inner}</div>
          );
        })}
      </div>
    </AppShell>
  );
}
