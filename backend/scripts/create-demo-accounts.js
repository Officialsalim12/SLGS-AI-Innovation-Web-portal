require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const now = new Date();

  const participant = await prisma.user.upsert({
    where: { email: "participant@slgs.edu.sl" },
    update: {
      name: "Demo Participant",
      passwordHash,
      role: "PARTICIPANT",
      emailVerifiedAt: now,
      title: "Team Builder",
      onboardingCompletedAt: now,
      cocAcceptedAt: now,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
    create: {
      email: "participant@slgs.edu.sl",
      name: "Demo Participant",
      passwordHash,
      role: "PARTICIPANT",
      emailVerifiedAt: now,
      title: "Team Builder",
      onboardingCompletedAt: now,
      cocAcceptedAt: now,
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: "mentor@slgs.edu.sl" },
    update: {
      name: "Demo Mentor",
      passwordHash,
      role: "MENTOR",
      emailVerifiedAt: now,
      title: "Programme Mentor",
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
    create: {
      email: "mentor@slgs.edu.sl",
      name: "Demo Mentor",
      passwordHash,
      role: "MENTOR",
      emailVerifiedAt: now,
      title: "Programme Mentor",
    },
  });

  let team = await prisma.team.findFirst({ orderBy: { createdAt: "asc" } });
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: "NexWave",
        slug: "nexwave",
        description: "Demo team for the AI Innovation Programme",
      },
    });
  }

  const membership = await prisma.teamMember.findFirst({
    where: { userId: participant.id },
  });
  if (!membership) {
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: participant.id,
        role: "LEAD",
        title: "Project Lead",
      },
    });
  }

  await prisma.team.update({
    where: { id: team.id },
    data: { mentorId: mentor.id },
  });
  await prisma.teamMentor.upsert({
    where: {
      teamId_mentorId: { teamId: team.id, mentorId: mentor.id },
    },
    update: {},
    create: { teamId: team.id, mentorId: mentor.id },
  });

  console.log("Created demo accounts:");
  console.log("  Participant: participant@slgs.edu.sl / Password123!");
  console.log("  Mentor:      mentor@slgs.edu.sl / Password123!");
  console.log("  Team:       ", team.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
