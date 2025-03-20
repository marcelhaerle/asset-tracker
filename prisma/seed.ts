import { PrismaClient, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  const categories = [
    { name: 'Laptop', description: 'Portable computers' },
    { name: 'Desktop', description: 'Stationary computers' },
    { name: 'Monitor', description: 'Display screens' },
    { name: 'Peripheral', description: 'Keyboards, mice, etc.' },
    { name: 'Networking', description: 'Routers, switches, etc.' },
    { name: 'Server', description: 'Server equipment' },
    { name: 'Mobile', description: 'Mobile phones and tablets' },
    { name: 'Other', description: 'Miscellaneous equipment' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create a default location
  const headquarters = await prisma.location.upsert({
    where: { id: 'hq-location' },
    update: {},
    create: {
      id: 'hq-location',
      name: 'Headquarters',
      building: 'Main Building',
      floor: '1st Floor',
    },
  });

  // Create a default employee
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      employeeId: 'EMP001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@company.com',
      department: 'IT',
      position: 'System Administrator',
    },
  });

  // Create some sample assets
  const laptopCategory = await prisma.category.findUnique({
    where: { name: 'Laptop' },
  });

  const networkCategory = await prisma.category.findUnique({
    where: { name: 'Networking' },
  });

  if (laptopCategory && networkCategory) {
    // Sample laptop
    await prisma.asset.upsert({
      where: { assetTag: 'LAP001' },
      update: {},
      create: {
        assetTag: 'LAP001',
        serialNumber: 'SN12345678',
        name: 'Dell XPS 15',
        description: 'Developer Laptop',
        model: 'XPS 15 9570',
        manufacturer: 'Dell',
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: 1599.99,
        expectedLifespan: 36, // 3 years in months
        status: AssetStatus.IN_USE,
        categoryId: laptopCategory.id,
        locationId: headquarters.id,
        assignedToId: admin.id,
      },
    });

    // Sample router
    await prisma.asset.upsert({
      where: { assetTag: 'NET001' },
      update: {},
      create: {
        assetTag: 'NET001',
        serialNumber: 'RT78901234',
        name: 'Cisco Router',
        description: 'Main office router',
        model: 'Cisco 2900 Series',
        manufacturer: 'Cisco',
        purchaseDate: new Date('2022-11-05'),
        purchasePrice: 899.99,
        expectedLifespan: 60, // 5 years in months
        status: AssetStatus.AVAILABLE,
        categoryId: networkCategory.id,
        locationId: headquarters.id,
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });