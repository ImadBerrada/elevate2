import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const RentalUnitUpdateSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  unitTypeId: z.string().min(1, 'Unit type is required'),
  area: z.number().optional(),
  bedrooms: z.number().default(0),
  bathrooms: z.number().default(0),
  parkingSpots: z.number().default(0),
  rentAmount: z.number().min(0, 'Rent amount must be positive'),
  securityDeposit: z.number().optional(),
  status: z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('VACANT'),
  notes: z.string().optional(),
});

// GET - Get specific rental unit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;
const unit = await prisma.propertyRentalUnit.findUnique({
      where: { id: id },
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
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Rental unit not found' },
        { status: 404 }
      );
    }

    const enrichedUnit = {
      ...unit,
      currentTenant: unit.agreements[0]?.tenant || null,
      isOccupied: unit.agreements.length > 0,
      monthlyRent: unit.agreements[0]?.rentAmount || unit.rentAmount,
    };

    return NextResponse.json(enrichedUnit);

  } catch (error) {
    console.error('Error fetching rental unit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental unit' },
      { status: 500 }
    );
  }
}

// PUT - Update rental unit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = RentalUnitUpdateSchema.parse(body);

    const unit = await prisma.propertyRentalUnit.update({
      where: { id: id },
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

    return NextResponse.json(unit);

  } catch (error) {
    console.error('Error updating rental unit:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update rental unit' },
      { status: 500 }
    );
  }
}

// DELETE - Delete rental unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if unit has active agreements
    const activeAgreements = await prisma.tenantAgreement.findMany({
      where: {
        rentalUnitId: id,
        status: 'ACTIVE'
      }
    });

    if (activeAgreements.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete unit with active agreements' },
        { status: 400 }
      );
    }

    await prisma.propertyRentalUnit.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Rental unit deleted successfully' });

  } catch (error) {
    console.error('Error deleting rental unit:', error);
    return NextResponse.json(
      { error: 'Failed to delete rental unit' },
      { status: 500 }
    );
  }
} 