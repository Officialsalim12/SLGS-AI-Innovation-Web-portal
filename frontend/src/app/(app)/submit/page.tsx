"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form-fields";
import { FileUploadField } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const steps = [
  "Project Name",
  "Project Description",
  "GitHub Repository",
  "Live Demo",
  "Pitch Deck",
  "Demo Video",
  "Documentation",
  "Prototype",
  "Final Submit",
];

type FormState = {
  name: string;
  description: string;
  github: string;
  demo: string;
  pitch: string;
  video: string;
  videoLink: string;
  docs: string;
  prototype: string;
  prototypeLink: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  github: "",
  demo: "",
  pitch: "",
  video: "",
  videoLink: "",
  docs: "",
  prototype: "",
  prototypeLink: "",
};

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

function looksLikeUpload(url: string) {
  return /\/uploads\//i.test(url);
}

export default function SubmitPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.submission();
        if (cancelled) return;
        const s = res.submission;
        if (s) {
          const video = str(s.videoUrl) || str(s.video);
          const prototype = str(s.prototypeUrl) || str(s.prototype);
          setForm({
            name: str(s.title) || str(s.name),
            description: str(s.description),
            github: str(s.repoUrl) || str(s.github),
            demo: str(s.demoUrl) || str(s.demo),
            pitch: str(s.deckUrl) || str(s.pitch),
            video: looksLikeUpload(video) ? video : "",
            videoLink: looksLikeUpload(video) ? "" : video,
            docs: str(s.docsUrl) || str(s.docs),
            prototype: looksLikeUpload(prototype) ? prototype : "",
            prototypeLink: looksLikeUpload(prototype) ? "" : prototype,
          });
          const status = str(s.status);
          if (
            status === "SUBMITTED" ||
            status === "FINAL" ||
            status === "UNDER_REVIEW"
          ) {
            setDone(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load submission"
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

  const videoValue = form.video || form.videoLink;
  const prototypeValue = form.prototype || form.prototypeLink;

  const checklist = [
    { label: "Repository", done: Boolean(form.github) },
    { label: "Demo", done: Boolean(form.demo) },
    { label: "Pitch deck", done: Boolean(form.pitch) },
    { label: "Video", done: Boolean(videoValue) },
    { label: "Docs", done: Boolean(form.docs) },
    { label: "Prototype", done: Boolean(prototypeValue) },
  ];

  const progress = ((step + 1) / steps.length) * 100;
  const checklistProgress = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100
  );

  async function save(finalize = false) {
    setSaving(true);
    try {
      await api.saveSubmission({
        title: form.name,
        name: form.name,
        description: form.description,
        github: form.github,
        demo: form.demo,
        pitch: form.pitch,
        video: videoValue,
        docs: form.docs,
        prototype: prototypeValue,
        finalize,
      });
      if (finalize) {
        setDone(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#7C3AED", "#2563EB", "#10B981", "#F97316"],
        });
        toast("Project submitted successfully!", "success");
      } else {
        toast("Draft saved", "success");
      }
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not save submission",
        "error"
      );
      throw err;
    } finally {
      setSaving(false);
    }
  }

  const next = async () => {
    try {
      await save(false);
      setStep((s) => Math.min(steps.length - 1, s + 1));
    } catch {
      /* already toasted */
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const finalize = async () => {
    try {
      await save(true);
    } catch {
      /* already toasted */
    }
  };

  if (loading) {
    return <PageLoader label="Loading submission…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald/20 text-emerald-light">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-semibold text-fg">Submission locked</h1>
        <p className="mt-3 text-fg-muted">
          Only administrators can reopen submissions. Good luck on Demo Day.
        </p>
        <Button className="mt-8" onClick={() => (window.location.href = "/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
            Project Submission
          </h1>
          <p className="mt-1 text-fg-muted">
            Step {step + 1} of {steps.length} · {steps[step]}
          </p>
          <Progress value={progress} className="mt-4" color="emerald" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {steps.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs",
                i === step
                  ? "bg-purple/30 text-purple-light"
                  : i < step
                    ? "bg-emerald/15 text-emerald-light"
                    : "bg-surface-muted text-fg-subtle"
              )}
            >
              {i < step && <Check className="h-3 w-3" />}
              {s}
            </button>
          ))}
        </div>

        <Card>
          {step === 0 && (
            <Input
              label="Project Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Community Outage Reporter"
            />
          )}
          {step === 1 && (
            <Textarea
              label="Project Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What problem are you solving?"
              rows={6}
            />
          )}
          {step === 2 && (
            <Input
              label="GitHub Repository"
              type="url"
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              placeholder="https://github.com/..."
            />
          )}
          {step === 3 && (
            <Input
              label="Live Demo"
              type="url"
              value={form.demo}
              onChange={(e) => setForm({ ...form, demo: e.target.value })}
              placeholder="https://..."
            />
          )}
          {step === 4 && (
            <FileUploadField
              label="Pitch Deck"
              accept=".pdf,.ppt,.pptx,.key"
              value={form.pitch}
              onChange={(url) => setForm({ ...form, pitch: url })}
              hint="Upload your pitch deck (PDF or slides, max 8 MB)."
            />
          )}
          {step === 5 && (
            <div className="space-y-5">
              <Input
                label="Demo Video link"
                type="url"
                value={form.videoLink}
                onChange={(e) =>
                  setForm({ ...form, videoLink: e.target.value })
                }
                placeholder="YouTube / Drive / Loom link"
              />
              <FileUploadField
                label="Or upload a video file"
                accept="video/*,.mp4,.webm,.mov"
                value={form.video}
                onChange={(url) => setForm({ ...form, video: url })}
                hint="Optional upload if you don’t have a public link (max 8 MB)."
              />
            </div>
          )}
          {step === 6 && (
            <FileUploadField
              label="Documentation"
              accept=".pdf,.doc,.docx,.md,.txt"
              value={form.docs}
              onChange={(url) => setForm({ ...form, docs: url })}
              hint="Upload docs or README export (max 8 MB)."
            />
          )}
          {step === 7 && (
            <div className="space-y-5">
              <Input
                label="Prototype link"
                type="url"
                value={form.prototypeLink}
                onChange={(e) =>
                  setForm({ ...form, prototypeLink: e.target.value })
                }
                placeholder="Figma / prototype URL"
              />
              <FileUploadField
                label="Or upload a prototype file"
                accept=".pdf,.png,.jpg,.jpeg,.zip"
                value={form.prototype}
                onChange={(url) => setForm({ ...form, prototype: url })}
                hint="Optional file if you don’t have a public link (max 8 MB)."
              />
            </div>
          )}
          {step === 8 && (
            <div className="space-y-3 text-sm text-fg-muted">
              <p>
                Review your submission. Once submitted, only admins can reopen
                it. Mentors and admins only see submitted projects — drafts stay
                private.
              </p>
              <ul className="space-y-1 text-fg-muted">
                <li>Project: {form.name || "—"}</li>
                <li>Repo: {form.github || "—"}</li>
                <li>Demo: {form.demo || "—"}</li>
                <li>Pitch: {form.pitch ? "Uploaded" : "—"}</li>
                <li>Video: {videoValue || "—"}</li>
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0 || saving}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} loading={saving}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finalize} loading={saving}>
                Final Submit
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Card className="h-fit">
        <p className="text-xs uppercase tracking-wider text-fg-subtle">
          Progress indicator
        </p>
        <div className="mt-4 space-y-3">
          {checklist.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-fg-muted">{c.label}</span>
              {c.done ? (
                <span className="text-emerald-light">✓</span>
              ) : (
                <span className="text-orange-light">Pending</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-sm text-fg-muted">Submission</p>
          <p className="mt-1 font-display text-3xl text-fg">
            {checklistProgress}%
          </p>
          <Progress value={checklistProgress} className="mt-3" />
        </div>
      </Card>
    </div>
  );
}
