import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const InvoiceSchema = z.object({
  agreementId: z.string().min(1, 'Agreement is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
  taxAmount: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).default('PENDING'),
});

// Generate invoice number
const generateInvoiceNumber = async () => {
  const count = await prisma.realEstateInvoice.count();
  return `INV-${(count + 1).toString().padStart(6, '0')}`;
};

// GET - List invoices with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const agreementId = searchParams.get('agreementId') || '';
    const tenantId = searchParams.get('tenantId') || '';
    const propertyId = searchParams.get('propertyId') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (agreementId) where.agreementId = agreementId;
    if (status && status !== 'all') where.status = status.toUpperCase();
    
    if (tenantId) {
      where.agreement = {
        tenantId: tenantId
      };
    } else if (propertyId) {
      where.agreement = {
        propertyId: propertyId
      };
    }
    
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { agreement: {
          tenant: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }},
        { agreement: {
          property: {
            name: { contains: search, mode: 'insensitive' }
          }
        }}
      ];
    }
    
    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [invoices, total] = await Promise.all([
      prisma.realEstateInvoice.findMany({
        where,
        include: {
          agreement: {
            include: {
              tenant: true,
              property: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  area: true,
                  propertyType: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  owner: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true
                    }
                  }
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
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.realEstateInvoice.count({ where }),
    ]);

    // Convert Decimal to number and add calculated fields
    const invoicesWithNumbers = invoices.map(invoice => {
      const daysOverdue = invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date() 
        ? Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))
        : 0;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        type: 'RENT', // Default type since it's not in the current schema
        status: invoice.status,
        issueDate: invoice.createdAt.toISOString().split('T')[0],
        dueDate: invoice.dueDate.toISOString().split('T')[0],
        paidDate: invoice.status === 'PAID' ? invoice.updatedAt?.toISOString().split('T')[0] : null,
        description: invoice.description,
        notes: invoice.notes,
        items: [], // Will be populated when we add invoice items support
        subtotal: Number(invoice.amount),
        taxAmount: Number(invoice.taxAmount) || 0,
        totalAmount: Number(invoice.totalAmount),
        daysOverdue,
        isOverdue: daysOverdue > 0,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        agreement: {
          id: invoice.agreement.id,
          agreementNumber: invoice.agreement.agreementNumber,
          rentAmount: Number(invoice.agreement.rentAmount),
          securityDeposit: Number(invoice.agreement.securityDeposit) || 0,
          commissionAmount: Number(invoice.agreement.commissionAmount) || 0,
          startDate: invoice.agreement.startDate.toISOString().split('T')[0],
          endDate: invoice.agreement.endDate.toISOString().split('T')[0],
          status: invoice.agreement.status,
          tenant: {
            id: invoice.agreement.tenant.id,
            firstName: invoice.agreement.tenant.firstName,
            lastName: invoice.agreement.tenant.lastName,
            email: invoice.agreement.tenant.email,
            phone: invoice.agreement.tenant.phone
          },
          property: {
            id: invoice.agreement.property.id,
            name: invoice.agreement.property.name,
            address: invoice.agreement.property.address,
            city: invoice.agreement.property.city,
            area: invoice.agreement.property.area,
            propertyType: invoice.agreement.property.propertyType,
            owner: invoice.agreement.property.owner
          },
          rentalUnit: {
            id: invoice.agreement.rentalUnit.id,
            unitNumber: invoice.agreement.rentalUnit.unitNumber,
            unitType: invoice.agreement.rentalUnit.unitType
          }
        }
      };
    });

    return NextResponse.json({
      invoices: invoicesWithNumbers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = InvoiceSchema.parse(body);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate total amount (amount + tax)
    const taxAmount = validatedData.taxAmount || 0;
    const totalAmount = validatedData.amount + taxAmount;

    // Convert date string to Date object
    const invoiceData = {
      ...validatedData,
      invoiceNumber,
      taxAmount,
      totalAmount,
      dueDate: new Date(validatedData.dueDate),
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

    const invoice = await prisma.realEstateInvoice.create({
      data: invoiceData,
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
        }
      },
    });

    // Convert Decimal to number for JSON serialization
    const invoiceWithNumbers = {
      ...invoice,
      amount: Number(invoice.amount),
      taxAmount: Number(invoice.taxAmount) || 0,
      totalAmount: Number(invoice.totalAmount),
      agreement: {
        ...invoice.agreement,
        rentAmount: Number(invoice.agreement.rentAmount),
        securityDeposit: Number(invoice.agreement.securityDeposit) || 0,
        commissionAmount: Number(invoice.agreement.commissionAmount) || 0,
      }
    };

    return NextResponse.json(invoiceWithNumbers, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 