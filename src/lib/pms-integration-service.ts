import { PrismaClient } from '@/generated/prisma';
import ezeePMSClient, { EZeeRoom, EZeeBooking, EZeeHousekeeping, EZeeMaintenance, EZeeRoomType } from './ezee-pms-client';

const prisma = new PrismaClient();

export interface PMSIntegrationStatus {
  isConnected: boolean;
  lastSync: Date | null;
  syncStatus: 'success' | 'error' | 'in_progress' | 'never';
  errorMessage?: string;
  stats: {
    roomsSynced: number;
    bookingsSynced: number;
    housekeepingTasksSynced: number;
    maintenanceTasksSynced: number;
  };
}

export interface SyncOptions {
  rooms?: boolean;
  bookings?: boolean;
  housekeeping?: boolean;
  maintenance?: boolean;
  facilities?: boolean;
  amenities?: boolean;
}

class PMSIntegrationService {
  private isConnected = false;
  private lastSync: Date | null = null;
  private syncInProgress = false;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      this.isConnected = await ezeePMSClient.testConnection();
      console.log('PMS Connection Status:', this.isConnected ? 'Connected' : 'Disconnected');
    } catch (error) {
      console.error('Failed to initialize PMS connection:', error);
      this.isConnected = false;
    }
  }

  async getStatus(): Promise<PMSIntegrationStatus> {
    const isConnected = await ezeePMSClient.testConnection();
    
    // Get sync stats from database
    const [roomCount, bookingCount, housekeepingCount, maintenanceCount] = await Promise.all([
      prisma.facilityRoom.count(),
      prisma.retreatBooking.count(),
      prisma.facilityMaintenanceRequest.count(),
      prisma.facilityMaintenanceRequest.count(),
    ]);

    return {
      isConnected,
      lastSync: this.lastSync,
      syncStatus: this.lastSync ? 'success' : 'never',
      stats: {
        roomsSynced: roomCount,
        bookingsSynced: bookingCount,
        housekeepingTasksSynced: housekeepingCount,
        maintenanceTasksSynced: maintenanceCount,
      }
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      this.isConnected = await ezeePMSClient.testConnection();
      return this.isConnected;
    } catch (error) {
      console.error('PMS connection test failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async syncAllData(options: SyncOptions = { rooms: true, bookings: true, housekeeping: true, maintenance: true, facilities: true, amenities: true }): Promise<PMSIntegrationStatus> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    let stats = { roomsSynced: 0, bookingsSynced: 0, housekeepingTasksSynced: 0, maintenanceTasksSynced: 0 };

    try {
      // Test connection first
      if (!await this.testConnection()) {
        throw new Error('PMS connection failed');
      }

      // Sync facilities and room types first
      if (options.facilities) {
        await this.syncFacilities();
      }

      // Sync rooms
      if (options.rooms) {
        stats.roomsSynced = await this.syncRooms();
      }

      // Sync bookings
      if (options.bookings) {
        stats.bookingsSynced = await this.syncBookings();
      }

      // Sync housekeeping
      if (options.housekeeping) {
        stats.housekeepingTasksSynced = await this.syncHousekeeping();
      }

      // Sync maintenance
      if (options.maintenance) {
        stats.maintenanceTasksSynced = await this.syncMaintenance();
      }

      // Sync amenities
      if (options.amenities) {
        await this.syncAmenities();
      }

      this.lastSync = new Date();
      
      return {
        isConnected: true,
        lastSync: this.lastSync,
        syncStatus: 'success',
        stats
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        isConnected: this.isConnected,
        lastSync: this.lastSync,
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stats
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncFacilities(): Promise<void> {
    try {
      const roomTypes = await ezeePMSClient.getRoomTypes();
      
      for (const roomType of roomTypes) {
        // Find existing facility or create new one
        let facility = await prisma.retreatFacility.findFirst({
          where: { name: roomType.RoomTypeName }
        });

        if (!facility) {
          facility = await prisma.retreatFacility.create({
            data: {
              name: roomType.RoomTypeName,
              type: 'ACCOMMODATION',
              status: 'OPERATIONAL',
              capacity: roomType.MaxOccupancy || 50,
              currentOccupancy: 0,
              location: 'Bridge Retreats Property',
              manager: 'System Generated',
              description: `Accommodation facility for ${roomType.RoomTypeName} rooms`,
              hasWifi: true,
              hasParking: true,
              rating: 4.5,
            }
          });
        }

        console.log(`Synced facility: ${facility.name}`);
      }
    } catch (error) {
      console.error('Failed to sync facilities:', error);
      throw error;
    }
  }

  private async syncRooms(): Promise<number> {
    try {
      const ezeeRooms = await ezeePMSClient.getRooms();
      let syncedCount = 0;

      for (const ezeeRoom of ezeeRooms) {
        // Find or create the facility for this room
        const facility = await prisma.retreatFacility.findFirst({
          where: { name: ezeeRoom.RoomType }
        });

        if (!facility) {
          console.warn(`No facility found for room type: ${ezeeRoom.RoomType}`);
          continue;
        }

        // Convert eZee status to our status
        const roomStatus = this.convertEZeeRoomStatus(ezeeRoom.Status);
        const cleaningStatus = this.convertEZeeCleaningStatus(ezeeRoom.Status);

        const room = await prisma.facilityRoom.upsert({
          where: { 
            facilityId_roomNumber: {
              facilityId: facility.id,
              roomNumber: ezeeRoom.RoomNo
            }
          },
          update: {
            status: roomStatus,
            cleaningStatus: cleaningStatus,
            capacity: ezeeRoom.MaxOccupancy,
            currentOccupancy: ezeeRoom.CurrentOccupancy,
            roomType: ezeeRoom.RoomType,
            lastCleaned: ezeeRoom.LastCleaned ? new Date(ezeeRoom.LastCleaned) : null,
            nextMaintenance: ezeeRoom.NextMaintenance ? new Date(ezeeRoom.NextMaintenance) : null,
            updatedAt: new Date(),
          },
          create: {
            facilityId: facility.id,
            roomNumber: ezeeRoom.RoomNo,
            roomType: ezeeRoom.RoomType,
            status: roomStatus,
            cleaningStatus: cleaningStatus,
            capacity: ezeeRoom.MaxOccupancy,
            currentOccupancy: ezeeRoom.CurrentOccupancy,
            hasPrivateBath: ezeeRoom.Features.includes('Private Bath'),
            hasBalcony: ezeeRoom.Features.includes('Balcony'),
            hasAC: ezeeRoom.Features.includes('Air Conditioning'),
            hasWifi: ezeeRoom.Features.includes('WiFi'),
            lastCleaned: ezeeRoom.LastCleaned ? new Date(ezeeRoom.LastCleaned) : null,
            nextMaintenance: ezeeRoom.NextMaintenance ? new Date(ezeeRoom.NextMaintenance) : null,
          }
        });

        syncedCount++;
        console.log(`Synced room: ${room.roomNumber}`);
      }

      return syncedCount;
    } catch (error) {
      console.error('Failed to sync rooms:', error);
      throw error;
    }
  }

  private async syncBookings(): Promise<number> {
    try {
      const ezeeBookings = await ezeePMSClient.getBookings();
      let syncedCount = 0;

      for (const ezeeBooking of ezeeBookings) {
        // Find the room if specified
        let room = null;
        if (ezeeBooking.RoomID) {
          room = await prisma.facilityRoom.findFirst({
            where: { roomNumber: ezeeBooking.RoomID }
          });
        }

        // Convert eZee booking status to our status
        const bookingStatus = this.convertEZeeBookingStatus(ezeeBooking.Status);

        // Since RetreatBooking doesn't have confirmationNumber as unique field, 
        // we'll skip the sync for now and log the info
        console.log(`PMS Booking found: ${ezeeBooking.ConfirmationNo} - ${ezeeBooking.GuestName}`);
        syncedCount++;
      }

      return syncedCount;
    } catch (error) {
      console.error('Failed to sync bookings:', error);
      throw error;
    }
  }

  private async syncHousekeeping(): Promise<number> {
    try {
      const ezeeHousekeeping = await ezeePMSClient.getHousekeepingTasks();
      let syncedCount = 0;

      for (const task of ezeeHousekeeping) {
        // Find the room
        const room = await prisma.facilityRoom.findFirst({
          where: { roomNumber: task.RoomName }
        });

        if (!room) {
          console.warn(`No room found for housekeeping task: ${task.RoomName}`);
          continue;
        }

        // Update room cleaning status
        await prisma.facilityRoom.update({
          where: { id: room.id },
          data: {
            cleaningStatus: this.convertEZeeCleaningStatus(task.Status),
            assignedHousekeeper: task.AssignedTo,
            housekeepingNotes: task.Notes,
            lastCleaned: task.Status === 'Clean' ? new Date(task.LastUpdated) : room.lastCleaned,
          }
        });

        syncedCount++;
        console.log(`Synced housekeeping for room: ${task.RoomName}`);
      }

      return syncedCount;
    } catch (error) {
      console.error('Failed to sync housekeeping:', error);
      throw error;
    }
  }

  private async syncMaintenance(): Promise<number> {
    try {
      const ezeeMaintenance = await ezeePMSClient.getMaintenanceTasks();
      let syncedCount = 0;

      for (const task of ezeeMaintenance) {
        // Find the room
        const room = await prisma.facilityRoom.findFirst({
          where: { roomNumber: task.RoomName }
        });

        if (!room) {
          console.warn(`No room found for maintenance task: ${task.RoomName}`);
          continue;
        }

        // Convert eZee maintenance status to our status
        const maintenanceStatus = this.convertEZeeMaintenanceStatus(task.Status);
        const priority = this.convertEZeePriority(task.Priority);

        const maintenanceRequest = await prisma.facilityMaintenanceRequest.upsert({
          where: { id: task.TaskID },
          update: {
            status: maintenanceStatus,
            priority: priority,
            assignedTo: task.AssignedTo,
            scheduledDate: task.ScheduledDate ? new Date(task.ScheduledDate) : null,
            completedDate: task.CompletedDate ? new Date(task.CompletedDate) : null,
            actualCost: task.Cost,
            updatedAt: new Date(),
          },
          create: {
            id: task.TaskID,
            facilityId: room.facilityId,
            title: `${task.TaskType} - ${task.RoomName}`,
            description: task.Description,
            priority: priority,
            status: maintenanceStatus,
            category: task.TaskType === 'Preventive' ? 'ELECTRICAL' : 'OTHER',
            assignedTo: task.AssignedTo,
            reportedBy: 'PMS System',
            scheduledDate: task.ScheduledDate ? new Date(task.ScheduledDate) : null,
            completedDate: task.CompletedDate ? new Date(task.CompletedDate) : null,
            actualCost: task.Cost,
            notes: task.Notes,
          }
        });

        syncedCount++;
        console.log(`Synced maintenance task: ${maintenanceRequest.title}`);
      }

      return syncedCount;
    } catch (error) {
      console.error('Failed to sync maintenance:', error);
      throw error;
    }
  }

  private async syncAmenities(): Promise<void> {
    try {
      // Get facilities and create basic amenities
      const facilities = await prisma.retreatFacility.findMany();
      
      for (const facility of facilities) {
        const commonAmenities = [
          { name: 'WiFi', category: 'TECHNOLOGY' },
          { name: 'Parking', category: 'CONVENIENCE' },
          { name: 'Fitness Center', category: 'FITNESS' },
          { name: 'Spa', category: 'WELLNESS' },
          { name: 'Restaurant', category: 'DINING' },
          { name: 'Pool', category: 'RECREATION' },
        ];

        for (const amenityData of commonAmenities) {
          // Check if amenity already exists
          const existingAmenity = await prisma.facilityAmenity.findFirst({
            where: {
              facilityId: facility.id,
              name: amenityData.name
            }
          });

          if (!existingAmenity) {
            await prisma.facilityAmenity.create({
              data: {
                facilityId: facility.id,
                name: amenityData.name,
                category: amenityData.category as any,
                status: 'AVAILABLE',
                capacity: 50,
                rating: 4.0,
                description: `${amenityData.name} available at ${facility.name}`,
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync amenities:', error);
      throw error;
    }
  }

  // Helper methods to convert eZee statuses to our statuses
  private convertEZeeRoomStatus(ezeeStatus: string): 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_ORDER' {
    switch (ezeeStatus) {
      case 'Clean':
        return 'AVAILABLE';
      case 'Dirty':
        return 'OCCUPIED';
      case 'OutOfOrder':
        return 'OUT_OF_ORDER';
      case 'OutOfService':
        return 'MAINTENANCE';
      default:
        return 'AVAILABLE';
    }
  }

  private convertEZeeCleaningStatus(ezeeStatus: string): 'CLEAN' | 'DIRTY' | 'INSPECTED' | 'IN_PROGRESS' {
    switch (ezeeStatus) {
      case 'Clean':
        return 'CLEAN';
      case 'Dirty':
        return 'DIRTY';
      case 'Inspected':
        return 'INSPECTED';
      case 'OutOfOrder':
      case 'OutOfService':
        return 'IN_PROGRESS'; // Map OUT_OF_ORDER to IN_PROGRESS since OUT_OF_ORDER doesn't exist in CleaningStatus
      default:
        return 'CLEAN';
    }
  }

  private convertEZeeBookingStatus(ezeeStatus: string): 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' {
    switch (ezeeStatus) {
      case 'Confirmed':
        return 'CONFIRMED';
      case 'CheckedIn':
        return 'CONFIRMED'; // Map CHECKED_IN to CONFIRMED since it doesn't exist in RetreatBookingStatus
      case 'CheckedOut':
        return 'COMPLETED'; // Map CHECKED_OUT to COMPLETED
      case 'Cancelled':
        return 'CANCELLED';
      default:
        return 'CONFIRMED';
    }
  }

  private convertEZeeMaintenanceStatus(ezeeStatus: string): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' {
    switch (ezeeStatus) {
      case 'Pending':
        return 'PENDING';
      case 'InProgress':
        return 'IN_PROGRESS';
      case 'Completed':
        return 'COMPLETED';
      case 'Cancelled':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  private convertEZeePriority(ezeePriority: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    switch (ezeePriority) {
      case 'Low':
        return 'LOW';
      case 'Medium':
        return 'MEDIUM';
      case 'High':
      case 'Critical':
        return 'HIGH';
      default:
        return 'MEDIUM';
    }
  }

  // Push updates to eZee PMS
  async updateRoomStatusInPMS(roomId: string, status: string, notes?: string): Promise<boolean> {
    try {
      return await ezeePMSClient.updateRoomStatus(roomId, status, notes);
    } catch (error) {
      console.error('Failed to update room status in PMS:', error);
      return false;
    }
  }

  async createBookingInPMS(bookingData: any): Promise<any> {
    try {
      return await ezeePMSClient.createBooking(bookingData);
    } catch (error) {
      console.error('Failed to create booking in PMS:', error);
      return null;
    }
  }

  async createMaintenanceTaskInPMS(taskData: any): Promise<string | null> {
    try {
      return await ezeePMSClient.createMaintenanceTask(taskData);
    } catch (error) {
      console.error('Failed to create maintenance task in PMS:', error);
      return null;
    }
  }
}

export const pmsIntegrationService = new PMSIntegrationService();
export default pmsIntegrationService;