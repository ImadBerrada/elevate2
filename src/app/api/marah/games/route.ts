import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const gameSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  pricePerDay: z.number().positive('Price must be positive'),
  pricePerWeek: z.number().positive('Price must be positive').optional(),
  pricePerMonth: z.number().positive('Price must be positive').optional(),
  isDiscountable: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  discountPercentage: z.number().min(0).max(100).optional(),
  imageUrl: z.string().optional(),
  dimensions: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  ageGroup: z.string().optional(),
  setupTime: z.number().int().positive().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
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
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Status filtering
    if (status) {
      switch (status) {
        case 'available':
          where.isAvailable = true;
          break;
        case 'unavailable':
          where.isAvailable = false;
          break;
        case 'discountable':
          where.isDiscountable = true;
          break;
      }
    }

    const [games, total, categories] = await Promise.all([
      prisma.marahGame.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahGame.count({ where }),
      prisma.marahGame.groupBy({
        by: ['category'],
        where: { companyId },
        _count: { category: true },
      }),
    ]);

    // Calculate default prices if not set
    const gamesWithPricing = games.map(game => ({
      ...game,
      pricePerDay: Number(game.pricePerDay),
      pricePerWeek: game.pricePerWeek ? Number(game.pricePerWeek) : Number(game.pricePerDay) * 6, // 6 days for weekly discount
      pricePerMonth: game.pricePerMonth ? Number(game.pricePerMonth) : Number(game.pricePerDay) * 25, // 25 days for monthly discount
    }));

    return NextResponse.json({
      games: gamesWithPricing,
      categories: categories.map(c => ({ name: c.category, count: c._count.category })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = gameSchema.parse(body);

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, validatedData.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    // Set default weekly and monthly prices if not provided
    const gameData = {
      ...validatedData,
      pricePerWeek: validatedData.pricePerWeek || validatedData.pricePerDay * 6,
      pricePerMonth: validatedData.pricePerMonth || validatedData.pricePerDay * 25,
    };

    const game = await prisma.marahGame.create({
      data: gameData,
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(postHandler); 