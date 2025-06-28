import { NextResponse } from 'next/server';
import { ezeePMSClient as ezeeClient } from '@/lib/ezee-pms-client';

export async function GET() {
  try {
    console.log('=== Testing Booking Guest Retrieval ===');
    
    // Test connection first
    const connectionTest = await ezeeClient.testEZeeConnection();
    console.log('Connection test result:', connectionTest);
    
    // Test booking retrieval
    console.log('Testing booking retrieval...');
    const bookings = await ezeeClient.getBookings();
    console.log('Total bookings retrieved:', bookings.length);
    
    // Test booking guest extraction specifically
    console.log('Testing booking guest extraction...');
    const bookingGuests = await (ezeeClient as any).getAllGuestsFromBookings();
    console.log('Total booking guests extracted:', bookingGuests.length);
    
    // Test the full guest comparison
    console.log('Testing full guest comparison...');
    const guestComparison = await ezeeClient.getGuestsWithBookingComparison();
    
    const testResults = {
      timestamp: new Date().toISOString(),
      connection: connectionTest,
      bookingStats: {
        totalBookings: bookings.length,
        sampleBooking: bookings[0] || null,
        bookingGuests: bookingGuests.length,
        sampleBookingGuest: bookingGuests[0] || null
      },
      guestComparisonStats: guestComparison.comparisonStats,
      sampleData: {
        allGuests: guestComparison.allGuests.slice(0, 3),
        guestsWithBookings: guestComparison.guestsWithBookings.slice(0, 3),
        guestsWithoutBookings: guestComparison.guestsWithoutBookings.slice(0, 3)
      },
      detailedBreakdown: {
        totalUniqueGuests: guestComparison.allGuests.length,
        guestsWithBookings: guestComparison.guestsWithBookings.length,
        guestsWithoutBookings: guestComparison.guestsWithoutBookings.length,
        guestsWithRealEmails: guestComparison.allGuests.filter(g => g.Email && g.Email.length > 0 && !g.Email.includes('example')).length,
        guestsWithFinancialData: guestComparison.allGuests.filter(g => (g.TotalSpent || 0) > 0).length,
        guestsWithBookingHistory: guestComparison.allGuests.filter(g => g.BookingHistory && g.BookingHistory.length > 0).length
      }
    };
    
    console.log('=== Test Results Summary ===');
    console.log('Connection Success:', connectionTest.success);
    console.log('Total Bookings:', bookings.length);
    console.log('Booking Guests:', bookingGuests.length);
    console.log('Total Unique Guests:', guestComparison.allGuests.length);
    console.log('Guests With Bookings:', guestComparison.guestsWithBookings.length);
    console.log('Guests Without Bookings:', guestComparison.guestsWithoutBookings.length);
    
    return NextResponse.json({
      success: true,
      message: 'Booking guest retrieval test completed',
      data: testResults
    });
    
  } catch (error) {
    console.error('Booking guest test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Booking guest test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 