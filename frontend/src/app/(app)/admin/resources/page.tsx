"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form-fields";
import { FileUploadField } from "@/components/ui/file-upload";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

type Resource = Awaited<
  ReturnType<typeof api.judgeResources>
>["resources"][number];

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AdminJudgeResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await api.judgeResources();
    setResources(res.resources);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load resources"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function publish() {
    const finalUrl = url.trim() || link.trim();
    if (!title.trim() || !finalUrl) {
      toast("Add a title and upload a file or paste a link", "error");
      return;
    }
    setSaving(true);
    try {
      await api.createJudgeResource({
        title: title.trim(),
        description: description.trim() || undefined,
        url: finalUrl,
        fileName: fileName || undefined,
      });
      setTitle("");
      setDescription("");
      setUrl("");
      setFileName("");
      setLink("");
      await load();
      toast("Resource shared with all judges", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not share resource",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api.deleteJudgeResource(id);
      await load();
      toast("Resource removed", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not remove resource",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <PageLoader label="Loading judge resources…" />;
  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PortalPageHeader
        title="Judge resources"
        description="Share files and links with every judge on the programme."
      />

      <Card className="space-y-4">
        <CardHeader
          title="Share a resource"
        description="Share files and links with every judge. Files are stored in the database, so you can add as many as you need (up to 5 MB each)."
        />
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Scoring guide, briefing pack…"
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Short note for judges"
        />
        <FileUploadField
          label="Upload file"
          value={url}
          onChange={(next) => {
            setUrl(next);
            setFileName(next.split("/").pop() || "");
            if (next) setLink("");
          }}
          hint="PDF, slides, or documents up to 5 MB"
        />
        <Input
          label="Or paste a link"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            if (e.target.value.trim()) {
              setUrl("");
              setFileName("");
            }
          }}
          placeholder="https://"
        />
        <Button onClick={publish} loading={saving}>
          Share with all judges
        </Button>
      </Card>

      <Card>
        <CardHeader title={`Shared resources (${resources.length})`} />
        <div className="mt-4 space-y-3">
          {resources.length === 0 && (
            <p className="text-sm text-fg-muted">No resources shared yet.</p>
          )}
          {resources.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-muted/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-fg">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-sm text-fg-muted">{item.description}</p>
                )}
                <p className="mt-1 text-xs text-fg-subtle">
                  Shared {formatDate(item.createdAt)} by {item.author}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(item.url, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={busyId === item.id}
                  onClick={() => remove(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
