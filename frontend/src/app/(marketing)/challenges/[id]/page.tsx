"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/challenges#${id}`);
  }, [id, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-fg/50 md:px-6">
      Redirecting to problem statements…
    </div>
  );
}
