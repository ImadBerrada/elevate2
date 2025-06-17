import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const PaymentSchema = z.object({
  agreementId: z.string().min(1, 'Agreement is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  receiptNumber: z.string().optional(),
  status: z.enum(['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED']).default('COMPLETED'),
});

// Generate receipt number
const generateReceiptNumber = async () => {
  const count = await prisma.tenantPayment.count();
  return `RCP-${(count + 1).toString().padStart(6, '0')}`;
};

// GET - List payments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const agreementId = searchParams.get('agreementId') || '';
    const tenantId = searchParams.get('tenantId') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (agreementId) where.agreementId = agreementId;
    if (status) where.status = status;
    
    if (tenantId) {
      where.agreement = {
        tenantId: tenantId
      };
    }
    
    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [payments, total] = await Promise.all([
      prisma.tenantPayment.findMany({
        where,
        include: {
          agreement: {
            include: {
              tenant: true,
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
            }
          },
          paymentMethod: true
        },
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.tenantPayment.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const paymentsWithNumbers = payments.map(payment => ({
      ...payment,
      amount: payment.amount.toNumber(),
      agreement: {
        ...payment.agreement,
        rentAmount: payment.agreement.rentAmount.toNumber(),
        securityDeposit: payment.agreement.securityDeposit?.toNumber() || 0,
        commissionAmount: payment.agreement.commissionAmount?.toNumber() || 0,
      }
    }));

    return NextResponse.json({
      payments: paymentsWithNumbers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PaymentSchema.parse(body);

    // Generate receipt number if not provided
    const receiptNumber = validatedData.receiptNumber || await generateReceiptNumber();

    // Convert date string to Date object
    const paymentData = {
      ...validatedData,
      receiptNumber,
      paymentDate: new Date(validatedData.paymentDate),
    };

    // Check if agreement exists
    const agreement = await prisma.tenantAgreement.findUnique({
      where: { id: validatedData.agreementId },
      include: {
        tenant: true,
        property: { select: { name: true } },
        rentalUnit: { select: { unitNumber: true } }
      }
    });

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    const payment = await prisma.tenantPayment.create({
      data: paymentData,
      include: {
        agreement: {
          include: {
            tenant: true,
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
          }
        },
        paymentMethod: true
      },
    });

    // Convert Decimal to number for JSON serialization
    const paymentWithNumbers = {
      ...payment,
      amount: payment.amount.toNumber(),
      agreement: {
        ...payment.agreement,
        rentAmount: payment.agreement.rentAmount.toNumber(),
        securityDeposit: payment.agreement.securityDeposit?.toNumber() || 0,
        commissionAmount: payment.agreement.commissionAmount?.toNumber() || 0,
      }
    };

    return NextResponse.json(paymentWithNumbers, { status: 201 });

  } catch (error) {
    console.error('Error creating payment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 