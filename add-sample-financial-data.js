const { PrismaClient } = require('./src/generated/prisma');
const { subDays, subMonths, format } = require('date-fns');

const prisma = new PrismaClient();

async function addSampleFinancialData() {
  try {
    console.log('Adding sample financial data...');

    // Create sample retreat guests
    const guests = [];
    for (let i = 1; i <= 10; i++) {
      const guest = await prisma.retreatGuest.upsert({
        where: { email: `guest${i}@example.com` },
        update: {},
        create: {
          firstName: `Guest${i}`,
          lastName: `User${i}`,
          email: `guest${i}@example.com`,
          phone: `+971-50-${1000000 + i}`,
          loyaltyPoints: Math.floor(Math.random() * 1000),
          loyaltyTier: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'][Math.floor(Math.random() * 4)]
        }
      });
      guests.push(guest);
    }
    console.log(`Created ${guests.length} sample guests`);

    // Create sample retreats
    const retreats = [];
    const retreatTypes = ['WELLNESS', 'CORPORATE', 'SPIRITUAL', 'ADVENTURE', 'EDUCATIONAL'];
    
    for (let i = 1; i <= 5; i++) {
      const retreat = await prisma.retreat.upsert({
        where: { id: `retreat-${i}` },
        update: {},
        create: {
          id: `retreat-${i}`,
          title: `Sample Retreat ${i}`,
          description: `This is a sample retreat for testing purposes`,
          type: retreatTypes[i - 1],
          status: 'PUBLISHED',
          duration: Math.floor(Math.random() * 7) + 3, // 3-9 days
          startDate: subDays(new Date(), Math.floor(Math.random() * 90)),
          endDate: subDays(new Date(), Math.floor(Math.random() * 60)),
          capacity: 20 + (i * 10),
          price: 1000 + (i * 500),
          location: `Location ${i}`,
          instructor: `Instructor ${i}`,
          amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
          requirements: ['Yoga Mat', 'Comfortable Clothes'],
          inclusions: ['Meals', 'Accommodation', 'Activities'],
          exclusions: ['Transportation', 'Personal Items']
        }
      });
      retreats.push(retreat);
    }
    console.log(`Created ${retreats.length} sample retreats`);

    // Create sample bookings with payments over the last 6 months
    const bookings = [];
    for (let month = 0; month < 6; month++) {
      const bookingsThisMonth = Math.floor(Math.random() * 5) + 2; // 2-6 bookings per month
      
      for (let i = 0; i < bookingsThisMonth; i++) {
        const guest = guests[Math.floor(Math.random() * guests.length)];
        const retreat = retreats[Math.floor(Math.random() * retreats.length)];
        const bookingDate = subMonths(new Date(), month);
        const totalAmount = 1500 + Math.floor(Math.random() * 3000); // 1500-4500 AED
        const paidAmount = Math.random() > 0.2 ? totalAmount : totalAmount * 0.5; // 80% fully paid
        
        const booking = await prisma.retreatBooking.create({
          data: {
            retreatId: retreat.id,
            guestId: guest.id,
            checkInDate: subDays(bookingDate, Math.floor(Math.random() * 30)),
            checkOutDate: subDays(bookingDate, Math.floor(Math.random() * 25)),
            numberOfGuests: Math.floor(Math.random() * 3) + 1,
            totalAmount,
            paidAmount,
            paymentMethod: ['CARD', 'BANK_TRANSFER', 'CASH'][Math.floor(Math.random() * 3)],
            paymentStatus: paidAmount >= totalAmount ? 'PAID' : 'PARTIAL',
            status: 'CONFIRMED',
            createdAt: bookingDate,
            updatedAt: bookingDate
          }
        });
        bookings.push(booking);
      }
    }
    console.log(`Created ${bookings.length} sample bookings`);

    // Create sample financial transactions
    const transactionCategories = [
      'STAFF_SALARIES',
      'FACILITY_MAINTENANCE', 
      'UTILITIES',
      'MARKETING',
      'SUPPLIES',
      'FOOD_BEVERAGE',
      'EQUIPMENT',
      'INSURANCE'
    ];

    const transactions = [];
    for (let month = 0; month < 6; month++) {
      const transactionsThisMonth = Math.floor(Math.random() * 8) + 5; // 5-12 transactions per month
      
      for (let i = 0; i < transactionsThisMonth; i++) {
        const transactionDate = subMonths(new Date(), month);
        const isIncome = Math.random() > 0.7; // 30% income, 70% expense
        const category = isIncome ? 'RETREAT_BOOKING' : transactionCategories[Math.floor(Math.random() * transactionCategories.length)];
        const amount = isIncome ? 
          (1000 + Math.floor(Math.random() * 2000)) : // Income: 1000-3000 AED
          (500 + Math.floor(Math.random() * 1500));   // Expense: 500-2000 AED
        
        const transaction = await prisma.retreatFinancialTransaction.create({
          data: {
            type: isIncome ? 'INCOME' : 'EXPENSE',
            category,
            amount,
            description: `Sample ${isIncome ? 'income' : 'expense'} transaction for ${category.toLowerCase().replace(/_/g, ' ')}`,
            bookingId: isIncome && bookings.length > 0 ? bookings[Math.floor(Math.random() * bookings.length)].id : null,
            retreatId: retreats.length > 0 ? retreats[Math.floor(Math.random() * retreats.length)].id : null,
            status: 'COMPLETED',
            reference: `TXN-${Date.now()}-${i}`,
            createdAt: transactionDate,
            updatedAt: transactionDate
          }
        });
        transactions.push(transaction);
      }
    }
    console.log(`Created ${transactions.length} sample financial transactions`);

    // Create sample budgets and budget items
    const budgetCategories = [
      'STAFF_SALARIES',
      'MARKETING', 
      'UTILITIES',
      'SUPPLIES',
      'FACILITY_MAINTENANCE',
      'FOOD_BEVERAGE'
    ];

    const budget = await prisma.retreatBudget.upsert({
      where: { id: 'sample-budget-2024' },
      update: {},
      create: {
        id: 'sample-budget-2024',
        name: '2024 Annual Budget',
        period: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 500000,
        status: 'ACTIVE'
      }
    });

    const budgetItems = [];
    for (const category of budgetCategories) {
      const budgetedAmount = 20000 + Math.floor(Math.random() * 50000); // 20k-70k AED
      const actualAmount = budgetedAmount * (0.3 + Math.random() * 0.8); // 30%-110% of budget
      
      const budgetItem = await prisma.retreatBudgetItem.upsert({
        where: { 
          id: `budget-item-${category.toLowerCase()}`
        },
        update: {
          actualAmount
        },
        create: {
          id: `budget-item-${category.toLowerCase()}`,
          budgetId: budget.id,
          category,
          description: `Budget for ${category.toLowerCase().replace(/_/g, ' ')}`,
          budgetedAmount,
          actualAmount
        }
      });
      budgetItems.push(budgetItem);
    }
    console.log(`Created ${budgetItems.length} sample budget items`);

    console.log('\n✅ Sample financial data created successfully!');
    console.log('\nSummary:');
    console.log(`- ${guests.length} guests`);
    console.log(`- ${retreats.length} retreats`);
    console.log(`- ${bookings.length} bookings`);
    console.log(`- ${transactions.length} financial transactions`);
    console.log(`- ${budgetItems.length} budget items`);
    
    // Calculate totals
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalExpenseTransactions = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalBudgetExpenses = budgetItems.reduce((sum, item) => sum + Number(item.actualAmount), 0);
    
    console.log(`\nFinancial Summary:`);
    console.log(`- Total Revenue: AED ${totalRevenue.toLocaleString()}`);
    console.log(`- Total Transaction Expenses: AED ${totalExpenseTransactions.toLocaleString()}`);
    console.log(`- Total Budget Expenses: AED ${totalBudgetExpenses.toLocaleString()}`);
    console.log(`- Net Profit: AED ${(totalRevenue - totalExpenseTransactions - totalBudgetExpenses).toLocaleString()}`);

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleFinancialData(); 