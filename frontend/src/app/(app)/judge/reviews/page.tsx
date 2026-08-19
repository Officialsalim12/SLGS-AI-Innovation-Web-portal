"use client";

import { SubmissionReviewPanel } from "@/components/submissions/submission-review-panel";

export default function JudgeReviewsPage() {
  return (
    <SubmissionReviewPanel
      title="Score projects"
      description="Open each team’s submitted files, then score them with SMART. You cannot see other judges’ marks."
    />
  );
}
