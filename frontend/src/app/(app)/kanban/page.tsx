"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MessageSquare,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/form-fields";
import { FileUploadField } from "@/components/ui/file-upload";
import { InlineLoader, PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type TaskFocus = "details" | "files" | "comments";

type Task = {
  id: string;
  title: string;
  assignees: string[];
  assignee: string;
  assigneeId: string | null;
  due: string;
  priority: "High" | "Medium" | "Low";
  comments: number;
  attachments: number;
  attachmentUrls?: string[];
  labels: string[];
  canMove: boolean;
};

type Columns = Record<string, Task[]>;
type Member = { id: string; name: string };
type Comment = {
  id: string;
  body: string;
  author: string;
  authorId: string;
  createdAt: string;
};

const columnMeta = [
  { id: "ideas", title: "Ideas" },
  { id: "todo", title: "Todo" },
  { id: "inProgress", title: "In Progress" },
  { id: "testing", title: "Testing" },
  { id: "completed", title: "Completed" },
];

const emptyColumns = (): Columns =>
  Object.fromEntries(columnMeta.map((c) => [c.id, []])) as Columns;

function priorityVariant(p: Task["priority"]) {
  if (p === "High") return "orange" as const;
  if (p === "Medium") return "blue" as const;
  return "muted" as const;
}

function ColumnDroppable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mt-3 min-h-[140px] space-y-3 rounded-xl transition",
        isOver && "bg-brand/8 ring-1 ring-brand/30"
      )}
    >
      {children}
    </div>
  );
}

