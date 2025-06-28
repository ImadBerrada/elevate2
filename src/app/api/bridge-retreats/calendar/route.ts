import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/calendar - Get calendar data for retreats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const view = searchParams.get('view') || 'month'; // month, week, list

    // Calculate date range based on view
    let startDate: Date;
    let endDate: Date;

    if (view === 'month') {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (view === 'week') {
      const weekStart = parseInt(searchParams.get('weekStart') || '1');
      startDate = new Date(year, month - 1, weekStart);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else {
      // List view - show next 30 days
      startDate = new Date();
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
    }

    // Get retreats in the date range
    const retreats = await prisma.retreat.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      include: {
        activities: true,
        bookings: {
          where: { status: 'CONFIRMED' },
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
      orderBy: { startDate: 'asc' },
    });

    // Get resources (instructors, facilities) and their availability
    const instructors = await prisma.retreat.findMany({
      select: {
        instructor: true,
      },
      distinct: ['instructor'],
    });

    const facilities = await prisma.retreat.findMany({
      select: {
        location: true,
      },
      distinct: ['location'],
    });

    // Check for conflicts (same instructor or location at overlapping times)
    const conflicts: string[] = [];
    
    for (let i = 0; i < retreats.length; i++) {
      for (let j = i + 1; j < retreats.length; j++) {
        const retreat1 = retreats[i];
        const retreat2 = retreats[j];
        
        // Check for date overlap
        const overlap = (
          retreat1.startDate <= retreat2.endDate &&
          retreat2.startDate <= retreat1.endDate
        );
        
        if (overlap) {
          // Check for instructor conflict
          if (retreat1.instructor === retreat2.instructor) {
            conflicts.push(`Instructor conflict: ${retreat1.instructor} scheduled for both "${retreat1.title}" and "${retreat2.title}"`);
          }
          
          // Check for location conflict
          if (retreat1.location === retreat2.location) {
            conflicts.push(`Location conflict: ${retreat1.location} booked for both "${retreat1.title}" and "${retreat2.title}"`);
          }
        }
      }
    }

    // Format retreats for calendar display
    const calendarRetreats = retreats.map(retreat => ({
      id: retreat.id,
      title: retreat.title,
      type: retreat.type,
      status: retreat.status,
      startDate: retreat.startDate,
      endDate: retreat.endDate,
      duration: retreat.duration,
      capacity: retreat.capacity,
      currentBookings: retreat._count.bookings,
      price: retreat.price,
      location: retreat.location,
      instructor: retreat.instructor,
      color: getRetreatColor(retreat.type),
      isFullyBooked: retreat._count.bookings >= retreat.capacity,
    }));

    // Get resource availability
    const resourceAvailability = {
      instructors: instructors.map(i => ({
        name: i.instructor,
        availability: getInstructorAvailability(i.instructor, retreats, startDate, endDate),
      })),
      facilities: facilities.map(f => ({
        name: f.location,
        availability: getFacilityAvailability(f.location, retreats, startDate, endDate),
      })),
    };

    return NextResponse.json({
      retreats: calendarRetreats,
      conflicts,
      resourceAvailability,
      period: {
        startDate,
        endDate,
        view,
        year,
        month,
      },
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}

// Helper function to get retreat color based on type
function getRetreatColor(type: string): string {
  const colors: { [key: string]: string } = {
    wellness: '#10B981',
    corporate: '#3B82F6',
    spiritual: '#8B5CF6',
    adventure: '#F59E0B',
    educational: '#6366F1',
  };
  return colors[type] || '#6B7280';
}

// Helper function to get instructor availability
function getInstructorAvailability(
  instructor: string,
  retreats: any[],
  startDate: Date,
  endDate: Date
): { [date: string]: boolean } {
  const availability: { [date: string]: boolean } = {};
  
  // Initialize all dates as available
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    availability[d.toISOString().split('T')[0]] = true;
  }
  
  // Mark dates as unavailable where instructor is scheduled
  retreats
    .filter(retreat => retreat.instructor === instructor)
    .forEach(retreat => {
      for (let d = new Date(retreat.startDate); d <= retreat.endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (availability.hasOwnProperty(dateKey)) {
          availability[dateKey] = false;
        }
      }
    });
  
  return availability;
}

// Helper function to get facility availability
function getFacilityAvailability(
  location: string,
  retreats: any[],
  startDate: Date,
  endDate: Date
): { [date: string]: boolean } {
  const availability: { [date: string]: boolean } = {};
  
  // Initialize all dates as available
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    availability[d.toISOString().split('T')[0]] = true;
  }
  
  // Mark dates as unavailable where facility is booked
  retreats
    .filter(retreat => retreat.location === location)
    .forEach(retreat => {
      for (let d = new Date(retreat.startDate); d <= retreat.endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (availability.hasOwnProperty(dateKey)) {
          availability[dateKey] = false;
        }
      }
    });
  
  return availability;
} 
 
 
 