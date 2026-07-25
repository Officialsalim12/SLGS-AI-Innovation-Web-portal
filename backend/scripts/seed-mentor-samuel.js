require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BIO = `Samuel Olu Gibson is a Project Support Engineer and IT Trainer with a background in Electrical and Electronics Engineering. He specialises in project management, technical documentation, product strategy, and digital transformation.

He has experience leading projects, developing training programmes, and designing scalable SaaS platforms. His strengths include leadership, systems thinking, and bridging the gap between technical execution and business objectives.`;

async function main() {
  const now = new Date();
  const email = "samuel.gibson@kns.sl";

  const mentor = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Samuel Olu Gibson",
      role: "MENTOR",
      title: "Project Support Engineer & IT Trainer",
      bio: BIO,
      emailVerifiedAt: now,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
    create: {
      email,
      name: "Samuel Olu Gibson",
      role: "MENTOR",
      title: "Project Support Engineer & IT Trainer",
      bio: BIO,
      emailVerifiedAt: now,
    },
  });

  console.log("Mentor profile ready:");
  console.log("  Name: ", mentor.name);
  console.log("  Email:", mentor.email);
  console.log("  Title:", mentor.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
