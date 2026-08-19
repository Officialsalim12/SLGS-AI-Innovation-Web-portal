"use client";

import { SubmissionReviewPanel } from "@/components/submissions/submission-review-panel";

export default function AdminSubmissionsPage() {
  return (
    <SubmissionReviewPanel
      title="Project Reviews"
      description="Open submitted files and see how each judge scored the team. Administrators do not grade projects."
    />
  );
}
