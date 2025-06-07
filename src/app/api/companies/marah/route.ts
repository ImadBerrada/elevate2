import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId;

    // Check if MARAH company already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: 'MARAH Inflatable Games Rental',
        userId: userId,
      },
    });

    if (existingCompany) {
      return NextResponse.json({ 
        message: 'MARAH company already exists',
        company: existingCompany 
      });
    }

    // Create MARAH company with comprehensive sample data
    const company = await prisma.company.create({
      data: {
        name: 'MARAH Inflatable Games Rental',
        description: 'Premium inflatable games rental service in Dubai',
        industry: 'Entertainment & Events',
        size: 'Small Business (1-10 employees)',
        location: 'Dubai, UAE',
        email: 'info@marah-games.ae',
        phone: '+971-50-123-4567',
        website: 'https://marah-games.ae',
        status: 'ACTIVE',
        foundedYear: 2023,
        revenue: '100,000 - 500,000 AED',
        userId: userId,
      },
    });

    // Create sample games with enhanced data
    const games = await Promise.all([
      prisma.marahGame.create({
        data: {
          nameEn: 'Royal Bouncy Castle',
          nameAr: 'القلعة الملكية النطاطة',
          description: 'A magnificent royal-themed bouncy castle perfect for birthday parties and events',
          category: 'Bounce Houses',
          pricePerDay: 150.00,
          pricePerWeek: 900.00,
          pricePerMonth: 3000.00,
          isDiscountable: true,
          isAvailable: true,
          discountPercentage: 10,
          dimensions: '4m x 4m x 3.5m',
          capacity: 8,
          ageGroup: '3-12 years',
          setupTime: 30,
          images: ['/images/royal-castle.jpg'],
          companyId: company.id,
        },
      }),
      prisma.marahGame.create({
        data: {
          nameEn: 'Tropical Water Slide',
          nameAr: 'زحليقة المياه الاستوائية',
          description: 'Exciting water slide with tropical theme, perfect for summer events',
          category: 'Water Slides',
          pricePerDay: 200.00,
          pricePerWeek: 1200.00,
          pricePerMonth: 4000.00,
          isDiscountable: true,
          isAvailable: true,
          discountPercentage: 15,
          dimensions: '6m x 3m x 4m',
          capacity: 6,
          ageGroup: '6+ years',
          setupTime: 45,
          images: ['/images/tropical-slide.jpg'],
          companyId: company.id,
        },
      }),
      prisma.marahGame.create({
        data: {
          nameEn: 'Adventure Obstacle Course',
          nameAr: 'مسار العقبات المغامر',
          description: 'Challenging obstacle course for team building and competitive fun',
          category: 'Obstacle Courses',
          pricePerDay: 250.00,
          pricePerWeek: 1500.00,
          pricePerMonth: 5000.00,
          isDiscountable: true,
          isAvailable: true,
          discountPercentage: 20,
          dimensions: '10m x 3m x 3m',
          capacity: 10,
          ageGroup: '8+ years',
          setupTime: 60,
          images: ['/images/obstacle-course.jpg'],
          companyId: company.id,
        },
      }),
      prisma.marahGame.create({
        data: {
          nameEn: 'Colorful Ball Pit',
          nameAr: 'حوض الكرات الملون',
          description: 'Safe and fun ball pit for toddlers and young children',
          category: 'Interactive Games',
          pricePerDay: 100.00,
          pricePerWeek: 600.00,
          pricePerMonth: 2000.00,
          isDiscountable: true,
          isAvailable: true,
          discountPercentage: 5,
          dimensions: '3m x 3m x 1m',
          capacity: 12,
          ageGroup: '1-6 years',
          setupTime: 20,
          images: ['/images/ball-pit.jpg'],
          companyId: company.id,
        },
      }),
      prisma.marahGame.create({
        data: {
          nameEn: 'Giant Trampoline',
          nameAr: 'الترامبولين العملاق',
          description: 'Large professional trampoline for high-energy fun',
          category: 'Sports Games',
          pricePerDay: 180.00,
          pricePerWeek: 1080.00,
          pricePerMonth: 3600.00,
          isDiscountable: true,
          isAvailable: true,
          discountPercentage: 12,
          dimensions: '5m x 5m x 1m',
          capacity: 4,
          ageGroup: '6+ years',
          setupTime: 25,
          images: ['/images/trampoline.jpg'],
          companyId: company.id,
        },
      }),
    ]);

    // Create sample drivers with enhanced profiles
    const drivers = await Promise.all([
      prisma.marahDriver.create({
        data: {
          name: 'Ahmed Al-Rashid',
          phone: '+971501234567',
          email: 'ahmed.rashid@marah.ae',
          licenseNumber: 'DL123456789',
          vehicleInfo: 'Toyota Hiace 2022 - White',
          vehicleRegistration: 'DXB-A-12345',
          status: 'ACTIVE',
          address: 'Al Barsha, Dubai',
          emergencyContact: 'Fatima Al-Rashid',
          emergencyPhone: '+971509876543',
          experience: '5 years',
          salary: 4500.00,
          totalOrders: 45,
          completedOrders: 42,
          activeOrders: 3,
          totalRevenue: 12500.00,
          completionRate: 93.33,
          rating: 4.7,
          totalRatings: 38,
          companyId: company.id,
        },
      }),
      prisma.marahDriver.create({
        data: {
          name: 'Mohammed Hassan',
          phone: '+971507654321',
          email: 'mohammed.hassan@marah.ae',
          licenseNumber: 'DL987654321',
          vehicleInfo: 'Ford Transit 2021 - Blue',
          vehicleRegistration: 'DXB-B-67890',
          status: 'ACTIVE',
          address: 'Deira, Dubai',
          emergencyContact: 'Aisha Hassan',
          emergencyPhone: '+971501122334',
          experience: '3 years',
          salary: 4200.00,
          totalOrders: 32,
          completedOrders: 30,
          activeOrders: 2,
          totalRevenue: 8900.00,
          completionRate: 93.75,
          rating: 4.5,
          totalRatings: 28,
          companyId: company.id,
        },
      }),
    ]);

    // Create sample customers with enhanced profiles
    const customers = await Promise.all([
      prisma.marahCustomer.create({
        data: {
          name: 'Sarah Al-Mahmoud',
          phone: '+971551234567',
          email: 'sarah.mahmoud@gmail.com',
          status: 'ACTIVE',
          customerType: 'VIP',
          balance: 150.00,
          loyaltyPoints: 250,
          totalOrders: 8,
          completedOrders: 7,
          totalSpent: 1850.00,
          averageOrderValue: 231.25,
          registrationDate: new Date('2023-06-15'),
          lastOrderDate: new Date('2024-01-10'),
          preferredLanguage: 'en',
          marketingConsent: true,
          notes: 'VIP customer - prefers weekend deliveries',
          companyId: company.id,
        },
      }),
      prisma.marahCustomer.create({
        data: {
          name: 'Omar Al-Zahra',
          phone: '+971559876543',
          email: 'omar.zahra@outlook.com',
          status: 'ACTIVE',
          customerType: 'PREMIUM',
          balance: -50.00,
          loyaltyPoints: 180,
          totalOrders: 5,
          completedOrders: 5,
          totalSpent: 1200.00,
          averageOrderValue: 240.00,
          registrationDate: new Date('2023-08-20'),
          lastOrderDate: new Date('2024-01-05'),
          preferredLanguage: 'ar',
          marketingConsent: true,
          notes: 'Corporate events specialist',
          companyId: company.id,
        },
      }),
      prisma.marahCustomer.create({
        data: {
          name: 'Fatima Al-Nouri',
          phone: '+971552468135',
          email: 'fatima.nouri@yahoo.com',
          status: 'ACTIVE',
          customerType: 'REGULAR',
          balance: 0.00,
          loyaltyPoints: 95,
          totalOrders: 3,
          completedOrders: 3,
          totalSpent: 650.00,
          averageOrderValue: 216.67,
          registrationDate: new Date('2023-10-12'),
          lastOrderDate: new Date('2023-12-20'),
          preferredLanguage: 'en',
          marketingConsent: true,
          notes: 'Birthday party specialist',
          companyId: company.id,
        },
      }),
      prisma.marahCustomer.create({
        data: {
          name: 'Khalid Al-Mansoori',
          phone: '+971558642097',
          email: 'khalid.mansoori@gmail.com',
          status: 'ACTIVE',
          customerType: 'REGULAR',
          balance: 25.00,
          loyaltyPoints: 45,
          totalOrders: 2,
          completedOrders: 2,
          totalSpent: 425.00,
          averageOrderValue: 212.50,
          registrationDate: new Date('2023-11-30'),
          lastOrderDate: new Date('2024-01-02'),
          preferredLanguage: 'ar',
          marketingConsent: false,
          notes: 'New customer - first time user',
          companyId: company.id,
        },
      }),
    ]);

    // Create addresses for customers
    const addresses = await Promise.all([
      // Sarah's addresses
      prisma.marahCustomerAddress.create({
        data: {
          customerId: customers[0].id,
          name: 'Home',
          address: 'Villa 123, Al Barsha 1, Dubai',
          zone: 'Al Barsha',
          isDefault: true,
        },
      }),
      prisma.marahCustomerAddress.create({
        data: {
          customerId: customers[0].id,
          name: 'Office',
          address: 'Office 456, Business Bay, Dubai',
          zone: 'Business Bay',
          isDefault: false,
        },
      }),
      // Omar's address
      prisma.marahCustomerAddress.create({
        data: {
          customerId: customers[1].id,
          name: 'Home',
          address: 'Apartment 789, Downtown Dubai',
          zone: 'Downtown',
          isDefault: true,
        },
      }),
      // Fatima's address
      prisma.marahCustomerAddress.create({
        data: {
          customerId: customers[2].id,
          name: 'Home',
          address: 'Villa 321, Jumeirah 2, Dubai',
          zone: 'Jumeirah',
          isDefault: true,
        },
      }),
      // Khalid's address
      prisma.marahCustomerAddress.create({
        data: {
          customerId: customers[3].id,
          name: 'Home',
          address: 'Apartment 654, Marina Walk, Dubai Marina',
          zone: 'Dubai Marina',
          isDefault: true,
        },
      }),
    ]);

    // Create delivery charges for different zones
    const deliveryCharges = await Promise.all([
      prisma.marahDeliveryCharge.create({
        data: {
          zone: 'Al Barsha',
          area: 'Al Barsha 1, Al Barsha 2, Al Barsha 3',
          charge: 25.00,
          baseCharge: 25.00,
          perKmCharge: 2.00,
          minimumCharge: 20.00,
          maximumCharge: 50.00,
          estimatedTime: 30,
          isActive: true,
          notes: 'Standard residential area',
          companyId: company.id,
        },
      }),
      prisma.marahDeliveryCharge.create({
        data: {
          zone: 'Business Bay',
          area: 'Business Bay, DIFC',
          charge: 35.00,
          baseCharge: 35.00,
          perKmCharge: 3.00,
          minimumCharge: 30.00,
          maximumCharge: 70.00,
          estimatedTime: 45,
          isActive: true,
          notes: 'Business district - traffic considerations',
          companyId: company.id,
        },
      }),
      prisma.marahDeliveryCharge.create({
        data: {
          zone: 'Downtown',
          area: 'Downtown Dubai, Burj Khalifa area',
          charge: 40.00,
          baseCharge: 40.00,
          perKmCharge: 3.50,
          minimumCharge: 35.00,
          maximumCharge: 80.00,
          estimatedTime: 50,
          isActive: true,
          notes: 'Premium area - high demand zone',
          companyId: company.id,
        },
      }),
      prisma.marahDeliveryCharge.create({
        data: {
          zone: 'Jumeirah',
          area: 'Jumeirah 1, Jumeirah 2, Jumeirah 3',
          charge: 30.00,
          baseCharge: 30.00,
          perKmCharge: 2.50,
          minimumCharge: 25.00,
          maximumCharge: 60.00,
          estimatedTime: 35,
          isActive: true,
          notes: 'Coastal residential area',
          companyId: company.id,
        },
      }),
      prisma.marahDeliveryCharge.create({
        data: {
          zone: 'Dubai Marina',
          area: 'Dubai Marina, JBR, Palm Jumeirah',
          charge: 45.00,
          baseCharge: 45.00,
          perKmCharge: 4.00,
          minimumCharge: 40.00,
          maximumCharge: 90.00,
          estimatedTime: 60,
          isActive: true,
          notes: 'Premium coastal area - high-rise buildings',
          companyId: company.id,
        },
      }),
    ]);

    // Create sample orders with comprehensive data
    const orders = await Promise.all([
      prisma.marahOrder.create({
        data: {
          orderNumber: 'MRH240115001',
          customerId: customers[0].id,
          addressId: addresses[0].id,
          driverId: drivers[0].id,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          orderDate: new Date('2024-01-15T10:30:00'),
          eventDate: new Date('2024-01-20T14:00:00'),
          eventEndDate: new Date('2024-01-20T20:00:00'),
          eventTime: '2:00 PM',
          setupTime: '1:30 PM',
          notes: 'Birthday party for 8-year-old. Setup in backyard.',
          source: 'PHONE',
          subtotal: 300.00,
          discountAmount: 30.00,
          deliveryCharge: 25.00,
          totalAmount: 295.00,
          deliveredAt: new Date('2024-01-20T13:45:00'),
          collectedAt: new Date('2024-01-20T20:30:00'),
          companyId: company.id,
        },
      }),
      prisma.marahOrder.create({
        data: {
          orderNumber: 'MRH240118002',
          customerId: customers[1].id,
          addressId: addresses[2].id,
          driverId: drivers[1].id,
          status: 'ACTIVE',
          paymentStatus: 'PAID',
          orderDate: new Date('2024-01-18T09:15:00'),
          eventDate: new Date('2024-01-25T16:00:00'),
          eventEndDate: new Date('2024-01-25T22:00:00'),
          eventTime: '4:00 PM',
          setupTime: '3:30 PM',
          notes: 'Corporate team building event. Need early setup.',
          source: 'WEBSITE',
          subtotal: 450.00,
          discountAmount: 67.50,
          deliveryCharge: 40.00,
          totalAmount: 422.50,
          companyId: company.id,
        },
      }),
      prisma.marahOrder.create({
        data: {
          orderNumber: 'MRH240120003',
          customerId: customers[2].id,
          addressId: addresses[3].id,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          orderDate: new Date('2024-01-20T14:22:00'),
          eventDate: new Date('2024-01-28T15:00:00'),
          eventEndDate: new Date('2024-01-28T21:00:00'),
          eventTime: '3:00 PM',
          setupTime: '2:30 PM',
          notes: 'Kids birthday party. Please call before delivery.',
          source: 'WHATSAPP',
          subtotal: 250.00,
          discountAmount: 0.00,
          deliveryCharge: 30.00,
          totalAmount: 280.00,
          companyId: company.id,
        },
      }),
      prisma.marahOrder.create({
        data: {
          orderNumber: 'MRH240122004',
          customerId: customers[3].id,
          addressId: addresses[4].id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          orderDate: new Date('2024-01-22T11:45:00'),
          eventDate: new Date('2024-02-02T17:00:00'),
          eventEndDate: new Date('2024-02-02T23:00:00'),
          eventTime: '5:00 PM',
          setupTime: '4:30 PM',
          notes: 'First time customer. Weekend delivery preferred.',
          source: 'SOCIAL_MEDIA',
          subtotal: 180.00,
          discountAmount: 0.00,
          deliveryCharge: 45.00,
          totalAmount: 225.00,
          companyId: company.id,
        },
      }),
    ]);

    // Create order items
    await Promise.all([
      // Order 1 items
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[0].id,
          gameId: games[0].id, // Royal Bouncy Castle
          quantity: 1,
          pricePerDay: 150.00,
          days: 1,
          totalPrice: 150.00,
        },
      }),
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[0].id,
          gameId: games[3].id, // Ball Pit
          quantity: 1,
          pricePerDay: 100.00,
          days: 1,
          totalPrice: 100.00,
        },
      }),
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[0].id,
          gameId: games[4].id, // Trampoline
          quantity: 1,
          pricePerDay: 50.00, // Discounted price
          days: 1,
          totalPrice: 50.00,
        },
      }),
      // Order 2 items
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[1].id,
          gameId: games[2].id, // Obstacle Course
          quantity: 1,
          pricePerDay: 200.00, // Discounted price
          days: 1,
          totalPrice: 200.00,
        },
      }),
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[1].id,
          gameId: games[1].id, // Water Slide
          quantity: 1,
          pricePerDay: 170.00, // Discounted price
          days: 1,
          totalPrice: 170.00,
        },
      }),
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[1].id,
          gameId: games[4].id, // Trampoline
          quantity: 1,
          pricePerDay: 80.00, // Discounted price
          days: 1,
          totalPrice: 80.00,
        },
      }),
      // Order 3 items
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[2].id,
          gameId: games[0].id, // Royal Bouncy Castle
          quantity: 1,
          pricePerDay: 150.00,
          days: 1,
          totalPrice: 150.00,
        },
      }),
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[2].id,
          gameId: games[3].id, // Ball Pit
          quantity: 1,
          pricePerDay: 100.00,
          days: 1,
          totalPrice: 100.00,
        },
      }),
      // Order 4 items
      prisma.marahOrderItem.create({
        data: {
          orderId: orders[3].id,
          gameId: games[4].id, // Trampoline
          quantity: 1,
          pricePerDay: 180.00,
          days: 1,
          totalPrice: 180.00,
        },
      }),
    ]);

    // Create sample payments
    await Promise.all([
      prisma.marahPayment.create({
        data: {
          orderId: orders[0].id,
          amount: 295.00,
          method: 'CASH',
          status: 'PAID',
          transactionId: 'CASH-240120-001',
          notes: 'Paid in cash on delivery',
          paidAt: new Date('2024-01-20T13:45:00'),
          companyId: company.id,
        },
      }),
      prisma.marahPayment.create({
        data: {
          orderId: orders[1].id,
          amount: 422.50,
          method: 'BANK_TRANSFER',
          status: 'PAID',
          transactionId: 'BT-240118-002',
          notes: 'Bank transfer - corporate payment',
          paidAt: new Date('2024-01-18T15:30:00'),
          companyId: company.id,
        },
      }),
    ]);

    // Create sample expenses with enhanced data
    await Promise.all([
      prisma.marahExpense.create({
        data: {
          description: 'Fuel for delivery vehicles',
          amount: 150.00,
          category: 'FUEL',
          date: new Date('2024-01-15'),
          vendor: 'ADNOC Gas Station',
          location: 'Al Barsha',
          notes: 'Weekly fuel refill for both vehicles',
          driverId: drivers[0].id,
          tags: ['fuel', 'vehicle', 'weekly'],
          companyId: company.id,
        },
      }),
      prisma.marahExpense.create({
        data: {
          description: 'Vehicle maintenance and oil change',
          amount: 250.00,
          category: 'MAINTENANCE',
          date: new Date('2024-01-10'),
          vendor: 'Al Futtaim Auto Service',
          location: 'Dubai',
          notes: 'Regular maintenance for Toyota Hiace',
          driverId: drivers[0].id,
          tags: ['maintenance', 'vehicle', 'oil-change'],
          companyId: company.id,
        },
      }),
      prisma.marahExpense.create({
        data: {
          description: 'Social media advertising campaign',
          amount: 500.00,
          category: 'MARKETING',
          date: new Date('2024-01-12'),
          vendor: 'Meta Business',
          location: 'Online',
          notes: 'Facebook and Instagram ads for January',
          tags: ['marketing', 'social-media', 'advertising'],
          companyId: company.id,
        },
      }),
      prisma.marahExpense.create({
        data: {
          description: 'Cleaning supplies for games',
          amount: 75.00,
          category: 'SUPPLIES',
          date: new Date('2024-01-08'),
          vendor: 'Carrefour',
          location: 'Mall of the Emirates',
          notes: 'Disinfectants and cleaning materials',
          tags: ['supplies', 'cleaning', 'hygiene'],
          companyId: company.id,
        },
      }),
      prisma.marahExpense.create({
        data: {
          description: 'Office rent for January',
          amount: 3000.00,
          category: 'RENT',
          date: new Date('2024-01-01'),
          vendor: 'Dubai Properties',
          location: 'Business Bay',
          notes: 'Monthly office rent payment',
          isRecurring: true,
          tags: ['rent', 'office', 'monthly'],
          companyId: company.id,
        },
      }),
    ]);

    // Create system settings
    await Promise.all([
      prisma.marahSetting.create({
        data: {
          key: 'business_hours_start',
          value: '08:00',
          companyId: company.id,
        },
      }),
      prisma.marahSetting.create({
        data: {
          key: 'business_hours_end',
          value: '20:00',
          companyId: company.id,
        },
      }),
      prisma.marahSetting.create({
        data: {
          key: 'default_setup_time',
          value: '30',
          companyId: company.id,
        },
      }),
      prisma.marahSetting.create({
        data: {
          key: 'auto_assign_drivers',
          value: 'true',
          companyId: company.id,
        },
      }),
      prisma.marahSetting.create({
        data: {
          key: 'sms_notifications',
          value: 'true',
          companyId: company.id,
        },
      }),
      prisma.marahSetting.create({
        data: {
          key: 'email_notifications',
          value: 'true',
          companyId: company.id,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'MARAH company created successfully with comprehensive sample data',
      company,
      stats: {
        games: games.length,
        drivers: drivers.length,
        customers: customers.length,
        orders: orders.length,
        deliveryZones: deliveryCharges.length,
        expenses: 5,
        settings: 6,
      },
    });
  } catch (error) {
    console.error('Error creating MARAH company:', error);
    return NextResponse.json(
      { error: 'Failed to create MARAH company' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler); 