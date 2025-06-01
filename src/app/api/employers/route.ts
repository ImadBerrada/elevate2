import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { employerSchema } from '@/lib/validations';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

// GET /api/employers - Get all employers for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: request.user!.userId,
      ...(search && {
        OR: [
          { nameEnglish: { contains: search, mode: 'insensitive' as const } },
          { nameArabic: { contains: search, mode: 'insensitive' as const } },
          { industry: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
    };

    const employers = await prisma.employer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.employer.count({
      where: whereClause,
    });

    return NextResponse.json({
      employers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get employers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employers' },
      { status: 500 }
    );
  }
});

// POST /api/employers - Create a new employer
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = employerSchema.parse(body);
    
    // Create employer
    const employer = await prisma.employer.create({
      data: {
        ...validatedData,
        userId: request.user!.userId,
      },
    });
    
    return NextResponse.json(employer, { status: 201 });
  } catch (error) {
    console.error('Create employer error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create employer' },
      { status: 500 }
    );
  }
}); 