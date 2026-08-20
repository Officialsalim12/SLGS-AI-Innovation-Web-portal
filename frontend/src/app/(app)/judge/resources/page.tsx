"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";

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

export default function JudgeResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.judgeResources();
        if (!cancelled) setResources(res.resources);
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

  if (loading) return <PageLoader label="Loading resources…" />;
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
        description="Files and links shared by programme administrators."
      />

      <div className="space-y-3">
        {resources.length === 0 && (
          <Card>
            <p className="text-sm text-fg-muted">
              No resources have been shared yet.
            </p>
          </Card>
        )}
        {resources.map((item) => (
          <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-xl bg-surface-muted p-2.5">
                <FileText className="h-4 w-4 text-purple-light" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-fg">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-sm text-fg-muted">{item.description}</p>
                )}
                <p className="mt-1 text-xs text-fg-subtle">
                  Shared {formatDate(item.createdAt)} by {item.author}
                </p>
              </div>
            </div>
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
          </Card>
        ))}
      </div>
    </div>
  );
}
