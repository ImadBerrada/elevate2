import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const AgreementUpdateSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rentAmount: z.number().optional(),
  securityDeposit: z.number().optional(),
  commissionAmount: z.number().optional(),
  paymentDueDate: z.number().min(1).max(31).optional(),
  paymentFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY']).optional(),
  utilities: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING']).optional(),
});

// GET - Get agreement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;

    const agreement = await prisma.tenantAgreement.findUnique({
      where: { id },
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
      }
    });

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agreement);

  } catch (error) {
    console.error('Error fetching agreement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agreement' },
      { status: 500 }
    );
  }
}

// PUT - Update agreement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;

    const body = await request.json();
    const validatedData = AgreementUpdateSchema.parse(body);

    // Check if agreement exists
    const existingAgreement = await prisma.tenantAgreement.findUnique({
      where: { id }
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Convert date strings to Date objects if provided
    const updateData: any = { ...validatedData };
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    const updatedAgreement = await prisma.tenantAgreement.update({
      where: { id },
      data: updateData,
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

    // Update rental unit status based on agreement status
    if (validatedData.status) {
      const unitStatus = validatedData.status === 'ACTIVE' ? 'OCCUPIED' : 'VACANT';
      await prisma.propertyRentalUnit.update({
        where: { id: existingAgreement.rentalUnitId },
        data: { status: unitStatus }
      });
    }

    return NextResponse.json(updatedAgreement);

  } catch (error) {
    console.error('Error updating agreement:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update agreement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete agreement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;

    // Check if agreement exists
    const existingAgreement = await prisma.tenantAgreement.findUnique({
      where: { id },
      include: {
        invoices: true,
        payments: true
      }
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Check if agreement has payments or invoices
    if (existingAgreement.payments.length > 0 || existingAgreement.invoices.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete agreement with existing payments or invoices. Consider terminating instead.' },
        { status: 400 }
      );
    }

    // Delete agreement
    await prisma.tenantAgreement.delete({
      where: { id }
    });

    // Update rental unit status to vacant
    await prisma.propertyRentalUnit.update({
      where: { id: existingAgreement.rentalUnitId },
      data: { status: 'VACANT' }
    });

    return NextResponse.json(
      { message: 'Agreement deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting agreement:', error);
    return NextResponse.json(
      { error: 'Failed to delete agreement' },
      { status: 500 }
    );
  }
} 