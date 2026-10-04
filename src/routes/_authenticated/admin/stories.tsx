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

export const Route = createFileRoute("/_authenticated/admin/stories")({
  head: () => ({
    meta: [
      { title: "Impact stories — Lift1 admin" },
      { name: "description", content: "Publish impact stories for the transparency page." },
      { property: "og:title", content: "Impact stories — Lift1 admin" },
      { property: "og:description", content: "Publish and edit impact stories." },
    ],
  }),
  component: AdminStories,
});

type Story = {
  id: string;
  title: string;
  body: string;
  county: string | null;
  person_label: string | null;
  published: boolean;
};

function AdminStories() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCounty, setNewCounty] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const stories = useQuery({
    queryKey: ["admin-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impact_stories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    queryClient.invalidateQueries({ queryKey: ["impact-stories"] });
  };

  const save = useMutation({
    mutationFn: async (row: Story) => {
      const { error } = await supabase
        .from("impact_stories")
        .update({
          title: row.title,
          body: row.body,
          county: row.county,
          person_label: row.person_label,
          published: row.published,
        })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Story saved.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save story"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("impact_stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Story removed.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not remove story"),
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("impact_stories").insert({
        title: newTitle,
        body: newBody,
        county: newCounty || null,
        person_label: newLabel || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      setNewBody("");
      setNewCounty("");
      setNewLabel("");
      invalidate();
      toast.success("Story published.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add story"),
  });

  return (
    <AdminShell
      title="Impact stories"
      subtitle="Short, consent-based updates about people the community has lifted. Shown on the public transparency page."
    >
      <div className="space-y-3">
        {(stories.data ?? []).length === 0 && (
          <p className="surface-card p-4 text-sm text-muted-foreground sm:p-5">
            No stories yet. Publish the first one below.
          </p>
        )}
        {(stories.data ?? []).map((story) => (
          <StoryEditor
            key={story.id}
            story={story}
            onSave={(row) => save.mutate(row)}
            onRemove={() => remove.mutate(story.id)}
            saving={save.isPending}
          />
        ))}
      </div>

      <div className="surface-card mt-6 space-y-3 p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Add a story</h2>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Title
          </Label>
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Story
          </Label>
          <Textarea rows={4} value={newBody} onChange={(e) => setNewBody(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              County (optional)
            </Label>
            <Input value={newCounty} onChange={(e) => setNewCounty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Who it is about (e.g. "A mother of three")
            </Label>
            <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          </div>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={!newTitle.trim() || !newBody.trim() || create.isPending}
          onClick={() => create.mutate()}
        >
          Publish story
        </Button>
      </div>
    </AdminShell>
  );
}

function StoryEditor({
  story,
  onSave,
  onRemove,
  saving,
}: {
  story: Story;
  onSave: (row: Story) => void;
  onRemove: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(story.title);
  const [body, setBody] = useState(story.body);
  const [county, setCounty] = useState(story.county ?? "");
  const [label, setLabel] = useState(story.person_label ?? "");
  const [published, setPublished] = useState(story.published);

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
          Story
        </Label>
        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            County
          </Label>
          <Input value={county} onChange={(e) => setCounty(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Who it is about
          </Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          disabled={saving}
          onClick={() =>
            onSave({
              ...story,
              title,
              body,
              county: county || null,
              person_label: label || null,
              published,
            })
          }
        >
          Save story
        </Button>
        <Button variant="outline" onClick={() => setPublished((p) => !p)}>
          {published ? "Published" : "Hidden"}
        </Button>
        <Button variant="ghost" className="text-destructive" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
