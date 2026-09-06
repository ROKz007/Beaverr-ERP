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

  // Phase 2+ sample data — gives every module's list view something to show right after seeding,
  // instead of an empty state on first login. These models have no natural unique business key, so
  // upserted by a fixed literal id (bypassing the cuid default) to keep re-running the seed safe.
  const plumber = await prisma.worker.upsert({
    where: { id: "seed-worker-plumber" },
    update: {},
    create: {
      id: "seed-worker-plumber",
      societyId: society.id,
      name: "Ramesh Plumber",
      phone: "9000000201",
      skills: ["Plumbing"],
      isVerified: true,
      ratingAvg: 4.5,
      reputationScore: 65,
    },
  });

  const plumbingService = await prisma.service.upsert({
    where: { id: "seed-service-plumbing" },
    update: {},
    create: {
      id: "seed-service-plumbing",
      societyId: society.id,
      name: "Plumbing Repair",
      description: "Fix leaks, taps, and pipe issues",
      category: "MAINTENANCE",
      subCategory: "Plumbing",
      isPaid: true,
      price: 299,
      slaHours: 24,
      durationEstMins: 60,
    },
  });

  await prisma.service.upsert({
    where: { id: "seed-service-hall" },
    update: {},
    create: {
      id: "seed-service-hall",
      societyId: society.id,
      name: "Clubhouse Booking",
      description: "Book the community hall for private events",
      category: "AMENITY",
      subCategory: "Clubhouse",
      isPaid: true,
      price: 1500,
      slaHours: 48,
      durationEstMins: 180,
    },
  });

  await prisma.serviceBooking.upsert({
    where: { id: "seed-booking-1" },
    update: {},
    create: {
      id: "seed-booking-1",
      societyId: society.id,
      serviceId: plumbingService.id,
      residentId: resident.id,
      workerId: plumber.id,
      status: "CONFIRMED",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.grievance.upsert({
    where: { id: "seed-grievance-1" },
    update: {},
    create: {
      id: "seed-grievance-1",
      societyId: society.id,
      raisedByUserId: resident.id,
      type: "INFRASTRUCTURE",
      description: "Lift in Block A is making a loud noise.",
      status: "OPEN",
    },
  });

  await prisma.visitor.upsert({
    where: { id: "seed-visitor-1" },
    update: {},
    create: {
      id: "seed-visitor-1",
      societyId: society.id,
      residentId: resident.id,
      visitorName: "Amazon Delivery",
      visitorPhone: "9000000301",
      qrToken: "seed-qr-token-1",
      status: "APPROVED",
    },
  });

  await prisma.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      societyId: society.id,
      title: "Diwali Celebration",
      description: "Society-wide Diwali party in the clubhouse, all families welcome.",
      category: "Festival",
      startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdByUserId: admin.id,
    },
  });

  await prisma.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      societyId: society.id,
      title: "Water tank cleaning this weekend",
      body: "No water supply Saturday 10am-2pm for scheduled tank cleaning.",
      isCritical: true,
      createdByUserId: admin.id,
    },
  });

  await prisma.document.upsert({
    where: { id: "seed-document-1" },
    update: {},
    create: {
      id: "seed-document-1",
      societyId: society.id,
      title: "Society Bye-laws",
      url: "https://example.com/beaverr-demo-bylaws.pdf",
      category: "bye-laws",
      uploadedByUserId: admin.id,
    },
  });

  await prisma.forumThread.upsert({
    where: { id: "seed-thread-1" },
    update: {},
    create: {
      id: "seed-thread-1",
      societyId: society.id,
      category: "GENERAL",
      title: "Welcome to the Beaverr community forum!",
      body: "Use this space for classifieds, carpooling, recommendations, and general chat.",
      authorUserId: admin.id,
    },
  });

  console.log("Seed complete:");
  console.log(`  Society code: ${society.code}`);
  console.log(`  Admin phone: 9000000001 (OTP logged to console — OTP_PROVIDER=console)`);
  console.log(`  Guard phone: 9000000002 / password: guard123`);
  console.log(`  Resident phone: 9000000101 (OTP logged to console)`);
  console.log(`  Sample data: 1 worker, 2 services, 1 booking, 1 grievance, 1 visitor, 1 event, 1 announcement, 1 document, 1 forum thread`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
