import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const RentalUnitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  unitTypeId: z.string().min(1, 'Unit type is required'),
  propertyId: z.string().min(1, 'Property is required'),
  area: z.number().optional(),
  bedrooms: z.number().default(0),
  bathrooms: z.number().default(0),
  parkingSpots: z.number().default(0),
  rentAmount: z.number().min(0, 'Rent amount must be positive'),
  securityDeposit: z.number().optional(),
  status: z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('VACANT'),
  notes: z.string().optional(),
});

// GET - List rental units with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const propertyId = searchParams.get('propertyId') || '';
    const status = searchParams.get('status') || '';
    const unitTypeId = searchParams.get('unitTypeId') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (unitTypeId) where.unitTypeId = unitTypeId;

    const [units, total] = await Promise.all([
      prisma.propertyRentalUnit.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          unitType: true,
          agreements: {
            where: { status: 'ACTIVE' },
            include: {
              tenant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { property: { name: 'asc' } },
          { unitNumber: 'asc' }
        ],
      }),
      prisma.propertyRentalUnit.count({ where }),
    ]);

    // Enrich with additional data
    const enrichedUnits = units.map(unit => ({
      ...unit,
      currentTenant: unit.agreements[0]?.tenant || null,
      isOccupied: unit.agreements.length > 0,
      monthlyRent: unit.agreements[0]?.rentAmount || unit.rentAmount,
    }));

    return NextResponse.json({
      units: enrichedUnits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching rental units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental units' },
      { status: 500 }
    );
  }
}

// POST - Create new rental unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RentalUnitSchema.parse(body);

    const unit = await prisma.propertyRentalUnit.create({
      data: validatedData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        unitType: true,
        agreements: {
          include: {
            tenant: true
          }
        }
      },
    });

    return NextResponse.json(unit, { status: 201 });

  } catch (error) {
    console.error('Error creating rental unit:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create rental unit' },
      { status: 500 }
    );
  }
} 