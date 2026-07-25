require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BIO = `Abdul Salim Gani is a full-stack software engineer and Software Lead at KNS. He builds web and mobile products that solve real problems, working across frontend and backend to turn ideas into apps people actually use.

Outside KNS, he collaborates with startups, entrepreneurs, and organizations to help bring ideas to life through technology. His work spans software architecture, APIs, databases, cloud solutions, AI integrations, and product development.

What drives him is building things that last: solutions that create opportunities and leave a real impact. That same mindset sits behind DiscoverSalone, a project he is building to showcase Sierra Leone to the world while supporting local businesses, communities, and the country's digital transformation.`;

async function main() {
  const now = new Date();
  const email = "salim@kns.sl";

  const mentor = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Abdul Salim Gani",
      role: "MENTOR",
      title: "Software Lead, KNS",
      bio: BIO,
      emailVerifiedAt: now,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
    create: {
      email,
      name: "Abdul Salim Gani",
      role: "MENTOR",
      title: "Software Lead, KNS",
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
