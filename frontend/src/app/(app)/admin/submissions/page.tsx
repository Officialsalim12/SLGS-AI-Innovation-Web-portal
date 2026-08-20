"use client";

import { SubmissionReviewPanel } from "@/components/submissions/submission-review-panel";

export default function AdminSubmissionsPage() {
  return (
    <SubmissionReviewPanel
      title="Project Reviews"
      description="Open submitted files and see each judge’s grades. Publish when ready — you cannot change scores."
    />
  );
}
