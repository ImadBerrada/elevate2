import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/retreats - Get all retreats with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const retreats = await prisma.retreat.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        activities: {
          select: {
            name: true,
            description: true,
            duration: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            numberOfGuests: true,
            totalAmount: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics for each retreat
    const retreatsWithStats = retreats.map(retreat => {
      const totalBookings = retreat.bookings.length;
      const confirmedBookings = retreat.bookings.filter(b => b.status === 'CONFIRMED');
      const completedBookings = retreat.bookings.filter(b => b.status === 'COMPLETED');
      const totalGuests = retreat.bookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const averageRating = retreat.reviews.length > 0 
        ? retreat.reviews.reduce((sum, r) => sum + r.rating, 0) / retreat.reviews.length 
        : 0;

      return {
        ...retreat,
        stats: {
          totalBookings,
          confirmedBookings: confirmedBookings.length,
          completedBookings: completedBookings.length,
          totalGuests,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10,
          occupancyRate: retreat.capacity > 0 ? Math.round((totalGuests / retreat.capacity) * 100) : 0
        }
      };
    });

    return NextResponse.json({ retreats: retreatsWithStats });
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
    console.log('=== RETREAT CREATION API DEBUG ===');
    console.log('Received body:', JSON.stringify(body, null, 2));
    
    const {
      title,
      description,
      type,
      customTypeName,
      status,
      duration,
      startDate,
      endDate,
      location,
      facilityId,
      capacity,
      price,
      instructor,
      amenities,
      inclusions,
      requirements,
      cancellationPolicy,
      images,
      activities,
      // Property-like fields
      totalRooms,
      occupiedRooms,
      occupancyRate,
      expectedRevenue,
      expectedExpenses,
      netIncome,
      facilitiesIncluded,
      roomTypes,
      seasonalPricing,
      depositRequired,
      refundPolicy,
      minimumStay,
      maximumStay,
      checkInTime,
      checkOutTime,
      ageRestrictions,
      healthRequirements,
      emergencyContact,
      emergencyPhone,
      insuranceCoverage,
      certifications,
      staffCount,
      languages,
      specialInstructions
    } = body;

    // Validate required fields
    if (!title || !description || !location || !instructor || !startDate || !endDate) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: title, description, location, instructor, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        console.log('Validation failed: End date must be after start date');
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Handle custom types and type mapping
    const typeMapping: { [key: string]: string } = {
      'wellness': 'WELLNESS',
      'corporate': 'CORPORATE',
      'spiritual': 'SPIRITUAL',
      'adventure': 'ADVENTURE',
      'educational': 'EDUCATIONAL'
    };
    
    const finalType = customTypeName ? 'CUSTOM' : (typeMapping[type] || type || 'WELLNESS');
    
    console.log('Creating retreat with data:', {
      title,
      description,
      type: finalType,
      customTypeName,
      status: status || 'DRAFT',
      duration: duration || 1,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      facilityId,
      capacity: capacity || 20,
      price: price ? parseFloat(price.toString()) : 0,
      instructor,
      amenities: amenities || [],
      inclusions: inclusions || [],
      requirements: requirements || [],
      cancellationPolicy,
      images: images || [],
      activities: activities || []
    });

    // Create retreat with activities
    const retreat = await prisma.retreat.create({
      data: {
        title,
        description,
        type: finalType,
        customTypeName,
        status: status || 'DRAFT',
        duration: duration || 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        facilityId: facilityId || null,
        capacity: capacity || 20,
        price: price ? parseFloat(price.toString()) : 0,
        instructor,
        amenities: amenities || [],
        inclusions: inclusions || [],
        requirements: requirements || [],
        cancellationPolicy,
        images: images || [],
        // Property-like fields
        totalRooms: totalRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        occupancyRate: occupancyRate || 0,
        expectedRevenue: expectedRevenue || 0,
        expectedExpenses: expectedExpenses || 0,
        netIncome: netIncome || 0,
        facilitiesIncluded: facilitiesIncluded || [],
        depositRequired: depositRequired || 0,
        refundPolicy,
        minimumStay: minimumStay || 0,
        maximumStay: maximumStay || 0,
        checkInTime,
        checkOutTime,
        ageRestrictions,
        healthRequirements: healthRequirements || [],
        emergencyContact,
        emergencyPhone,
        insuranceCoverage,
        certifications: certifications || [],
        staffCount: staffCount || 0,
        languages: languages || [],
        specialInstructions,
        // Create activities if provided
        ...(activities && activities.length > 0 && {
          activities: {
            create: activities.map((activity: any) => ({
              name: activity.name,
              description: activity.description,
              duration: activity.duration || 60,
              instructor: activity.instructor || instructor,
              capacity: activity.capacity || capacity,
              equipment: activity.equipment || []
            }))
          }
        })
      },
      include: {
        activities: true,
        facility: {
          include: {
            amenities: true,
            rooms: true
          }
        }
      }
    });

    console.log('Retreat created successfully:', retreat);
    console.log('=================================');

    return NextResponse.json({ retreat }, { status: 201 });
  } catch (error) {
    console.error('Error creating retreat:', error);
    console.log('=================================');
    return NextResponse.json(
      { error: 'Failed to create retreat', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
 
 
 