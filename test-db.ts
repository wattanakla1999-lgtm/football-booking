import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log("Users:", users)
  const orgs = await prisma.organization.findMany()
  console.log("Orgs:", orgs)
  const hours = await prisma.operatingHour.findMany()
  console.log("Operating Hours:", hours)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
