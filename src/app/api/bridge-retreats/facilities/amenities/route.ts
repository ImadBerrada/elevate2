import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const amenities = await prisma.facilityAmenity.findMany({
      where: {
        ...(category && { category: category.toUpperCase() as any }),
        ...(status && { status: status.toUpperCase() as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { coordinator: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        equipment: true,
        bookings: {
          where: {
            startTime: {
              gte: new Date()
            }
          },
          take: 5,
          orderBy: {
            startTime: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data to match frontend interface
    const transformedAmenities = amenities.map(amenity => ({
      id: amenity.id,
      name: amenity.name,
      category: amenity.category.toLowerCase(),
      status: amenity.status.toLowerCase(),
      location: `${amenity.facility.name}, ${amenity.facility.location}`,
      capacity: amenity.capacity || 0,
      currentUsage: amenity.currentUsage,
      coordinator: amenity.coordinator || '',
      operatingHours: amenity.operatingHours || '9:00 AM - 6:00 PM',
      nextMaintenance: amenity.nextMaintenance?.toISOString().split('T')[0] || '',
      equipment: amenity.equipment.map(eq => ({
        name: eq.name,
        quantity: eq.quantity,
        condition: eq.condition.toLowerCase(),
        lastService: eq.lastService?.toISOString().split('T')[0] || ''
      })),
      bookings: amenity.bookings.map(booking => ({
        id: booking.id,
        time: booking.startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: booking.duration,
        guest: booking.guestName,
        type: booking.bookingType
      })),
      rating: amenity.rating,
      issues: amenity.issueCount,
      image: amenity.image || '/api/placeholder/400/300',
      description: amenity.description || '',
      features: amenity.features
    }));

    // Calculate stats
    const totalAmenities = transformedAmenities.length;
    const available = transformedAmenities.filter(a => a.status === 'available').length;
    const occupied = transformedAmenities.filter(a => a.status === 'occupied').length;
    const maintenance = transformedAmenities.filter(a => a.status === 'maintenance').length;
    const totalCapacity = transformedAmenities.reduce((sum, a) => sum + a.capacity, 0);
    const totalUsage = transformedAmenities.reduce((sum, a) => sum + a.currentUsage, 0);
    const averageUsage = totalCapacity > 0 ? Math.round((totalUsage / totalCapacity) * 100) : 0;
    const totalEquipment = transformedAmenities.reduce((sum, a) => sum + a.equipment.length, 0);
    const totalRating = transformedAmenities.reduce((sum, a) => sum + a.rating, 0);
    const averageRating = totalAmenities > 0 ? Number((totalRating / totalAmenities).toFixed(1)) : 0;

    return NextResponse.json({
      amenities: transformedAmenities,
      stats: {
        totalAmenities,
        available,
        occupied,
        maintenance,
        averageUsage,
        totalEquipment,
        averageRating,
      }
    });
  } catch (error) {
    console.error('Error fetching facility amenities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility amenities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      name,
      category,
      capacity,
      coordinator,
      operatingHours,
      description,
      features,
      image
    } = body;

    // Validate required fields
    if (!facilityId || !name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: facilityId, name, category' },
        { status: 400 }
      );
    }

    const amenity = await prisma.facilityAmenity.create({
      data: {
        facilityId,
        name,
        category: category.toUpperCase(),
        status: 'AVAILABLE',
        capacity: capacity || null,
        currentUsage: 0,
        coordinator,
        operatingHours,
        description,
        features: features || [],
        image,
        rating: 0,
        totalReviews: 0,
        issueCount: 0
      },
      include: {
        facility: true
      }
    });

    return NextResponse.json({ amenity }, { status: 201 });
  } catch (error) {
    console.error('Error creating facility amenity:', error);
    return NextResponse.json(
      { error: 'Failed to create facility amenity' },
      { status: 500 }
    );
  }
} 