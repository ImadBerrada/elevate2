import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';
import { format, parseISO } from 'date-fns';

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

// Helper function to determine facility type based on room type
function determineFacilityType(roomType: string): string {
  const type = roomType.toLowerCase();
  if (type.includes('suite') || type.includes('villa') || type.includes('deluxe')) {
    return 'ACCOMMODATION';
  }
  if (type.includes('restaurant') || type.includes('dining')) {
    return 'DINING';
  }
  if (type.includes('spa') || type.includes('wellness')) {
    return 'WELLNESS';
  }
  if (type.includes('gym') || type.includes('pool') || type.includes('recreation')) {
    return 'RECREATION';
  }
  return 'ACCOMMODATION';
}

// Helper function to calculate facility statistics
function calculateFacilityStats(rooms: any[], housekeeping: any[], maintenanceTasks: any[]) {
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.Status === 'Clean').length;
  const occupiedRooms = rooms.filter(r => r.CurrentOccupancy > 0).length;
  const maintenanceRooms = rooms.filter(r => r.Status === 'OutOfOrder' || r.Status === 'OutOfService').length;
  const outOfOrderRooms = rooms.filter(r => r.Status === 'OutOfOrder').length;
  const cleanRooms = rooms.filter(r => r.Condition === 'Good').length;

  // Calculate occupancy rate
  const totalCapacity = rooms.reduce((sum, room) => sum + (room.MaxOccupancy || 0), 0);
  const currentOccupancy = rooms.reduce((sum, room) => sum + (room.CurrentOccupancy || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  // Calculate room utilization
  const roomUtilization = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Calculate cleanliness score
  const cleanlinessScore = totalRooms > 0 ? Math.round((cleanRooms / totalRooms) * 100) : 0;

  // Calculate maintenance score
  const activeMaintenanceRequests = maintenanceTasks.filter(m => m.Status === 'Pending' || m.Status === 'InProgress').length;
  const maintenanceScore = Math.max(0, 100 - (activeMaintenanceRequests * 10));

  const criticalMaintenanceRequests = maintenanceTasks.filter(m => 
    (m.Status === 'Pending' || m.Status === 'InProgress') && 
    (m.Priority === 'High' || m.Priority === 'Critical')
  ).length;

  return {
    totalRooms,
    availableRooms,
    cleanRooms,
    occupiedRooms,
    maintenanceRooms,
    outOfOrderRooms,
    occupancyRate,
    roomUtilization,
    cleanlinessScore,
    maintenanceScore,
    activeMaintenanceRequests,
    criticalMaintenanceRequests,
    totalCapacity,
    currentOccupancy
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sync = searchParams.get('sync') === 'true';

    console.log('Fetching facilities data from eZee PMS...');

    // Fetch data from eZee PMS
    const [hotels, rooms, roomTypes, housekeeping, maintenanceTasks] = await Promise.all([
      ezeePMSClient.getHotels(),
      ezeePMSClient.getRooms(),
      ezeePMSClient.getRoomTypes(),
      ezeePMSClient.getHousekeepingTasks(),
      ezeePMSClient.getMaintenanceTasks()
    ]);

    console.log(`Retrieved ${hotels.length} hotels, ${rooms.length} rooms, ${roomTypes.length} room types from eZee PMS`);

    // Group rooms by room type to create facilities
    const roomTypeMap = new Map();
    
    // Process room types first
    roomTypes.forEach(roomType => {
      roomTypeMap.set(roomType.RoomTypeID, {
        id: roomType.RoomTypeID,
        name: roomType.RoomTypeName,
        type: determineFacilityType(roomType.RoomTypeName),
        rooms: [],
        roomType: roomType
      });
    });

    // Add rooms to their respective types
    rooms.forEach(room => {
      const facilityData = roomTypeMap.get(room.RoomTypeID) || roomTypeMap.get('default');
      if (facilityData) {
        facilityData.rooms.push(room);
      } else {
        // Create a default facility if room type not found
        if (!roomTypeMap.has('default')) {
          roomTypeMap.set('default', {
            id: 'default',
            name: 'General Accommodation',
            type: 'ACCOMMODATION',
            rooms: [],
            roomType: { RoomTypeID: 'default', RoomTypeName: 'General Accommodation' }
          });
        }
        roomTypeMap.get('default').rooms.push(room);
      }
    });

    // Convert to facilities array
    const facilities = Array.from(roomTypeMap.values()).map(facilityData => {
      const facilityRooms = facilityData.rooms;
      const facilityHousekeeping = housekeeping.filter(h => 
        facilityRooms.some((r: any) => r.RoomID === h.RoomID)
      );
      const facilityMaintenance = maintenanceTasks.filter(m => 
        facilityRooms.some((r: any) => r.RoomID === m.RoomID)
      );

      const stats = calculateFacilityStats(facilityRooms, facilityHousekeeping, facilityMaintenance);

      // Determine facility status based on room conditions
      let facilityStatus = 'OPERATIONAL';
      const outOfOrderPercentage = stats.totalRooms > 0 ? (stats.outOfOrderRooms / stats.totalRooms) * 100 : 0;
      const maintenancePercentage = stats.totalRooms > 0 ? (stats.maintenanceRooms / stats.totalRooms) * 100 : 0;

      if (outOfOrderPercentage > 50) {
        facilityStatus = 'CLOSED';
      } else if (maintenancePercentage > 30 || stats.criticalMaintenanceRequests > 2) {
        facilityStatus = 'MAINTENANCE';
      } else if (outOfOrderPercentage > 20) {
        facilityStatus = 'RENOVATION';
      }

      // Calculate average rating (simulated based on cleanliness and maintenance scores)
      const rating = Math.min(5, Math.max(1, (stats.cleanlinessScore + stats.maintenanceScore) / 40));

      return {
        id: facilityData.id,
        name: facilityData.name,
        type: facilityData.type,
        status: facilityStatus,
        capacity: stats.totalCapacity,
        currentOccupancy: stats.currentOccupancy,
        location: 'Bridge Retreats', // Default location
        manager: 'PMS Manager', // Default manager
        description: `${facilityData.name} facility with ${stats.totalRooms} rooms`,
        operatingHours: '24/7',
        hasWifi: true,
        hasParking: true,
        parkingSpots: Math.ceil(stats.totalRooms * 1.2), // Estimate parking spots
        rating: Math.round(rating * 10) / 10,
        totalReviews: Math.floor(Math.random() * 100) + 10, // Simulated
        issueCount: stats.activeMaintenanceRequests,
        lastMaintenance: facilityMaintenance.length > 0 ? 
          facilityMaintenance
            .filter(m => m.CompletedDate)
            .sort((a, b) => new Date(b.CompletedDate!).getTime() - new Date(a.CompletedDate!).getTime())[0]?.CompletedDate
          : null,
        nextMaintenance: facilityMaintenance.length > 0 ?
          facilityMaintenance
            .filter(m => m.Status === 'Pending')
            .sort((a, b) => new Date(a.ScheduledDate).getTime() - new Date(b.ScheduledDate).getTime())[0]?.ScheduledDate
          : null,
        
        // Room details
        rooms: facilityRooms.map((room: any) => ({
          id: room.RoomID,
          roomNumber: room.RoomNo,
          status: convertEZeeRoomStatus(room.Status),
          cleaningStatus: convertEZeeConditionToCleaningStatus(room.Condition),
          capacity: room.MaxOccupancy,
          currentOccupancy: room.CurrentOccupancy,
          roomType: room.RoomType,
          hasPrivateBath: true, // Default assumption
          hasBalcony: room.Features?.includes('Balcony') || false,
          hasAC: room.Features?.includes('AC') || room.Features?.includes('Air Conditioning') || true,
          hasWifi: true, // Default assumption
          lastCleaned: room.LastCleaned || null,
          nextMaintenance: room.NextMaintenance || null,
          assignedHousekeeper: facilityHousekeeping.find(h => h.RoomID === room.RoomID)?.AssignedTo || null,
          floor: room.Floor || 1,
          description: room.Description || `${room.RoomType} room`,
          features: room.Features || []
        })),

        // Amenities (derived from room features)
        amenities: Array.from(new Set(
          facilityRooms.flatMap((room: any) => room.Features || [])
        )).map((feature, index) => ({
          id: `${facilityData.id}-amenity-${index}`,
          name: feature,
          status: 'AVAILABLE',
          capacity: Math.floor(Math.random() * 20) + 5, // Simulated
          currentUsage: Math.floor(Math.random() * 10), // Simulated
          category: 'ROOM_FEATURE',
          rating: Math.random() * 2 + 3, // 3-5 rating
          coordinator: 'Facility Manager'
        })),

        // Maintenance requests
        maintenanceRequests: facilityMaintenance.map(m => ({
          id: m.TaskID,
          title: m.Description,
          priority: m.Priority?.toUpperCase() || 'MEDIUM',
          status: m.Status?.toUpperCase().replace('PROGRESS', '_PROGRESS') || 'PENDING',
          category: m.TaskType?.toUpperCase() || 'GENERAL',
          scheduledDate: m.ScheduledDate,
          assignedTo: m.AssignedTo || null,
          description: m.Description,
          notes: m.Notes || null,
          cost: m.Cost || null
        })),

        // Enhanced statistics
        stats: {
          ...stats,
          totalAmenities: Array.from(new Set(facilityRooms.flatMap((room: any) => room.Features || []))).length,
          availableAmenities: Array.from(new Set(facilityRooms.flatMap((room: any) => room.Features || []))).length, // Assume all available
          pmsIntegrated: true,
          lastPMSSync: new Date().toISOString(),
          roomOccupancyTrend: 'stable', // Could be calculated from historical data
          maintenanceEfficiency: stats.maintenanceScore,
          guestSatisfactionScore: rating * 20 // Convert 5-star to 100-point scale
        },

        // PMS-specific data
        pmsData: {
          roomTypeId: facilityData.roomType.RoomTypeID,
          totalRoomsInType: facilityRooms.length,
          ezeeRoomType: facilityData.roomType,
          lastSyncTime: new Date().toISOString(),
          dataSource: 'eZee PMS'
        }
      };
    });

    // Apply filters
    let filteredFacilities = facilities;

    if (type && type !== 'all') {
      filteredFacilities = filteredFacilities.filter(f => f.type === type.toUpperCase());
    }

    if (status && status !== 'all') {
      filteredFacilities = filteredFacilities.filter(f => f.status === status.toUpperCase());
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredFacilities = filteredFacilities.filter(f =>
        f.name.toLowerCase().includes(searchLower) ||
        f.location.toLowerCase().includes(searchLower) ||
        f.manager.toLowerCase().includes(searchLower) ||
        f.description?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate overall statistics
    const totalFacilities = filteredFacilities.length;
    const operational = filteredFacilities.filter(f => f.status === 'OPERATIONAL').length;
    const maintenanceFacilities = filteredFacilities.filter(f => f.status === 'MAINTENANCE').length;
    const totalCapacity = filteredFacilities.reduce((sum, f) => sum + (f.capacity || 0), 0);
    const totalOccupancy = filteredFacilities.reduce((sum, f) => sum + (f.currentOccupancy || 0), 0);
    const averageOccupancy = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
    const totalRooms = filteredFacilities.reduce((sum, f) => sum + (f.stats?.totalRooms || 0), 0);
    const availableRooms = filteredFacilities.reduce((sum, f) => sum + (f.stats?.availableRooms || 0), 0);

    return NextResponse.json({
      facilities: filteredFacilities,
      stats: {
        totalFacilities,
        operational,
        maintenance: maintenanceFacilities,
        averageOccupancy,
        totalCapacity,
        totalOccupancy,
        totalRooms,
        availableRooms,
        pendingMaintenance: filteredFacilities.reduce((sum, f) => sum + (f.stats?.activeMaintenanceRequests || 0), 0)
      },
      source: 'eZee PMS',
      lastSync: new Date().toISOString(),
      hotels: hotels,
      roomTypes: roomTypes,
      totalRooms: rooms.length,
      totalHousekeepingTasks: housekeeping.length,
      totalMaintenanceTasks: maintenanceTasks.length
    });

  } catch (error) {
    console.error('Error fetching facilities from eZee PMS:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch facilities from eZee PMS',
        details: error instanceof Error ? error.message : 'Unknown error',
        facilities: [],
        stats: {
          totalFacilities: 0,
          operational: 0,
          maintenance: 0,
          averageOccupancy: 0,
          totalCapacity: 0,
          totalOccupancy: 0,
          totalRooms: 0,
          availableRooms: 0,
          pendingMaintenance: 0
        }
      },
      { status: 500 }
    );
  }
}

// POST endpoint for creating facilities (not applicable for PMS integration)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Creating facilities is managed through eZee PMS. Please use the PMS interface to add new room types and rooms.' },
    { status: 400 }
  );
      }

// PUT endpoint for updating facilities (limited to local data)
export async function PUT(request: NextRequest) {
    return NextResponse.json(
    { error: 'Facility updates should be made through eZee PMS. Only local preferences can be updated.' },
    { status: 400 }
  );
}

// DELETE endpoint for deleting facilities (not applicable for PMS integration)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Deleting facilities is managed through eZee PMS. Please use the PMS interface to remove room types.' },
    { status: 400 }
    );
} 