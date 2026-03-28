const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst({ where: { collegeId: '20254210' } });
  if (!u) { console.log('Student not found'); return; }
  console.log('User:', u.id, u.name);
  
  const records = await prisma.semesterRecord.findMany({ where: { studentId: u.id } });
  console.log('Semester Records:', JSON.stringify(records, null, 2));

  const totalCredits = records.reduce((sum, r) => sum + r.creditsEarned, 0);
  console.log('Calculated Total Credits:', totalCredits);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
