import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchIsAdmin } from "@/hooks/useIsAdmin";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const isAdmin = await fetchIsAdmin();
    if (!isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});
