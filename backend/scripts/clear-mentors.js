const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.teamMentor.deleteMany();
  await prisma.team.updateMany({ data: { mentorId: null } });
  await prisma.chatMessage.deleteMany({ where: { channel: "mentor" } });

  const mentors = await prisma.user.findMany({
    where: { role: "MENTOR" },
    select: { id: true, email: true, name: true },
  });

  for (const mentor of mentors) {
    await prisma.notification.deleteMany({ where: { userId: mentor.id } });
    await prisma.score.deleteMany({ where: { judgeId: mentor.id } });
    await prisma.user.delete({ where: { id: mentor.id } });
  }

  console.log(
    "Removed mentors:",
    mentors.map((m) => m.email).join(", ") || "(none)"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
