import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import ezeePMSClient from '@/lib/ezee-pms-client';

const prisma = new PrismaClient();
const ezeePMS = ezeePMSClient;

// GET /api/bridge-retreats/guests/[id] - Get specific guest by ID from eZee PMS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guestId } = await params;
    console.log('Fetching guest by ID from eZee PMS:', guestId);

    const ezeeGuest = await ezeePMS.getGuestById(guestId);

    if (!ezeeGuest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Transform guest to match the required structure
    const transformedGuest = {
      id: ezeeGuest.GuestID,
      guestName: ezeeGuest.GuestName,
      firstName: ezeeGuest.FirstName,
      lastName: ezeeGuest.LastName,
      country: ezeeGuest.Country,
      email: ezeeGuest.Email,
      phone: ezeeGuest.Phone,
      mobile: ezeeGuest.Mobile,
      vipStatus: ezeeGuest.VIPStatus,
      city: ezeeGuest.City,
      state: ezeeGuest.State,
      address: ezeeGuest.Address,
      postalCode: ezeeGuest.PostalCode,
      nationality: ezeeGuest.Nationality,
      dateOfBirth: ezeeGuest.DateOfBirth,
      gender: ezeeGuest.Gender,
      totalBookings: ezeeGuest.TotalBookings || 0,
      totalSpent: ezeeGuest.TotalSpent || 0,
      lastBookingDate: ezeeGuest.LastBookingDate,
      createdDate: ezeeGuest.CreatedDate,
      updatedDate: ezeeGuest.UpdatedDate,
      notes: ezeeGuest.Notes,
      preferences: ezeeGuest.Preferences || [],
      emergencyContact: ezeeGuest.EmergencyContact
    };

    // Also get guest's booking history
    const bookingHistory = await ezeePMS.getGuestBookingHistory(guestId);

    return NextResponse.json({
      guest: transformedGuest,
      bookingHistory,
      source: 'eZee PMS',
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching guest by ID from eZee PMS:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch guest from eZee PMS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/bridge-retreats/guests/[id] - Update specific guest by ID in eZee PMS
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guestId } = await params;
    const body = await request.json();

    console.log('Updating guest by ID in eZee PMS:', guestId, body);

    const guestUpdates = {
      GuestName: body.guestName,
      FirstName: body.firstName,
      LastName: body.lastName,
      Email: body.email,
      Phone: body.phone,
      Mobile: body.mobile,
      Country: body.country,
      City: body.city,
      State: body.state,
      Address: body.address,
      PostalCode: body.postalCode,
      Nationality: body.nationality,
      DateOfBirth: body.dateOfBirth,
      Gender: body.gender,
      VIPStatus: body.vipStatus,
      Notes: body.notes,
      Preferences: body.preferences,
      EmergencyContact: body.emergencyContact
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
    console.error('Error updating guest by ID:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/bridge-retreats/guests/[id] - Update guest
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if guest exists
    const existingGuest = await prisma.retreatGuest.findUnique({
      where: { id }
    });

    if (!existingGuest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it conflicts with another guest
    if (body.email && body.email !== existingGuest.email) {
      const emailConflict = await prisma.retreatGuest.findUnique({
        where: { email: body.email }
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'A guest with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update the guest
    const updatedGuest = await prisma.retreatGuest.update({
      where: { id },
      data: {
        firstName: body.firstName || existingGuest.firstName,
        lastName: body.lastName || existingGuest.lastName,
        email: body.email || existingGuest.email,
        phone: body.phone !== undefined ? body.phone : existingGuest.phone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : existingGuest.dateOfBirth,
        nationality: body.nationality !== undefined ? body.nationality : existingGuest.nationality,
        passportNumber: body.passportNumber !== undefined ? body.passportNumber : existingGuest.passportNumber,
        gender: body.gender !== undefined ? body.gender : existingGuest.gender,
        status: body.status || existingGuest.status,
        
        // Address
        addressStreet: body.address?.street !== undefined ? body.address.street : existingGuest.addressStreet,
        addressCity: body.address?.city !== undefined ? body.address.city : existingGuest.addressCity,
        addressState: body.address?.state !== undefined ? body.address.state : existingGuest.addressState,
        addressCountry: body.address?.country !== undefined ? body.address.country : existingGuest.addressCountry,
        addressPostalCode: body.address?.postalCode !== undefined ? body.address.postalCode : existingGuest.addressPostalCode,
        
        // Emergency contact
        emergencyContactName: body.emergencyContact?.name !== undefined ? body.emergencyContact.name : existingGuest.emergencyContactName,
        emergencyContactPhone: body.emergencyContact?.phone !== undefined ? body.emergencyContact.phone : existingGuest.emergencyContactPhone,
        emergencyContactEmail: body.emergencyContact?.email !== undefined ? body.emergencyContact.email : existingGuest.emergencyContactEmail,
        emergencyContactRelation: body.emergencyContact?.relationship !== undefined ? body.emergencyContact.relationship : existingGuest.emergencyContactRelation,
        
        // Preferences
        dietaryRestrictions: body.preferences?.dietaryRestrictions !== undefined ? body.preferences.dietaryRestrictions : existingGuest.dietaryRestrictions,
        roomTypePreference: body.preferences?.roomType !== undefined ? body.preferences.roomType : existingGuest.roomTypePreference,
        bedTypePreference: body.preferences?.bedType !== undefined ? body.preferences.bedType : existingGuest.bedTypePreference,
        smokingPreference: body.preferences?.smokingPreference !== undefined ? body.preferences.smokingPreference : existingGuest.smokingPreference,
        specialRequests: body.preferences?.specialRequests !== undefined ? body.preferences.specialRequests : existingGuest.specialRequests,
        
        // Medical information
        medicalConditions: body.medicalConditions !== undefined ? body.medicalConditions : existingGuest.medicalConditions,
        allergies: body.allergies !== undefined ? body.allergies : existingGuest.allergies,
        medications: body.medications !== undefined ? body.medications : existingGuest.medications,
        
        // Loyalty program
        loyaltyProgramActive: body.loyaltyProgram !== undefined ? body.loyaltyProgram : existingGuest.loyaltyProgramActive,
        marketingConsent: body.marketingConsent !== undefined ? body.marketingConsent : existingGuest.marketingConsent,
        
        // Profile
        profileImage: body.profileImage !== undefined ? body.profileImage : existingGuest.profileImage,
        notes: body.notes !== undefined ? body.notes : existingGuest.notes,
      },
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          }
        }
      }
    });

    return NextResponse.json({ guest: updatedGuest });

  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { error: 'Failed to update guest' },
      { status: 500 }
    );
  }
}

// DELETE /api/bridge-retreats/guests/[id] - Delete guest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if guest exists
    const existingGuest = await prisma.retreatGuest.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }
      }
    });

    if (!existingGuest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Check if guest has active bookings
    if (existingGuest.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete guest with active bookings. Please cancel or complete all bookings first.' },
        { status: 400 }
      );
    }

    // Delete the guest (this will cascade delete related records)
    await prisma.retreatGuest.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Guest deleted successfully' });

  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { error: 'Failed to delete guest' },
      { status: 500 }
    );
  }
} 