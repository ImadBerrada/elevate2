import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const orderItemSchema = z.object({
  gameId: z.string(),
  quantity: z.number().int().positive(),
  days: z.number().int().positive().default(1),
});

const orderSchema = z.object({
  customerId: z.string(),
  addressId: z.string(),
  eventDate: z.string().transform(val => new Date(val)),
  eventEndDate: z.string().transform(val => new Date(val)),
  eventTime: z.string().optional(),
  setupTime: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['WEBSITE', 'PHONE', 'WHATSAPP', 'SOCIAL_MEDIA', 'REFERRAL', 'WALK_IN']).default('PHONE'),
  items: z.array(orderItemSchema),
  discountAmount: z.number().default(0),
  companyId: z.string().min(1, 'Company ID is required'),
});

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MRH${year}${month}${day}${random}`;
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const driverId = searchParams.get('driverId');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date'); // For today's orders
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

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Date filtering
    if (date) {
      // For specific date (today's orders)
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      where.orderDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      // For date range
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.orderDate.lte = endDateTime;
      }
    }

    const [orders, total, statusCounts] = await Promise.all([
      prisma.marahOrder.findMany({
        where,
        include: {
          customer: true,
          address: true,
          driver: true,
          items: {
            include: {
              game: true,
            },
          },
          payments: true,
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahOrder.count({ where }),
      prisma.marahOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { status: true },
      }),
    ]);

    return NextResponse.json({
      orders,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, validatedData.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    // Get delivery charge for the address zone
    const address = await prisma.marahCustomerAddress.findUnique({
      where: { id: validatedData.addressId },
    });

    let deliveryCharge = 0;
    if (address?.zone) {
      const deliveryChargeRecord = await prisma.marahDeliveryCharge.findFirst({
        where: { 
          zone: address.zone,
          companyId: validatedData.companyId,
        },
      });
      deliveryCharge = deliveryChargeRecord ? Number(deliveryChargeRecord.charge) : 0;
    }

    // Calculate pricing
    let subtotal = 0;
    const itemsWithPricing = [];

    for (const item of validatedData.items) {
      const game = await prisma.marahGame.findFirst({
        where: { 
          id: item.gameId,
          companyId: validatedData.companyId,
        },
      });

      if (!game) {
        return NextResponse.json({ error: `Game not found: ${item.gameId}` }, { status: 400 });
      }

      const pricePerDay = Number(game.pricePerDay);
      const totalPrice = pricePerDay * item.quantity * item.days;
      subtotal += totalPrice;

      itemsWithPricing.push({
        gameId: item.gameId,
        quantity: item.quantity,
        days: item.days,
        pricePerDay,
        totalPrice,
      });
    }

    const totalAmount = subtotal - validatedData.discountAmount + deliveryCharge;

    const order = await prisma.marahOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: validatedData.customerId,
        addressId: validatedData.addressId,
        eventDate: validatedData.eventDate,
        eventEndDate: validatedData.eventEndDate,
        setupTime: validatedData.setupTime,
        notes: validatedData.notes,
        source: validatedData.source,
        companyId: validatedData.companyId,
        subtotal,
        discountAmount: validatedData.discountAmount,
        deliveryCharge,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: itemsWithPricing,
        },
      },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            game: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(postHandler); 