function TaskCard({
  task,
  dragging,
  onOpen,
}: {
  task: Task;
  dragging?: boolean;
  onOpen?: (focus?: TaskFocus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      disabled: !task.canMove,
      data: { type: "task" },
    });

  const attachmentCount =
    task.attachmentUrls?.length ?? task.attachments ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-xl border border-line bg-surface-muted p-3",
        (isDragging || dragging) && "opacity-50 ring-2 ring-purple/50",
        !task.canMove && "opacity-80"
      )}
    >
      <div className="flex items-start gap-2">
        {task.canMove ? (
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none text-fg-subtle active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <span className="mt-0.5 h-4 w-4" />
        )}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onOpen?.("details")}
          >
            <p className="text-sm font-medium text-fg">{task.title}</p>
            <div className="mt-3 space-y-1.5 text-xs text-fg-muted">
              <p>
                Assigned To <span className="text-fg">{task.assignee}</span>
              </p>
              <p className="flex items-center gap-2">
                Priority{" "}
                <Badge variant={priorityVariant(task.priority)}>
                  {task.priority}
                </Badge>
              </p>
              <p>
                Due Date <span className="text-fg">{task.due || "—"}</span>
              </p>
            </div>
          </button>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => onOpen?.("comments")}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2 py-1 text-fg-muted transition hover:border-brand/40 hover:text-fg"
              title="Open comments"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments}</span>
              <span className="text-fg-subtle">comments</span>
            </button>
            {task.canMove && (
              <button
                type="button"
                onClick={() => onOpen?.("files")}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2 py-1 text-fg-muted transition hover:border-brand/40 hover:text-fg"
                title="Open file attachments"
              >
                <Paperclip className="h-3 w-3" />
                <span>{attachmentCount}</span>
                <span className="text-fg-subtle">files</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [columns, setColumns] = useState<Columns>(emptyColumns());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLead, setIsLead] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">(
    "Medium"
  );
  const [newDue, setNewDue] = useState("");
  const [newColumn, setNewColumn] = useState("todo");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);
  const [taskFocus, setTaskFocus] = useState<TaskFocus>("details");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const filesSectionRef = useRef<HTMLDivElement>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function loadTasks() {
    const res = await api.tasks();
    setColumns({ ...emptyColumns(), ...res.columns });
    setIsLead(res.isLead);
    setMembers(res.members);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadTasks();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load tasks");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTasks = useMemo(
    () => Object.values(columns).flat(),
    [columns]
  );
  const activeTask = allTasks.find((t) => t.id === activeId) || null;

  function findColumn(id: string) {
    return Object.keys(columns).find((key) =>
      columns[key].some((t) => t.id === id)
    );
  }

  function onDragStart(event: DragStartEvent) {
    const task = allTasks.find((t) => t.id === String(event.active.id));
    if (task && !task.canMove) {
      toast("You can only move tasks assigned to you", "error");
      return;
    }
    setActiveId(String(event.active.id));
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const dragged = allTasks.find((t) => t.id === String(active.id));
    if (dragged && !dragged.canMove) {
      toast("You can only move tasks assigned to you", "error");
      return;
    }

    const activeCol = findColumn(String(active.id));
    const overCol =
      findColumn(String(over.id)) ||
      columnMeta.find((c) => c.id === over.id)?.id;

    if (!activeCol || !overCol) return;

    if (activeCol === overCol) {
      const list = [...columns[activeCol]];
      const oldIndex = list.findIndex((t) => t.id === active.id);
      const newIndex = list.findIndex((t) => t.id === over.id);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved);
      setColumns({ ...columns, [activeCol]: list });
      try {
        await api.moveTask({ id: String(active.id), column: overCol });
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not save move", "error");
        await loadTasks();
      }
      return;
    }

    const from = [...columns[activeCol]];
    const to = [...columns[overCol]];
    const fromIndex = from.findIndex((t) => t.id === active.id);
    if (fromIndex < 0) return;
    const [moved] = from.splice(fromIndex, 1);
    const overIndex = to.findIndex((t) => t.id === over.id);
    if (overIndex >= 0) to.splice(overIndex, 0, moved);
    else to.push(moved);
    const prev = columns;
    const next = { ...columns, [activeCol]: from, [overCol]: to };
    setColumns(next);
    try {
      await api.moveTask({ id: String(active.id), column: overCol });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save move", "error");
      setColumns(prev);
    }
  }

  async function openTask(task: Task, focus: TaskFocus = "details") {
    setSelected(task);
    setTaskFocus(focus);
    setCommentText("");
    setLoadingComments(true);
    try {
      const res = await api.taskComments(task.id);
      setComments(res.comments);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not load comments",
        "error"
      );
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => {
      if (taskFocus === "files") {
        filesSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (taskFocus === "comments") {
        commentsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        commentInputRef.current?.focus();
      }
    }, 50);
    return () => window.clearTimeout(timer);
  }, [selected, taskFocus, loadingComments]);

  async function createTask() {
    if (!newTitle.trim()) {
      toast("Enter a task title", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await api.createTask({
        title: newTitle.trim(),
        column: newColumn,
        priority: newPriority,
        dueDate: newDue || undefined,
        assigneeId: newAssignee || null,
      });
      setColumns((cols) => {
        const col = res.task.column;
        const list = [...(cols[col] || [])];
        list.push({
          id: res.task.id,
          title: res.task.title,
          assigneeId: res.task.assigneeId,
          assignee: res.task.assignee,
          assignees: res.task.assignees,
          due: res.task.due,
          priority: res.task.priority as Task["priority"],
          comments: res.task.comments,
          attachments: res.task.attachments,
          labels: res.task.labels,
          canMove: res.task.canMove,
        });
        return { ...cols, [col]: list };
      });
      setNewTitle("");
      setNewAssignee("");
      setNewDue("");
      setNewPriority("Medium");
      setNewColumn("todo");
      setShowCreate(false);
      toast("Task created", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create task", "error");
    } finally {
      setCreating(false);
    }
  }

  async function postComment() {
    if (!selected || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await api.postTaskComment(selected.id, commentText.trim());
      setComments((c) => [...c, res.comment]);
      setCommentText("");
      setColumns((cols) => {
        const next = { ...cols };
        for (const key of Object.keys(next)) {
          next[key] = next[key].map((t) =>
            t.id === selected.id ? { ...t, comments: t.comments + 1 } : t
          );
        }
        return next;
      });
      setSelected((t) => (t ? { ...t, comments: t.comments + 1 } : t));
      toast("Comment added", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not post comment",
        "error"
      );
    } finally {
      setPostingComment(false);
    }
  }

  async function reassignSelected(assigneeId: string) {
    if (!selected || !isLead) return;
    try {
      await api.moveTask({
        id: selected.id,
        column: findColumn(selected.id) || "todo",
        assigneeId: assigneeId || null,
      });
      await loadTasks();
      const member = members.find((m) => m.id === assigneeId);
      setSelected((t) =>
        t
          ? {
              ...t,
              assigneeId: assigneeId || null,
              assignee: member?.name || "Unassigned",
              assignees: member ? [member.name] : [],
            }
          : t
      );
      toast("Assignee updated", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update assignee",
        "error"
      );
    }
  }

  async function attachFile(url: string) {
    if (!selected || !url) return;
    try {
      const res = await api.attachTaskFile(selected.id, url);
      setSelected((t) =>
        t
          ? {
              ...t,
              attachments: res.task.attachments,
              attachmentUrls: res.task.attachmentUrls,
            }
          : t
      );
      setColumns((cols) => {
        const next = { ...cols };
        for (const key of Object.keys(next)) {
          next[key] = next[key].map((t) =>
            t.id === selected.id
              ? {
                  ...t,
                  attachments: res.task.attachments,
                  attachmentUrls: res.task.attachmentUrls,
                }
              : t
          );
        }
        return next;
      });
      toast("File attached to task", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not attach file",
        "error"
      );
    }
  }

  if (loading) {
    return <PageLoader label="Loading kanban…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {isLead
              ? "Create tasks and assign them to teammates. Drag any card to update status."
              : "Update progress on your assigned tasks and leave comments for the team."}
          </p>
        </div>
        {isLead && (
          <Button type="button" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New task
          </Button>
        )}
      </div>

      {showCreate && isLead && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-fg">Create task</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Design login page"
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-fg-muted">Assign to</span>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-fg outline-none focus:border-purple/40"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-fg-muted">Column</span>
              <select
                value={newColumn}
                onChange={(e) => setNewColumn(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-fg outline-none focus:border-purple/40"
              >
                {columnMeta.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-fg-muted">Priority</span>
              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as Task["priority"])
                }
                className="w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-fg outline-none focus:border-purple/40"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
            <Input
              label="Due date"
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={createTask} disabled={creating}>
              {creating ? "Creating…" : "Create task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-4 scrollbar-thin sm:-mx-4 sm:gap-4 sm:px-4 lg:mx-0 lg:px-0">
          {columnMeta.map((col) => (
            <Card
              key={col.id}
              className="w-[min(280px,85vw)] shrink-0 bg-card"
              glass={false}
            >
              <CardHeader
                title={col.title}
                action={
                  <span className="text-xs text-fg-subtle">
                    {columns[col.id]?.length || 0}
                  </span>
                }
              />
              <SortableContext
                items={(columns[col.id] || []).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
                id={col.id}
              >
                <ColumnDroppable id={col.id}>
                  {(columns[col.id] || []).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpen={(focus) => openTask(task, focus)}
                    />
                  ))}
                  {(columns[col.id] || []).length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-fg-subtle">
                      Drop tasks here
                    </p>
                  )}
                </ColumnDroppable>
              </SortableContext>
            </Card>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
          <Card className="relative max-h-[85dvh] w-full max-w-lg min-w-0 overflow-y-auto">
            <button
              type="button"
              className="absolute right-4 top-4 text-fg-subtle hover:text-fg"
              onClick={() => setSelected(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="pr-8 text-xl font-semibold text-fg">
              {selected.title}
            </h2>
            <div className="mt-3 space-y-2 text-sm text-fg-muted">
              <p>
                Status:{" "}
                <span className="text-fg">
                  {columnMeta.find((c) => c.id === findColumn(selected.id))
                    ?.title || "—"}
                </span>
              </p>
              {isLead ? (
                <label className="block">
                  <span className="mb-1 block text-xs text-fg-subtle">
                    Assign to
                  </span>
                  <select
                    value={selected.assigneeId || ""}
                    onChange={(e) => reassignSelected(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface-muted px-3 py-2 text-sm text-fg outline-none focus:border-purple/40"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p>
                  Assigned to{" "}
                  <span className="text-fg">{selected.assignee}</span>
                </p>
              )}
              {!selected.canMove && (
                <p className="text-xs text-fg-subtle">
                  Progress updates are limited to the assignee and Project Lead.
                </p>
              )}
            </div>

            {taskFocus !== "comments" && selected.canMove && (
              <div
                ref={filesSectionRef}
                className={cn(
                  "mt-6 rounded-xl border p-3",
                  taskFocus === "files"
                    ? "border-brand/40 bg-brand/5"
                    : "border-transparent"
                )}
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
                  <Paperclip className="h-4 w-4 text-fg-muted" />
                  File attachments
                </h3>
                <p className="mt-1 text-xs text-fg-subtle">
                  Upload docs, images, or other files for this task.
                </p>
                {(selected.attachmentUrls || []).length === 0 ? (
                  <p className="mt-2 text-sm text-fg-muted">No files attached.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {(selected.attachmentUrls || []).map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand hover:underline"
                        >
                          {url.split("/").pop() || "Attachment"}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3">
                  <FileUploadField
                    label="Upload file"
                    value=""
                    onChange={attachFile}
                    hint="Attach a file to this task (max 8 MB)."
                  />
                </div>
              </div>
            )}

            <div
              ref={commentsSectionRef}
              className={cn(
                "mt-4 rounded-xl border p-3",
                taskFocus === "comments"
                  ? "border-brand/40 bg-brand/5"
                  : "border-transparent"
              )}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <MessageSquare className="h-4 w-4 text-fg-muted" />
                Comments
              </h3>
              <p className="mt-1 text-xs text-fg-subtle">
                Leave text updates and notes for your team.
              </p>
              {loadingComments ? (
                <InlineLoader label="Loading comments…" className="mt-2" />
              ) : comments.length === 0 ? (
                <p className="mt-2 text-sm text-fg-muted">No comments yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border border-line bg-surface-muted px-3 py-2"
                    >
                      <p className="text-xs text-fg-subtle">
                        {c.author} ·{" "}
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-fg">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 space-y-2">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Write a comment…"
                  className="w-full resize-y rounded-xl border border-line bg-surface-muted p-3 text-sm text-fg outline-none focus:border-purple/40"
                />
                <Button
                  type="button"
                  onClick={postComment}
                  loading={postingComment}
                  disabled={!commentText.trim()}
                >
                  {postingComment ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
