import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const TenantUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  alternatePhone: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  emiratesId: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  monthlyIncome: z.union([
    z.number(),
    z.string().transform((val) => val === '' ? undefined : Number(val))
  ]).refine((val) => val === undefined || (typeof val === 'number' && val <= 99999999.99), {
    message: 'Monthly income cannot exceed 99,999,999.99'
  }).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
});

// GET - Get single tenant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        agreements: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            rentalUnit: {
              select: {
                id: true,
                unitNumber: true,
                unitType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            agreements: true
          }
        }
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get current active agreement
    const activeAgreement = tenant.agreements.find(agreement => 
      agreement.status === 'ACTIVE'
    );

    // Calculate total payments made
    const totalPayments = await prisma.tenantPayment.aggregate({
      where: {
        agreement: {
          tenantId: tenant.id
        },
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    // Calculate outstanding invoices
    const outstandingInvoices = await prisma.realEstateInvoice.count({
      where: {
        agreement: {
          tenantId: tenant.id
        },
        status: 'PENDING'
      }
    });

    const enrichedTenant = {
      ...tenant,
      currentProperty: activeAgreement?.property,
      currentUnit: activeAgreement?.rentalUnit,
      currentRent: activeAgreement?.rentAmount || 0,
      totalPayments: totalPayments._sum.amount?.toNumber() || 0,
      outstandingInvoices,
    };

    return NextResponse.json(enrichedTenant);

  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}

// PUT - Update tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the data
    const validatedData = TenantUpdateSchema.parse(body);

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Update the tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: validatedData,
      include: {
        agreements: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            rentalUnit: {
              select: {
                id: true,
                unitNumber: true,
                unitType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            agreements: true
          }
        }
      },
    });

    return NextResponse.json(updatedTenant);

  } catch (error) {
    console.error('Error updating tenant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('numeric field overflow')) {
        return NextResponse.json(
          { error: 'One of the numeric values is too large. Please check the monthly income field.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if tenant exists and get all related data
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        agreements: {
          include: {
            rentalUnit: true
          }
        }
      }
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if tenant has active agreements
    const activeAgreements = existingTenant.agreements.filter(
      agreement => agreement.status === 'ACTIVE'
    );

    if (activeAgreements.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete tenant with ${activeAgreements.length} active agreement(s). Please terminate all active agreements first.`,
          activeAgreements: activeAgreements.map(a => a.agreementNumber)
        },
        { status: 400 }
      );
    }

    // Perform cascading deletion in correct order
    const agreementIds = existingTenant.agreements.map(a => a.id);
    
    if (agreementIds.length > 0) {
      console.log(`Deleting tenant ${id} with ${agreementIds.length} agreements`);
      
      // Step 1: Delete all payments related to these agreements
      await prisma.tenantPayment.deleteMany({
        where: {
          agreementId: { in: agreementIds }
        }
      });
      console.log('Deleted tenant payments');

      // Step 2: Delete all invoices related to these agreements
      await prisma.realEstateInvoice.deleteMany({
        where: {
          agreementId: { in: agreementIds }
        }
      });
      console.log('Deleted tenant invoices');

      // Step 3: Update rental units to VACANT for agreements being deleted
      const rentalUnitIds = existingTenant.agreements
        .filter(a => a.rentalUnitId)
        .map(a => a.rentalUnitId);
      
      if (rentalUnitIds.length > 0) {
        await prisma.propertyRentalUnit.updateMany({
          where: { 
            id: { in: rentalUnitIds },
            status: 'OCCUPIED' // Only update if currently occupied
          },
          data: { status: 'VACANT' }
        });
        console.log('Updated rental units to VACANT');
      }

      // Step 4: Delete all agreements
      await prisma.tenantAgreement.deleteMany({
        where: {
          id: { in: agreementIds }
        }
      });
      console.log('Deleted tenant agreements');
    }

    // Step 5: Finally delete the tenant
    await prisma.tenant.delete({
      where: { id }
    });

    console.log(`Successfully deleted tenant ${id}`);

    return NextResponse.json(
      { 
        message: 'Tenant deleted successfully',
        deletedAgreements: agreementIds.length,
        releasedUnits: existingTenant.agreements.filter(a => a.rentalUnitId).length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting tenant:', error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: 'Cannot delete tenant due to foreign key constraints. Please contact support if the issue persists.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Tenant not found or already deleted' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
} 
