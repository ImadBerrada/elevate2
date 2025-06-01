import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';

// GET /api/contacts - Get contacts (demo mode - no auth required)
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
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { employer: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create contact (demo mode - no auth required)
export async function POST(request: NextRequest) {
  try {
    // For demo purposes, use default user ID
    const userId = 'demo-user-id';
    
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        userId,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
} 