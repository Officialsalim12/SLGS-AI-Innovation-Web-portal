require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { challenges } = require("../prisma/challenges");

const prisma = new PrismaClient();

// Refreshes the published problem statements only. Teams, mentors and
// submissions are left untouched.
async function main() {
  const slugs = challenges.map((c) => c.slug);

  for (const challenge of challenges) {
    await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: challenge,
      create: challenge,
    });
  }

  const stale = await prisma.challenge.findMany({
    where: { slug: { notIn: slugs } },
    select: { slug: true, title: true, _count: { select: { teams: true, submissions: true } } },
  });

  const removable = stale.filter(
    (c) => c._count.teams === 0 && c._count.submissions === 0
  );
  const kept = stale.filter(
    (c) => c._count.teams > 0 || c._count.submissions > 0
  );

  if (removable.length) {
    await prisma.challenge.deleteMany({
      where: { slug: { in: removable.map((c) => c.slug) } },
    });
  }

  console.log(`Challenges upserted: ${challenges.length}`);
  console.log(`Old challenges removed: ${removable.length}`);
  if (kept.length) {
    console.log("Kept (still linked to teams or submissions):");
    for (const c of kept) console.log(`  ${c.slug} - ${c.title}`);
  }

  const byTrack = await prisma.challenge.groupBy({
    by: ["track"],
    _count: { _all: true },
  });
  console.log("Now in database:", await prisma.challenge.count());
  for (const t of byTrack) console.log(`  ${t.track}: ${t._count._all}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
