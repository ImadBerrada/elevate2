import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { employerSchema } from '@/lib/validations';

// GET /api/employers - Get employers (demo mode - no auth required)
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
          { nameEnglish: { contains: search, mode: 'insensitive' as const } },
          { nameArabic: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const employers = await prisma.employer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(employers);
  } catch (error) {
    console.error('Get employers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employers' },
      { status: 500 }
    );
  }
}

// POST /api/employers - Create employer (demo mode - no auth required)
export async function POST(request: NextRequest) {
  try {
    // For demo purposes, use default user ID
    const userId = 'demo-user-id';
    
    const body = await request.json();
    const validatedData = employerSchema.parse(body);

    const employer = await prisma.employer.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return NextResponse.json(employer, { status: 201 });
  } catch (error) {
    console.error('Create employer error:', error);
    return NextResponse.json(
      { error: 'Failed to create employer' },
      { status: 500 }
    );
  }
} 