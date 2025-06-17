import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/retreats/[id] - Get a specific retreat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const retreat = await prisma.retreat.findUnique({
      where: { id },
      include: {
        activities: true,
        bookings: {
          include: {
            guest: true,
          },
        },
        reviews: {
          include: {
            guest: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Calculate derived fields
    const retreatWithStats = {
      ...retreat,
      currentBookings: retreat._count.bookings,
      totalReviews: retreat._count.reviews,
      rating: retreat.reviews?.length > 0 
        ? retreat.reviews.reduce((sum, review) => sum + review.rating, 0) / retreat.reviews.length 
        : 0,
    };

    return NextResponse.json(retreatWithStats);
  } catch (error) {
    console.error('Error fetching retreat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retreat' },
      { status: 500 }
    );
  }
}

// PUT /api/bridge-retreats/retreats/[id] - Update a specific retreat
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      description,
      type,
      duration,
      capacity,
      price,
      startDate,
      endDate,
      location,
      instructor,
      amenities = [],
      requirements = [],
      activities = [],
      inclusions = [],
      exclusions = [],
      cancellationPolicy,
      specialInstructions,
      images = [],
      status,
    } = body;

    // Check if retreat exists
    const existingRetreat = await prisma.retreat.findUnique({
      where: { id },
      include: { activities: true },
    });

    if (!existingRetreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Update retreat with activities
    const retreat = await prisma.retreat.update({
      where: { id },
      data: {
        title,
        description,
        type,
        duration: duration ? parseInt(duration) : undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        price: price ? parseFloat(price) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        instructor,
        amenities,
        requirements,
        inclusions,
        exclusions,
        cancellationPolicy,
        specialInstructions,
        images,
        status,
        activities: {
          deleteMany: {},
          create: activities.map((activity: any) => ({
            name: activity.name,
            description: activity.description,
            duration: activity.duration,
            instructor: activity.instructor,
            capacity: activity.capacity,
            equipment: activity.equipment || [],
          })),
        },
      },
      include: {
        activities: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...retreat,
      currentBookings: retreat._count.bookings,
      totalReviews: retreat._count.reviews,
      rating: 0,
    });
  } catch (error) {
    console.error('Error updating retreat:', error);
    return NextResponse.json(
      { error: 'Failed to update retreat' },
      { status: 500 }
    );
  }
}

// DELETE /api/bridge-retreats/retreats/[id] - Delete a specific retreat
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if retreat exists
    const existingRetreat = await prisma.retreat.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });

    if (!existingRetreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Check if retreat has bookings
    if (existingRetreat.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete retreat with existing bookings' },
        { status: 400 }
      );
    }

    // Delete retreat (activities will be deleted due to cascade)
    await prisma.retreat.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Retreat deleted successfully' });
  } catch (error) {
    console.error('Error deleting retreat:', error);
    return NextResponse.json(
      { error: 'Failed to delete retreat' },
      { status: 500 }
    );
  }
} 