import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE']),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED']).default('PAID'),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const dateFilter = searchParams.get('dateFilter');
    const search = searchParams.get('search');
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

    if (orderId) {
      where.orderId = orderId;
    }

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    // Handle search
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { order: { customer: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Handle date filtering
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let startDateFilter: Date;
      let endDateFilter: Date = now;

      switch (dateFilter) {
        case 'today':
          startDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDateFilter = new Date(now.getFullYear(), quarterStart, 1);
          break;
        default:
          startDateFilter = new Date(0);
      }

      where.createdAt = {
        gte: startDateFilter,
        lte: endDateFilter,
      };
    }

    const [payments, total] = await Promise.all([
      prisma.marahPayment.findMany({
        where,
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahPayment.count({ where }),
    ]);

    // Convert Decimal amounts to numbers for JSON serialization
    const paymentsWithNumbers = payments.map(payment => ({
      ...payment,
      amount: Number(payment.amount),
      order: payment.order ? {
        ...payment.order,
        totalAmount: Number(payment.order.totalAmount),
        subtotal: Number(payment.order.subtotal),
        discountAmount: Number(payment.order.discountAmount),
        deliveryCharge: Number(payment.order.deliveryCharge),
      } : undefined,
    }));

    return NextResponse.json({
      payments: paymentsWithNumbers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, validatedData.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    // Verify order exists and belongs to the company
    const order = await prisma.marahOrder.findFirst({
      where: {
        id: validatedData.orderId,
        companyId: validatedData.companyId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create the payment
    const payment = await prisma.marahPayment.create({
      data: {
        ...validatedData,
        companyId: validatedData.companyId,
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    // Update order payment status if fully paid
    const totalPaid = await prisma.marahPayment.aggregate({
      where: {
        orderId: validatedData.orderId,
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaidAmount = Number(totalPaid._sum?.amount || 0);
    const orderTotal = Number(order.totalAmount);

    if (totalPaidAmount >= orderTotal) {
      await prisma.marahOrder.update({
        where: { id: validatedData.orderId },
        data: { paymentStatus: 'PAID' },
      });
    } else if (totalPaidAmount > 0) {
      await prisma.marahOrder.update({
        where: { id: validatedData.orderId },
        data: { paymentStatus: 'PARTIAL' },
      });
    }

    // Convert Decimal to number for JSON serialization
    const paymentWithNumbers = {
      ...payment,
      amount: Number(payment.amount),
      order: payment.order ? {
        ...payment.order,
        totalAmount: Number(payment.order.totalAmount),
        subtotal: Number(payment.order.subtotal),
        discountAmount: Number(payment.order.discountAmount),
        deliveryCharge: Number(payment.order.deliveryCharge),
      } : undefined,
    };

    return NextResponse.json(paymentWithNumbers, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(postHandler); 