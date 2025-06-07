import { PrismaClient } from '../src/generated/prisma';
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

  // Create super admin user
  const superAdminPassword = await bcrypt.hash('superadmin123', 12);
  
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@elevate.com' },
    update: {},
    create: {
      email: 'superadmin@elevate.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin user created:', superAdminUser.email);

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

  // Create additional test users
  const testUsers = [
    {
      email: 'manager@elevate.com',
      password: await bcrypt.hash('manager123', 12),
      firstName: 'Manager',
      lastName: 'Smith',
      role: 'ADMIN' as const, // Will be displayed as MANAGER in frontend
    },
    {
      email: 'user1@elevate.com',
      password: await bcrypt.hash('user123', 12),
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER' as const,
    },
    {
      email: 'user2@elevate.com',
      password: await bcrypt.hash('user123', 12),
      firstName: 'Jane',
      lastName: 'Wilson',
      role: 'USER' as const,
    },
    {
      email: 'viewer@elevate.com',
      password: await bcrypt.hash('viewer123', 12),
      firstName: 'Viewer',
      lastName: 'Johnson',
      role: 'USER' as const, // Will be displayed as VIEWER in frontend
    },
  ];

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  console.log('✅ Additional test users created');

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

  // Create sample companies
  const companies = [
    {
      name: 'TechCorp Solutions',
      description: 'Leading technology solutions provider specializing in enterprise software development',
      industry: 'Technology',
      size: '201-500',
      location: 'San Francisco, CA',
      website: 'https://techcorp.com',
      email: 'contact@techcorp.com',
      phone: '+1-555-0123',
      status: 'ACTIVE' as const,
      foundedYear: 2015,
      revenue: '$10M - $50M',
      userId: adminUser.id,
    },
    {
      name: 'Green Energy Corp',
      description: 'Renewable energy solutions and sustainable technology development',
      industry: 'Energy',
      size: '51-200',
      location: 'Austin, TX',
      website: 'https://greenenergy.com',
      email: 'info@greenenergy.com',
      phone: '+1-555-0456',
      status: 'ACTIVE' as const,
      foundedYear: 2018,
      revenue: '$5M - $10M',
      userId: adminUser.id,
    },
    {
      name: 'FinanceFirst',
      description: 'Financial services and investment management',
      industry: 'Finance',
      size: '11-50',
      location: 'New York, NY',
      website: 'https://financefirst.com',
      email: 'contact@financefirst.com',
      phone: '+1-555-0789',
      status: 'ACTIVE' as const,
      foundedYear: 2020,
      revenue: '$1M - $5M',
      userId: demoUser.id,
    },
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const createdCompany = await prisma.company.create({ data: company });
    createdCompanies.push(createdCompany);
  }

  console.log('✅ Sample companies created');

  // Create sample employees
  const employees = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@techcorp.com',
      phone: '+1-555-1001',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      salary: '$120,000',
      startDate: new Date('2023-01-15'),
      status: 'ACTIVE' as const,
      location: 'San Francisco, CA',
      manager: 'Jane Smith',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      companyId: createdCompanies[0].id, // TechCorp Solutions
      userId: adminUser.id,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@techcorp.com',
      phone: '+1-555-1002',
      position: 'Product Manager',
      department: 'Product',
      salary: '$130,000',
      startDate: new Date('2022-06-01'),
      status: 'ACTIVE' as const,
      location: 'San Francisco, CA',
      manager: 'Mike Johnson',
      skills: ['Product Strategy', 'Analytics', 'Agile', 'Leadership'],
      companyId: createdCompanies[0].id, // TechCorp Solutions
      userId: adminUser.id,
    },
    {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@techcorp.com',
      phone: '+1-555-1003',
      position: 'Engineering Manager',
      department: 'Engineering',
      salary: '$150,000',
      startDate: new Date('2021-03-10'),
      status: 'ACTIVE' as const,
      location: 'San Francisco, CA',
      skills: ['Team Leadership', 'System Architecture', 'Python', 'DevOps'],
      companyId: createdCompanies[0].id, // TechCorp Solutions
      userId: adminUser.id,
    },
    {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@greenenergy.com',
      phone: '+1-555-2001',
      position: 'Environmental Engineer',
      department: 'Engineering',
      salary: '$95,000',
      startDate: new Date('2023-03-01'),
      status: 'ACTIVE' as const,
      location: 'Austin, TX',
      manager: 'David Brown',
      skills: ['Environmental Science', 'Renewable Energy', 'Project Management'],
      companyId: createdCompanies[1].id, // Green Energy Corp
      userId: adminUser.id,
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@greenenergy.com',
      phone: '+1-555-2002',
      position: 'VP of Engineering',
      department: 'Engineering',
      salary: '$140,000',
      startDate: new Date('2019-08-15'),
      status: 'ACTIVE' as const,
      location: 'Austin, TX',
      skills: ['Leadership', 'Renewable Energy', 'Business Development'],
      companyId: createdCompanies[1].id, // Green Energy Corp
      userId: adminUser.id,
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@financefirst.com',
      phone: '+1-555-3001',
      position: 'Financial Analyst',
      department: 'Finance',
      salary: '$85,000',
      startDate: new Date('2023-09-01'),
      status: 'ACTIVE' as const,
      location: 'New York, NY',
      manager: 'Robert Taylor',
      skills: ['Financial Analysis', 'Excel', 'Bloomberg', 'Risk Assessment'],
      companyId: createdCompanies[2].id, // FinanceFirst
      userId: demoUser.id,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.create({ data: employee });
  }

  // Update company employee counts
  for (const company of createdCompanies) {
    const employeeCount = employees.filter(emp => emp.companyId === company.id).length;
    await prisma.company.update({
      where: { id: company.id },
      data: { employeeCount },
    });
  }

  console.log('✅ Sample employees created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Super Admin: superadmin@elevate.com / superadmin123');
  console.log('Admin: admin@elevate.com / admin123');
  console.log('Manager: manager@elevate.com / manager123');
  console.log('User: demo@elevate.com / demo123');
  console.log('User: user1@elevate.com / user123');
  console.log('User: user2@elevate.com / user123');
  console.log('Viewer: viewer@elevate.com / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 