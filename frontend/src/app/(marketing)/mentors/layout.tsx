import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mentors & Judges",
  description:
    "Meet the mentors who will help teams during the build weeks, and the judges who will score Demo Day.",
};

export default function MentorsLayout({ children }: { children: ReactNode }) {
  return children;
}
