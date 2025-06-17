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
      role: 'MANAGER' as const,
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
      role: 'USER' as const,
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
    {
      name: 'HealthTech Innovations',
      description: 'Healthcare technology and medical device development',
      industry: 'Healthcare',
      size: '11-50',
      location: 'Boston, MA',
      website: 'https://healthtech.com',
      email: 'contact@healthtech.com',
      phone: '+1-555-0321',
      status: 'ACTIVE' as const,
      foundedYear: 2019,
      revenue: '$2M - $5M',
      userId: adminUser.id,
    },
    {
      name: 'EduLearn Platform',
      description: 'Online education and e-learning solutions',
      industry: 'Education',
      size: '51-200',
      location: 'Seattle, WA',
      website: 'https://edulearn.com',
      email: 'info@edulearn.com',
      phone: '+1-555-0654',
      status: 'ACTIVE' as const,
      foundedYear: 2021,
      revenue: '$5M - $10M',
      userId: demoUser.id,
    },
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const createdCompany = await prisma.company.create({ data: company });
    createdCompanies.push(createdCompany);
  }

  console.log('✅ Sample companies created');

  // Create manager assignments for multiple companies
  const managerUser = await prisma.user.findUnique({
    where: { email: 'manager@elevate.com' }
  });
  
  if (managerUser && createdCompanies.length > 0) {
    // Assign manager to multiple companies with different permissions
    const managerAssignments = [
      {
        userId: managerUser.id,
        companyId: createdCompanies[0].id, // TechCorp Solutions
        platforms: ['ELEVATE', 'Real Estate', 'MARAH'],
        permissions: {
          canManageAssets: true,
          canModifyCompanies: true,
          canCreateCompanies: false,
          canDeleteCompanies: false,
        },
        assignedBy: superAdminUser.id,
      },
      {
        userId: managerUser.id,
        companyId: createdCompanies[1].id, // Green Energy Corp
        platforms: ['ELEVATE', 'Real Estate'],
        permissions: {
          canManageAssets: true,
          canModifyCompanies: true,
          canCreateCompanies: true,
          canDeleteCompanies: false,
        },
        assignedBy: superAdminUser.id,
      },
      {
        userId: managerUser.id,
        companyId: createdCompanies[2].id, // FinanceFirst
        platforms: ['ELEVATE'],
        permissions: {
          canManageAssets: false,
          canModifyCompanies: true,
          canCreateCompanies: false,
          canDeleteCompanies: false,
        },
                 assignedBy: superAdminUser.id,
       },
       {
         userId: managerUser.id,
         companyId: createdCompanies[3].id, // HealthTech Innovations
         platforms: ['ELEVATE', 'Real Estate'],
         permissions: {
           canManageAssets: true,
           canModifyCompanies: false,
           canCreateCompanies: false,
           canDeleteCompanies: false,
         },
         assignedBy: superAdminUser.id,
       },
       {
         userId: managerUser.id,
         companyId: createdCompanies[4].id, // EduLearn Platform
         platforms: ['ELEVATE', 'Real Estate', 'MARAH'],
         permissions: {
           canManageAssets: true,
           canModifyCompanies: true,
           canCreateCompanies: true,
           canDeleteCompanies: true,
         },
         assignedBy: superAdminUser.id,
       },
     ];

    for (const assignment of managerAssignments) {
      await prisma.managerAssignment.upsert({
        where: {
          userId_companyId: {
            userId: assignment.userId,
            companyId: assignment.companyId,
          },
        },
        update: assignment,
        create: assignment,
      });
    }

         console.log('✅ Manager assigned to multiple companies:');
     console.log(`   - ${createdCompanies[0].name} (Full access - ELEVATE, Real Estate, MARAH)`);
     console.log(`   - ${createdCompanies[1].name} (Create permissions - ELEVATE, Real Estate)`);
     console.log(`   - ${createdCompanies[2].name} (Limited access - ELEVATE only)`);
     console.log(`   - ${createdCompanies[3].name} (View/Assets only - ELEVATE, Real Estate)`);
     console.log(`   - ${createdCompanies[4].name} (Full permissions - All platforms)`);
  }

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
    {
      firstName: 'Dr. Lisa',
      lastName: 'Chen',
      email: 'lisa.chen@healthtech.com',
      phone: '+1-555-4001',
      position: 'Chief Medical Officer',
      department: 'Medical',
      salary: '$180,000',
      startDate: new Date('2022-01-15'),
      status: 'ACTIVE' as const,
      location: 'Boston, MA',
      manager: 'CEO',
      skills: ['Medical Research', 'Healthcare Technology', 'Regulatory Affairs'],
      companyId: createdCompanies[3].id, // HealthTech Innovations
      userId: adminUser.id,
    },
    {
      firstName: 'Mark',
      lastName: 'Rodriguez',
      email: 'mark.rodriguez@healthtech.com',
      phone: '+1-555-4002',
      position: 'Software Engineer',
      department: 'Engineering',
      salary: '$110,000',
      startDate: new Date('2023-05-01'),
      status: 'ACTIVE' as const,
      location: 'Boston, MA',
      manager: 'Dr. Lisa Chen',
      skills: ['React', 'Python', 'Healthcare APIs', 'HIPAA Compliance'],
      companyId: createdCompanies[3].id, // HealthTech Innovations
      userId: adminUser.id,
    },
    {
      firstName: 'Anna',
      lastName: 'Thompson',
      email: 'anna.thompson@edulearn.com',
      phone: '+1-555-5001',
      position: 'Head of Content',
      department: 'Education',
      salary: '$125,000',
      startDate: new Date('2021-09-01'),
      status: 'ACTIVE' as const,
      location: 'Seattle, WA',
      manager: 'CEO',
      skills: ['Curriculum Development', 'Educational Technology', 'Content Strategy'],
      companyId: createdCompanies[4].id, // EduLearn Platform
      userId: demoUser.id,
    },
    {
      firstName: 'James',
      lastName: 'Park',
      email: 'james.park@edulearn.com',
      phone: '+1-555-5002',
      position: 'UX Designer',
      department: 'Design',
      salary: '$95,000',
      startDate: new Date('2022-11-15'),
      status: 'ACTIVE' as const,
      location: 'Seattle, WA',
      manager: 'Anna Thompson',
      skills: ['UI/UX Design', 'User Research', 'Figma', 'Educational Design'],
      companyId: createdCompanies[4].id, // EduLearn Platform
      userId: demoUser.id,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {},
      create: employee,
    });
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

  // ========================================
  // REAL ESTATE SYSTEM SEEDING
  // ========================================
  
  console.log('🏢 Starting Real Estate system seeding...');

  // Create Property Types
  const propertyTypes = [
    { name: 'Apartment', description: 'Multi-unit residential building' },
    { name: 'Villa', description: 'Luxury single-family home' },
    { name: 'Townhouse', description: 'Multi-level attached home' },
    { name: 'Commercial', description: 'Office or retail space' },
    { name: 'Studio', description: 'Single room living space' },
  ];

  for (const propertyType of propertyTypes) {
    await prisma.propertyType.upsert({
      where: { name: propertyType.name },
      update: {},
      create: propertyType,
    });
  }

  console.log('✅ Property types created');

  // Create Rental Unit Types
  const rentalUnitTypes = [
    { name: 'Studio', description: 'Open plan living space' },
    { name: '1BR', description: 'One bedroom apartment' },
    { name: '2BR', description: 'Two bedroom apartment' },
    { name: '3BR', description: 'Three bedroom apartment' },
    { name: 'Penthouse', description: 'Luxury top floor unit' },
  ];

  for (const unitType of rentalUnitTypes) {
    await prisma.rentalUnitType.upsert({
      where: { name: unitType.name },
      update: {},
      create: unitType,
    });
  }

  console.log('✅ Rental unit types created');

  // Create Payment Methods
  const paymentMethods = [
    { name: 'Cash' },
    { name: 'Bank Transfer' },
    { name: 'Credit Card' },
    { name: 'Cheque' },
    { name: 'Online Payment' },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method,
    });
  }

  console.log('✅ Payment methods created');

  // Create Property Owners
  const propertyOwner1 = await prisma.propertyOwner.upsert({
    where: { email: 'ahmed.mansouri@realestate.ae' },
    update: {},
    create: {
      firstName: 'Ahmed',
      lastName: 'Al Mansouri',
      email: 'ahmed.mansouri@realestate.ae',
      phone: '+971-50-1234567',
      address: 'Business Bay, Dubai',
      city: 'Dubai',
      country: 'UAE',
      notes: 'Experienced property investor with multiple properties',
      userId: adminUser.id,
    },
  });

  const propertyOwner2 = await prisma.propertyOwner.upsert({
    where: { email: 'fatima.zahra@properties.ae' },
    update: {},
    create: {
      firstName: 'Fatima',
      lastName: 'Al Zahra',
      email: 'fatima.zahra@properties.ae',
      phone: '+971-55-7654321',
      address: 'Marina Walk, Dubai Marina',
      city: 'Dubai',
      country: 'UAE',
      notes: 'Commercial property specialist',
      userId: demoUser.id,
    },
  });

  console.log('✅ Property owners created');

  // Get property types for reference
  const apartmentType = await prisma.propertyType.findUnique({ where: { name: 'Apartment' } });
  const villaType = await prisma.propertyType.findUnique({ where: { name: 'Villa' } });

  // Create Properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Skyline Towers',
      description: 'Luxury apartment complex in Business Bay',
      address: '123 Business Bay Boulevard',
      city: 'Dubai',
      area: 'Business Bay',
      country: 'UAE',
      floorArea: 15000,
      lotArea: 20000,
      purchaseValue: 25000000,
      purchaseDate: new Date('2022-01-15'),
      propertyTypeId: apartmentType!.id,
      ownerId: propertyOwner1.id,
      notes: 'Prime location with full amenities',
      status: 'ACTIVE',
      occupancyRate: 85.5,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Marina Heights',
      description: 'Modern residential tower with sea views',
      address: '456 Marina Walk',
      city: 'Dubai',
      area: 'Dubai Marina',
      country: 'UAE',
      floorArea: 12000,
      lotArea: 15000,
      purchaseValue: 18000000,
      purchaseDate: new Date('2023-03-20'),
      propertyTypeId: apartmentType!.id,
      ownerId: propertyOwner2.id,
      notes: 'Waterfront property with premium finishes',
      status: 'ACTIVE',
      occupancyRate: 92.0,
    },
  });

  console.log('✅ Properties created');

  // Get rental unit types for reference
  const studiotype = await prisma.rentalUnitType.findUnique({ where: { name: 'Studio' } });
  const oneBRType = await prisma.rentalUnitType.findUnique({ where: { name: '1BR' } });
  const twoBRType = await prisma.rentalUnitType.findUnique({ where: { name: '2BR' } });

  // Create Rental Units
  const rentalUnits = [
    {
      unitNumber: '101',
      unitTypeId: oneBRType!.id,
      propertyId: property1.id,
      area: 650,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 1,
      rentAmount: 4500,
      securityDeposit: 4500,
      status: 'OCCUPIED' as const,
    },
    {
      unitNumber: '102',
      unitTypeId: twoBRType!.id,
      propertyId: property1.id,
      area: 950,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 1,
      rentAmount: 6500,
      securityDeposit: 6500,
      status: 'VACANT' as const,
    },
    {
      unitNumber: '201',
      unitTypeId: studiotype!.id,
      propertyId: property2.id,
      area: 450,
      bedrooms: 0,
      bathrooms: 1,
      parkingSpots: 1,
      rentAmount: 3200,
      securityDeposit: 3200,
      status: 'OCCUPIED' as const,
    },
  ];

  const createdUnits = [];
  for (const unit of rentalUnits) {
    const createdUnit = await prisma.propertyRentalUnit.create({ data: unit });
    createdUnits.push(createdUnit);
  }

  console.log('✅ Rental units created');

  // Create Tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { email: 'mohammad.hassan@email.com' },
    update: {},
    create: {
      firstName: 'Mohammad',
      lastName: 'Hassan',
      email: 'mohammad.hassan@email.com',
      phone: '+971-50-9876543',
      alternatePhone: '+971-56-1234567',
      nationality: 'Pakistani',
      passportNumber: 'AB1234567',
      emiratesId: '784-1985-1234567-8',
      occupation: 'Software Engineer',
      company: 'TechSolutions DMCC',
      monthlyIncome: 15000,
      notes: 'Reliable tenant, always pays on time',
      status: 'ACTIVE',
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { email: 'sarah.williams@email.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@email.com',
      phone: '+971-55-2468135',
      nationality: 'British',
      passportNumber: 'GB9876543',
      emiratesId: '784-1990-9876543-2',
      occupation: 'Marketing Manager',
      company: 'Global Marketing FZ-LLC',
      monthlyIncome: 12000,
      notes: 'Professional tenant, works from home occasionally',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Tenants created');

  // Create Tenant Agreements
  const agreement1 = await prisma.tenantAgreement.create({
    data: {
      agreementNumber: 'AGT-000001',
      propertyId: property1.id,
      rentalUnitId: createdUnits[0].id, // Unit 101
      tenantId: tenant1.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 4500,
      securityDeposit: 4500,
      commissionAmount: 2250,
      paymentDueDate: 1,
      paymentFrequency: 'MONTHLY',
      utilities: JSON.stringify(['Water', 'Electricity', 'Internet']),
      terms: 'Standard residential lease agreement terms and conditions',
      notes: 'Initial lease agreement',
      status: 'ACTIVE',
    },
  });

  const agreement2 = await prisma.tenantAgreement.create({
    data: {
      agreementNumber: 'AGT-000002',
      propertyId: property2.id,
      rentalUnitId: createdUnits[2].id, // Unit 201
      tenantId: tenant2.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      rentAmount: 3200,
      securityDeposit: 3200,
      commissionAmount: 1600,
      paymentDueDate: 5,
      paymentFrequency: 'MONTHLY',
      utilities: JSON.stringify(['Water', 'Electricity']),
      terms: 'Standard residential lease agreement terms and conditions',
      notes: 'Studio apartment lease',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Tenant agreements created');

  // Get payment method for reference
  const bankTransfer = await prisma.paymentMethod.findUnique({ where: { name: 'Bank Transfer' } });
  const creditCard = await prisma.paymentMethod.findUnique({ where: { name: 'Credit Card' } });

  // Create Sample Payments
  const payments = [
    {
      agreementId: agreement1.id,
      amount: 4500,
      paymentDate: new Date('2024-01-01'),
      paymentMethodId: bankTransfer!.id,
      referenceNumber: 'TXN-202401-001',
      notes: 'January rent payment',
      receiptNumber: 'RCP-001',
      status: 'COMPLETED' as const,
    },
    {
      agreementId: agreement1.id,
      amount: 4500,
      paymentDate: new Date('2024-02-01'),
      paymentMethodId: bankTransfer!.id,
      referenceNumber: 'TXN-202402-001',
      notes: 'February rent payment',
      receiptNumber: 'RCP-002',
      status: 'COMPLETED' as const,
    },
    {
      agreementId: agreement2.id,
      amount: 3200,
      paymentDate: new Date('2024-02-05'),
      paymentMethodId: creditCard!.id,
      referenceNumber: 'CC-202402-003',
      notes: 'February rent payment',
      receiptNumber: 'RCP-003',
      status: 'COMPLETED' as const,
    },
  ];

  for (const payment of payments) {
    await prisma.tenantPayment.create({ data: payment });
  }

  console.log('✅ Sample payments created');

  // Create Sample Invoices
  const invoices = [
    {
      invoiceNumber: 'INV-202403-001',
      agreementId: agreement1.id,
      amount: 4500,
      dueDate: new Date('2024-03-01'),
      description: 'March 2024 Rent',
      taxAmount: 225,
      totalAmount: 4725,
      status: 'PENDING' as const,
    },
    {
      invoiceNumber: 'INV-202403-002',
      agreementId: agreement2.id,
      amount: 3200,
      dueDate: new Date('2024-03-05'),
      description: 'March 2024 Rent',
      taxAmount: 160,
      totalAmount: 3360,
      status: 'PENDING' as const,
    },
  ];

  for (const invoice of invoices) {
    await prisma.realEstateInvoice.create({ data: invoice });
  }

  console.log('✅ Sample invoices created');

  // Create Sample Property Expenses
  const expenses = [
    {
      propertyId: property1.id,
      category: 'MAINTENANCE' as const,
      description: 'AC system maintenance and cleaning',
      amount: 1500,
      expenseDate: new Date('2024-01-15'),
      vendor: 'CoolTech Services',
      invoiceNumber: 'CT-2024-001',
      isTaxDeductible: true,
      status: 'APPROVED' as const,
    },
    {
      propertyId: property1.id,
      category: 'UTILITIES' as const,
      description: 'Common area electricity bill',
      amount: 850,
      expenseDate: new Date('2024-01-31'),
      vendor: 'DEWA',
      invoiceNumber: 'DEWA-202401-SK123',
      isTaxDeductible: true,
      isRecurring: true,
      status: 'APPROVED' as const,
    },
    {
      propertyId: property2.id,
      category: 'CLEANING' as const,
      description: 'Monthly common area cleaning',
      amount: 600,
      expenseDate: new Date('2024-02-01'),
      vendor: 'CleanPro Services',
      invoiceNumber: 'CP-2024-002',
      isTaxDeductible: true,
      isRecurring: true,
      status: 'APPROVED' as const,
    },
  ];

  for (const expense of expenses) {
    await prisma.propertyExpense.create({ data: expense });
  }

  console.log('✅ Sample property expenses created');

  // Create Sample Property Appliances
  const appliances = [
    {
      propertyId: property1.id,
      name: 'Central AC System - Building A',
      brand: 'Carrier',
      model: 'Chiller System 40RV',
      serialNumber: 'CR-2022-001',
      purchaseDate: new Date('2022-01-20'),
      purchasePrice: 85000,
      warrantyExpiry: new Date('2025-01-20'),
      installationDate: new Date('2022-01-25'),
      condition: 'GOOD' as const,
      notes: 'Serviced quarterly',
    },
    {
      propertyId: property2.id,
      name: 'Elevator System - Tower 1',
      brand: 'Otis',
      model: 'Gen2 Comfort',
      serialNumber: 'OT-2023-MH001',
      purchaseDate: new Date('2023-03-15'),
      purchasePrice: 120000,
      warrantyExpiry: new Date('2026-03-15'),
      installationDate: new Date('2023-03-20'),
      condition: 'EXCELLENT' as const,
      notes: 'Monthly maintenance contract active',
    },
  ];

  for (const appliance of appliances) {
    await prisma.propertyAppliance.create({ data: appliance });
  }

  console.log('✅ Sample property appliances created');

  console.log('🏢 Real Estate system seeding completed!');
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