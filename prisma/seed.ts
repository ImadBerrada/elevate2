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

async function seedRetreatGuests() {
  console.log('Seeding retreat guests...');

  // Create sample retreats first
  const retreat1 = await prisma.retreat.upsert({
    where: { id: 'retreat-1' },
    update: {},
    create: {
      id: 'retreat-1',
      title: 'Mindfulness & Meditation Retreat',
      description: 'A transformative 7-day journey into mindfulness and meditation practices.',
      type: 'WELLNESS',
      duration: 7,
      capacity: 20,
      instructor: 'Master Li Wei',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-22'),
      location: 'Serenity Valley Resort, Bali',
      price: 1200,
      amenities: ['Meditation Hall', 'Yoga Studio', 'Spa', 'Organic Garden'],
      requirements: ['Basic meditation experience', 'Comfortable clothing'],
      inclusions: ['Accommodation', 'All meals', 'Guided sessions', 'Materials'],
      exclusions: ['Travel insurance', 'Personal expenses', 'Spa treatments'],
      images: [],
    },
  });

  const retreat2 = await prisma.retreat.upsert({
    where: { id: 'retreat-2' },
    update: {},
    create: {
      id: 'retreat-2',
      title: 'Digital Detox & Nature Immersion',
      description: 'Disconnect from technology and reconnect with nature in this 5-day retreat.',
      type: 'WELLNESS',
      duration: 5,
      capacity: 15,
      instructor: 'Sarah Mountain',
      startDate: new Date('2024-07-10'),
      endDate: new Date('2024-07-15'),
      location: 'Mountain View Lodge, Colorado',
      price: 800,
      amenities: ['Hiking Trails', 'Mountain Views', 'Fire Pit', 'Library'],
      requirements: ['Good physical condition', 'Hiking boots'],
      inclusions: ['Accommodation', 'All meals', 'Guided hikes', 'Digital lockbox'],
      exclusions: ['Travel insurance', 'Personal gear', 'Laundry'],
      images: [],
    },
  });

  // Create sample guests
  const guest1 = await prisma.retreatGuest.upsert({
    where: { email: 'sarah.johnson@email.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      dateOfBirth: new Date('1985-03-15'),
      nationality: 'USA',
      passportNumber: 'US123456789',
      gender: 'Female',
      status: 'VIP',
      
      // Address
      addressStreet: '123 Main Street',
      addressCity: 'New York',
      addressState: 'NY',
      addressCountry: 'USA',
      addressPostalCode: '10001',
      
      // Emergency Contact
      emergencyContactName: 'John Johnson',
      emergencyContactPhone: '+1-555-0124',
      emergencyContactEmail: 'john.johnson@email.com',
      emergencyContactRelation: 'Spouse',
      
      // Preferences
      dietaryRestrictions: ['Vegetarian', 'Gluten-free'],
      roomTypePreference: 'Deluxe',
      bedTypePreference: 'Queen',
      smokingPreference: 'Non-smoking',
      specialRequests: ['Late check-out', 'Ground floor room'],
      
      // Medical Information
      medicalConditions: [],
      allergies: ['Peanuts'],
      medications: ['Vitamin D'],
      
      // Loyalty Program
      loyaltyPoints: 2500,
      loyaltyTier: 'GOLD',
      loyaltyProgramActive: true,
      marketingConsent: true,
      
      // Profile
      notes: 'VIP guest, prefers quiet rooms away from elevators.',
    },
  });

  const guest2 = await prisma.retreatGuest.upsert({
    where: { email: 'ahmed.rashid@email.com' },
    update: {},
    create: {
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      email: 'ahmed.rashid@email.com',
      phone: '+971-50-123-4567',
      dateOfBirth: new Date('1990-08-22'),
      nationality: 'UAE',
      passportNumber: 'AE987654321',
      gender: 'Male',
      status: 'ACTIVE',
      
      // Address
      addressStreet: 'Al Wasl Road',
      addressCity: 'Dubai',
      addressState: 'Dubai',
      addressCountry: 'UAE',
      addressPostalCode: '12345',
      
      // Emergency Contact
      emergencyContactName: 'Fatima Al-Rashid',
      emergencyContactPhone: '+971-50-123-4568',
      emergencyContactEmail: 'fatima.rashid@email.com',
      emergencyContactRelation: 'Spouse',
      
      // Preferences
      dietaryRestrictions: ['Halal'],
      roomTypePreference: 'Standard',
      bedTypePreference: 'King',
      smokingPreference: 'Non-smoking',
      specialRequests: ['Prayer mat', 'Qibla direction'],
      
      // Medical Information
      medicalConditions: [],
      allergies: [],
      medications: [],
      
      // Loyalty Program
      loyaltyPoints: 1200,
      loyaltyTier: 'SILVER',
      loyaltyProgramActive: true,
      marketingConsent: true,
      
      // Profile
      notes: 'Requires halal meals and prayer facilities.',
    },
  });

  const guest3 = await prisma.retreatGuest.upsert({
    where: { email: 'emma.wilson@email.com' },
    update: {},
    create: {
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@email.com',
      phone: '+44-20-1234-5678',
      dateOfBirth: new Date('1992-11-05'),
      nationality: 'UK',
      passportNumber: 'GB456789123',
      gender: 'Female',
      status: 'ACTIVE',
      
      // Address
      addressStreet: '45 Baker Street',
      addressCity: 'London',
      addressState: 'England',
      addressCountry: 'UK',
      addressPostalCode: 'NW1 6XE',
      
      // Emergency Contact
      emergencyContactName: 'Margaret Wilson',
      emergencyContactPhone: '+44-20-1234-5679',
      emergencyContactEmail: 'margaret.wilson@email.com',
      emergencyContactRelation: 'Mother',
      
      // Preferences
      dietaryRestrictions: ['Vegan'],
      roomTypePreference: 'Suite',
      bedTypePreference: 'Double',
      smokingPreference: 'Non-smoking',
      specialRequests: ['Yoga mat', 'Essential oils'],
      
      // Medical Information
      medicalConditions: ['Asthma'],
      allergies: ['Shellfish', 'Dust mites'],
      medications: ['Inhaler', 'Antihistamines'],
      
      // Loyalty Program
      loyaltyPoints: 800,
      loyaltyTier: 'BRONZE',
      loyaltyProgramActive: true,
      marketingConsent: false,
      
      // Profile
      notes: 'Yoga enthusiast, prefers rooms with good ventilation due to asthma.',
    },
  });

  // Create sample bookings
  const booking1 = await prisma.retreatBooking.upsert({
    where: { id: 'booking-1' },
    update: {},
    create: {
      id: 'booking-1',
      retreatId: retreat1.id,
      guestId: guest1.id,
      checkInDate: new Date('2024-06-15T15:00:00Z'),
      checkOutDate: new Date('2024-06-22T11:00:00Z'),
      roomNumber: 'A101',
      totalAmount: 1200,
      paidAmount: 1200,
      paymentStatus: 'PAID',
      status: 'COMPLETED',
      actualCheckInTime: new Date('2024-06-15T15:30:00Z'),
      actualCheckOutTime: new Date('2024-06-22T10:45:00Z'),
      checkInStaff: 'Reception Team',
      checkOutStaff: 'Reception Team',
      notes: 'VIP guest, provided welcome amenities.',
    },
  });

  const booking2 = await prisma.retreatBooking.upsert({
    where: { id: 'booking-2' },
    update: {},
    create: {
      id: 'booking-2',
      retreatId: retreat2.id,
      guestId: guest2.id,
      checkInDate: new Date('2024-07-10T15:00:00Z'),
      checkOutDate: new Date('2024-07-15T11:00:00Z'),
      roomNumber: 'B205',
      totalAmount: 800,
      paidAmount: 800,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      notes: 'Halal meals arranged, prayer mat provided.',
    },
  });

  // Create sample reviews
  await prisma.retreatReview.upsert({
    where: { id: 'review-1' },
    update: {},
    create: {
      id: 'review-1',
      retreatId: retreat1.id,
      guestId: guest1.id,
      rating: 5,
      title: 'Absolutely Transformative Experience',
      comment: 'This retreat exceeded all my expectations. The meditation sessions were profound, the accommodation was luxurious, and the staff was incredibly attentive. I left feeling completely renewed and centered.',
      serviceRating: 5,
      facilitiesRating: 5,
      foodRating: 4,
      valueRating: 5,
      wouldRecommend: true,
      highlights: ['Excellent meditation guidance', 'Beautiful location', 'Outstanding service'],
      issues: [],
    },
  });

  await prisma.retreatReview.upsert({
    where: { id: 'review-2' },
    update: {},
    create: {
      id: 'review-2',
      retreatId: retreat1.id,
      guestId: guest3.id,
      rating: 4,
      title: 'Great Retreat with Minor Issues',
      comment: 'Overall a wonderful experience. The yoga sessions were fantastic and the vegan meals were delicious. Only minor issue was some noise from the neighboring room.',
      serviceRating: 4,
      facilitiesRating: 4,
      foodRating: 5,
      valueRating: 4,
      wouldRecommend: true,
      highlights: ['Excellent vegan cuisine', 'Professional yoga instruction', 'Peaceful environment'],
      issues: ['Some noise issues'],
    },
  });

  // Create loyalty transactions
  await prisma.retreatLoyaltyTransaction.upsert({
    where: { id: 'loyalty-1' },
    update: {},
    create: {
      id: 'loyalty-1',
      guestId: guest1.id,
      type: 'EARNED',
      points: 120,
      description: 'Stay completed - Mindfulness & Meditation Retreat',
      bookingId: booking1.id,
    },
  });

  await prisma.retreatLoyaltyTransaction.upsert({
    where: { id: 'loyalty-2' },
    update: {},
    create: {
      id: 'loyalty-2',
      guestId: guest1.id,
      type: 'EARNED',
      points: 50,
      description: 'Review bonus - Thank you for your feedback!',
      bookingId: booking1.id,
    },
  });

  // Create guest communications
  await prisma.retreatGuestCommunication.upsert({
    where: { id: 'comm-1' },
    update: {},
    create: {
      id: 'comm-1',
      guestId: guest1.id,
      type: 'BOOKING_RELATED',
      subject: 'Welcome to Your Retreat',
      message: 'We are excited to welcome you to our Mindfulness & Meditation Retreat. Please find your booking confirmation and pre-arrival information attached.',
      direction: 'OUTBOUND',
      channel: 'email',
      staffMember: 'Guest Services',
      bookingId: booking1.id,
    },
  });

  await prisma.retreatGuestCommunication.upsert({
    where: { id: 'comm-2' },
    update: {},
    create: {
      id: 'comm-2',
      guestId: guest2.id,
      type: 'INQUIRY',
      subject: 'Halal Meal Options',
      message: 'I would like to confirm that halal meal options will be available during my stay.',
      direction: 'INBOUND',
      channel: 'email',
      staffMember: 'Guest Services',
      bookingId: booking2.id,
    },
  });

  console.log('Retreat guests seeded successfully!');
}

