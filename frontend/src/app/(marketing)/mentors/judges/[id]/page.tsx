import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProgrammeJudge, programmeJudges } from "@/lib/data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return programmeJudges.map((judge) => ({ id: judge.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const judge = getProgrammeJudge(id);
  if (!judge) {
    return { title: "Judge" };
  }
  const description =
    judge.bio.split(/\n\n+/)[0] || `${judge.name}, programme judge.`;
  const title = `${judge.name} · Judge`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/mentors/judges/${judge.id}`,
      images: [
        {
          url: judge.photo,
          alt: judge.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [judge.photo],
    },
  };
}

export default async function JudgeBioPage({ params }: PageProps) {
  const { id } = await params;
  const judge = getProgrammeJudge(id);
  if (!judge) notFound();

  const paragraphs = judge.bio.split(/\n\n+/);

  return (
    <div className="overflow-x-hidden pb-16 pt-8 sm:pb-20 sm:pt-12 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/mentors#judges"
          className="inline-flex items-center gap-2 text-sm font-semibold text-fg/60 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to judges
        </Link>

        <article className="mt-8 overflow-hidden rounded-2xl border border-line bg-card/90 p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:mt-10 sm:p-8">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-start">
            <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border border-line bg-white sm:mx-0">
              <Image
                src={judge.photo}
                alt={judge.name}
                fill
                priority
                sizes="220px"
                className="object-cover"
                style={
                  judge.photoPosition
                    ? { objectPosition: judge.photoPosition }
                    : undefined
                }
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                Hackathon judge
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                {judge.name}
              </h1>
              <p className="mt-2 text-base font-semibold text-fg/70">
                {judge.title}
              </p>
              <div className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand to-blue/70" />
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-fg/65 sm:text-[15px] sm:leading-relaxed">
            {paragraphs.map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </div>

          {judge.focus.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {judge.focus.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-line bg-canvas/80 px-2.5 py-1 text-xs font-medium text-fg/65"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}
