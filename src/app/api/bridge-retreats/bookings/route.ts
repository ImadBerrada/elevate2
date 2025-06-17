import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/bookings - Get all bookings with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get('status');
    const guestName = searchParams.get('guestName');
    const retreatId = searchParams.get('retreatId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (retreatId) {
      where.retreatId = retreatId;
    }
    
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      where.checkInDate = {};
      if (startDate) where.checkInDate.gte = new Date(startDate);
      if (endDate) where.checkInDate.lte = new Date(endDate);
    }
    
    if (guestName) {
      where.guest = {
        OR: [
          { firstName: { contains: guestName, mode: 'insensitive' } },
          { lastName: { contains: guestName, mode: 'insensitive' } },
          { email: { contains: guestName, mode: 'insensitive' } },
        ],
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.retreatBooking.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.retreatBooking.count({ where }),
    ]);

    // Calculate summary statistics
    const stats = await prisma.retreatBooking.aggregate({
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const statusCounts = await prisma.retreatBooking.groupBy({
      by: ['status'],
      _count: { status: true },
      where,
    });

    const paymentStatusCounts = await prisma.retreatBooking.groupBy({
      by: ['paymentStatus'],
      _count: { paymentStatus: true },
      where,
    });

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalBookings: stats._count.id,
        totalRevenue: stats._sum.totalAmount || 0,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        paymentStatusCounts: paymentStatusCounts.reduce((acc, item) => {
          acc[item.paymentStatus] = item._count.paymentStatus;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/bookings - Create new booking
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
      totalAmount,
      paymentStatus = 'PENDING',
      status = 'PENDING',
    } = body;

    // Validate required fields
    if (!retreatId || !guestData || !checkInDate || !checkOutDate || !guestCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check retreat availability
    const retreat = await prisma.retreat.findUnique({
      where: { id: retreatId },
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Check current bookings for capacity
    const currentBookings = await prisma.retreatBooking.aggregate({
      where: {
        retreatId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        OR: [
          {
            checkInDate: { lte: new Date(checkOutDate) },
            checkOutDate: { gte: new Date(checkInDate) },
          },
        ],
      },
      _sum: { numberOfGuests: true },
    });

    const currentOccupancy = currentBookings._sum?.numberOfGuests || 0;
    if (currentOccupancy + guestCount > retreat.capacity) {
      return NextResponse.json(
        { error: 'Insufficient capacity for the requested dates' },
        { status: 400 }
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

    // Create booking
    const booking = await prisma.retreatBooking.create({
      data: {
        retreatId,
        guestId: guest.id,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        numberOfGuests: guestCount,
        specialRequests,
        totalAmount: totalAmount || retreat.price * guestCount,
        paymentStatus,
        status,
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

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH /api/bridge-retreats/bookings - Bulk actions
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bookingIds, data } = body;

    if (!action || !bookingIds || !Array.isArray(bookingIds)) {
      return NextResponse.json(
        { error: 'Invalid bulk action request' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'confirm':
        result = await prisma.retreatBooking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: 'CONFIRMED' },
        });
        break;

      case 'cancel':
        result = await prisma.retreatBooking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: 'CANCELLED' },
        });
        break;

      case 'updatePaymentStatus':
        if (!data?.paymentStatus) {
          return NextResponse.json(
            { error: 'Payment status is required' },
            { status: 400 }
          );
        }
        result = await prisma.retreatBooking.updateMany({
          where: { id: { in: bookingIds } },
          data: { paymentStatus: data.paymentStatus },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
} 