import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mentors & Judges",
  description: "Meet our judges and mentors for the AI Innovation Hackathon 2026.",
};

export default function MentorsLayout({ children }: { children: ReactNode }) {
  return children;
}
