import { NextRequest, NextResponse } from 'next/server';
import pmsIntegrationService from '@/lib/pms-integration-service';

export async function POST(request: NextRequest) {
  try {
    const { syncType = 'full' } = await request.json();
    
    // Validate sync type
    const validSyncTypes = ['full', 'rooms', 'bookings', 'housekeeping', 'maintenance', 'facilities', 'amenities'];
    if (!validSyncTypes.includes(syncType)) {
      return NextResponse.json(
        { error: 'Invalid sync type' },
        { status: 400 }
      );
    }
    
    // Prepare sync options
    const syncOptions = {
      rooms: syncType === 'full' || syncType === 'rooms',
      bookings: syncType === 'full' || syncType === 'bookings',
      housekeeping: syncType === 'full' || syncType === 'housekeeping',
      maintenance: syncType === 'full' || syncType === 'maintenance',
      facilities: syncType === 'full' || syncType === 'facilities',
      amenities: syncType === 'full' || syncType === 'amenities',
    };
    
    // Perform synchronization
    const result = await pmsIntegrationService.syncAllData(syncOptions);
    
    if (result.syncStatus === 'error') {
      return NextResponse.json(
        { 
          error: result.errorMessage || 'Sync failed',
          status: result 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `${syncType} synchronization completed successfully`,
      status: result
    });
  } catch (error) {
    console.error('Error performing PMS sync:', error);
    return NextResponse.json(
      { 
        error: 'Sync operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 