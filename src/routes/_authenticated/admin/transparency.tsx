import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/lift1/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency content — Lift1 admin" },
      {
        name: "description",
        content: "Edit the sections published on the public Lift1 transparency page.",
      },
      { property: "og:title", content: "Transparency content — Lift1 admin" },
      { property: "og:description", content: "Publish and edit transparency sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminTransparency,
});

function AdminTransparency() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const sections = useQuery({
    queryKey: ["admin-transparency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transparency_content")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (row: {
      id: string;
      title: string;
      body: string;
      sort_order: number;
      published: boolean;
    }) => {
      const { error } = await supabase
        .from("transparency_content")
        .update({
          title: row.title,
          body: row.body,
          sort_order: row.sort_order,
          published: row.published,
        })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transparency"] });
      queryClient.invalidateQueries({ queryKey: ["transparency-content"] });
      toast.success("Transparency page updated.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save section"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transparency_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transparency"] });
      queryClient.invalidateQueries({ queryKey: ["transparency-content"] });
      toast.success("Section removed.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not remove section"),
  });

  const create = useMutation({
    mutationFn: async () => {
      const slug =
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `section-${Date.now()}`;
      const nextOrder = (sections.data ?? []).reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;
      const { error } = await supabase.from("transparency_content").insert({
        slug,
        title: newTitle,
        body: newBody,
        sort_order: nextOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      setNewBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-transparency"] });
      queryClient.invalidateQueries({ queryKey: ["transparency-content"] });
      toast.success("Section published.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add section"),
  });

  return (
    <AdminShell
      title="Transparency content"
      subtitle="What members and the public read on the transparency page."
    >
      <div className="space-y-3">
        {(sections.data ?? []).map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            onSave={(row) => save.mutate(row)}
            onRemove={() => remove.mutate(section.id)}
            saving={save.isPending}
          />
        ))}
      </div>

      <div className="surface-card mt-6 space-y-3 p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Add a section</h2>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Title
          </Label>
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Text
          </Label>
          <Textarea rows={4} value={newBody} onChange={(e) => setNewBody(e.target.value)} />
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={!newTitle.trim() || !newBody.trim() || create.isPending}
          onClick={() => create.mutate()}
        >
          Publish section
        </Button>
      </div>
    </AdminShell>
  );
}

function SectionEditor({
  section,
  onSave,
  onRemove,
  saving,
}: {
  section: {
    id: string;
    title: string;
    body: string;
    sort_order: number;
    published: boolean;
  };
  onSave: (row: {
    id: string;
    title: string;
    body: string;
    sort_order: number;
    published: boolean;
  }) => void;
  onRemove: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(section.title);
  const [body, setBody] = useState(section.body);
  const [order, setOrder] = useState(String(section.sort_order));
  const [published, setPublished] = useState(section.published);

  return (
    <div className="surface-card space-y-3 p-4 sm:p-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Title
        </Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Text
        </Label>
        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Order
          </Label>
          <Input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant={published ? "default" : "outline"}
            className="w-full"
            onClick={() => setPublished((p) => !p)}
          >
            {published ? "Published" : "Hidden"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          disabled={saving}
          onClick={() =>
            onSave({ id: section.id, title, body, sort_order: Number(order) || 0, published })
          }
        >
          Save section
        </Button>
        <Button variant="ghost" className="text-destructive" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
