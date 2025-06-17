import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const TenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
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
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).default('ACTIVE'),
  // Property assignment fields
  propertyId: z.string().optional(),
  rentalUnitId: z.string().optional(),
});

// GET - List all tenants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { occupation: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) where.status = status;

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    // Calculate additional metrics for each tenant
    const enrichedTenants = await Promise.all(
      tenants.map(async (tenant) => {
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

        return {
          ...tenant,
          currentProperty: activeAgreement?.property,
          currentUnit: activeAgreement?.rentalUnit,
          currentRent: activeAgreement?.rentAmount ? (
            typeof activeAgreement.rentAmount === 'object' && activeAgreement.rentAmount !== null && 'toNumber' in activeAgreement.rentAmount
              ? (activeAgreement.rentAmount as any).toNumber()
              : Number(activeAgreement.rentAmount)
          ) : 0,
          totalPayments: totalPayments._sum.amount?.toNumber() || 0,
          outstandingInvoices,
        };
      })
    );

    return NextResponse.json({
      tenants: enrichedTenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

// POST - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received tenant creation request:', JSON.stringify(body, null, 2));
    
    const validatedData = TenantSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Create tenant first
    const tenant = await prisma.tenant.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        alternatePhone: validatedData.alternatePhone,
        nationality: validatedData.nationality,
        passportNumber: validatedData.passportNumber,
        emiratesId: validatedData.emiratesId,
        occupation: validatedData.occupation,
        company: validatedData.company,
        monthlyIncome: validatedData.monthlyIncome,
        notes: validatedData.notes,
        status: validatedData.status,
      },
      include: {
        agreements: true,
        _count: {
          select: {
            agreements: true
          }
        }
      },
    });

    console.log('Created tenant:', tenant.id);

    // If property and rental unit are provided, create an agreement
    if (validatedData.propertyId && validatedData.propertyId !== 'none' && 
        validatedData.rentalUnitId && validatedData.rentalUnitId !== 'none') {
      try {
        console.log('Creating agreement for property:', validatedData.propertyId, 'unit:', validatedData.rentalUnitId);
        
        // Get rental unit details to get rent amount
        const rentalUnit = await prisma.propertyRentalUnit.findUnique({
          where: { id: validatedData.rentalUnitId },
          include: { property: true }
        });

        if (rentalUnit) {
          console.log('Found rental unit:', rentalUnit.unitNumber, 'rent:', rentalUnit.rentAmount);
          
          // Create lease agreement
          const agreement = await prisma.tenantAgreement.create({
            data: {
              tenantId: tenant.id,
              propertyId: validatedData.propertyId,
              rentalUnitId: validatedData.rentalUnitId,
              rentAmount: rentalUnit.rentAmount,
              securityDeposit: rentalUnit.securityDeposit || 0,
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year lease
              status: 'ACTIVE',
              agreementNumber: `AGR-${Date.now()}`,
              paymentFrequency: 'MONTHLY'
            }
          });

          console.log('Created agreement:', agreement.id);

          // Update rental unit status to OCCUPIED
          await prisma.propertyRentalUnit.update({
            where: { id: validatedData.rentalUnitId },
            data: { status: 'OCCUPIED' }
          });

          console.log('Updated rental unit status to OCCUPIED');
        } else {
          console.error('Rental unit not found:', validatedData.rentalUnitId);
        }
      } catch (agreementError) {
        console.error('Error creating agreement:', agreementError);
        // Don't fail the tenant creation if agreement creation fails
      }
    } else {
      console.log('No property/unit assignment - skipping agreement creation');
    }

    // Fetch the updated tenant with all relations
    const enrichedTenant = await prisma.tenant.findUnique({
      where: { id: tenant.id },
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

    console.log('Returning tenant with agreements:', enrichedTenant?.agreements?.length || 0);
    return NextResponse.json(enrichedTenant, { status: 201 });

  } catch (error) {
    console.error('Error creating tenant:', error);
    
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
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
} 