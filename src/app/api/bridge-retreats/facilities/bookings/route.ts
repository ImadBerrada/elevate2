import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facility = searchParams.get('facility');
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');
    const search = searchParams.get('search');

    const bookings = await prisma.facilityBooking.findMany({
      where: {
        ...(facility && {
          facility: {
            name: { contains: facility, mode: 'insensitive' }
          }
        }),
        ...(status && { status: status as any }),
        ...(eventType && { eventType: eventType as any }),
        ...(search && {
          OR: [
            { eventName: { contains: search, mode: 'insensitive' } },
            { organizer: { contains: search, mode: 'insensitive' } },
            { contactEmail: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Transform data to match frontend interface
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      facilityName: booking.facility.name,
      eventName: booking.eventName,
      eventType: booking.eventType.toLowerCase(),
      organizer: booking.organizer,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone || '',
      startDate: booking.startDate.toISOString().split('T')[0],
      endDate: booking.endDate.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      attendees: booking.attendees,
      status: booking.status.toLowerCase(),
      setupRequirements: booking.setupRequirements,
      catering: booking.catering,
      audioVisual: booking.audioVisual,
      parking: booking.parking,
      specialRequests: booking.specialRequests || '',
      totalCost: booking.totalCost || 0,
      coordinator: booking.coordinator || '',
      notes: booking.notes
    }));

    // Calculate stats
    const totalBookings = transformedBookings.length;
    const confirmed = transformedBookings.filter(b => b.status === 'confirmed').length;
    const pending = transformedBookings.filter(b => b.status === 'pending').length;
    const ongoing = transformedBookings.filter(b => b.status === 'ongoing' || b.status === 'setup').length;
    const totalRevenue = transformedBookings.reduce((sum, b) => sum + b.totalCost, 0);
    const totalAttendees = transformedBookings.reduce((sum, b) => sum + b.attendees, 0);
    const averageAttendees = totalBookings > 0 ? Math.round(totalAttendees / totalBookings) : 0;
    const utilizationRate = 75; // This would be calculated based on available vs booked time slots

    return NextResponse.json({
      bookings: transformedBookings,
      stats: {
        totalBookings,
        confirmed,
        pending,
        ongoing,
        totalRevenue,
        averageAttendees,
        utilizationRate,
      }
    });
  } catch (error) {
    console.error('Error fetching facility bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      eventName,
      eventType,
      organizer,
      contactEmail,
      contactPhone,
      startDate,
      endDate,
      startTime,
      endTime,
      attendees,
      setupRequirements,
      catering,
      audioVisual,
      parking,
      specialRequests,
      totalCost,
      coordinator
    } = body;

    // Validate required fields
    if (!facilityId || !eventName || !organizer || !contactEmail || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await prisma.facilityBooking.create({
      data: {
        facilityId,
        eventName,
        eventType: eventType?.toUpperCase() || 'MEETING',
        organizer,
        contactEmail,
        contactPhone,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        attendees: attendees || 1,
        setupRequirements: setupRequirements || [],
        catering: catering || false,
        audioVisual: audioVisual || false,
        parking: parking || 0,
        specialRequests,
        totalCost: totalCost || 0,
        coordinator,
        status: 'PENDING',
        notes: []
      },
      include: {
        facility: true
      }
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating facility booking:', error);
    return NextResponse.json(
      { error: 'Failed to create facility booking' },
      { status: 500 }
    );
  }
} 