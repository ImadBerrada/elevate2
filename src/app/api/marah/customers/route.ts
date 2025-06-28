import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED']).default('ACTIVE'),
  customerType: z.enum(['REGULAR', 'VIP', 'PREMIUM', 'CORPORATE']).default('REGULAR'),
  balance: z.number().default(0),
  loyaltyPoints: z.number().default(0),
  profilePicture: z.string().optional(),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  preferredLanguage: z.enum(['en', 'ar']).default('en'),
  marketingConsent: z.boolean().default(true),
  companyId: z.string().min(1, 'Company ID is required'),
  // Address fields (optional for creating customer with address)
  street: z.string().optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
});

const addressSchema = z.object({
  name: z.string().min(1, 'Address name is required'),
  address: z.string().min(1, 'Address is required'),
  zone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const balance = searchParams.get('balance');
    const customerType = searchParams.get('customerType');
    const orderRange = searchParams.get('orderRange');
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    // Balance filtering
    if (balance) {
      switch (balance) {
        case 'positive':
          where.balance = { gt: 0 };
          break;
        case 'negative':
          where.balance = { lt: 0 };
          break;
        case 'zero':
          where.balance = 0;
          break;
      }
    }

    const [customers, total] = await Promise.all([
      prisma.marahCustomer.findMany({
        where,
        include: {
          addresses: true,
          orders: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              orderDate: true,
            },
            orderBy: { orderDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahCustomer.count({ where }),
    ]);

    // Calculate customer statistics and apply order range filtering
    let customersWithStats = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const completedOrders = customer.orders.filter(order => order.status === 'COMPLETED').length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].orderDate : null;

      return {
        ...customer,
        totalOrders,
        completedOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        registrationDate: customer.createdAt,
      };
    });

    // Apply order range filtering after calculating stats
    if (orderRange) {
      customersWithStats = customersWithStats.filter(customer => {
        switch (orderRange) {
          case '0':
            return customer.totalOrders === 0;
          case '1-5':
            return customer.totalOrders >= 1 && customer.totalOrders <= 5;
          case '6-20':
            return customer.totalOrders >= 6 && customer.totalOrders <= 20;
          case '21+':
            return customer.totalOrders >= 21;
          default:
            return true;
        }
      });
    }

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, validatedData.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    // Check if phone number already exists
    const existingCustomer = await prisma.marahCustomer.findFirst({
      where: {
        phone: validatedData.phone,
      },
    });

    if (existingCustomer) {
      return NextResponse.json({ 
        error: 'Phone number already exists', 
        message: `A customer with phone number ${validatedData.phone} already exists. Please use a different phone number.` 
      }, { status: 409 });
    }

    // Create customer with enhanced data
    const customerData = {
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email || null,
      notes: validatedData.notes,
      status: validatedData.status,
      customerType: validatedData.customerType,
      balance: validatedData.balance,
      loyaltyPoints: validatedData.loyaltyPoints,
      profilePicture: validatedData.profilePicture,
      dateOfBirth: validatedData.dateOfBirth,
      emergencyContact: validatedData.emergencyContact,
      emergencyPhone: validatedData.emergencyPhone,
      preferredLanguage: validatedData.preferredLanguage,
      marketingConsent: validatedData.marketingConsent,
      registrationDate: new Date(),
      companyId: validatedData.companyId,
    };

    const customer = await prisma.marahCustomer.create({
      data: customerData,
      include: {
        addresses: true,
      },
    });

    // Create address if address fields are provided
    if (validatedData.street && validatedData.city) {
      const address = await prisma.marahCustomerAddress.create({
        data: {
          customerId: customer.id,
          name: 'Home', // Default address name
          address: `${validatedData.street}, ${validatedData.city}`,
          zone: validatedData.zone,
          isDefault: true,
        },
      });

      // Return customer with the created address
      return NextResponse.json({
        ...customer,
        addresses: [address],
      }, { status: 201 });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const field = (error as any).meta?.target?.[0] || 'field';
      return NextResponse.json({ 
        error: `${field} already exists`, 
        message: `A customer with this ${field} already exists. Please use a different ${field}.` 
      }, { status: 409 });
    }
    
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(postHandler); 