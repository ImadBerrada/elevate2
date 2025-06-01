import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { contactSchema } from '@/lib/validations';

// GET /api/contacts - Get all contacts for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: request.user!.userId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { employer: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.contact.count({
      where: whereClause,
    });

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
});

// POST /api/contacts - Create a new contact
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    // Create contact
    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        userId: request.user!.userId,
      },
    });
    
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Create contact error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}); 