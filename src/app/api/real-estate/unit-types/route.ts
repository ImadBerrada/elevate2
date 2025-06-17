import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const UnitTypeSchema = z.object({
  name: z.string().min(1, 'Unit type name is required'),
  description: z.string().optional(),
});

// GET - List all unit types
export async function GET(request: NextRequest) {
  try {
    const unitTypes = await prisma.rentalUnitType.findMany({
      orderBy: { name: 'asc' },
    });

    // If no unit types exist, create default ones
    if (unitTypes.length === 0) {
      const defaultUnitTypes = [
        { name: 'Studio', description: 'Studio apartment' },
        { name: '1BR', description: 'One bedroom apartment' },
        { name: '2BR', description: 'Two bedroom apartment' },
        { name: '3BR', description: 'Three bedroom apartment' },
        { name: '4BR', description: 'Four bedroom apartment' },
        { name: 'Penthouse', description: 'Luxury penthouse unit' },
        { name: 'Duplex', description: 'Two-story unit' },
        { name: 'Villa', description: 'Independent villa' },
        { name: 'Townhouse', description: 'Multi-level townhouse' },
        { name: 'Shop', description: 'Commercial retail space' },
        { name: 'Office', description: 'Commercial office space' },
        { name: 'Warehouse', description: 'Storage/warehouse space' }
      ];

      const createdUnitTypes = await Promise.all(
        defaultUnitTypes.map(unitType =>
          prisma.rentalUnitType.create({ data: unitType })
        )
      );

      return NextResponse.json({
        unitTypes: createdUnitTypes,
        message: 'Default unit types created'
      });
    }

    return NextResponse.json({
      unitTypes,
      total: unitTypes.length
    });

  } catch (error) {
    console.error('Error fetching unit types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unit types' },
      { status: 500 }
    );
  }
}

// POST - Create new unit type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UnitTypeSchema.parse(body);

    const unitType = await prisma.rentalUnitType.create({
      data: validatedData,
    });

    return NextResponse.json(unitType, { status: 201 });

  } catch (error) {
    console.error('Error creating unit type:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create unit type' },
      { status: 500 }
    );
  }
} 