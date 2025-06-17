import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for property updates
const PropertyUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  country: z.string().optional(),
  floorArea: z.number().optional(),
  lotArea: z.number().optional(),
  purchaseValue: z.union([z.string(), z.number()]).optional(),
  purchaseDate: z.string().optional(),
  propertyTypeId: z.string().optional(),
  ownerId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  expectedMonthlyRent: z.union([z.string(), z.number()]).optional(),
  expectedAnnualExpenses: z.union([z.string(), z.number()]).optional(),
  image: z.string().optional(),
});

// GET - Get property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
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
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 10
        },
        appliances: true,
        attachments: true,
        agreements: {
          include: {
            tenant: true,
            rentalUnit: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Calculate additional metrics
    const totalRent = await prisma.tenantAgreement.aggregate({
      where: {
        propertyId: property.id,
        status: 'ACTIVE'
      },
      _sum: {
        rentAmount: true
      }
    });

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

    const enrichedProperty = {
      ...property,
      totalMonthlyRent: totalRent._sum.rentAmount?.toNumber() || property.expectedMonthlyRent?.toNumber() || 0,
      totalYearlyExpenses: totalExpenses._sum.amount?.toNumber() || property.expectedAnnualExpenses?.toNumber() || 0,
      occupiedUnits: property.rentalUnits.filter(unit => 
        unit.agreements.some(agreement => agreement.status === 'ACTIVE')
      ).length || property.occupiedUnits || 0,
      totalUnits: property.rentalUnits.length || property.totalUnits || 0
    };

    return NextResponse.json(enrichedProperty);

  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;

    const body = await request.json();
    console.log('Received PUT body:', body);
    const validatedData = PropertyUpdateSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Convert purchaseDate string to Date if provided
    // Also ensure Decimal fields are properly handled
    const updateData = {
      ...validatedData,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
      // Ensure decimal fields are converted properly
      purchaseValue: validatedData.purchaseValue !== undefined ? validatedData.purchaseValue : undefined,
      expectedMonthlyRent: validatedData.expectedMonthlyRent !== undefined ? validatedData.expectedMonthlyRent : undefined,
      expectedAnnualExpenses: validatedData.expectedAnnualExpenses !== undefined ? validatedData.expectedAnnualExpenses : undefined,
    };

    console.log('Update data being sent to Prisma:', updateData);
    
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        propertyType: true,
        owner: true,
        rentalUnits: true,
      },
    });
    
    console.log('Property updated successfully:', updatedProperty.id);

    return NextResponse.json(updatedProperty);

  } catch (error) {
    console.error('Error updating property:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;

    // Check for ?force=true in search params
    const url = new URL(request.url);
    const forceDelete = url.searchParams.get('force') === 'true';

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        rentalUnits: true,
        agreements: true,
        expenses: true,
        appliances: true,
        attachments: true
      }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if property has active agreements
    const activeAgreements = await prisma.tenantAgreement.count({
      where: {
        propertyId: id,
        status: 'ACTIVE'
      }
    });

    if (activeAgreements > 0 && !forceDelete) {
      return NextResponse.json(
        { error: 'Cannot delete property with active tenant agreements. Pass force=true to override.' },
        { status: 400 }
      );
    }

    // Delete related records manually to avoid foreign key constraints
    // First, get all agreements for this property
    const propertyAgreements = await prisma.tenantAgreement.findMany({
      where: { propertyId: id },
      select: { id: true }
    });

    // Delete all payments related to these agreements
    if (propertyAgreements.length > 0) {
      await prisma.tenantPayment.deleteMany({
        where: {
          agreementId: {
            in: propertyAgreements.map(a => a.id)
          }
        }
      });

      // Delete all invoices related to these agreements
      await prisma.realEstateInvoice.deleteMany({
        where: {
          agreementId: {
            in: propertyAgreements.map(a => a.id)
          }
        }
      });
    }

    // Delete all agreements (including terminated ones)
    await prisma.tenantAgreement.deleteMany({
      where: { propertyId: id }
    });

    // Delete all rental units
    await prisma.propertyRentalUnit.deleteMany({
      where: { propertyId: id }
    });

    // Delete all expenses
    await prisma.propertyExpense.deleteMany({
      where: { propertyId: id }
    });

    // Delete all appliances
    await prisma.propertyAppliance.deleteMany({
      where: { propertyId: id }
    });

    // Delete all attachments
    await prisma.propertyAttachment.deleteMany({
      where: { propertyId: id }
    });

    // Finally delete the property
    await prisma.property.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Property deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
} 