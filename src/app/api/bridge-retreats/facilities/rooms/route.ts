import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';

// Helper function to convert eZee room status to our system status
function convertEZeeRoomStatus(ezeeStatus: string): string {
  switch (ezeeStatus) {
    case 'Clean': return 'AVAILABLE';
    case 'Dirty': return 'MAINTENANCE';
    case 'OutOfOrder': return 'OUT_OF_ORDER';
    case 'OutOfService': return 'CLOSED';
    default: return 'AVAILABLE';
  }
}

// Helper function to convert eZee room condition to cleaning status
function convertEZeeConditionToCleaningStatus(condition: string): string {
  switch (condition) {
    case 'Good': return 'CLEAN';
    case 'Fair': return 'NEEDS_CLEANING';
    case 'Poor': return 'DEEP_CLEANING';
    default: return 'CLEAN';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const roomType = searchParams.get('roomType');
    const status = searchParams.get('status');
    const floor = searchParams.get('floor');
    const search = searchParams.get('search');

    console.log('Fetching rooms data from eZee PMS...');

    // Fetch data from eZee PMS
    const [rooms, roomTypes, housekeeping] = await Promise.all([
      ezeePMSClient.getRooms(),
      ezeePMSClient.getRoomTypes(),
      ezeePMSClient.getHousekeepingTasks()
    ]);

    console.log(`Retrieved ${rooms.length} rooms from eZee PMS`);

    // Transform rooms data
    const transformedRooms = rooms.map(room => {
      const roomTypeInfo = roomTypes.find(rt => rt.RoomTypeID === room.RoomTypeID);
      const housekeepingTasks = housekeeping.filter(h => h.RoomID === room.RoomID);
      const activeHousekeeping = housekeepingTasks.find(h => h.AssignedTo);
      
      return {
        id: room.RoomID,
        roomNumber: room.RoomNo,
        roomType: roomTypeInfo?.RoomTypeName || room.RoomType || 'Standard',
        status: convertEZeeRoomStatus(room.Status),
        cleaningStatus: convertEZeeConditionToCleaningStatus(room.Condition),
        capacity: room.MaxOccupancy || 2,
        currentOccupancy: room.CurrentOccupancy || 0,
        floor: room.Floor || 1,
        hasPrivateBath: true, // Default assumption
        hasBalcony: room.Features?.includes('Balcony') || false,
        hasAC: room.Features?.includes('AC') || room.Features?.includes('Air Conditioning') || true,
        hasWifi: true, // Default assumption
        lastCleaned: room.LastCleaned || null,
        nextMaintenance: room.NextMaintenance || null,
        assignedHousekeeper: activeHousekeeping?.AssignedTo || null,
        description: room.Description || `${roomTypeInfo?.RoomTypeName || 'Standard'} room`,
        features: room.Features || [],
        
        // Additional room details (using defaults since not in eZee interface)
        bedType: 'Double', // Default
        view: 'City', // Default
        smokingAllowed: false, // Default
        petFriendly: false, // Default
        accessibility: false, // Default
        
        // Pricing information (not available in eZee interface)
        baseRate: null,
        currentRate: null,
        
        // PMS specific data
        pmsData: {
          roomId: room.RoomID,
          roomTypeId: room.RoomTypeID,
          ezeeRoomType: roomTypeInfo,
          ezeeStatus: room.Status,
          ezeeCondition: room.Condition,
          lastSyncTime: new Date().toISOString(),
          dataSource: 'eZee PMS'
        },
        
        // Housekeeping information
        housekeeping: {
          tasks: housekeepingTasks.map(task => ({
            id: `${task.RoomID}-${task.TaskType}`, // Create ID from available fields
            type: task.TaskType,
            status: task.Status,
            assignedTo: task.AssignedTo,
            scheduledDate: task.LastUpdated, // Use LastUpdated as schedule date
            completedDate: null, // Not available in interface
            notes: task.Notes
          })),
          lastCleaned: room.LastCleaned,
          nextScheduledCleaning: housekeepingTasks
            .filter(t => t.AssignedTo && t.Status === 'Clean')
            .sort((a, b) => new Date(a.LastUpdated).getTime() - new Date(b.LastUpdated).getTime())[0]?.LastUpdated || null
        }
      };
    });

    // Apply filters
    let filteredRooms = transformedRooms;

    if (facilityId && facilityId !== 'all') {
      // Filter by room type ID if facilityId corresponds to a room type
      filteredRooms = filteredRooms.filter(room => 
        room.pmsData.roomTypeId === facilityId || room.roomType.toLowerCase().includes(facilityId.toLowerCase())
      );
    }

    if (roomType && roomType !== 'all') {
      filteredRooms = filteredRooms.filter(room => 
        room.roomType.toLowerCase().includes(roomType.toLowerCase())
      );
    }

    if (status && status !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.status === status.toUpperCase());
    }

    if (floor && floor !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.floor === parseInt(floor));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRooms = filteredRooms.filter(room =>
        room.roomNumber.toLowerCase().includes(searchLower) ||
        room.roomType.toLowerCase().includes(searchLower) ||
        room.description.toLowerCase().includes(searchLower) ||
        room.assignedHousekeeper?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate statistics
    const totalRooms = filteredRooms.length;
    const availableRooms = filteredRooms.filter(r => r.status === 'AVAILABLE').length;
    const occupiedRooms = filteredRooms.filter(r => r.status === 'OCCUPIED' || r.currentOccupancy > 0).length;
    const maintenanceRooms = filteredRooms.filter(r => r.status === 'MAINTENANCE').length;
    const outOfOrderRooms = filteredRooms.filter(r => r.status === 'OUT_OF_ORDER').length;
    const cleanRooms = filteredRooms.filter(r => r.cleaningStatus === 'CLEAN').length;
    const needsCleaningRooms = filteredRooms.filter(r => r.cleaningStatus === 'NEEDS_CLEANING').length;

    const totalCapacity = filteredRooms.reduce((sum, room) => sum + room.capacity, 0);
    const currentOccupancy = filteredRooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;
    const roomUtilization = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const cleanlinessScore = totalRooms > 0 ? Math.round((cleanRooms / totalRooms) * 100) : 0;

    // Group rooms by floor
    const roomsByFloor = filteredRooms.reduce((acc, room) => {
      const floor = room.floor;
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(room);
      return acc;
    }, {} as Record<number, typeof filteredRooms>);

    // Group rooms by type
    const roomsByType = filteredRooms.reduce((acc, room) => {
      const type = room.roomType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(room);
      return acc;
    }, {} as Record<string, typeof filteredRooms>);

    return NextResponse.json({
      rooms: filteredRooms,
      stats: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        outOfOrderRooms,
        cleanRooms,
        needsCleaningRooms,
        occupancyRate,
        roomUtilization,
        cleanlinessScore,
        totalCapacity,
        currentOccupancy
      },
      groupings: {
        byFloor: roomsByFloor,
        byType: roomsByType
      },
      roomTypes: roomTypes,
      source: 'eZee PMS',
      lastSync: new Date().toISOString(),
      totalRoomsInPMS: rooms.length,
      totalHousekeepingTasks: housekeeping.length
    });

  } catch (error) {
    console.error('Error fetching rooms from eZee PMS:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch rooms from eZee PMS',
        details: error instanceof Error ? error.message : 'Unknown error',
        rooms: [],
        stats: {
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          maintenanceRooms: 0,
          outOfOrderRooms: 0,
          cleanRooms: 0,
          needsCleaningRooms: 0,
          occupancyRate: 0,
          roomUtilization: 0,
          cleanlinessScore: 0,
          totalCapacity: 0,
          currentOccupancy: 0
        }
      },
      { status: 500 }
    );
  }
}

