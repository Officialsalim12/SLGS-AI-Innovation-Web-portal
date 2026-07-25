const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { challenges } = require("./challenges");

const prisma = new PrismaClient();

const faqs = [
  {
    question: "What is this programme?",
    answer:
      "The KNS and SLGS AI Innovation Bootcamp & Challenge 2026 is a four week programme at Sierra Leone Grammar School, Murray Town. Facilitated by KNS in partnership with SLGS. Weeks 1 to 2 are an instructor led bootcamp on the fundamentals. Weeks 3 to 4 you are grouped into teams, assigned mentors, and build your solution for Demo Day.",
    sortOrder: 1,
  },
  {
    question: "Do I need a team?",
    answer:
      "Yes — for the build phase. After the bootcamp, administrators create teams and assign mentors. Stick with your group unless organizers move you.",
    sortOrder: 2,
  },
  {
    question: "How do I use this site?",
    answer:
      "Browse the public pages for programme info, challenges, timeline, mentors, FAQ, and grading. When you have an account, open your portal and sign in: participants manage their team, workspace, kanban, chats, and project submission; mentors review assigned teams; administrators run the programme. Use announcements and notifications in the portal for official updates.",
    sortOrder: 3,
  },
  {
    question: "Who do I contact if I'm stuck?",
    answer:
      "During bootcamp, ask your instructors. During the build weeks, ask your mentor for team or project questions. For login or admin issues, use the contact details on the home page.",
    sortOrder: 4,
  },
];

async function main() {
  console.log("Seeding database...");

  const now = new Date();
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamResponsibility.deleteMany();
  await prisma.workspaceDoc.deleteMany();
  await prisma.score.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.teamMentor.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany({ where: { role: "MENTOR" } });

  await prisma.challenge.deleteMany();
  await prisma.challenge.createMany({ data: challenges });

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({ data: faqs });

  await prisma.programmeMeta.upsert({
    where: { id: "default" },
    update: {
      name: "KNS and SLGS AI Innovation Bootcamp & Challenge 2026",
      theme: "Building for Sierra Leone",
      venue: "Sierra Leone Grammar School, Murray Town",
      startDate: new Date("2026-07-27"),
      endDate: new Date("2026-08-21"),
      welcomeLine:
        "Four weeks: two weeks of instructor led bootcamp, then two weeks building with your team and mentor. Facilitated by KNS in partnership with SLGS.",
    },
    create: {
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

  await prisma.user.upsert({
    where: { email: "admin@slgs.edu.sl" },
    update: {
      name: "Programme Admin",
      role: "ADMIN",
      passwordHash,
      emailVerifiedAt: now,
    },
    create: {
      email: "admin@slgs.edu.sl",
      name: "Programme Admin",
      role: "ADMIN",
      passwordHash,
      emailVerifiedAt: now,
    },
  });

  await prisma.user.deleteMany({ where: { role: "PARTICIPANT" } });

  await prisma.announcement.deleteMany();

  console.log("Seed complete:", {
    challenges: await prisma.challenge.count(),
    faqs: await prisma.faq.count(),
    users: await prisma.user.count(),
    teams: await prisma.team.count(),
    programmeMeta: await prisma.programmeMeta.count(),
  });
  console.log("Admin login: admin@slgs.edu.sl / Password123!");
  console.log("No teams or participants are seeded — create them in Admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
