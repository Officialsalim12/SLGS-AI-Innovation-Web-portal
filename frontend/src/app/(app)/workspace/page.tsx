"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { PageLoader } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

type Section = Awaited<ReturnType<typeof api.workspace>>["sections"][number];
type Responsibility = Awaited<
  ReturnType<typeof api.responsibilities>
>["responsibilities"][number];
type Member = Awaited<ReturnType<typeof api.responsibilities>>["members"][number];

export default function WorkspacePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState("");
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Responsibility[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLead, setIsLead] = useState(false);
  const [savingRoles, setSavingRoles] = useState(false);
  const [creatingSection, setCreatingSection] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pendingSection = useRef<string | null>(null);
  const pendingTitle = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [workspace, responsibilities] = await Promise.all([
          api.workspace(),
          api.responsibilities(),
        ]);
        if (cancelled) return;
        setSections(workspace.sections);
        setDocs(
          Object.fromEntries(workspace.sections.map((s) => [s.id, s.content]))
        );
        setTitles(
          Object.fromEntries(workspace.sections.map((s) => [s.id, s.title]))
        );
        if (workspace.sections[0]) setActive(workspace.sections[0].id);
        setRoles(responsibilities.responsibilities);
        setMembers(responsibilities.members);
        setIsLead(responsibilities.isLead);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load workspace"
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

  useEffect(() => {
    if (saved || !active) return;
    const sectionId = pendingSection.current || active;
    const content = docs[sectionId];
    if (content === undefined) return;

    const t = setTimeout(async () => {
      try {
        const title = pendingTitle.current ? titles[sectionId] : undefined;
        await api.saveWorkspace({
          sectionId,
          content,
          ...(title ? { title } : {}),
        });
        pendingTitle.current = false;
        setSaved(true);
        toast("Workspace auto-saved", "success");
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Could not save workspace",
          "error"
        );
      }
    }, 800);
    return () => clearTimeout(t);
  }, [docs, titles, active, saved]);

  async function addSection() {
    const title = newSectionTitle.trim() || "Untitled";
    setCreatingSection(true);
    try {
      const res = await api.createWorkspaceSection({ title });
      const section = res.section;
      setSections((list) => [...list, section]);
      setDocs((d) => ({ ...d, [section.id]: section.content || "" }));
      setTitles((t) => ({ ...t, [section.id]: section.title }));
      setActive(section.id);
      setSaved(true);
      setShowAddSection(false);
      setNewSectionTitle("");
      toast("Section created", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not create section",
        "error"
      );
    } finally {
      setCreatingSection(false);
    }
  }

  async function saveRoles() {
    if (!isLead) return;
    setSavingRoles(true);
    try {
      const res = await api.saveResponsibilities(
        roles.map((r) => ({ label: r.label, userId: r.userId }))
      );
      setRoles(res.responsibilities);
      setMembers(res.members);
      toast("Role assignments saved", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not save role assignments",
        "error"
      );
    } finally {
      setSavingRoles(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading workspace…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  const section = sections.find((s) => s.id === active);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
            Workspace
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Shared team notes — everything auto-saves for your whole team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-light" /> Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 animate-pulse" /> Saving…
              </>
            )}
          </span>
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowAddSection(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add section
          </Button>
        </div>
      </div>

      {showAddSection && (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-fg">New section</h2>
          <input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Section title"
            className="h-11 w-full rounded-xl border border-line bg-input px-3.5 text-sm text-fg outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/15"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") addSection();
              if (e.key === "Escape") setShowAddSection(false);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={addSection} loading={creatingSection}>
              {creatingSection ? "Creating…" : "Create section"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddSection(false);
                setNewSectionTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-6">
        <aside className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-thin lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2.5 text-left text-sm transition lg:w-full",
                active === s.id
                  ? "bg-surface-hover text-fg"
                  : "bg-surface-muted text-fg-muted hover:bg-surface-muted hover:text-fg lg:bg-transparent"
              )}
            >
              <span className="whitespace-nowrap lg:whitespace-normal">
                {titles[s.id] || s.title}
              </span>
            </button>
          ))}
        </aside>

        <Card className="min-h-[320px] min-w-0 sm:min-h-[420px]">
          {section ? (
            <>
              <input
                value={titles[active] ?? section.title}
                onChange={(e) => {
                  pendingSection.current = active;
                  pendingTitle.current = true;
                  const value = e.target.value;
                  setTitles((t) => ({ ...t, [active]: value }));
                  setSections((list) =>
                    list.map((s) =>
                      s.id === active ? { ...s, title: value } : s
                    )
                  );
                  setSaved(false);
                }}
                className="w-full bg-transparent text-xl font-semibold text-fg outline-none placeholder:text-fg-subtle"
                placeholder="Section title"
              />
              <textarea
                value={docs[active] ?? ""}
                onChange={(e) => {
                  pendingSection.current = active;
                  setDocs((d) => ({ ...d, [active]: e.target.value }));
                  setSaved(false);
                }}
                placeholder="Start writing notes for your team…"
                className="mt-4 min-h-[320px] w-full resize-y rounded-xl border border-line bg-surface-muted p-4 text-sm leading-relaxed text-fg outline-none focus:border-brand/40"
              />
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-fg-muted">
                No sections yet. Create one to start collaborating.
              </p>
              <Button type="button" onClick={() => setShowAddSection(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add section
              </Button>
            </div>
          )}
        </Card>
      </div>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-fg">Role Assignment</h2>
            <p className="mt-1 text-sm text-fg-muted">
              {isLead
                ? "As Project Lead, create roles and assign them to teammates."
                : "Only the Project Lead can create roles and assign teammates."}
            </p>
          </div>
          {isLead && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                onClick={() =>
                  setRoles((r) => [
                    ...r,
                    {
                      id: `new-${Date.now()}`,
                      label: "New role",
                      userId: null,
                      name: "",
                    },
                  ])
                }
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add role
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={saveRoles}
                loading={savingRoles}
              >
                {savingRoles ? "Saving…" : "Save assignments"}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.length === 0 && (
            <p className="text-sm text-fg-muted sm:col-span-2 lg:col-span-3">
              No roles yet
              {isLead ? " — add roles and assign your teammates." : "."}
            </p>
          )}
          {roles.map((r, idx) => (
            <Card key={r.id}>
              {isLead ? (
                <input
                  value={r.label}
                  onChange={(e) => {
                    const next = [...roles];
                    next[idx] = { ...r, label: e.target.value };
                    setRoles(next);
                  }}
                  className="w-full rounded-lg border border-line bg-transparent px-2 py-1 text-xs uppercase tracking-wider text-fg-subtle outline-none focus:border-brand/40"
                />
              ) : (
                <p className="text-xs uppercase tracking-wider text-fg-subtle">
                  {r.label}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={r.name || r.label} />
                {isLead ? (
                  <select
                    value={r.userId || ""}
                    onChange={(e) => {
                      const userId = e.target.value || null;
                      const member = members.find((m) => m.id === userId);
                      const next = [...roles];
                      next[idx] = {
                        ...r,
                        userId,
                        name: member?.name || "",
                      };
                      setRoles(next);
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-line bg-surface-muted px-2 py-1.5 text-sm text-fg outline-none focus:border-brand/40"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-fg">
                    {r.name || "Unassigned"}
                  </p>
                )}
              </div>
              {isLead && (
                <button
                  type="button"
                  className="mt-3 text-xs text-fg-subtle hover:text-fg"
                  onClick={() =>
                    setRoles((list) => list.filter((_, i) => i !== idx))
                  }
                >
                  Remove role
                </button>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
