
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const riskCount = await prisma.riskAssessment.count();
  const students = await prisma.user.count({ where: { role: 'student' } });
  console.log(`Students: ${students}, RiskAssessments: ${riskCount}`);
  
  const highRisk = await prisma.riskAssessment.count({ where: { riskLevel: 'high' } });
  const medRisk = await prisma.riskAssessment.count({ where: { riskLevel: 'medium' } });
  console.log(`High: ${highRisk}, Medium: ${medRisk}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
