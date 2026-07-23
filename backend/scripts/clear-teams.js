const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.score.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamResponsibility.deleteMany();
  await prisma.workspaceDoc.deleteMany();
  await prisma.teamMentor.deleteMany();
  await prisma.teamMember.deleteMany();
  const n = await prisma.team.deleteMany();
  console.log("Deleted teams:", n.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
