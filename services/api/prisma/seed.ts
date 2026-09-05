import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const society = await prisma.society.upsert({
    where: { code: "BVR001" },
    update: {},
    create: {
      name: "Beaverr Demo Society",
      code: "BVR001",
      address: "123 Demo Lane, Mumbai",
      isRestrictedEntry: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { societyId_phone: { societyId: society.id, phone: "9000000001" } },
    update: {},
    create: {
      societyId: society.id,
      name: "Asha Admin",
      phone: "9000000001",
      email: "admin@beaverr.demo",
      role: "SOCIETY_ADMIN",
    },
  });

  await prisma.society.update({ where: { id: society.id }, data: { adminUserId: admin.id } });

  const guardPasswordHash = await bcrypt.hash("guard123", 10);
  await prisma.user.upsert({
    where: { societyId_phone: { societyId: society.id, phone: "9000000002" } },
    update: {},
    create: {
      societyId: society.id,
      name: "Gopal Guard",
      phone: "9000000002",
      role: "GUARD",
      passwordHash: guardPasswordHash,
    },
  });

  await prisma.department.createMany({
    data: [
      { societyId: society.id, name: "Maintenance", contactName: "Ravi", phone: "9000000010" },
      { societyId: society.id, name: "Security", contactName: "Gopal Guard", phone: "9000000002" },
    ],
    skipDuplicates: true,
  });

  const units = await Promise.all(
    [
      { block: "A", floor: 1, unitNumber: "101", type: "TWO_BHK" as const },
      { block: "A", floor: 2, unitNumber: "201", type: "THREE_BHK" as const },
    ].map((unit) =>
      prisma.unit.upsert({
        where: { societyId_block_unitNumber: { societyId: society.id, block: unit.block, unitNumber: unit.unitNumber } },
        update: {},
        create: { societyId: society.id, ...unit },
      }),
    ),
  );

  const resident = await prisma.user.upsert({
    where: { societyId_phone: { societyId: society.id, phone: "9000000101" } },
    update: {},
    create: {
      societyId: society.id,
      name: "Riya Resident",
      phone: "9000000101",
      email: "riya@beaverr.demo",
      role: "RESIDENT",
    },
  });

  await prisma.unit.update({ where: { id: units[0].id }, data: { ownerUserId: resident.id } });

  console.log("Seed complete:");
  console.log(`  Society code: ${society.code}`);
  console.log(`  Admin phone: 9000000001 (OTP logged to console — OTP_PROVIDER=console)`);
  console.log(`  Guard phone: 9000000002 / password: guard123`);
  console.log(`  Resident phone: 9000000101 (OTP logged to console)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
