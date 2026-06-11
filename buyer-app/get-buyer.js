const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const buyer = await prisma.buyer.findFirst({
    include: { addresses: true }
  });
  console.log(JSON.stringify(buyer, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
