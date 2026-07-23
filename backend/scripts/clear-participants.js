const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const participants = await prisma.user.findMany({
    where: { role: "PARTICIPANT" },
    select: { id: true, email: true, name: true },
  });

  for (const user of participants) {
    await prisma.teamMember.deleteMany({ where: { userId: user.id } });
    await prisma.teamResponsibility.updateMany({
      where: { userId: user.id },
      data: { userId: null },
    });
    await prisma.task.updateMany({
      where: { assigneeId: user.id },
      data: { assigneeId: null },
    });
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.taskComment.deleteMany({ where: { authorId: user.id } });
    await prisma.chatMessage.deleteMany({ where: { authorId: user.id } });
    await prisma.submission.updateMany({
      where: { authorId: user.id },
      data: { authorId: null },
    });
    await prisma.workspaceDoc.updateMany({
      where: { updatedById: user.id },
      data: { updatedById: null },
    });
    await prisma.score.deleteMany({ where: { judgeId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }

  console.log(
    "Removed participants:",
    participants.map((p) => p.email).join(", ") || "(none)"
  );
  console.log("Remaining users:", await prisma.user.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
