import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const UpdateInvoiceSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive').optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  taxAmount: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

// GET - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;
const invoice = await prisma.realEstateInvoice.findUnique({
      where: { id: id },
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
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Calculate days overdue
    const daysOverdue = invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date() 
      ? Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))
      : 0;

    // Convert to response format
    const invoiceResponse = {
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

    return NextResponse.json(invoiceResponse);

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateInvoiceSchema.parse(body);

    // Check if invoice exists
    const existingInvoice = await prisma.realEstateInvoice.findUnique({
      where: { id: id }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Prevent modification of paid invoices (business rule)
    if (existingInvoice.status === 'PAID' && validatedData.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Cannot modify paid invoices' },
        { status: 400 }
      );
    }

    // Calculate total amount if amount or tax changed
    const amount = validatedData.amount ?? Number(existingInvoice.amount);
    const taxAmount = validatedData.taxAmount ?? Number(existingInvoice.taxAmount || 0);
    const totalAmount = amount + taxAmount;

    const updatedInvoice = await prisma.realEstateInvoice.update({
      where: { id: id },
      data: {
        ...validatedData,
        totalAmount,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
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
      }
    });

    // Calculate days overdue
    const daysOverdue = updatedInvoice.status === 'PENDING' && new Date(updatedInvoice.dueDate) < new Date() 
      ? Math.ceil((new Date().getTime() - new Date(updatedInvoice.dueDate).getTime()) / (1000 * 3600 * 24))
      : 0;

    // Convert to response format
    const invoiceResponse = {
      id: updatedInvoice.id,
      invoiceNumber: updatedInvoice.invoiceNumber,
      type: 'RENT', // Default type since it's not in the current schema
      status: updatedInvoice.status,
      issueDate: updatedInvoice.createdAt.toISOString().split('T')[0],
      dueDate: updatedInvoice.dueDate.toISOString().split('T')[0],
      paidDate: updatedInvoice.status === 'PAID' ? updatedInvoice.updatedAt?.toISOString().split('T')[0] : null,
      description: updatedInvoice.description,
      notes: updatedInvoice.notes,
      items: [], // Will be populated when we add invoice items support
      subtotal: Number(updatedInvoice.amount),
      taxAmount: Number(updatedInvoice.taxAmount) || 0,
      totalAmount: Number(updatedInvoice.totalAmount),
      daysOverdue,
      isOverdue: daysOverdue > 0,
      createdAt: updatedInvoice.createdAt.toISOString(),
      updatedAt: updatedInvoice.updatedAt.toISOString(),
      agreement: {
        id: updatedInvoice.agreement.id,
        agreementNumber: updatedInvoice.agreement.agreementNumber,
        rentAmount: Number(updatedInvoice.agreement.rentAmount),
        securityDeposit: Number(updatedInvoice.agreement.securityDeposit) || 0,
        commissionAmount: Number(updatedInvoice.agreement.commissionAmount) || 0,
        startDate: updatedInvoice.agreement.startDate.toISOString().split('T')[0],
        endDate: updatedInvoice.agreement.endDate.toISOString().split('T')[0],
        status: updatedInvoice.agreement.status,
        tenant: {
          id: updatedInvoice.agreement.tenant.id,
          firstName: updatedInvoice.agreement.tenant.firstName,
          lastName: updatedInvoice.agreement.tenant.lastName,
          email: updatedInvoice.agreement.tenant.email,
          phone: updatedInvoice.agreement.tenant.phone
        },
        property: {
          id: updatedInvoice.agreement.property.id,
          name: updatedInvoice.agreement.property.name,
          address: updatedInvoice.agreement.property.address,
          city: updatedInvoice.agreement.property.city,
          area: updatedInvoice.agreement.property.area,
          propertyType: updatedInvoice.agreement.property.propertyType,
          owner: updatedInvoice.agreement.property.owner
        },
        rentalUnit: {
          id: updatedInvoice.agreement.rentalUnit.id,
          unitNumber: updatedInvoice.agreement.rentalUnit.unitNumber,
          unitType: updatedInvoice.agreement.rentalUnit.unitType
        }
      }
    };

    return NextResponse.json(invoiceResponse);

  } catch (error) {
    console.error('Error updating invoice:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if invoice exists and if it can be deleted
    const existingInvoice = await prisma.realEstateInvoice.findUnique({
      where: { id: id }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of paid invoices (business rule)
    if (existingInvoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      );
    }

    await prisma.realEstateInvoice.delete({
      where: { id: id }
    });

    return NextResponse.json(
      { message: 'Invoice deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
} 