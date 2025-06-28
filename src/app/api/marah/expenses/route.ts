import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['FUEL', 'MAINTENANCE', 'MARKETING', 'SUPPLIES', 'UTILITIES', 'SALARIES', 'RENT', 'INSURANCE', 'EQUIPMENT', 'REPAIRS', 'OFFICE_SUPPLIES', 'PROFESSIONAL_SERVICES', 'TRAVEL', 'TRAINING', 'SOFTWARE', 'OTHER']),
  date: z.string().transform(val => new Date(val)).optional(),
  receipt: z.string().optional(),
  notes: z.string().optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
  receiptUrl: z.string().optional(),
  driverId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  companyId: z.string().min(1, 'Company ID is required'),
});

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const dateFilter = searchParams.get('dateFilter');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
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

    if (category) {
      where.category = category;
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
        case 'year':
          startDateFilter = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDateFilter = new Date(0);
      }

      where.date = {
        gte: startDateFilter,
        lte: endDateFilter,
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [expenses, total, categoryTotals] = await Promise.all([
      prisma.marahExpense.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahExpense.count({ where }),
      prisma.marahExpense.groupBy({
        by: ['category'],
        where: {
          companyId,
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          } : {}),
        },
        _sum: { amount: true },
        _count: { category: true },
      }),
    ]);

    return NextResponse.json({
      expenses,
      categoryTotals: categoryTotals.map(item => ({
        category: item.category,
        total: Number(item._sum.amount || 0),
        count: item._count.category,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, validatedData.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    const expense = await prisma.marahExpense.create({
      data: {
        ...validatedData,
        date: validatedData.date || new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(postHandler); 