import { prisma } from "../src/lib/prisma";

async function main() {
  const orgs = await prisma.organization.findMany();
  console.log("ORGANIZATIONS:", orgs);

  const courts = await prisma.court.findMany();
  console.log("COURTS:", courts);

  const hours = await prisma.operatingHour.findMany();
  console.log("OPERATING HOURS:", hours);

  const holidays = await prisma.holiday.findMany();
  console.log("HOLIDAYS:", holidays);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