// POST endpoint for room operations (limited in PMS integration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, data } = body;

    switch (action) {
      case 'updateStatus':
        // Update room status in eZee PMS
        const result = await ezeePMSClient.updateRoomStatus(roomId, data.status);
        return NextResponse.json({ success: true, result });

      case 'assignHousekeeper':
        // Create housekeeping task in eZee PMS
        const housekeepingResult = await ezeePMSClient.createHousekeepingTask({
          RoomID: roomId,
          TaskType: 'Cleaning',
          AssignedTo: data.housekeeper,
          Notes: data.notes || 'Room cleaning assignment'
        });
        return NextResponse.json({ success: true, result: housekeepingResult });

      default:
      return NextResponse.json(
          { error: 'Invalid action. Supported actions: updateStatus, assignHousekeeper' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating room in eZee PMS:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update room in eZee PMS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for bulk room operations
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomIds, data } = body;

    const results = [];
    
    for (const roomId of roomIds) {
      try {
        let result;
        switch (action) {
          case 'bulkStatusUpdate':
            result = await ezeePMSClient.updateRoomStatus(roomId, data.status);
            break;
                     case 'bulkHousekeepingAssign':
             result = await ezeePMSClient.createHousekeepingTask({
               RoomID: roomId,
               TaskType: 'Cleaning',
               AssignedTo: data.housekeeper,
               Notes: data.notes || 'Bulk room cleaning assignment'
             });
            break;
          default:
            throw new Error('Invalid bulk action');
        }
        results.push({ roomId, success: true, result });
      } catch (error) {
        results.push({ 
          roomId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      results,
      summary: {
        total: roomIds.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Error performing bulk room operation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform bulk room operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 