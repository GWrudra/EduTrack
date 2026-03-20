
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.semesterAttendance.count();
  const sample = await prisma.semesterAttendance.findMany({
    take: 5,
    select: { semester: true, subjectName: true }
  });
  console.log('Total records:', count);
  console.log('Sample semesters:', JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
