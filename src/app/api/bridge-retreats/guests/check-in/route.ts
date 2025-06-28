import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/guests/check-in - Get guests checking in today
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const search = searchParams.get('search') || '';

    // Get start and end of the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Build where clause
    const where: any = {
      checkInDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['CONFIRMED', 'PENDING']
      }
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        {
          guest: {
            firstName: { contains: search, mode: 'insensitive' }
          }
        },
        {
          guest: {
            lastName: { contains: search, mode: 'insensitive' }
          }
        },
        {
          guest: {
            email: { contains: search, mode: 'insensitive' }
          }
        },
        {
          roomNumber: { contains: search, mode: 'insensitive' }
        }
      ];
    }

    // Get bookings for check-in
    const bookings = await prisma.retreatBooking.findMany({
      where,
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            dietaryRestrictions: true,
            specialRequests: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
          }
        },
        retreat: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          }
        }
      },
      orderBy: {
        checkInDate: 'asc'
      }
    });

    // Transform bookings to check-in format
    const checkInGuests = bookings.map(booking => ({
      id: booking.guest.id,
      bookingId: booking.id,
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName,
      email: booking.guest.email,
      phone: booking.guest.phone,
      profileImage: booking.guest.profileImage,
      booking: {
        id: booking.id,
        retreat: {
          title: booking.retreat.title,
          startDate: booking.retreat.startDate.toISOString(),
          endDate: booking.retreat.endDate.toISOString(),
          location: booking.retreat.location,
        },
        roomNumber: booking.roomNumber || 'TBD',
        checkInTime: booking.checkInDate.toISOString(),
        specialRequests: booking.guest.specialRequests,
        totalAmount: booking.totalAmount,
      },
      preferences: {
        dietaryRestrictions: booking.guest.dietaryRestrictions,
      },
      emergencyContact: {
        name: booking.guest.emergencyContactName,
        phone: booking.guest.emergencyContactPhone,
      },
      status: booking.actualCheckInTime ? 'completed' : (booking.status === 'CONFIRMED' ? 'pending' : 'in-progress'),
      arrivalTime: booking.actualCheckInTime?.toISOString(),
    }));

    return NextResponse.json({ guests: checkInGuests });

  } catch (error) {
    console.error('Error fetching check-in guests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in guests' },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/guests/check-in - Process guest check-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, checkInData, staffMember } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get the booking
    const booking = await prisma.retreatBooking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        retreat: true,
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.actualCheckInTime) {
      return NextResponse.json(
        { error: 'Guest has already checked in' },
        { status: 400 }
      );
    }

    // Update booking with check-in details
    const updatedBooking = await prisma.retreatBooking.update({
      where: { id: bookingId },
      data: {
        actualCheckInTime: checkInData.actualCheckInTime ? new Date(checkInData.actualCheckInTime) : new Date(),
        checkInStaff: staffMember || 'System',
        roomNumber: checkInData.roomNumber || booking.roomNumber,
        notes: checkInData.additionalNotes 
          ? `${booking.notes || ''}\n\nCheck-in Notes: ${checkInData.additionalNotes}`.trim()
          : booking.notes,
      }
    });

    // Create check-in communication record
    await prisma.retreatGuestCommunication.create({
      data: {
        guestId: booking.guestId,
        type: 'BOOKING_RELATED',
        subject: 'Guest Check-in Completed',
        message: `Guest checked in successfully for ${booking.retreat.title}. Room: ${checkInData.roomNumber || booking.roomNumber}`,
        direction: 'OUTBOUND',
        channel: 'in-person',
        staffMember: staffMember || 'System',
        bookingId: bookingId,
      }
    });

    // Award loyalty points for check-in
    if (booking.guest.loyaltyProgramActive) {
      const pointsToAward = Math.floor(booking.totalAmount / 10); // 1 point per $10 spent

      await prisma.retreatLoyaltyTransaction.create({
        data: {
          guestId: booking.guestId,
          type: 'EARNED',
          points: pointsToAward,
          description: `Stay completed - ${booking.retreat.title}`,
          bookingId: bookingId,
        }
      });

      // Update guest's loyalty points
      await prisma.retreatGuest.update({
        where: { id: booking.guestId },
        data: {
          loyaltyPoints: {
            increment: pointsToAward
          }
        }
      });
    }

    return NextResponse.json({ 
      message: 'Check-in completed successfully',
      booking: updatedBooking 
    });

  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
} 