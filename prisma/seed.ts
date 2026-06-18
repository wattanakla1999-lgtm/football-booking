import bcrypt from 'bcryptjs';
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log('Starting seed...')

  // 1. Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Football Booking',
      slug: 'default',
      timezone: 'Asia/Bangkok',
    },
  })
  console.log(`Created Organization: ${org.name}`)

  // 2. Create Admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@footballbooking.local' },
    update: {},
    create: {
      email: 'admin@footballbooking.local',
      passwordHash: await bcrypt.hash('admin1234', 10), // Default password: admin1234
      displayName: 'System Admin',
      role: 'SUPER_ADMIN',
      organizationId: org.id,
    },
  })
  console.log(`Created Admin: ${admin.email}`)

  // 3. Create Operating Hours
  const defaultHours = []
  for (let i = 0; i < 7; i++) {
    defaultHours.push({
      dayOfWeek: i,
      openTime: '08:00',
      closeTime: '23:00',
      isClosed: false,
      organizationId: org.id,
    })
  }

  // Use createMany to ignore duplicates if run multiple times (requires Prisma support or loop)
  for (const hour of defaultHours) {
    await prisma.operatingHour.upsert({
      where: {
        organizationId_dayOfWeek: {
          organizationId: org.id,
          dayOfWeek: hour.dayOfWeek,
        },
      },
      update: {},
      create: hour,
    })
  }
  console.log('Created Operating Hours')

  // 4. Create Courts
  const courtsData = [
    {
      id: 'court-1',
      name: 'Pitch 1 (Standard)',
      description: 'Standard artificial grass 7-a-side pitch',
      surface: 'Artificial Grass',
      maxPlayers: 14,
      pricePerHour: 1000.00,
      organizationId: org.id,
    },
    {
      id: 'court-2',
      name: 'Pitch 2 (VIP)',
      description: 'Premium artificial grass 7-a-side pitch with roof',
      surface: 'Artificial Grass',
      maxPlayers: 14,
      pricePerHour: 1500.00,
      organizationId: org.id,
    },
  ]

  for (const court of courtsData) {
    const createdCourt = await prisma.court.upsert({
      where: { id: court.id },
      update: {},
      create: court,
    })

    // Add dummy image if not exists
    const existingImages = await prisma.courtImage.findMany({ where: { courtId: createdCourt.id } })
    if (existingImages.length === 0) {
      await prisma.courtImage.create({
        data: {
          url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop',
          isPrimary: true,
          courtId: createdCourt.id,
        }
      })
    }
  }
  console.log('Created Courts')

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
