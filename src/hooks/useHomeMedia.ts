import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HomeMedia = {
  id: string;
  kind: "image" | "video";
  storage_path: string;
  caption: string | null;
  sort_order: number;
  published: boolean;
  url: string | null;
};

export async function fetchHomeMedia(all = false): Promise<HomeMedia[]> {
  let q = supabase.from("home_media").select("*").order("sort_order").order("created_at", { ascending: false });
  if (!all) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: signed } = await supabase.storage
    .from("home-media")
    .createSignedUrls(rows.map((r) => r.storage_path), 60 * 60 * 6);
  return rows.map((r) => ({
    ...(r as Omit<HomeMedia, "url">),
    url: signed?.find((s) => s.path === r.storage_path)?.signedUrl ?? null,
  }));
}

export function useHomeMedia() {
  return useQuery({ queryKey: ["home-media"], queryFn: () => fetchHomeMedia(false), staleTime: 60_000 });
}
