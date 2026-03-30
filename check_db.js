const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.attendanceLog.count();
    console.log('AttendanceLog count:', count);
  } catch (e) {
    console.error('AttendanceLog error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
