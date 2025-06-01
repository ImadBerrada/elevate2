import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { businessSchema } from '@/lib/validations';

// GET /api/businesses - Get businesses (demo mode - no auth required)
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, use default user ID
    const userId = 'demo-user-id';
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const where = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { industry: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const businesses = await prisma.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

// POST /api/businesses - Create business (demo mode - no auth required)
export async function POST(request: NextRequest) {
  try {
    // For demo purposes, use default user ID
    const userId = 'demo-user-id';
    
    const body = await request.json();
    const validatedData = businessSchema.parse(body);

    const business = await prisma.business.create({
      data: {
        ...validatedData,
        lastInteraction: validatedData.lastInteraction ? new Date(validatedData.lastInteraction) : null,
        userId,
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Create business error:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
} 