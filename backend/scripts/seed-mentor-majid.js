require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BIO = `Abdul Majid Bah is a software engineering intern and tutor at Knowledge Network Solutions (KNS). He supports learners with practical software skills and helps students build with confidence during the programme.`;

async function main() {
  const now = new Date();
  const email = "abdul.majid@kns.sl";

  const mentor = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Abdul Majid Bah",
      role: "MENTOR",
      title: "Software Engineering Intern",
      bio: BIO,
      emailVerifiedAt: now,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
    create: {
      email,
      name: "Abdul Majid Bah",
      role: "MENTOR",
      title: "Software Engineering Intern",
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
