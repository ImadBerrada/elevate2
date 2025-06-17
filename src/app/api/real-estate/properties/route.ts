import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for property creation/update
const PropertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  country: z.string().default('UAE'),
  floorArea: z.number().nullable().optional(),
  lotArea: z.number().nullable().optional(),
  purchaseValue: z.number().nullable().optional(),
  purchaseDate: z.string().optional(),
  propertyTypeId: z.string().min(1, 'Property type is required'),
  ownerId: z.string().min(1, 'Owner is required'),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_RENOVATION', 'FOR_SALE']).default('ACTIVE'),
  // Financial and occupancy fields
  expectedMonthlyRent: z.number().nullable().optional(),
  expectedAnnualExpenses: z.number().nullable().optional(),
  totalUnits: z.number().nullable().optional(),
  occupiedUnits: z.number().nullable().optional(),
  occupancyRate: z.number().nullable().optional(),
  // Property image
  image: z.string().optional(),
});

// GET - List all properties with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const ownerId = searchParams.get('ownerId') || '';
    const propertyTypeId = searchParams.get('propertyTypeId') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (ownerId) where.ownerId = ownerId;
    if (propertyTypeId) where.propertyTypeId = propertyTypeId;
    if (status) where.status = status;

    // Get properties with related data
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          propertyType: true,
          owner: true,
          rentalUnits: {
            include: {
              unitType: true,
              agreements: {
                where: { status: 'ACTIVE' },
                include: { tenant: true }
              }
            }
          },
          _count: {
            select: {
              rentalUnits: true,
              expenses: true,
              agreements: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    // Calculate additional metrics for each property
    const enrichedProperties = await Promise.all(
      properties.map(async (property) => {
        // Calculate total rent amount from active agreements
        const totalRent = await prisma.tenantAgreement.aggregate({
          where: {
            propertyId: property.id,
            status: 'ACTIVE'
          },
          _sum: {
            rentAmount: true
          }
        });

        // Calculate total expenses for current year
        const totalExpenses = await prisma.propertyExpense.aggregate({
          where: {
            propertyId: property.id,
            expenseDate: {
              gte: new Date(new Date().getFullYear(), 0, 1)
            }
          },
          _sum: {
            amount: true
          }
        });

        // Use expected values if actual values are not available
        const actualMonthlyRent = totalRent._sum.rentAmount?.toNumber() || 0;
        const actualYearlyExpenses = totalExpenses._sum.amount?.toNumber() || 0;
        const actualOccupiedUnits = property.rentalUnits.filter(unit => 
          unit.agreements.some(agreement => agreement.status === 'ACTIVE')
        ).length;
        const actualTotalUnits = property.rentalUnits.length;

        return {
          ...property,
          totalMonthlyRent: actualMonthlyRent > 0 ? actualMonthlyRent : (property.expectedMonthlyRent?.toNumber() || 0),
          totalYearlyExpenses: actualYearlyExpenses > 0 ? actualYearlyExpenses : (property.expectedAnnualExpenses?.toNumber() || 0),
          occupiedUnits: actualTotalUnits > 0 ? actualOccupiedUnits : (property.occupiedUnits || 0),
          totalUnits: actualTotalUnits > 0 ? actualTotalUnits : (property.totalUnits || 0)
        };
      })
    );

    return NextResponse.json({
      success: true,
      properties: enrichedProperties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PropertySchema.parse(body);

    // Convert purchaseDate string to Date if provided
    const propertyData = {
      ...validatedData,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        propertyType: true,
        owner: true,
        rentalUnits: true,
      },
    });

    return NextResponse.json(property, { status: 201 });

  } catch (error) {
    console.error('Error creating property:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
} 