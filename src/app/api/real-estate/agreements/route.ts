import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const AgreementSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  rentalUnitId: z.string().min(1, 'Rental unit is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  rentAmount: z.number().min(0, 'Rent amount must be positive'),
  securityDeposit: z.number().optional(),
  commissionAmount: z.number().optional(),
  paymentDueDate: z.number().min(1).max(31).default(1),
  paymentFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY']).default('MONTHLY'),
  utilities: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING']).default('PENDING'),
});

// Generate agreement number
const generateAgreementNumber = async () => {
  const count = await prisma.tenantAgreement.count();
  return `AGT-${(count + 1).toString().padStart(6, '0')}`;
};

// GET - List agreements with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const propertyId = searchParams.get('propertyId') || '';
    const tenantId = searchParams.get('tenantId') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (propertyId) where.propertyId = propertyId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const [agreements, total] = await Promise.all([
      prisma.tenantAgreement.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          rentalUnit: {
            include: {
              unitType: true
            }
          },
          tenant: true,
          invoices: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              dueDate: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              status: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenantAgreement.count({ where }),
    ]);

    // Enrich with calculations
    const enrichedAgreements = agreements.map(agreement => {
      const totalPaid = agreement.payments
        .filter(payment => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + payment.amount.toNumber(), 0);
      
      const pendingInvoices = agreement.invoices
        .filter(invoice => invoice.status === 'PENDING').length;
      
      const overdueInvoices = agreement.invoices
        .filter(invoice => invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date()).length;

      return {
        ...agreement,
        rentAmount: agreement.rentAmount.toNumber(),
        securityDeposit: agreement.securityDeposit?.toNumber() || 0,
        commissionAmount: agreement.commissionAmount?.toNumber() || 0,
        totalPaid,
        pendingInvoices,
        overdueInvoices,
        isActive: agreement.status === 'ACTIVE',
        daysUntilExpiry: Math.ceil((new Date(agreement.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
      };
    });

    return NextResponse.json({
      agreements: enrichedAgreements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agreements' },
      { status: 500 }
    );
  }
}

// POST - Create new agreement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = AgreementSchema.parse(body);

    // Generate agreement number
    const agreementNumber = await generateAgreementNumber();

    // Convert date strings to Date objects
    const agreementData = {
      ...validatedData,
      agreementNumber,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
    };

    // Check for conflicting agreements
    const existingAgreement = await prisma.tenantAgreement.findFirst({
      where: {
        rentalUnitId: validatedData.rentalUnitId,
        status: 'ACTIVE',
      }
    });

    if (existingAgreement) {
      return NextResponse.json(
        { error: 'This rental unit already has an active agreement' },
        { status: 400 }
      );
    }

    const agreement = await prisma.tenantAgreement.create({
      data: agreementData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        rentalUnit: {
          include: {
            unitType: true
          }
        },
        tenant: true,
      },
    });

    // Update rental unit status to occupied if agreement is active
    if (validatedData.status === 'ACTIVE') {
      await prisma.propertyRentalUnit.update({
        where: { id: validatedData.rentalUnitId },
        data: { status: 'OCCUPIED' }
      });
    }

    return NextResponse.json(agreement, { status: 201 });

  } catch (error) {
    console.error('Error creating agreement:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create agreement' },
      { status: 500 }
    );
  }
} 