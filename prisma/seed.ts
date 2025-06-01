import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@elevate.com' },
    update: {},
    create: {
      email: 'admin@elevate.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create demo user
  const demoHashedPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@elevate.com' },
    update: {},
    create: {
      email: 'demo@elevate.com',
      password: demoHashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create sample activities
  const activities = [
    {
      title: 'Strategic Partnership Meeting',
      type: 'MEETING' as const,
      date: new Date('2024-01-15'),
      notes: 'Discussed potential collaboration opportunities',
      points: 50,
      userId: adminUser.id,
    },
    {
      title: 'Investment Presentation',
      type: 'PRESENTATION' as const,
      date: new Date('2024-01-20'),
      notes: 'Presented Q4 portfolio performance to stakeholders',
      points: 75,
      userId: adminUser.id,
    },
    {
      title: 'Client Call',
      type: 'CALL' as const,
      date: new Date('2024-01-25'),
      notes: 'Follow-up call with potential investor',
      points: 30,
      userId: demoUser.id,
    },
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }

  console.log('✅ Sample activities created');

  // Create sample contacts
  const contacts = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1-555-0123',
      employer: 'TechCorp Inc.',
      gender: 'MALE' as const,
      maritalStatus: 'MARRIED' as const,
      relation: 'CONTACT' as const,
      category: 'Technology',
      rating: 3,
      country: 'USA',
      city: 'New York',
      userId: adminUser.id,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@realestate.com',
      phone: '+1-555-0456',
      employer: 'Prime Real Estate',
      gender: 'FEMALE' as const,
      maritalStatus: 'SINGLE' as const,
      relation: 'CONTACT' as const,
      category: 'Real Estate',
      rating: 2,
      country: 'USA',
      city: 'Los Angeles',
      userId: adminUser.id,
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact });
  }

  console.log('✅ Sample contacts created');

  // Create sample businesses
  const businesses = [
    {
      name: 'TechVenture Solutions',
      description: 'Leading technology consulting firm',
      industry: 'Technology',
      size: '500-1000 employees',
      location: 'Silicon Valley, CA',
      revenue: '$50M - $100M',
      founded: '2015',
      status: 'PARTNER' as const,
      partnership: 'STRATEGIC_ALLIANCE' as const,
      dealValue: '$2.5M',
      rating: 5,
      tags: ['Technology', 'Consulting', 'AI'],
      userId: adminUser.id,
    },
    {
      name: 'Green Energy Corp',
      description: 'Renewable energy solutions provider',
      industry: 'Energy',
      size: '100-500 employees',
      location: 'Austin, TX',
      revenue: '$25M - $50M',
      founded: '2018',
      status: 'NEGOTIATING' as const,
      partnership: 'INVESTMENT_OPPORTUNITY' as const,
      dealValue: '$5M',
      rating: 4,
      tags: ['Energy', 'Renewable', 'Sustainability'],
      userId: adminUser.id,
    },
  ];

  for (const business of businesses) {
    await prisma.business.create({ data: business });
  }

  console.log('✅ Sample businesses created');

  // Create sample employers
  const employers = [
    {
      category: 'Technology',
      nameArabic: 'شركة التكنولوجيا المتقدمة',
      nameEnglish: 'Advanced Technology Company',
      description: 'Leading software development company',
      industry: 'Information Technology',
      size: '200-500 employees',
      location: 'Dubai, UAE',
      founded: '2010',
      status: 'ACTIVE' as const,
      partnership: 'Preferred Partner',
      openPositions: 15,
      placementRate: 85.5,
      avgSalary: '$75,000 - $120,000',
      rating: 5,
      benefits: ['Health Insurance', 'Remote Work', 'Professional Development'],
      tags: ['Software', 'AI', 'Cloud Computing'],
      userId: adminUser.id,
    },
    {
      category: 'Finance',
      nameArabic: 'البنك الوطني للاستثمار',
      nameEnglish: 'National Investment Bank',
      description: 'Premier financial services institution',
      industry: 'Banking & Finance',
      size: '1000+ employees',
      location: 'Riyadh, Saudi Arabia',
      founded: '1995',
      status: 'PREMIUM' as const,
      partnership: 'Strategic Partner',
      openPositions: 25,
      placementRate: 92.3,
      avgSalary: '$60,000 - $150,000',
      rating: 5,
      benefits: ['Comprehensive Benefits', 'Career Growth', 'International Exposure'],
      tags: ['Banking', 'Investment', 'Wealth Management'],
      userId: adminUser.id,
    },
  ];

  for (const employer of employers) {
    await prisma.employer.create({ data: employer });
  }

  console.log('✅ Sample employers created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@elevate.com / admin123');
  console.log('Demo:  demo@elevate.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 