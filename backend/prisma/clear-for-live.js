/**
 * Clears the DB for go-live. Schema stays. No seed users.
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database for go-live…");

  await prisma.$transaction([
    prisma.chatReaction.deleteMany(),
    prisma.chatMessage.deleteMany(),
    prisma.taskComment.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.score.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.task.deleteMany(),
    prisma.teamResponsibility.deleteMany(),
    prisma.workspaceDoc.deleteMany(),
    prisma.teamMentor.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.faq.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.user.deleteMany(),
    prisma.programmeMeta.deleteMany(),
  ]);

  await prisma.programmeMeta.create({
    data: {
      id: "default",
      name: "KNS and SLGS AI Innovation Bootcamp & Challenge 2026",
      theme: "Building for Sierra Leone",
      venue: "Sierra Leone Grammar School, Murray Town",
      startDate: new Date("2026-07-27"),
      endDate: new Date("2026-08-21"),
      welcomeLine:
        "Four weeks: two weeks of instructor led bootcamp, then two weeks building with your team and mentor. Facilitated by KNS in partnership with SLGS.",
    },
  });

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.submission.count(),
    prisma.announcement.count(),
    prisma.faq.count(),
    prisma.challenge.count(),
  ]);

  console.log("Done. Database is empty for go-live.");
  console.log(
    `Remaining: users=${counts[0]}, teams=${counts[1]}, submissions=${counts[2]}, announcements=${counts[3]}, faqs=${counts[4]}, challenges=${counts[5]}`
  );
  console.log("Programme metadata kept. Create a new admin account to start.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
