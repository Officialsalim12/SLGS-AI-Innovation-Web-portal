"use client";

import { SubmissionReviewPanel } from "@/components/submissions/submission-review-panel";

export default function JudgeReviewsPage() {
  return (
    <SubmissionReviewPanel
      title="Score projects"
      description="Open each team’s files, score with SMART, and mark grading complete. Scores stay private until an administrator publishes them."
    />
  );
}
