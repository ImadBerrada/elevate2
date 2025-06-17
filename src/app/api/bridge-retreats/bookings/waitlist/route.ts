import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/bookings/waitlist - Get waitlist entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const retreatId = searchParams.get('retreatId');

    // For now, we'll simulate waitlist with cancelled bookings that have special notes
    // In a real implementation, you'd have a separate Waitlist model
    const waitlistEntries = await prisma.retreatBooking.findMany({
      where: {
        status: 'CANCELLED',
        notes: { contains: 'WAITLIST:' }, // Use notes field to mark waitlist entries
        ...(retreatId && { retreatId }),
      },
      include: {
        guest: true,
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
            capacity: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // First come, first served
      take: limit,
      skip: offset,
    });

    const total = await prisma.retreatBooking.count({
      where: {
        status: 'CANCELLED',
        notes: { contains: 'WAITLIST:' },
        ...(retreatId && { retreatId }),
      },
    });

    // Get retreat availability for each waitlisted booking
    const waitlistWithAvailability = await Promise.all(
      waitlistEntries.map(async (entry) => {
        const currentBookings = await prisma.retreatBooking.count({
          where: {
            retreatId: entry.retreatId,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            OR: [
              {
                checkInDate: { lte: entry.checkOutDate },
                checkOutDate: { gte: entry.checkInDate },
              },
            ],
          },
        });

        const availableSpots = entry.retreat.capacity - currentBookings;
        const canBePromoted = availableSpots >= entry.numberOfGuests;

        return {
          ...entry,
          availableSpots,
          canBePromoted,
          waitlistPosition: waitlistEntries.findIndex(w => w.id === entry.id) + 1,
        };
      })
    );

    return NextResponse.json({
      waitlist: waitlistWithAvailability,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/bookings/waitlist - Add to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      retreatId,
      guestData,
      checkInDate,
      checkOutDate,
      guestCount,
      specialRequests,
      priority = 'NORMAL', // NORMAL, HIGH, VIP
    } = body;

    // Validate required fields
    if (!retreatId || !guestData || !checkInDate || !checkOutDate || !guestCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: retreatId },
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Create or find guest
    let guest = await prisma.retreatGuest.findFirst({
      where: { email: guestData.email },
    });

    if (!guest) {
      guest = await prisma.retreatGuest.create({
        data: guestData,
      });
    }

    // Create waitlist entry (as a cancelled booking with special notes)
    const waitlistEntry = await prisma.retreatBooking.create({
      data: {
        retreatId,
        guestId: guest.id,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        numberOfGuests: guestCount,
        specialRequests,
        totalAmount: retreat.price * guestCount,
        paymentStatus: 'PENDING',
        status: 'CANCELLED',
        notes: `WAITLIST:${priority}:${new Date().toISOString()}`, // Mark as waitlist entry
      },
      include: {
        guest: true,
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
            capacity: true,
            price: true,
          },
        },
      },
    });

    // Get waitlist position
    const waitlistPosition = await prisma.retreatBooking.count({
      where: {
        retreatId,
        status: 'CANCELLED',
        notes: { contains: 'WAITLIST:' },
        createdAt: { lte: waitlistEntry.createdAt },
      },
    });

    return NextResponse.json({
      ...waitlistEntry,
      waitlistPosition,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}

// PATCH /api/bridge-retreats/bookings/waitlist - Promote from waitlist
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bookingIds, retreatId } = body;

    if (action === 'promote') {
      if (!bookingIds || !Array.isArray(bookingIds)) {
        return NextResponse.json(
          { error: 'Booking IDs are required for promotion' },
          { status: 400 }
        );
      }

      const promotedBookings = [];
      const errors = [];

      for (const bookingId of bookingIds) {
        try {
          const booking = await prisma.retreatBooking.findUnique({
            where: { id: bookingId },
            include: { retreat: true },
          });

          if (!booking || booking.status !== 'CANCELLED' || !booking.notes?.includes('WAITLIST:')) {
            errors.push(`Booking ${bookingId} not found or not waitlisted`);
            continue;
          }

          // Check availability
          const currentBookings = await prisma.retreatBooking.aggregate({
            where: {
              retreatId: booking.retreatId,
              status: { in: ['CONFIRMED', 'COMPLETED'] },
              OR: [
                {
                  checkInDate: { lte: booking.checkOutDate },
                  checkOutDate: { gte: booking.checkInDate },
                },
              ],
            },
            _sum: { numberOfGuests: true },
          });

          const currentOccupancy = currentBookings._sum?.numberOfGuests || 0;
          const availableSpots = booking.retreat.capacity - currentOccupancy;

          if (availableSpots >= booking.numberOfGuests) {
            // Promote to confirmed
            const promotedBooking = await prisma.retreatBooking.update({
              where: { id: bookingId },
              data: { 
                status: 'CONFIRMED',
                notes: booking.notes?.replace('WAITLIST:', 'PROMOTED:') || 'PROMOTED'
              },
              include: {
                guest: true,
                retreat: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    location: true,
                    capacity: true,
                    price: true,
                  },
                },
              },
            });

            promotedBookings.push(promotedBooking);
          } else {
            errors.push(`Insufficient capacity for booking ${bookingId}`);
          }
        } catch (err) {
          errors.push(`Error promoting booking ${bookingId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return NextResponse.json({
        success: true,
        promoted: promotedBookings,
        errors,
      });
    }

    if (action === 'autoPromote' && retreatId) {
      // Auto-promote waitlisted bookings when capacity becomes available
      const retreat = await prisma.retreat.findUnique({
        where: { id: retreatId },
      });

      if (!retreat) {
        return NextResponse.json(
          { error: 'Retreat not found' },
          { status: 404 }
        );
      }

      // Get current bookings
      const currentBookings = await prisma.retreatBooking.aggregate({
        where: {
          retreatId,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: { numberOfGuests: true },
      });

      const currentOccupancy = currentBookings._sum?.numberOfGuests || 0;
      const availableSpots = retreat.capacity - currentOccupancy;

      if (availableSpots <= 0) {
        return NextResponse.json({
          success: true,
          message: 'No available spots for promotion',
          promoted: [],
        });
      }

      // Get waitlist entries in order
      const waitlistEntries = await prisma.retreatBooking.findMany({
        where: {
          retreatId,
          status: 'CANCELLED',
          notes: { contains: 'WAITLIST:' },
        },
        orderBy: { createdAt: 'asc' },
      });

      const promotedBookings = [];
      let remainingSpots = availableSpots;

      for (const entry of waitlistEntries) {
        if (remainingSpots >= entry.numberOfGuests) {
          const promotedBooking = await prisma.retreatBooking.update({
            where: { id: entry.id },
            data: { 
              status: 'CONFIRMED',
              notes: entry.notes?.replace('WAITLIST:', 'PROMOTED:') || 'PROMOTED'
            },
            include: {
              guest: true,
              retreat: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                  location: true,
                  capacity: true,
                  price: true,
                },
              },
            },
          });

          promotedBookings.push(promotedBooking);
          remainingSpots -= entry.numberOfGuests;
        }
      }

      return NextResponse.json({
        success: true,
        promoted: promotedBookings,
        message: `Promoted ${promotedBookings.length} bookings from waitlist`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing waitlist action:', error);
    return NextResponse.json(
      { error: 'Failed to process waitlist action' },
      { status: 500 }
    );
  }
}

// DELETE /api/bridge-retreats/bookings/waitlist - Remove from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.retreatBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status !== 'CANCELLED' || !booking.notes?.includes('WAITLIST:')) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    // Permanently delete the waitlist entry
    await prisma.retreatBooking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from waitlist successfully',
    });
  } catch (error) {
    console.error('Error removing from waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from waitlist' },
      { status: 500 }
    );
  }
} 