async function seedFacilities() {
  console.log('🏢 Seeding facilities...');

  // Create sample facilities
  const mainLodge = await prisma.retreatFacility.upsert({
    where: { id: 'facility-1' },
    update: {},
    create: {
      id: 'facility-1',
      name: 'Mountain View Lodge',
      type: 'ACCOMMODATION',
      status: 'OPERATIONAL',
      capacity: 50,
      currentOccupancy: 32,
      location: 'North Wing',
      description: 'Our premier accommodation facility featuring luxury suites and standard rooms with breathtaking mountain views.',
      manager: 'Sarah Mitchell',
      image: '/images/facilities/mountain-lodge.jpg',
      lastMaintenance: new Date('2024-05-15'),
      nextMaintenance: new Date('2024-08-15'),
      rating: 4.8,
      totalReviews: 124,
      issueCount: 2,
      operatingHours: '24/7',
      temperature: 22.5,
      hasWifi: true,
      hasParking: true,
      parkingSpots: 25,
    },
  });

  const wellnessCenter = await prisma.retreatFacility.upsert({
    where: { id: 'facility-2' },
    update: {},
    create: {
      id: 'facility-2',
      name: 'Serenity Wellness Center',
      type: 'WELLNESS',
      status: 'OPERATIONAL',
      capacity: 30,
      currentOccupancy: 18,
      location: 'Central Building',
      description: 'State-of-the-art wellness facility with spa treatments, massage therapy, and holistic healing services.',
      manager: 'Dr. James Chen',
      image: '/images/facilities/wellness-center.jpg',
      lastMaintenance: new Date('2024-06-01'),
      nextMaintenance: new Date('2024-09-01'),
      rating: 4.9,
      totalReviews: 89,
      issueCount: 0,
      operatingHours: '6:00 AM - 10:00 PM',
      temperature: 24.0,
      hasWifi: true,
      hasParking: false,
    },
  });

  const diningHall = await prisma.retreatFacility.upsert({
    where: { id: 'facility-3' },
    update: {},
    create: {
      id: 'facility-3',
      name: 'Harmony Dining Hall',
      type: 'DINING',
      status: 'OPERATIONAL',
      capacity: 80,
      currentOccupancy: 45,
      location: 'South Wing',
      description: 'Spacious dining facility serving organic, locally-sourced meals with options for all dietary requirements.',
      manager: 'Chef Maria Rodriguez',
      image: '/images/facilities/dining-hall.jpg',
      lastMaintenance: new Date('2024-06-10'),
      nextMaintenance: new Date('2024-09-10'),
      rating: 4.7,
      totalReviews: 156,
      issueCount: 1,
      operatingHours: '6:30 AM - 9:30 PM',
      temperature: 21.0,
      hasWifi: true,
      hasParking: false,
    },
  });

  const conferenceCenter = await prisma.retreatFacility.upsert({
    where: { id: 'facility-4' },
    update: {},
    create: {
      id: 'facility-4',
      name: 'Tranquil Conference Center',
      type: 'CONFERENCE',
      status: 'OPERATIONAL',
      capacity: 100,
      currentOccupancy: 0,
      location: 'East Wing',
      description: 'Modern conference facility with advanced AV equipment, perfect for workshops, seminars, and corporate retreats.',
      manager: 'Michael Thompson',
      image: '/images/facilities/conference-center.jpg',
      lastMaintenance: new Date('2024-05-20'),
      nextMaintenance: new Date('2024-08-20'),
      rating: 4.6,
      totalReviews: 67,
      issueCount: 3,
      operatingHours: '8:00 AM - 8:00 PM',
      temperature: 23.0,
      hasWifi: true,
      hasParking: true,
      parkingSpots: 40,
    },
  });

  const recreationCenter = await prisma.retreatFacility.upsert({
    where: { id: 'facility-5' },
    update: {},
    create: {
      id: 'facility-5',
      name: 'Adventure Recreation Center',
      type: 'RECREATION',
      status: 'OPERATIONAL',
      capacity: 60,
      currentOccupancy: 22,
      location: 'West Wing',
      description: 'Comprehensive recreation facility with fitness equipment, yoga studios, and activity spaces for group exercises.',
      manager: 'Lisa Park',
      image: '/images/facilities/recreation-center.jpg',
      lastMaintenance: new Date('2024-06-05'),
      nextMaintenance: new Date('2024-09-05'),
      rating: 4.5,
      totalReviews: 98,
      issueCount: 1,
      operatingHours: '5:00 AM - 11:00 PM',
      temperature: 20.0,
      hasWifi: true,
      hasParking: true,
      parkingSpots: 15,
    },
  });

  // Create sample rooms
  const rooms = [
    {
      id: 'room-1',
      facilityId: mainLodge.id,
      roomNumber: 'A101',
      roomType: 'Deluxe Suite',
      status: 'OCCUPIED' as const,
      capacity: 2,
      currentOccupancy: 2,
      bedType: 'King',
      hasPrivateBath: true,
      hasBalcony: true,
      hasAC: true,
      hasWifi: true,
      cleaningStatus: 'CLEAN' as const,
      assignedHousekeeper: 'Maria Santos',
    },
    {
      id: 'room-2',
      facilityId: mainLodge.id,
      roomNumber: 'A102',
      roomType: 'Standard Room',
      status: 'AVAILABLE' as const,
      capacity: 2,
      currentOccupancy: 0,
      bedType: 'Queen',
      hasPrivateBath: true,
      hasBalcony: false,
      hasAC: true,
      hasWifi: true,
      cleaningStatus: 'CLEAN' as const,
      assignedHousekeeper: 'Maria Santos',
    },
    {
      id: 'room-3',
      facilityId: mainLodge.id,
      roomNumber: 'B201',
      roomType: 'Premium Suite',
      status: 'MAINTENANCE' as const,
      capacity: 4,
      currentOccupancy: 0,
      bedType: 'King + Sofa Bed',
      hasPrivateBath: true,
      hasBalcony: true,
      hasAC: true,
      hasWifi: true,
      cleaningStatus: 'DIRTY' as const,
      assignedHousekeeper: 'Elena Rodriguez',
      maintenanceNotes: 'AC unit needs repair',
    },
  ];

  for (const room of rooms) {
    await prisma.facilityRoom.upsert({
      where: { id: room.id },
      update: {},
      create: room,
    });
  }

  // Create sample amenities
  const amenities = [
    {
      id: 'amenity-1',
      facilityId: wellnessCenter.id,
      name: 'Meditation Garden',
      category: 'WELLNESS' as const,
      status: 'AVAILABLE' as const,
      capacity: 20,
      currentUsage: 8,
      coordinator: 'Zen Master Liu',
      operatingHours: '6:00 AM - 8:00 PM',
      equipmentCount: 25,
      availableEquipment: 20,
      rating: 4.9,
      totalReviews: 45,
      issueCount: 0,
      description: 'Peaceful outdoor meditation space surrounded by native plants and flowing water features.',
      features: ['Outdoor seating', 'Water features', 'Sound system', 'Weather protection'],
      image: '/images/amenities/meditation-garden.jpg',
    },
    {
      id: 'amenity-2',
      facilityId: wellnessCenter.id,
      name: 'Thermal Spa',
      category: 'SPA' as const,
      status: 'AVAILABLE' as const,
      capacity: 12,
      currentUsage: 6,
      coordinator: 'Spa Director Anna',
      operatingHours: '8:00 AM - 9:00 PM',
      equipmentCount: 8,
      availableEquipment: 8,
      rating: 4.8,
      totalReviews: 67,
      issueCount: 0,
      description: 'Luxurious thermal spa with hot springs, saunas, and relaxation pools.',
      features: ['Hot springs', 'Sauna', 'Steam room', 'Relaxation pool', 'Changing rooms'],
      image: '/images/amenities/thermal-spa.jpg',
    },
    {
      id: 'amenity-3',
      facilityId: recreationCenter.id,
      name: 'Yoga Studio',
      category: 'FITNESS' as const,
      status: 'OCCUPIED' as const,
      capacity: 25,
      currentUsage: 18,
      coordinator: 'Yoga Instructor Sarah',
      operatingHours: '5:00 AM - 10:00 PM',
      equipmentCount: 30,
      availableEquipment: 12,
      rating: 4.7,
      totalReviews: 89,
      issueCount: 1,
      description: 'Spacious yoga studio with natural lighting and premium equipment for all levels.',
      features: ['Mirrors', 'Sound system', 'Props storage', 'Air conditioning', 'Natural lighting'],
      image: '/images/amenities/yoga-studio.jpg',
    },
  ];

  for (const amenity of amenities) {
    await prisma.facilityAmenity.upsert({
      where: { id: amenity.id },
      update: {},
      create: amenity,
    });
  }

  // Create sample equipment
  const equipment = [
    {
      id: 'equipment-1',
      amenityId: 'amenity-1',
      name: 'Meditation Cushions',
      quantity: 20,
      condition: 'GOOD' as const,
      lastService: new Date('2024-05-01'),
      nextService: new Date('2024-08-01'),
      notes: 'Regular cleaning and replacement of covers',
    },
    {
      id: 'equipment-2',
      amenityId: 'amenity-3',
      name: 'Yoga Mats',
      quantity: 25,
      condition: 'EXCELLENT' as const,
      lastService: new Date('2024-06-01'),
      nextService: new Date('2024-09-01'),
      notes: 'Premium eco-friendly mats',
    },
    {
      id: 'equipment-3',
      amenityId: 'amenity-3',
      name: 'Yoga Blocks',
      quantity: 30,
      condition: 'GOOD' as const,
      lastService: new Date('2024-05-15'),
      nextService: new Date('2024-08-15'),
      notes: 'Cork blocks, some showing wear',
    },
  ];

  for (const item of equipment) {
    await prisma.amenityEquipment.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // Create sample maintenance requests
  const maintenanceRequests = [
    {
      id: 'maintenance-1',
      facilityId: mainLodge.id,
      title: 'AC Unit Repair - Room B201',
      description: 'Air conditioning unit in room B201 is not cooling properly. Guests reported warm temperatures.',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      category: 'HVAC' as const,
      assignedTo: 'HVAC Technician Mike',
      reportedBy: 'Housekeeping Staff',
      requestDate: new Date('2024-06-15'),
      scheduledDate: new Date('2024-06-16'),
      estimatedCost: 250,
      vendor: 'Cool Air Services',
      notes: 'Refrigerant leak suspected',
      images: ['/images/maintenance/ac-unit-b201.jpg'],
      documents: [],
    },
    {
      id: 'maintenance-2',
      facilityId: diningHall.id,
      title: 'Kitchen Equipment Service',
      description: 'Monthly preventive maintenance for commercial kitchen equipment',
      priority: 'MEDIUM' as const,
      status: 'SCHEDULED' as const,
      category: 'EQUIPMENT' as const,
      assignedTo: 'Kitchen Services Inc',
      reportedBy: 'Chef Maria Rodriguez',
      requestDate: new Date('2024-06-10'),
      scheduledDate: new Date('2024-06-20'),
      estimatedCost: 400,
      vendor: 'Kitchen Services Inc',
      notes: 'Regular maintenance schedule',
      images: [],
      documents: ['/docs/maintenance-schedule.pdf'],
    },
    {
      id: 'maintenance-3',
      facilityId: conferenceCenter.id,
      title: 'Projector Replacement',
      description: 'Main conference room projector bulb needs replacement',
      priority: 'LOW' as const,
      status: 'PENDING' as const,
      category: 'EQUIPMENT' as const,
      reportedBy: 'AV Technician',
      requestDate: new Date('2024-06-12'),
      estimatedCost: 150,
      notes: 'Backup projector available',
      images: [],
      documents: [],
    },
  ];

  for (const request of maintenanceRequests) {
    await prisma.facilityMaintenanceRequest.upsert({
      where: { id: request.id },
      update: {},
      create: request,
    });
  }

  // Create sample facility bookings
  const facilityBookings = [
    {
      id: 'facility-booking-1',
      facilityId: conferenceCenter.id,
      eventName: 'Corporate Leadership Workshop',
      eventType: 'WORKSHOP' as const,
      organizer: 'TechCorp Inc.',
      contactEmail: 'events@techcorp.com',
      contactPhone: '+1-555-0123',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-17'),
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      attendees: 45,
      status: 'CONFIRMED' as const,
      setupRequirements: ['Theater seating', 'Podium', 'Microphone system', 'Projection screen'],
      specialRequests: 'Need vegetarian lunch options for 15 attendees',
      catering: true,
      audioVisual: true,
      parking: 45,
      totalCost: 2500,
      coordinator: 'Event Coordinator Jane',
      notes: ['Confirmed catering for 45 people', 'AV equipment tested'],
      confirmationSent: true,
    },
    {
      id: 'facility-booking-2',
      facilityId: wellnessCenter.id,
      eventName: 'Mindfulness Meditation Retreat',
      eventType: 'RETREAT' as const,
      organizer: 'Zen Wellness Group',
      contactEmail: 'bookings@zengroup.com',
      contactPhone: '+1-555-0456',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-05'),
      startTime: '6:00 AM',
      endTime: '8:00 PM',
      attendees: 25,
      status: 'PENDING' as const,
      setupRequirements: ['Meditation cushions', 'Sound system', 'Ambient lighting'],
      specialRequests: 'Quiet environment essential, no construction noise',
      catering: false,
      audioVisual: false,
      parking: 25,
      totalCost: 1800,
      coordinator: 'Wellness Coordinator Mark',
      notes: ['Pending final headcount confirmation'],
      confirmationSent: false,
    },
  ];

  for (const booking of facilityBookings) {
    await prisma.facilityBooking.upsert({
      where: { id: booking.id },
      update: {},
      create: booking,
    });
  }

  // Create sample amenity bookings
  const amenityBookings = [
    {
      id: 'amenity-booking-1',
      amenityId: 'amenity-2',
      guestName: 'John Smith',
      guestContact: 'john.smith@email.com',
      bookingType: 'Thermal Spa Session',
      startTime: new Date('2024-06-20T14:00:00Z'),
      endTime: new Date('2024-06-20T16:00:00Z'),
      duration: 120,
      status: 'CONFIRMED' as const,
      notes: 'First-time spa visitor, provide orientation',
    },
    {
      id: 'amenity-booking-2',
      amenityId: 'amenity-3',
      guestName: 'Sarah Johnson',
      guestContact: 'sarah.j@email.com',
      bookingType: 'Private Yoga Session',
      startTime: new Date('2024-06-21T07:00:00Z'),
      endTime: new Date('2024-06-21T08:00:00Z'),
      duration: 60,
      status: 'CONFIRMED' as const,
      notes: 'Advanced practitioner, focus on strength poses',
    },
  ];

  for (const booking of amenityBookings) {
    await prisma.amenityBooking.upsert({
      where: { id: booking.id },
      update: {},
      create: booking,
    });
  }

  console.log('Facilities seeded successfully!');
}

async function seedBridgeRetreats(prisma: PrismaClient) {
  console.log('🏔️ Seeding Bridge Retreats data...');

  // Create facilities
  const facility1 = await prisma.retreatFacility.create({
    data: {
      name: 'Mountain View Lodge',
      type: 'ACCOMMODATION',
      status: 'OPERATIONAL',
      capacity: 50,
      currentOccupancy: 25,
      location: 'Blue Ridge Mountains, NC',
      description: 'A serene mountain lodge with panoramic views',
      manager: 'Sarah Johnson',
      operatingHours: '24/7',
      hasWifi: true,
      hasParking: true,
      parkingSpots: 30,
      rating: 4.5,
      totalReviews: 125
    }
  });

  const facility2 = await prisma.retreatFacility.create({
    data: {
      name: 'Wellness Center',
      type: 'WELLNESS',
      status: 'OPERATIONAL',
      capacity: 30,
      currentOccupancy: 15,
      location: 'Sedona, AZ',
      description: 'Modern wellness facility with spa services',
      manager: 'Dr. Michael Chen',
      operatingHours: '6:00 AM - 10:00 PM',
      hasWifi: true,
      hasParking: true,
      parkingSpots: 20,
      rating: 4.8,
      totalReviews: 89
    }
  });

  // Create rooms
  const rooms = [];
  for (let i = 1; i <= 10; i++) {
    const room = await prisma.facilityRoom.create({
      data: {
        facilityId: facility1.id,
        roomNumber: `${Math.floor(i/6) + 1}0${i % 10}`,
        roomType: i <= 6 ? 'Standard' : 'Premium',
        status: ['AVAILABLE', 'OCCUPIED'][Math.floor(Math.random() * 2)] as any,
        capacity: i <= 6 ? 2 : 4,
        currentOccupancy: Math.floor(Math.random() * 2),
        bedType: i <= 6 ? 'Queen' : 'King',
        hasPrivateBath: true,
        hasBalcony: i > 6,
        hasAC: true,
        hasWifi: true,
        cleaningStatus: ['CLEAN', 'DIRTY', 'IN_PROGRESS'][Math.floor(Math.random() * 3)] as any,
        lastCleaned: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        assignedHousekeeper: ['Maria Rodriguez', 'John Smith', 'Lisa Chen'][Math.floor(Math.random() * 3)]
      }
    });
    rooms.push(room);
  }

  // Create retreats
  const retreat1 = await prisma.retreat.create({
    data: {
      title: 'Mindfulness & Meditation Retreat',
      description: 'A transformative 5-day journey into mindfulness and inner peace',
      type: 'WELLNESS',
      status: 'ACTIVE',
      duration: 5,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-02-20'),
      location: 'Blue Ridge Mountains, NC',
      capacity: 20,
      price: 1299.99,
      instructor: 'Dr. Sarah Williams',
      amenities: ['Guided Meditation', 'Yoga Sessions', 'Nature Walks', 'Healthy Meals'],
      inclusions: ['Accommodation', 'All Meals', 'Workshop Materials', 'Certificate'],
      requirements: ['Basic fitness level', 'Open mind', 'Comfortable clothing'],
      exclusions: ['Personal expenses', 'Travel to location'],
      cancellationPolicy: 'Full refund 30 days before, 50% refund 14 days before',
      images: []
    }
  });

  const retreat2 = await prisma.retreat.create({
    data: {
      title: 'Corporate Leadership Intensive',
      description: 'Executive leadership development program',
      type: 'CORPORATE',
      status: 'ACTIVE',
      duration: 3,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-03'),
      location: 'Sedona, AZ',
      capacity: 15,
      price: 2499.99,
      instructor: 'Michael Thompson',
      amenities: ['Leadership Workshops', 'Team Building', 'Strategic Planning', 'Executive Coaching'],
      inclusions: ['Accommodation', 'All Meals', 'Materials', 'Follow-up Session'],
      requirements: ['Management experience', 'Business attire', 'Laptop'],
      exclusions: ['Travel expenses', 'Personal meals'],
      cancellationPolicy: 'Company policy applies',
      images: []
    }
  });

  // Create guests
  const guests = [];
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const guest = await prisma.retreatGuest.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        dateOfBirth: new Date(1970 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        nationality: ['American', 'Canadian', 'British', 'Australian'][Math.floor(Math.random() * 4)],
        status: ['ACTIVE', 'VIP'][Math.floor(Math.random() * 2)] as any,
        loyaltyTier: ['BRONZE', 'SILVER', 'GOLD'][Math.floor(Math.random() * 3)] as any,
        loyaltyPoints: Math.floor(Math.random() * 1000),
        addressStreet: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        addressCity: ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
        addressCountry: 'USA',
        emergencyContactName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        emergencyContactPhone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        dietaryRestrictions: Math.random() > 0.7 ? ['Vegetarian'] : [],
        medicalConditions: Math.random() > 0.8 ? ['None'] : [],
        loyaltyProgramActive: true,
        marketingConsent: Math.random() > 0.3
      }
    });
    guests.push(guest);
  }

  // Create bookings
  for (let i = 0; i < 15; i++) {
    const guest = guests[Math.floor(Math.random() * guests.length)];
    const retreat = Math.random() > 0.5 ? retreat1 : retreat2;
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    
    await prisma.retreatBooking.create({
      data: {
        retreatId: retreat.id,
        guestId: guest.id,
        status: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 4)] as any,
        checkInDate: new Date(retreat.startDate),
        checkOutDate: new Date(retreat.endDate),
        numberOfGuests: Math.floor(Math.random() * 3) + 1,
        totalAmount: retreat.price,
        paidAmount: Math.random() > 0.3 ? retreat.price : retreat.price * 0.5,
        paymentMethod: ['Credit Card', 'Bank Transfer', 'PayPal'][Math.floor(Math.random() * 3)],
        paymentStatus: ['PENDING', 'PARTIAL', 'PAID'][Math.floor(Math.random() * 3)] as any,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        specialRequests: Math.random() > 0.7 ? 'Ground floor room preferred' : null
      }
    });
  }

  // Create maintenance requests
  for (let i = 0; i < 8; i++) {
    const facility = Math.random() > 0.5 ? facility1 : facility2;
    
    await prisma.facilityMaintenanceRequest.create({
      data: {
        facilityId: facility.id,
        title: ['Fix leaking faucet', 'Replace light bulbs', 'Repair AC unit', 'Paint touch-up', 'Fix door lock'][Math.floor(Math.random() * 5)],
        description: 'Maintenance required as reported by housekeeping staff',
        category: ['ELECTRICAL', 'PLUMBING', 'HVAC', 'OTHER'][Math.floor(Math.random() * 4)] as any,
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
        status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)] as any,
        reportedBy: 'Housekeeping Staff',
        assignedTo: 'Maintenance Team',
        estimatedCost: Math.floor(Math.random() * 500) + 50,
        scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create amenities
  await prisma.facilityAmenity.create({
    data: {
      facilityId: facility1.id,
      name: 'Meditation Garden',
      category: 'RECREATION',
      status: 'AVAILABLE',
      capacity: 25,
      currentUsage: 8,
      coordinator: 'Sarah Johnson',
      operatingHours: '6:00 AM - 9:00 PM',
      equipmentCount: 25,
      availableEquipment: 20,
      rating: 4.7,
      totalReviews: 45,
      description: 'Peaceful outdoor meditation space',
      features: ['Zen Garden', 'Water Feature', 'Cushions', 'Shade Structure']
    }
  });

  await prisma.facilityAmenity.create({
    data: {
      facilityId: facility2.id,
      name: 'Spa Treatment Rooms',
      category: 'WELLNESS',
      status: 'AVAILABLE',
      capacity: 6,
      currentUsage: 3,
      coordinator: 'Dr. Michael Chen',
      operatingHours: '8:00 AM - 8:00 PM',
      equipmentCount: 12,
      availableEquipment: 10,
      rating: 4.9,
      totalReviews: 67,
      description: 'Professional spa treatment facilities',
      features: ['Massage Tables', 'Aromatherapy', 'Sound System', 'Climate Control']
    }
  });

  console.log('✅ Bridge Retreats data seeded successfully');
}

main()
  .then(() => seedRetreatGuests())
  .then(() => seedFacilities())
  .then(() => seedBridgeRetreats(prisma))
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 