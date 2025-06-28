import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// PUT /api/bridge-retreats/bookings/[id]/payment - Update payment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paidAmount, paymentMethod, paymentStatus, paymentReference } = body;

    // Get the current booking
    const currentBooking = await prisma.retreatBooking.findUnique({
      where: { id },
      include: {
        retreat: true,
        guest: true
      }
    });

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Calculate the payment difference
    const previousPaidAmount = Number(currentBooking.paidAmount || 0);
    const newPaidAmount = Number(paidAmount || 0);
    const paymentDifference = newPaidAmount - previousPaidAmount;

    // Update the booking
    const updatedBooking = await prisma.retreatBooking.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        paymentMethod: paymentMethod || currentBooking.paymentMethod,
        paymentStatus: paymentStatus || (newPaidAmount >= currentBooking.totalAmount ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING'),
        status: paymentStatus === 'PAID' ? 'CONFIRMED' : currentBooking.status
      },
      include: {
        guest: true,
        retreat: true
      }
    });

    // Update or create financial transaction if there's a payment difference
    if (paymentDifference !== 0) {
      try {
        // Find existing financial transaction for this booking
        const existingTransaction = await prisma.retreatFinancialTransaction.findFirst({
          where: {
            bookingId: id,
            type: 'INCOME',
            category: 'RETREAT_BOOKING'
          }
        });

        if (existingTransaction) {
          // Update existing transaction
          await prisma.retreatFinancialTransaction.update({
            where: { id: existingTransaction.id },
            data: {
              amount: newPaidAmount,
              status: paymentStatus === 'PAID' ? 'PROCESSED' : 'PENDING',
              description: `Booking payment for ${currentBooking.retreat.title} - ${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`,
              reference: paymentReference || `BOOK-${id}`,
            }
          });
        } else if (newPaidAmount > 0) {
          // Create new transaction if payment is made
          await prisma.retreatFinancialTransaction.create({
            data: {
              type: 'INCOME',
              category: 'RETREAT_BOOKING',
              amount: newPaidAmount,
              description: `Booking payment for ${currentBooking.retreat.title} - ${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`,
              bookingId: id,
              retreatId: currentBooking.retreatId,
              status: paymentStatus === 'PAID' ? 'PROCESSED' : 'PENDING',
              reference: paymentReference || `BOOK-${id}`,
            }
          });
        }
      } catch (transactionError) {
        console.error('Failed to update financial transaction:', transactionError);
        // Don't fail the payment update if transaction update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
      booking: updatedBooking,
      paymentDifference
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// GET /api/bridge-retreats/bookings/[id]/payment - Get payment history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get booking with payment info
    const booking = await prisma.retreatBooking.findUnique({
      where: { id },
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get related financial transactions
    const transactions = await prisma.retreatFinancialTransaction.findMany({
      where: {
        bookingId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      booking,
      transactions,
      paymentSummary: {
        totalAmount: Number(booking.totalAmount),
        paidAmount: Number(booking.paidAmount || 0),
        remainingAmount: Number(booking.totalAmount) - Number(booking.paidAmount || 0),
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Error fetching payment info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment information' },
      { status: 500 }
    );
  }
}