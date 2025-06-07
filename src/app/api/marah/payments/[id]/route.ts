import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const updatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE']).optional(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED']).optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.marahPayment.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (payment.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Convert Decimal to number for JSON serialization
    const paymentWithNumbers = {
      ...payment,
      amount: Number(payment.amount),
    };

    return NextResponse.json(paymentWithNumbers);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);

    // Get the payment first to verify ownership
    const existingPayment = await prisma.marahPayment.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingPayment.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the payment
    const updatedPayment = await prisma.marahPayment.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    // Convert Decimal to number for JSON serialization
    const paymentWithNumbers = {
      ...updatedPayment,
      amount: Number(updatedPayment.amount),
    };

    return NextResponse.json(paymentWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the payment first to verify ownership
    const existingPayment = await prisma.marahPayment.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingPayment.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if payment is completed and order is active
    if (existingPayment.status === 'PAID' && existingPayment.order.status !== 'CANCELLED') {
      return NextResponse.json({ 
        error: 'Cannot delete completed payment for active order. Consider refunding instead.' 
      }, { status: 400 });
    }

    // Delete the payment
    await prisma.marahPayment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler); 