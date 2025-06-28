import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/guests/check-out - Get guests checking out today
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
      checkOutDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: 'CONFIRMED',
      actualCheckInTime: {
        not: null, // Only guests who have checked in
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

    // Get bookings for check-out
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
        checkOutDate: 'asc'
      }
    });

    // Transform bookings to check-out format
    const checkOutGuests = bookings.map(booking => {
      const outstandingBalance = booking.totalAmount - booking.paidAmount;
      
      return {
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
          checkOutTime: booking.checkOutDate.toISOString(),
          totalAmount: booking.totalAmount,
          paidAmount: booking.paidAmount,
          outstandingBalance,
        },
        status: booking.actualCheckOutTime ? 'completed' : 'pending',
        checkInDate: booking.actualCheckInTime?.toISOString(),
        actualCheckOutTime: booking.actualCheckOutTime?.toISOString(),
      };
    });

    return NextResponse.json({ guests: checkOutGuests });

  } catch (error) {
    console.error('Error fetching check-out guests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-out guests' },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/guests/check-out - Process guest check-out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, checkOutData, feedback, staffMember } = body;

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

    if (booking.actualCheckOutTime) {
      return NextResponse.json(
        { error: 'Guest has already checked out' },
        { status: 400 }
      );
    }

    if (!booking.actualCheckInTime) {
      return NextResponse.json(
        { error: 'Guest must check in before checking out' },
        { status: 400 }
      );
    }

    // Calculate final amount with additional charges
    const additionalCharges = (checkOutData.additionalCharges || 0) + (checkOutData.damageCharges || 0);
    const finalAmount = booking.totalAmount + additionalCharges;

    // Update booking with check-out details
    const updatedBooking = await prisma.retreatBooking.update({
      where: { id: bookingId },
      data: {
        actualCheckOutTime: checkOutData.actualCheckOutTime ? new Date(checkOutData.actualCheckOutTime) : new Date(),
        checkOutStaff: staffMember || 'System',
        totalAmount: finalAmount,
        paidAmount: checkOutData.paymentProcessed ? finalAmount : booking.paidAmount,
        paymentStatus: checkOutData.paymentProcessed ? 'PAID' : booking.paymentStatus,
        status: 'COMPLETED',
        notes: checkOutData.additionalNotes 
          ? `${booking.notes || ''}\n\nCheck-out Notes: ${checkOutData.additionalNotes}`.trim()
          : booking.notes,
      }
    });

    // Create check-out communication record
    await prisma.retreatGuestCommunication.create({
      data: {
        guestId: booking.guestId,
        type: 'BOOKING_RELATED',
        subject: 'Guest Check-out Completed',
        message: `Guest checked out successfully from ${booking.retreat.title}. Final amount: $${finalAmount}`,
        direction: 'OUTBOUND',
        channel: 'in-person',
        staffMember: staffMember || 'System',
        bookingId: bookingId,
      }
    });

    // Create review if feedback was provided
    if (feedback && feedback.overallRating > 0) {
      await prisma.retreatReview.create({
        data: {
          retreatId: booking.retreatId,
          guestId: booking.guestId,
          rating: feedback.overallRating,
          title: `Review for ${booking.retreat.title}`,
          comment: feedback.comments || '',
          serviceRating: feedback.serviceRating || null,
          facilitiesRating: feedback.facilitiesRating || null,
          foodRating: feedback.foodRating || null,
          valueRating: Math.round((feedback.overallRating + (feedback.serviceRating || 0) + (feedback.facilitiesRating || 0) + (feedback.foodRating || 0)) / 4),
          wouldRecommend: feedback.wouldRecommend || false,
          highlights: [], // Could be extracted from comments in the future
          issues: [], // Could be extracted from comments in the future
        }
      });

      // Award bonus points for leaving a review
      if (booking.guest.loyaltyProgramActive && feedback.overallRating >= 4) {
        await prisma.retreatLoyaltyTransaction.create({
          data: {
            guestId: booking.guestId,
            type: 'EARNED',
            points: 50,
            description: 'Review bonus - Thank you for your feedback!',
            bookingId: bookingId,
          }
        });

        // Update guest's loyalty points
        await prisma.retreatGuest.update({
          where: { id: booking.guestId },
          data: {
            loyaltyPoints: {
              increment: 50
            }
          }
        });
      }
    }

    // Update loyalty tier if applicable
    if (booking.guest.loyaltyProgramActive) {
      const updatedGuest = await prisma.retreatGuest.findUnique({
        where: { id: booking.guestId },
        select: { loyaltyPoints: true, loyaltyTier: true }
      });

      if (updatedGuest) {
        let newTier = updatedGuest.loyaltyTier;
        const points = updatedGuest.loyaltyPoints;

        if (points >= 5000 && newTier !== 'PLATINUM') {
          newTier = 'PLATINUM';
        } else if (points >= 2500 && newTier === 'BRONZE') {
          newTier = 'GOLD';
        } else if (points >= 1000 && newTier === 'BRONZE') {
          newTier = 'SILVER';
        }

        if (newTier !== updatedGuest.loyaltyTier) {
          await prisma.retreatGuest.update({
            where: { id: booking.guestId },
            data: { loyaltyTier: newTier }
          });

          // Create communication about tier upgrade
          await prisma.retreatGuestCommunication.create({
            data: {
              guestId: booking.guestId,
              type: 'MARKETING',
              subject: `Congratulations! You've been upgraded to ${newTier} tier`,
              message: `Thank you for your loyalty! You've been upgraded to ${newTier} tier with ${points} points.`,
              direction: 'OUTBOUND',
              channel: 'email',
              staffMember: 'System',
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      message: 'Check-out completed successfully',
      booking: updatedBooking,
      finalAmount,
    });

  } catch (error) {
    console.error('Error processing check-out:', error);
    return NextResponse.json(
      { error: 'Failed to process check-out' },
      { status: 500 }
    );
  }
} 