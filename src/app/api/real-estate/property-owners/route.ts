import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const PropertyOwnerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
});

// GET - List all property owners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const propertyOwners = await prisma.propertyOwner.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        properties: {
          include: {
            propertyType: true,
            _count: {
              select: {
                rentalUnits: true,
                agreements: true
              }
            }
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      },
      orderBy: { firstName: 'asc' },
    });

    // Calculate additional metrics for each owner
    const enrichedOwners = await Promise.all(
      propertyOwners.map(async (owner) => {
        // Calculate total property value
        const totalValue = owner.properties.reduce((sum, property) => 
          sum + (property.purchaseValue?.toNumber() || 0), 0
        );

        // Calculate total monthly rent
        const totalRent = await prisma.tenantAgreement.aggregate({
          where: {
            propertyId: { in: owner.properties.map(p => p.id) },
            status: 'ACTIVE'
          },
          _sum: {
            rentAmount: true
          }
        });

        return {
          ...owner,
          totalPropertyValue: totalValue,
          totalMonthlyRent: totalRent._sum.rentAmount?.toNumber() || 0,
          totalUnits: owner.properties.reduce((sum, property) => 
            sum + property._count.rentalUnits, 0
          ),
        };
      })
    );

    return NextResponse.json(enrichedOwners);
  } catch (error) {
    console.error('Error fetching property owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property owners' },
      { status: 500 }
    );
  }
}

// POST - Create new property owner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PropertyOwnerSchema.parse(body);

    const propertyOwner = await prisma.propertyOwner.create({
      data: validatedData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      },
    });

    return NextResponse.json(propertyOwner, { status: 201 });
  } catch (error) {
    console.error('Error creating property owner:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create property owner' },
      { status: 500 }
    );
  }
} 