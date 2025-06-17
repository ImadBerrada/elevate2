import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const PropertyTypeSchema = z.object({
  name: z.string().min(1, 'Property type name is required'),
  description: z.string().optional(),
});

// GET - List all property types
export async function GET() {
  try {
    const propertyTypes = await prisma.propertyType.findMany({
      include: {
        _count: {
          select: {
            properties: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(propertyTypes);
  } catch (error) {
    console.error('Error fetching property types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property types' },
      { status: 500 }
    );
  }
}

// POST - Create new property type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PropertyTypeSchema.parse(body);

    const propertyType = await prisma.propertyType.create({
      data: validatedData,
    });

    return NextResponse.json(propertyType, { status: 201 });
  } catch (error) {
    console.error('Error creating property type:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create property type' },
      { status: 500 }
    );
  }
} 