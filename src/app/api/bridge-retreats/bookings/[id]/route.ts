import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.retreatBooking.findUnique({
      where: { id },
      include: {
        guest: true,
        retreat: {
          include: {
            activities: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get payment history (if implemented)
    // const paymentHistory = await prisma.payment.findMany({
    //   where: { bookingId: params.id },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      ...booking,
      // paymentHistory,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bridge-retreats/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      checkInDate,
      checkOutDate,
      guestCount,
      specialRequests,
      totalAmount,
      paymentStatus,
      status,
      guestData,
    } = body;

    // Check if booking exists
    const existingBooking = await prisma.retreatBooking.findUnique({
      where: { id },
      include: { retreat: true, guest: true },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If dates are being changed, check availability
    if (checkInDate || checkOutDate || guestCount) {
      const newCheckIn = checkInDate ? new Date(checkInDate) : existingBooking.checkInDate;
      const newCheckOut = checkOutDate ? new Date(checkOutDate) : existingBooking.checkOutDate;
      const newGuestCount = guestCount || existingBooking.numberOfGuests;

      // Check retreat capacity (excluding current booking)
      const conflictingBookings = await prisma.retreatBooking.count({
        where: {
          retreatId: existingBooking.retreatId,
          id: { not: id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          OR: [
            {
              checkInDate: { lte: newCheckOut },
              checkOutDate: { gte: newCheckIn },
            },
          ],
        },
      });

      const totalBookedGuests = await prisma.retreatBooking.aggregate({
        where: {
          retreatId: existingBooking.retreatId,
          id: { not: id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          OR: [
            {
              checkInDate: { lte: newCheckOut },
              checkOutDate: { gte: newCheckIn },
            },
          ],
        },
        _sum: { numberOfGuests: true },
      });

      const currentOccupancy = totalBookedGuests._sum?.numberOfGuests || 0;
      if (currentOccupancy + newGuestCount > existingBooking.retreat.capacity) {
        return NextResponse.json(
          { error: 'Insufficient capacity for the requested changes' },
          { status: 400 }
        );
      }
    }

    // Update guest information if provided
    if (guestData) {
      await prisma.retreatGuest.update({
        where: { id: existingBooking.guestId },
        data: guestData,
      });
    }

    // Update booking
    const updatedBooking = await prisma.retreatBooking.update({
      where: { id },
      data: {
        ...(checkInDate && { checkInDate: new Date(checkInDate) }),
        ...(checkOutDate && { checkOutDate: new Date(checkOutDate) }),
        ...(guestCount && { numberOfGuests: guestCount }),
        ...(specialRequests !== undefined && { specialRequests }),
        ...(totalAmount && { totalAmount }),
        ...(paymentStatus && { paymentStatus }),
        ...(status && { status }),
      },
      include: {
        guest: true,
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
            instructor: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bridge-retreats/bookings/[id] - Cancel/Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'cancel'; // 'cancel' or 'delete'

    const booking = await prisma.retreatBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (action === 'delete') {
      // Permanently delete booking
      await prisma.retreatBooking.delete({
        where: { id },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Booking deleted permanently' 
      });
    } else {
      // Cancel booking (soft delete)
      const cancelledBooking = await prisma.retreatBooking.update({
        where: { id },
        data: { 
          status: 'CANCELLED',
          // Add cancellation timestamp if you have that field
        },
        include: {
          guest: true,
          retreat: {
            select: {
              id: true,
              title: true,
              type: true,
              location: true,
              instructor: true,
              price: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: cancelledBooking,
      });
    }
  } catch (error) {
    console.error('Error cancelling/deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel/delete booking' },
      { status: 500 }
    );
  }
} 
 
 
 