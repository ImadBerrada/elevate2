import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { businessSchema } from '@/lib/validations';

// GET /api/businesses - Get all businesses for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: request.user!.userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { industry: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status: status as any }),
    };

    const businesses = await prisma.business.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.business.count({
      where: whereClause,
    });

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
});

// POST /api/businesses - Create a new business
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = businessSchema.parse(body);
    
    // Create business
    const business = await prisma.business.create({
      data: {
        ...validatedData,
        userId: request.user!.userId,
      },
    });
    
    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Create business error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}); 