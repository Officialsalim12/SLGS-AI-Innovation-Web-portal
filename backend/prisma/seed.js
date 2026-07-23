const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const challenges = [
  {
    slug: "agri-opp-portal",
    title: "Find Farm Support",
    track: "Agriculture",
    category: "Agriculture",
    featured: true,
    summary:
      "Government has farm grants, seeds, and training, but many young people never hear about them or know how to apply.",
    problem: "How can youth easily find and apply for farm support programs?",
  },
  {
    slug: "civic-problem-platform",
    title: "Report Community Problems",
    track: "Civic",
    category: "Civic",
    featured: true,
    summary:
      "People complain about broken pipes, bad roads, and other issues on social media, but government has no clear way to see what matters most.",
    problem:
      "How can communities report local problems and show government which ones to fix first?",
  },
  {
    slug: "salone-blessed",
    title: "Tell Unity Stories",
    track: "Media",
    category: "Media",
    featured: true,
    summary:
      "Online talk often divides people, while good stories of youth working together stay hidden.",
    problem:
      "How can we share live stories of youth from different places building together?",
  },
  {
    slug: "gov-info-chatbot",
    title: "Check Fake News & Scams",
    track: "Safety",
    category: "Safety",
    featured: true,
    summary:
      "False WhatsApp messages and online scams spread fast, and people have nowhere trusted to check the truth or report fraud.",
    problem:
      "How can citizens quickly verify viral messages and report cyber scams?",
  },
  {
    slug: "market-price-radar",
    title: "Know Fair Market Prices",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Farmers often sell crops cheap because they do not know the fair price in other towns.",
    problem: "How can a farmer check today’s fair price before selling?",
  },
  {
    slug: "clinic-queue-smart",
    title: "Find a Faster Clinic",
    track: "Health",
    category: "Health",
    summary:
      "People waste hours in clinic lines without knowing which nearby clinic is freer.",
    problem: "How can a parent find which nearby clinic can help sooner?",
  },
  {
    slug: "school-fee-clarity",
    title: "Understand School Fees",
    track: "Education",
    category: "Education",
    summary:
      "Families struggle to understand school fees and what help is available.",
    problem: "How can parents clearly see school costs and available support?",
  },
  {
    slug: "waste-pickup-map",
    title: "Report Missed Rubbish",
    track: "Environment",
    category: "Environment",
    summary:
      "Rubbish piles up when pickup is missed and nobody has a shared way to report it.",
    problem:
      "How can a community report missed rubbish pickup and show the worst spots?",
  },
  {
    slug: "transport-fare-fair",
    title: "Fair Okada & Poda Fares",
    track: "Transport",
    category: "Transport",
    summary:
      "Riders and passengers argue about fares because there is no shared guide for common trips.",
    problem: "How can people know a fair fare before they board?",
  },
  {
    slug: "flood-early-alert",
    title: "Flood Early Warning",
    track: "Climate",
    category: "Climate",
    summary: "Flood warnings often come too late for families to move to safety.",
    problem:
      "How can flood-prone communities get earlier warnings they understand?",
  },
  {
    slug: "job-skills-matcher",
    title: "Match Skills to Jobs",
    track: "Jobs",
    category: "Jobs",
    summary:
      "Young people finish school and struggle to see which jobs or training fit their skills.",
    problem: "How can a graduate find fitting jobs and what to learn next?",
  },
  {
    slug: "blood-donor-network",
    title: "Find Blood Donors Fast",
    track: "Health",
    category: "Health",
    summary:
      "When blood is urgently needed, families still depend on calling people one by one.",
    problem: "How can hospitals reach the right blood donors faster?",
  },
  {
    slug: "water-point-status",
    title: "Report Broken Water Pumps",
    track: "Water",
    category: "Water",
    summary:
      "Broken pumps leave communities without water, and repair teams often hear too late.",
    problem:
      "How can people report a broken pump and track when it will be fixed?",
  },
  {
    slug: "exam-prep-tutor",
    title: "Exam Study Helper",
    track: "Education",
    category: "Education",
    summary:
      "Many students prepare for BECE and WASSCE without enough practice on their weak topics.",
    problem:
      "How can a student get exam practice that focuses on what they struggle with?",
  },
  {
    slug: "small-business-bookkeeping",
    title: "Track Small Business Sales",
    track: "Business",
    category: "Business",
    summary:
      "Small traders often keep sales in notebooks or memory, so profit is hard to see.",
    problem: "How can a trader easily record sales and see daily profit?",
  },
];

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
      "Browse the public pages for programme info, challenges, timeline, FAQ, and grading. When you have an account, open your portal and sign in: participants manage their team, workspace, kanban, chats, and project submission; mentors review assigned teams; administrators run the programme. Use announcements and notifications in the portal for official updates.",
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

  for (const challenge of challenges) {
    await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: challenge,
      create: challenge,
    });
  }

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
