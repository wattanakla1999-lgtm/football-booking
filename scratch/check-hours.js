const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const hours = await prisma.operatingHour.findMany();
  console.log("Operating Hours:", hours);
  
  const org = await prisma.organization.findFirst();
  console.log("Organization:", org);

  const courts = await prisma.court.findMany();
  console.log("Courts:", courts);
  
  const holidays = await prisma.holiday.findMany();
  console.log("Holidays:", holidays);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
