import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/lift1/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchHomeMedia, type HomeMedia } from "@/hooks/useHomeMedia";

export const Route = createFileRoute("/_authenticated/admin/media")({
  head: () => ({
    meta: [
      { title: "Home page media — Lift1 admin" },
      { name: "description", content: "Upload photos and videos for the Lift1 home page." },
      { property: "og:title", content: "Home page media — Lift1 admin" },
      { property: "og:description", content: "Manage home page photos and videos." },
    ],
  }),
  component: AdminMedia,
});

function AdminMedia() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const media = useQuery({ queryKey: ["admin-home-media"], queryFn: () => fetchHomeMedia(true) });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-home-media"] });
    qc.invalidateQueries({ queryKey: ["home-media"] });
  };

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a photo or video first.");
      const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
      if (!kind) throw new Error("Only photos or videos are allowed.");
      if (file.size > 50 * 1024 * 1024) throw new Error("File is larger than 50 MB.");
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("home-media").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { error } = await supabase.from("home_media").insert({ kind, storage_path: path, caption: caption.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      setFile(null);
      setCaption("");
      (document.getElementById("media-file") as HTMLInputElement | null)?.value && ((document.getElementById("media-file") as HTMLInputElement).value = "");
      invalidate();
      toast.success("Uploaded — it's now on the home page.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const toggle = useMutation({
    mutationFn: async (m: HomeMedia) => {
      const { error } = await supabase.from("home_media").update({ published: !m.published }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (m: HomeMedia) => {
      await supabase.storage.from("home-media").remove([m.storage_path]);
      const { error } = await supabase.from("home_media").delete().eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Removed.");
    },
  });

  return (
    <AdminShell title="Home page media" subtitle="Photos and videos you upload here appear on the public home page.">
      <div className="surface-card space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="media-file">Photo or video (max 50 MB)</Label>
          <Input id="media-file" type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="media-caption">Caption (optional)</Label>
          <Input id="media-caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
        </div>
        <Button onClick={() => upload.mutate()} disabled={!file || upload.isPending}>
          {upload.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.data?.map((m) => (
          <div key={m.id} className="surface-card overflow-hidden">
            <div className="aspect-video bg-muted">
              {m.url &&
                (m.kind === "video" ? (
                  <video src={m.url} controls className="h-full w-full object-cover" />
                ) : (
                  <img src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover" />
                ))}
            </div>
            <div className="space-y-3 p-4">
              <p className="text-sm">{m.caption || <span className="text-muted-foreground">No caption</span>}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle.mutate(m)}>
                  {m.published ? "Hide" : "Show"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => confirm("Remove this item?") && remove.mutate(m)}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
        {media.data?.length === 0 && <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>}
      </div>
    </AdminShell>
  );
}
