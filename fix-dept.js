
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mapping = {
    'Department of Mechanical Engineering': 'ME',
    'Department of Computer Science Engineering': 'CSE',
    'Department of Computer Science & Engineering': 'CSE',
    'Department of Electrical Engineering': 'EE',
    'Department of Electronics & Communication Engineering': 'ECE',
    'Department of Civil Engineering': 'CE',
    'Department of Physics': 'PHY',
    'Department of Chemistry': 'CHM',
    'Department of Mathematics': 'MATH',
    'Department of Biotechnology': 'BIO',
    'Department of English': 'ENG'
  };

  const users = await prisma.user.findMany({ where: { role: 'faculty' } });
  
  for (const user of users) {
    const short = mapping[user.department] || user.department;
    if (short !== user.department) {
      await prisma.user.update({
        where: { id: user.id },
        data: { department: short }
      });
      console.log(`Updated ${user.name}: ${user.department} -> ${short}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
