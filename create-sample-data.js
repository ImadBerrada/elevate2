const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Create a sample guest
    const guest = await prisma.retreatGuest.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+971-50-1234567',
        loyaltyPoints: 500,
        loyaltyTier: 'GOLD'
      }
    });

    // Create sample retreats
    const retreat1 = await prisma.retreat.upsert({
      where: { id: 'wellness-retreat-1' },
      update: {},
      create: {
        id: 'wellness-retreat-1',
        title: 'Wellness Retreat',
        description: 'A relaxing wellness retreat',
        type: 'WELLNESS',
        status: 'ACTIVE',
        duration: 5,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-05'),
        capacity: 30,
        price: 2500,
        location: 'Dubai',
        instructor: 'Sarah Wilson',
        amenities: ['Spa', 'Yoga', 'Meditation'],
        requirements: ['Yoga Mat'],
        inclusions: ['Meals', 'Accommodation'],
        exclusions: ['Transportation']
      }
    });

    const retreat2 = await prisma.retreat.upsert({
      where: { id: 'corporate-retreat-1' },
      update: {},
      create: {
        id: 'corporate-retreat-1',
        title: 'Corporate Team Building',
        description: 'Corporate team building retreat',
        type: 'CORPORATE',
        status: 'ACTIVE',
        duration: 3,
        startDate: new Date('2024-11-15'),
        endDate: new Date('2024-11-17'),
        capacity: 50,
        price: 1800,
        location: 'Abu Dhabi',
        instructor: 'Mike Johnson',
        amenities: ['Conference Room', 'Team Activities'],
        requirements: ['Business Attire'],
        inclusions: ['Meals', 'Accommodation', 'Activities'],
        exclusions: ['Personal Items']
      }
    });

    // Create sample bookings
    const booking1 = await prisma.retreatBooking.create({
      data: {
        retreatId: retreat1.id,
        guestId: guest.id,
        checkInDate: new Date('2024-12-01'),
        checkOutDate: new Date('2024-12-05'),
        numberOfGuests: 2,
        totalAmount: 5000,
        paidAmount: 5000,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    });

    const booking2 = await prisma.retreatBooking.create({
      data: {
        retreatId: retreat2.id,
        guestId: guest.id,
        checkInDate: new Date('2024-11-15'),
        checkOutDate: new Date('2024-11-17'),
        numberOfGuests: 1,
        totalAmount: 1800,
        paidAmount: 900,
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PARTIAL',
        status: 'CONFIRMED'
      }
    });

    // Create sample financial transactions
    await prisma.retreatFinancialTransaction.create({
      data: {
        type: 'EXPENSE',
        category: 'STAFF_SALARIES',
        amount: 15000,
        description: 'Monthly staff salaries',
        status: 'PROCESSED',
        reference: 'SAL-2024-12'
      }
    });

    await prisma.retreatFinancialTransaction.create({
      data: {
        type: 'EXPENSE',
        category: 'FACILITY_MAINTENANCE',
        amount: 5000,
        description: 'Monthly facility maintenance',
        retreatId: retreat1.id,
        status: 'PROCESSED',
        reference: 'MAINT-2024-12'
      }
    });

    await prisma.retreatFinancialTransaction.create({
      data: {
        type: 'EXPENSE',
        category: 'MARKETING',
        amount: 8000,
        description: 'Digital marketing campaigns',
        status: 'PROCESSED',
        reference: 'MKT-2024-12'
      }
    });

    // Create sample budget
    const budget = await prisma.retreatBudget.upsert({
      where: { id: 'budget-2024' },
      update: {},
      create: {
        id: 'budget-2024',
        name: '2024 Annual Budget',
        period: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 500000,
        status: 'ACTIVE'
      }
    });

    // Create sample budget items
    await prisma.retreatBudgetItem.upsert({
      where: { id: 'budget-staff-2024' },
      update: { actualAmount: 180000 },
      create: {
        id: 'budget-staff-2024',
        budgetId: budget.id,
        category: 'STAFF_SALARIES',
        description: 'Annual staff salaries budget',
        budgetedAmount: 200000,
        actualAmount: 180000
      }
    });

    await prisma.retreatBudgetItem.upsert({
      where: { id: 'budget-marketing-2024' },
      update: { actualAmount: 45000 },
      create: {
        id: 'budget-marketing-2024',
        budgetId: budget.id,
        category: 'MARKETING',
        description: 'Annual marketing budget',
        budgetedAmount: 50000,
        actualAmount: 45000
      }
    });

    console.log('✅ Sample data created successfully!');
    console.log('- 1 guest');
    console.log('- 2 retreats');
    console.log('- 2 bookings');
    console.log('- 3 financial transactions');
    console.log('- 1 budget with 2 items');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData(); 