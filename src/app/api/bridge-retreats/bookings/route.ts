import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';

const ezeePMS = ezeePMSClient;

// Helper function to convert eZee booking status to our system status
function convertEZeeStatus(ezeeStatus: string): string {
  switch (ezeeStatus) {
    case 'Confirmed': return 'CONFIRMED';
    case 'CheckedIn': return 'CHECKED_IN';
    case 'CheckedOut': return 'CHECKED_OUT';
    case 'Cancelled': return 'CANCELLED';
    default: return 'PENDING';
  }
}

// Helper function to determine payment status based on booking data
function determinePaymentStatus(booking: any): string {
  // This would typically come from the PMS payment data
  // For now, we'll make educated guesses based on status
  if (booking.Status === 'CheckedOut') return 'PAID';
  if (booking.Status === 'Cancelled') return 'REFUNDED';
  if (booking.Status === 'CheckedIn') return 'PAID';
  if (booking.Status === 'Confirmed') return 'PARTIAL';
  return 'PENDING';
}

// Helper function to calculate booking statistics
function calculateBookingStats(bookings: any[]) {
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.TotalAmount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.Status === 'Confirmed').length;
  const checkedInBookings = bookings.filter(b => b.Status === 'CheckedIn').length;
  const checkedOutBookings = bookings.filter(b => b.Status === 'CheckedOut').length;
  const cancelledBookings = bookings.filter(b => b.Status === 'Cancelled').length;
  const pendingBookings = bookings.filter(b => !['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].includes(b.Status)).length;

  const today = new Date();
  const upcomingBookings = bookings.filter(b => {
    const checkIn = parseISO(b.CheckIn);
    return isAfter(checkIn, today) && ['Confirmed', 'CheckedIn'].includes(b.Status);
  }).length;

  const currentGuests = bookings.filter(b => {
    const checkIn = parseISO(b.CheckIn);
    const checkOut = parseISO(b.CheckOut);
    return b.Status === 'CheckedIn' && isBefore(checkIn, today) && isAfter(checkOut, today);
  }).length;

  return {
    totalBookings,
    totalRevenue,
    confirmedBookings,
    checkedInBookings,
    checkedOutBookings,
    cancelledBookings,
    pendingBookings,
    upcomingBookings,
    currentGuests,
    averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
    occupancyRate: 0 // This would need room capacity data
  };
}

// GET /api/bridge-retreats/bookings - Get all bookings from eZee PMS with guest data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sync = searchParams.get('sync') === 'true';
    const guestsOnly = searchParams.get('guestsOnly') === 'true';

    console.log('Fetching bookings and guests from eZee PMS...');

    // Fetch both bookings and guests from eZee PMS
    const [ezeeBookings, ezeeGuests] = await Promise.all([
      ezeePMS.getBookings(startDate || undefined, endDate || undefined),
      ezeePMS.getGuests()
    ]);
    
    console.log(`Retrieved ${ezeeBookings.length} bookings and ${ezeeGuests.length} guests from eZee PMS`);

    // Create a guest lookup map for faster access
    const guestMap = new Map();
    ezeeGuests.forEach(guest => {
      guestMap.set(guest.Id, guest);
      // Also map by email for fallback lookup
      if (guest.Email) {
        guestMap.set(guest.Email.toLowerCase(), guest);
      }
    });

    // If only guests are requested, return guest data
    if (guestsOnly) {
      // Apply search filter to guests
      let filteredGuests = ezeeGuests;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredGuests = ezeeGuests.filter(guest =>
          (guest.AccountName || guest.Contact_person || '').toLowerCase().includes(searchLower) ||
          (guest.Email || '').toLowerCase().includes(searchLower) ||
          (guest.Phone || '').includes(search) ||
          (guest.Mobile || '').includes(search) ||
          (guest.Country || '').toLowerCase().includes(searchLower)
        );
      }

      // Transform guests to match the required structure
      const transformedGuests = filteredGuests.map(guest => ({
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
        nationality: guest.Nationality || guest.Country,
        dateOfBirth: guest.DateOfBirth,
        gender: guest.Gender,
        totalBookings: 0, // Will be calculated from bookings
        totalSpent: 0, // Will be calculated from bookings
        lastBookingDate: null, // Will be calculated from bookings
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        notes: guest.TaxId ? `Tax ID: ${guest.TaxId}` : '',
        preferences: [],
        emergencyContact: null
      }));

      return NextResponse.json({
        guests: transformedGuests,
        total: transformedGuests.length,
        source: 'eZee PMS',
        lastSync: new Date().toISOString()
      });
    }

    // Transform eZee bookings to our format with enriched guest data
    let transformedBookings = ezeeBookings.map(ezeeBooking => {
      const bookingStatus = 'CONFIRMED'; // Default status since eZee interface doesn't have Status
      const paymentStatus = determinePaymentStatus(ezeeBooking);
      
      // Get guest data from the guest map
      let guestData = guestMap.get(ezeeBooking.GuestID || ezeeBooking.UniqueID);
      
      // Fallback: try to find guest by email if not found by ID
      if (!guestData && ezeeBooking.Email) {
        guestData = guestMap.get(ezeeBooking.Email.toLowerCase());
      }
      
      // If no guest data found, create basic guest info from booking
      if (!guestData) {
        guestData = {
          Id: ezeeBooking.GuestID || ezeeBooking.UniqueID,
          AccountName: `${ezeeBooking.FirstName} ${ezeeBooking.LastName}`.trim(),
          Contact_person: `${ezeeBooking.FirstName} ${ezeeBooking.LastName}`.trim(),
          Email: ezeeBooking.Email || '',
          Phone: ezeeBooking.Phone || '',
          Mobile: ezeeBooking.Mobile || ezeeBooking.Phone || '',
          Country: ezeeBooking.Country || 'Unknown',
          City: ezeeBooking.City || '',
          State: ezeeBooking.State || '',
          Address: ezeeBooking.Address || '',
          PostalCode: ezeeBooking.Zipcode || '',
          VIPStatus: 'Standard',
          AccountCode: '',
          Fax: ezeeBooking.Fax || '',
          TaxId: '',
          RegistrationNo: '',
          IsActive: true,
          Gender: ezeeBooking.Gender,
          Nationality: ezeeBooking.Country,
          DateOfBirth: ''
        };
      }
      
      const guestName = guestData.AccountName || guestData.Contact_person || 'Unknown Guest';
      
      return {
        id: ezeeBooking.UniqueID,
        confirmationNumber: ezeeBooking.UniqueID, // Using UniqueID as confirmation
        checkInDate: new Date().toISOString(), // Default check-in date
        checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default checkout (next day)
        guestCount: 1, // Default guest count
        adults: 1, // Default adults
        children: 0, // Default children
        totalAmount: 0, // Default amount
        status: bookingStatus,
        paymentStatus: paymentStatus,
        specialRequests: '',
        source: ezeeBooking.Source || 'Direct',
        createdAt: new Date().toISOString(),
        
        // Enhanced guest information matching the required structure
        guest: {
          id: guestData.Id,
          guestName: guestName,
          firstName: ezeeBooking.FirstName || guestName.split(' ')[0] || '',
          lastName: ezeeBooking.LastName || guestName.split(' ').slice(1).join(' ') || '',
          fullName: guestName,
          country: guestData.Country,
          email: guestData.Email,
          phone: guestData.Phone,
          mobile: guestData.Mobile,
          vipStatus: guestData.VIPStatus || 'Standard',
          city: guestData.City,
          state: guestData.State,
          address: guestData.Address,
          nationality: guestData.Nationality || guestData.Country,
          dateOfBirth: guestData.DateOfBirth,
          gender: guestData.Gender,
          totalBookings: 0,
          totalSpent: 0,
          lastBookingDate: null,
          notes: guestData.TaxId ? `Tax ID: ${guestData.TaxId}` : '',
          preferences: [],
          emergencyContact: null
        },
        
        room: {
          id: ezeeBooking.LocationId || '',
          roomNumber: ezeeBooking.LocationId || 'TBD',
          roomType: 'Standard',
          facility: {
            name: 'Bridge Retreats'
          }
        },
        retreat: {
          id: ezeeBooking.UniqueID,
          title: 'Standard Retreat',
          type: 'Standard',
          location: 'Bridge Retreats',
          price: 0
        },
        // Additional PMS-specific data
        pmsData: {
          bookingId: ezeeBooking.UniqueID,
          confirmationNo: ezeeBooking.UniqueID,
          source: ezeeBooking.Source,
          roomId: ezeeBooking.LocationId,
          guestId: ezeeBooking.GuestID || ezeeBooking.UniqueID,
          lastUpdated: new Date().toISOString()
        }
      };
    });

    // Apply filters
    if (status && status !== 'ALL') {
      transformedBookings = transformedBookings.filter(booking => booking.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      transformedBookings = transformedBookings.filter(booking =>
        booking.guest.firstName.toLowerCase().includes(searchLower) ||
        booking.guest.lastName.toLowerCase().includes(searchLower) ||
        booking.guest.email.toLowerCase().includes(searchLower) ||
        booking.confirmationNumber.toLowerCase().includes(searchLower) ||
        booking.guest.fullName.toLowerCase().includes(searchLower) ||
        booking.guest.phone.includes(search) ||
        booking.guest.mobile.includes(search) ||
        booking.guest.country.toLowerCase().includes(searchLower)
      );
    }

    // Calculate statistics
    const stats = calculateBookingStats(ezeeBookings);

    // Get room types for additional context
    const roomTypes = await ezeePMS.getRoomTypes();

    return NextResponse.json({
      bookings: transformedBookings,
      stats,
      roomTypes,
      guestCount: ezeeGuests.length,
      source: 'eZee PMS',
      lastSync: new Date().toISOString(),
      total: transformedBookings.length
    });

  } catch (error) {
    console.error('Error fetching bookings and guests from eZee PMS:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings and guests from eZee PMS',
        details: error instanceof Error ? error.message : 'Unknown error',
        bookings: [],
        guests: [],
        stats: {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          pendingBookings: 0
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/bridge-retreats/bookings - Create new booking in eZee PMS with guest creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating booking with guest in eZee PMS:', body);
    
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
      nationality,
      dateOfBirth,
      gender,
      vipStatus,
      checkInDate,
      checkOutDate,
      adults,
      children,
      roomType,
      specialRequests,
      totalAmount,
      emergencyContact
    } = body;

    // First, create or update the guest
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
      Nationality: nationality,
      DateOfBirth: dateOfBirth,
      Gender: gender,
      VIPStatus: vipStatus || 'Regular',
      EmergencyContact: emergencyContact
    };

    const createdGuest = await ezeePMS.createGuest(guestData);
    
    if (!createdGuest) {
      throw new Error('Failed to create guest in eZee PMS');
    }

    // Now create the booking with the guest ID
    const bookingData = {
      GuestID: createdGuest.Id,
      GuestName: createdGuest.AccountName || createdGuest.Contact_person,
      Email: createdGuest.Email,
      Phone: createdGuest.Phone,
      CheckIn: checkInDate,
      CheckOut: checkOutDate,
      Adults: adults || 1,
      Children: children || 0,
      RoomType: roomType,
      TotalAmount: totalAmount,
      Status: 'Confirmed' as const,
      Source: 'Bridge Retreats Portal',
      SpecialRequests: specialRequests
    };

    const createdBooking = await ezeePMS.createBooking(bookingData);
    
    if (!createdBooking) {
      throw new Error('Failed to create booking in eZee PMS');
    }

    return NextResponse.json({
      success: true,
      booking: createdBooking,
      guest: createdGuest,
      message: 'Booking and guest created successfully in eZee PMS'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/bridge-retreats/bookings - Update booking in eZee PMS
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, updates } = body;

    console.log('Updating booking in eZee PMS:', bookingId, updates);

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Update guest information if provided
    if (updates.guest) {
      const guestUpdates = {
        GuestName: updates.guest.guestName,
        FirstName: updates.guest.firstName,
        LastName: updates.guest.lastName,
        Email: updates.guest.email,
        Phone: updates.guest.phone,
        Mobile: updates.guest.mobile,
        Country: updates.guest.country,
        City: updates.guest.city,
        State: updates.guest.state,
        VIPStatus: updates.guest.vipStatus
      };

      await ezeePMS.updateGuest(updates.guest.id, guestUpdates);
    }

    // Update booking information
    const bookingUpdates = {
      CheckIn: updates.checkInDate,
      CheckOut: updates.checkOutDate,
      Adults: updates.adults,
      Children: updates.children,
      RoomType: updates.roomType,
      TotalAmount: updates.totalAmount,
      Status: updates.status,
      SpecialRequests: updates.specialRequests
    };

    const success = await ezeePMS.updateBooking(bookingId, bookingUpdates);
    
    if (!success) {
      throw new Error('Failed to update booking in eZee PMS');
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully in eZee PMS'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
          return NextResponse.json(
      { 
        error: 'Failed to update booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bridge-retreats/bookings - Cancel booking in eZee PMS
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const reason = searchParams.get('reason');

    console.log('Cancelling booking in eZee PMS:', bookingId);

    if (!bookingId) {
        return NextResponse.json(
        { error: 'Booking ID is required' },
          { status: 400 }
        );
    }

    const success = await ezeePMS.cancelBooking(bookingId, reason || 'Cancelled by user');
    
    if (!success) {
      throw new Error('Failed to cancel booking in eZee PMS');
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully in eZee PMS'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 