import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export async function fetchIsAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (error) return false;
  return !!data;
}

export function useIsAdmin() {
  return useQuery({ queryKey: ["is-admin"], queryFn: fetchIsAdmin, staleTime: 60_000 });
}
