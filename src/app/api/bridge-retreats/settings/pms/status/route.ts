import { NextRequest, NextResponse } from 'next/server';
import pmsIntegrationService from '@/lib/pms-integration-service';

export async function GET(request: NextRequest) {
  try {
    const status = await pmsIntegrationService.getStatus();
    
    return NextResponse.json({ 
      status,
      message: 'PMS status retrieved successfully' 
    });
  } catch (error) {
    console.error('Error getting PMS status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get PMS status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 