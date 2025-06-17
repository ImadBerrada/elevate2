import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/retreats - Get all retreats with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const instructor = searchParams.get('instructor');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (instructor) {
      where.instructor = { contains: instructor, mode: 'insensitive' };
    }

    const [retreats, total] = await Promise.all([
      prisma.retreat.findMany({
        where,
        include: {
          activities: true,
          bookings: {
            include: {
              guest: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.retreat.count({ where }),
    ]);

    // Calculate derived fields
    const retreatsWithStats = retreats.map(retreat => ({
      ...retreat,
      currentBookings: retreat._count.bookings,
      totalReviews: retreat._count.reviews,
      rating: retreat.reviews?.length > 0 
        ? retreat.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / retreat.reviews.length 
        : 0,
    }));

    return NextResponse.json({
      retreats: retreatsWithStats,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching retreats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retreats' },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/retreats - Create a new retreat
export async function POST(request: NextRequest) {
  try {
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
      status = 'draft',
    } = body;

    // Validate required fields
    if (!title || !description || !type || !duration || !capacity || !price || !startDate || !endDate || !location || !instructor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create retreat with activities
    const retreat = await prisma.retreat.create({
      data: {
        title,
        description,
        type,
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        price: parseFloat(price),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
    console.error('Error creating retreat:', error);
    return NextResponse.json(
      { error: 'Failed to create retreat' },
      { status: 500 }
    );
  }
} 