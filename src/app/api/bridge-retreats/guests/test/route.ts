import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing eZee PMS connection and data retrieval...');
    
    // Test connection
    const connectionTest = await ezeePMSClient.testEZeeConnection();
    console.log('Connection test result:', connectionTest);
    
    // Test guest data retrieval
    const guests = await ezeePMSClient.getGuests();
    console.log('Guest retrieval test:', {
      totalGuests: guests.length,
      sampleGuest: guests[0] ? {
        id: guests[0].GuestID,
        name: guests[0].GuestName,
        email: guests[0].Email,
        phone: guests[0].Phone,
        totalBookings: guests[0].TotalBookings,
        totalSpent: guests[0].TotalSpent
      } : null
    });
    
    // Test booking data retrieval
    const bookings = await ezeePMSClient.getGuestBookings();
    console.log('Booking retrieval test:', {
      totalBookings: bookings.length,
      sampleBooking: bookings[0] || null
    });
    
    return NextResponse.json({
      success: true,
      connectionTest,
      guestData: {
        totalGuests: guests.length,
        sampleGuest: guests[0] || null
      },
      bookingData: {
        totalBookings: bookings.length,
        sampleBooking: bookings[0] || null
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('eZee PMS test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 