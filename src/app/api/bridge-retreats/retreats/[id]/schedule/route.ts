import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch retreat schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: retreatId } = await params;

    // Get retreat with schedule data
    const retreat = await prisma.retreat.findUnique({
      where: { id: retreatId },
      include: {
        scheduleActivities: {
          orderBy: [
            { day: 'asc' },
            { time: 'asc' }
          ]
        }
      }
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Get available instructors and resources
    const instructors = await prisma.staff.findMany({
      where: {
        role: 'INSTRUCTOR',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialties: true,
        availability: true
      }
    });

    const resources = await prisma.retreatFacility.findMany({
      where: {
        status: 'OPERATIONAL'
      },
      include: {
        amenities: true,
        rooms: true
      }
    });

    // Transform schedule activities into day-based structure
    const scheduleMap = new Map();
    
    retreat.scheduleActivities.forEach(activity => {
      if (!scheduleMap.has(activity.day)) {
        scheduleMap.set(activity.day, {
          day: activity.day,
          date: new Date(retreat.startDate.getTime() + (activity.day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activities: [],
          notes: activity.notes || ''
        });
      }
      
      scheduleMap.get(activity.day).activities.push({
        id: activity.id,
        time: activity.time,
        name: activity.name,
        description: activity.description || '',
        duration: activity.duration,
        instructor: activity.instructor || '',
        location: activity.location || '',
        capacity: activity.capacity || 20,
        currentParticipants: activity.currentParticipants || 0,
        resources: activity.resources || [],
        type: activity.type,
        isRequired: activity.isRequired
      });
    });

    const schedule = Array.from(scheduleMap.values());

    // Transform instructors
    const transformedInstructors = instructors.map(instructor => ({
      id: instructor.id,
      name: `${instructor.firstName} ${instructor.lastName}`,
      specialties: instructor.specialties || [],
      availability: instructor.availability || []
    }));

    // Transform resources
    const transformedResources: Array<{ id: string; name: string; type: 'room' | 'equipment'; capacity?: number; location: string }> = [];
    
    // Add facility rooms as resources
    resources.forEach(facility => {
      facility.rooms.forEach(room => {
        transformedResources.push({
          id: room.id,
          name: room.roomNumber || `Room ${room.id}`,
          type: 'room' as const,
          capacity: room.capacity,
          location: facility.name
        });
      });
      
      // Add facility amenities as resources
      facility.amenities.forEach(amenity => {
        transformedResources.push({
          id: amenity.id,
          name: amenity.name,
          type: 'equipment' as const,
          location: facility.name
        });
      });
    });

    return NextResponse.json({
      schedule,
      instructors: transformedInstructors,
      resources: transformedResources
    });

  } catch (error) {
    console.error('Error fetching retreat schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retreat schedule' },
      { status: 500 }
    );
  }
}

// POST - Save/Update retreat schedule
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: retreatId } = await params;
    const { schedule } = await request.json();

    // Verify retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: retreatId }
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Delete existing schedule activities for this retreat
    await prisma.scheduleActivity.deleteMany({
      where: { retreatId }
    });

    // Create new schedule activities
    const scheduleActivities = [];
    
    for (const day of schedule) {
      for (const activity of day.activities) {
        scheduleActivities.push({
          id: activity.id === 'new' ? undefined : activity.id,
          retreatId,
          day: day.day,
          time: activity.time,
          name: activity.name,
          description: activity.description,
          duration: activity.duration,
          instructor: activity.instructor || null,
          location: activity.location || null,
          capacity: activity.capacity,
          currentParticipants: activity.currentParticipants || 0,
          resources: activity.resources,
          type: activity.type,
          isRequired: activity.isRequired,
          notes: day.notes || null
        });
      }
    }

    // Create all schedule activities
    if (scheduleActivities.length > 0) {
      await prisma.scheduleActivity.createMany({
        data: scheduleActivities,
        skipDuplicates: true
      });
    }

    return NextResponse.json({
      message: 'Schedule saved successfully',
      scheduleCount: scheduleActivities.length
    });

  } catch (error) {
    console.error('Error saving retreat schedule:', error);
    return NextResponse.json(
      { error: 'Failed to save retreat schedule' },
      { status: 500 }
    );
  }
}

// PUT - Update specific schedule activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: retreatId } = await params;
    const { activityId, activity } = await request.json();

    // Verify retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: retreatId }
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Update the specific activity
    const updatedActivity = await prisma.scheduleActivity.update({
      where: { 
        id: activityId,
        retreatId: retreatId // Ensure activity belongs to this retreat
      },
      data: {
        time: activity.time,
        name: activity.name,
        description: activity.description,
        duration: activity.duration,
        instructor: activity.instructor || null,
        location: activity.location || null,
        capacity: activity.capacity,
        resources: activity.resources,
        type: activity.type,
        isRequired: activity.isRequired
      }
    });

    return NextResponse.json({
      message: 'Activity updated successfully',
      activity: updatedActivity
    });

  } catch (error) {
    console.error('Error updating schedule activity:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule activity' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific schedule activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: retreatId } = await params;
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    // Verify retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: retreatId }
    });

    if (!retreat) {
      return NextResponse.json(
        { error: 'Retreat not found' },
        { status: 404 }
      );
    }

    // Delete the specific activity
    await prisma.scheduleActivity.delete({
      where: { 
        id: activityId,
        retreatId: retreatId // Ensure activity belongs to this retreat
      }
    });

    return NextResponse.json({
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting schedule activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule activity' },
      { status: 500 }
    );
  }
} 