import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';

const ezeePMS = ezeePMSClient;

// GET /api/bridge-retreats/guests - Get all guests from eZee PMS with booking comparison
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching guests from eZee PMS with booking comparison...');

    // Get guests and bookings separately from eZee PMS
    const [allGuests, allBookings] = await Promise.all([
      ezeePMS.getGuests(),
      ezeePMS.getBookings()
    ]);
    
    console.log(`Retrieved ${allGuests.length} guests and ${allBookings.length} bookings from eZee PMS`);

    // Transform all guests to match the required structure
    const transformedGuests = allGuests.map((guest: any) => {
      console.log('Transforming guest:', {
        id: guest.Id,
        name: guest.AccountName || guest.Contact_person,
        email: guest.Email,
        vipStatus: guest.VIPStatus,
        country: guest.Country
      });
      
      return {
        id: guest.Id,
        guestName: guest.AccountName || guest.Contact_person || 'Unknown Guest',
        firstName: (guest.AccountName || guest.Contact_person || '').split(' ')[0] || '',
        lastName: (guest.AccountName || guest.Contact_person || '').split(' ').slice(1).join(' ') || '',
        country: guest.Country,
        email: guest.Email,
        phone: guest.Phone,
        mobile: guest.Mobile,
        vipStatus: guest.VIPStatus || 'Standard',
        city: guest.City,
        state: guest.State,
        address: guest.Address,
        postalCode: guest.PostalCode,
        nationality: guest.Nationality || guest.Country,
        dateOfBirth: guest.DateOfBirth,
        gender: guest.Gender,
        totalBookings: 0, // Will be calculated from bookings
        totalStays: 0, // Will be calculated from bookings
        totalSpent: 0, // Will be calculated from bookings
        lastBookingDate: null, // Will be calculated from bookings
        bookingHistory: [],
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        notes: guest.TaxId ? `Tax ID: ${guest.TaxId}` : '',
        preferences: [],
        emergencyContact: null
      };
    });

    // Create guest lookup map for bookings
    const guestBookingMap = new Map();
    allBookings.forEach((booking: any) => {
      const guestId = booking.GuestID || booking.UniqueID;
      if (!guestBookingMap.has(guestId)) {
        guestBookingMap.set(guestId, []);
      }
      guestBookingMap.get(guestId).push(booking);
    });

    // Calculate booking statistics for each guest
    const enrichedGuests = transformedGuests.map(guest => {
      const guestBookings = guestBookingMap.get(guest.id) || [];
      const totalBookings = guestBookings.length;
      const totalSpent = guestBookings.reduce((sum: number, booking: any) => 
        sum + (booking.TotalAmountAfterTax || booking.TotalAmount || 0), 0);
      const lastBookingDate = guestBookings.length > 0 ? 
        Math.max(...guestBookings.map((b: any) => new Date(b.Start || b.CheckIn || '').getTime())) : null;

      return {
        ...guest,
        totalBookings,
        totalStays: totalBookings,
        totalSpent,
        lastBookingDate: lastBookingDate ? new Date(lastBookingDate).toISOString() : null,
        bookingHistory: guestBookings
      };
    });

    // Transform comparison data for frontend
    const guestsWithBookings = enrichedGuests.filter(guest => guest.totalBookings > 0);
    const guestsWithoutBookings = enrichedGuests.filter(guest => guest.totalBookings === 0);

    // For booking-only guests, we'll create them from bookings that don't have corresponding guests
    const guestIds = new Set(allGuests.map((g: any) => g.Id));
    const bookingOnlyGuests = allBookings
      .filter(booking => !guestIds.has(booking.GuestID || booking.UniqueID))
      .map((booking: any) => ({
        id: booking.GuestID || booking.UniqueID,
        guestName: `${booking.FirstName || ''} ${booking.LastName || ''}`.trim() || 'Unknown Guest',
        firstName: booking.FirstName || '',
        lastName: booking.LastName || '',
        country: booking.Country || 'Unknown',
        email: booking.Email,
        phone: booking.Phone,
        mobile: booking.Mobile || booking.Phone,
        vipStatus: 'Standard',
        city: booking.City || '',
        state: booking.State || '',
        address: booking.Address || '',
        postalCode: booking.Zipcode || '',
        nationality: booking.Country || '',
        dateOfBirth: '',
        gender: booking.Gender || '',
        totalBookings: 1,
        totalSpent: booking.TotalAmountAfterTax || booking.TotalAmount || 0,
        lastBookingDate: booking.Start || booking.CheckIn,
        createdDate: booking.Start || booking.CheckIn || new Date().toISOString(),
        updatedDate: booking.Start || booking.CheckIn || new Date().toISOString(),
        notes: '',
        preferences: [],
        emergencyContact: null
      }));

    // Calculate comprehensive statistics
    const stats = {
      totalGuests: enrichedGuests.length,
      vipGuests: enrichedGuests.filter((g: any) => g.vipStatus === 'VIP' || g.vipStatus === 'VVIP').length,
      corporateGuests: enrichedGuests.filter((g: any) => g.vipStatus === 'Corporate').length,
      regularGuests: enrichedGuests.filter((g: any) => g.vipStatus === 'Standard' || g.vipStatus === 'Regular').length,
      totalBookingsByGuests: enrichedGuests.reduce((sum: number, g: any) => sum + g.totalBookings, 0),
      totalRevenueFromGuests: enrichedGuests.reduce((sum: number, g: any) => sum + g.totalSpent, 0),
      averageSpentPerGuest: enrichedGuests.length > 0 ? 
        enrichedGuests.reduce((sum: number, g: any) => sum + g.totalSpent, 0) / enrichedGuests.length : 0,
      countries: Array.from(new Set(enrichedGuests.map((g: any) => g.country).filter(Boolean))).length,
      // Comparison statistics
      guestsWithBookings: guestsWithBookings.length,
      guestsWithoutBookings: guestsWithoutBookings.length,
      bookingOnlyGuests: bookingOnlyGuests.length,
      guestsInDatabase: allGuests.length,
      guestsFromBookings: allBookings.length
    };

    return NextResponse.json({
      guests: enrichedGuests,
      guestsWithBookings,
      guestsWithoutBookings,
      bookingOnlyGuests,
      comparisonStats: {
        totalUniqueGuests: allGuests.length,
        guestsInDatabase: allGuests.length,
        guestsFromBookings: allBookings.length,
        guestsWithBookingHistory: guestsWithBookings.length,
        guestsWithoutBookingHistory: guestsWithoutBookings.length,
        bookingOnlyGuests: bookingOnlyGuests.length
      },
      stats,
      source: 'eZee PMS',
      lastSync: new Date().toISOString(),
      total: enrichedGuests.length
    });

  } catch (error) {
    console.error('Error fetching guests from eZee PMS:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch guests from eZee PMS',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Please check eZee PMS API credentials and connection',
        guests: [],
        stats: {
          totalGuests: 0,
          vipGuests: 0,
          corporateGuests: 0,
          regularGuests: 0
        },
        apiStatus: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/guests - Create new guest in eZee PMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating guest in eZee PMS:', body);
    
    const {
      guestName,
      firstName,
      lastName,
      email,
      phone,
      mobile,
      country,
      city,
      state,
      address,
      postalCode,
      nationality,
      dateOfBirth,
      gender,
      vipStatus,
      notes,
      preferences,
      emergencyContact
    } = body;

    // Validate required fields
    if (!guestName && (!firstName || !lastName)) {
      return NextResponse.json(
        { error: 'Guest name or first/last name is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const guestData = {
      GuestName: guestName || `${firstName} ${lastName}`,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Phone: phone,
      Mobile: mobile || phone,
      Country: country,
      City: city,
      State: state,
      Address: address,
      PostalCode: postalCode,
      Nationality: nationality,
      DateOfBirth: dateOfBirth,
      Gender: gender,
      VIPStatus: vipStatus || 'Regular',
      Notes: notes,
      Preferences: preferences || [],
      EmergencyContact: emergencyContact
    };

    const createdGuest = await ezeePMS.createGuest(guestData);
    
    if (!createdGuest) {
      throw new Error('Failed to create guest in eZee PMS');
    }

    return NextResponse.json({
      success: true,
      guest: createdGuest,
      message: 'Guest created successfully in eZee PMS'
    });

  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/bridge-retreats/guests - Update guest in eZee PMS
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, updates } = body;

    console.log('Updating guest in eZee PMS:', guestId, updates);

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      );
    }

    const guestUpdates = {
      GuestName: updates.guestName,
      FirstName: updates.firstName,
      LastName: updates.lastName,
      Email: updates.email,
      Phone: updates.phone,
      Mobile: updates.mobile,
      Country: updates.country,
      City: updates.city,
      State: updates.state,
      Address: updates.address,
      PostalCode: updates.postalCode,
      Nationality: updates.nationality,
      DateOfBirth: updates.dateOfBirth,
      Gender: updates.gender,
      VIPStatus: updates.vipStatus,
      Notes: updates.notes,
      Preferences: updates.preferences,
      EmergencyContact: updates.emergencyContact
    };

    const success = await ezeePMS.updateGuest(guestId, guestUpdates);
    
    if (!success) {
      throw new Error('Failed to update guest in eZee PMS');
    }

    return NextResponse.json({
      success: true,
      message: 'Guest updated successfully in eZee PMS'
    });

  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 