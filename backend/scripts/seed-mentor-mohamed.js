require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BIO = `Mohamed Super Dumbuya is a software engineer, tech educator, and entrepreneur. He is co-founder of Tech Inspire SL and Lead Developer at UniGuide, where he builds digital solutions that improve education and opportunities for young people in Sierra Leone.

He is passionate about software development, AI, and using technology to solve real-world problems.`;

async function main() {
  const now = new Date();
  const email = "mohamed.dumbuya@kns.sl";

  const mentor = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Mohamed Super Dumbuya",
      role: "MENTOR",
      title: "Software Engineer & Tech Educator",
      bio: BIO,
      emailVerifiedAt: now,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
    create: {
      email,
      name: "Mohamed Super Dumbuya",
      role: "MENTOR",
      title: "Software Engineer & Tech Educator",
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
