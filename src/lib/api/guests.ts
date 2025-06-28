// Guest API utility functions

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: string;
  nationality?: string;
  country?: string;
  passportNumber?: string;
  gender?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'VIP' | 'BLACKLISTED';
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  addressPostalCode?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  emergencyContactRelation?: string;
  
  // Preferences
  dietaryRestrictions: string[];
  roomTypePreference?: string;
  bedTypePreference?: string;
  smokingPreference?: string;
  specialRequests: string[];
  
  // Medical Information
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  
  // Loyalty Program
  loyaltyPoints: number;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyProgramActive: boolean;
  marketingConsent: boolean;
  
  // Profile
  profileImage?: string;
  notes?: string;
  
  // Computed fields
  totalStays?: number;
  averageRating?: number;
  totalSpent?: number;
  lastStay?: any;
  lastBookingDate?: string;
  bookingHistory?: {
    id: string;
    checkIn: string;
    checkOut: string;
    status: string;
    amount: number;
    room?: string;
  }[];
  
  // Timestamps
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestFilters {
  search?: string;
  status?: string;
  nationality?: string;
  page?: number;
  limit?: number;
}

export interface GuestListResponse {
  guests: Guest[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  statistics: {
    totalGuests: number;
    activeGuests: number;
    vipGuests: number;
    newThisMonth: number;
    avgStays: number;
    totalLoyaltyPoints: number;
  };
}

export interface CreateGuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  gender?: string;
  status?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  };
  preferences?: {
    dietaryRestrictions?: string[];
    roomType?: string;
    bedType?: string;
    smokingPreference?: string;
    specialRequests?: string[];
  };
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  loyaltyProgram?: boolean;
  marketingConsent?: boolean;
  profileImage?: string;
  notes?: string;
}

export interface CheckInGuest {
  id: string;
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  booking: {
    id: string;
    retreat: {
      title: string;
      startDate: string;
      endDate: string;
      location: string;
    };
    roomNumber: string;
    checkInTime: string;
    specialRequests: string[];
    totalAmount: number;
  };
  preferences: {
    dietaryRestrictions: string[];
  };
  emergencyContact: {
    name?: string;
    phone?: string;
  };
  status: 'pending' | 'in-progress' | 'completed';
  arrivalTime?: string;
}

export interface CheckOutGuest {
  id: string;
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  booking: {
    id: string;
    retreat: {
      title: string;
      startDate: string;
      endDate: string;
      location: string;
    };
    roomNumber: string;
    checkOutTime: string;
    totalAmount: number;
    paidAmount: number;
    outstandingBalance: number;
  };
  status: 'pending' | 'in-progress' | 'completed';
  checkInDate?: string;
  actualCheckOutTime?: string;
}

// API Functions

export async function fetchGuests(filters: GuestFilters = {}): Promise<GuestListResponse> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.nationality) params.append('nationality', filters.nationality);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`/api/bridge-retreats/guests?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch guests');
  }
  
  return response.json();
}

export async function fetchGuest(id: string): Promise<{ guest: Guest }> {
  const response = await fetch(`/api/bridge-retreats/guests/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch guest');
  }
  
  return response.json();
}

export async function createGuest(data: CreateGuestData): Promise<{ guest: Guest }> {
  const response = await fetch('/api/bridge-retreats/guests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create guest');
  }
  
  return response.json();
}

export async function updateGuest(id: string, data: Partial<CreateGuestData>): Promise<{ guest: Guest }> {
  const response = await fetch(`/api/bridge-retreats/guests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update guest');
  }
  
  return response.json();
}

export async function deleteGuest(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/bridge-retreats/guests/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete guest');
  }
  
  return response.json();
}

export async function fetchCheckInGuests(date?: string, search?: string): Promise<{ guests: CheckInGuest[] }> {
  const params = new URLSearchParams();
  
  if (date) params.append('date', date);
  if (search) params.append('search', search);

  const response = await fetch(`/api/bridge-retreats/guests/check-in?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch check-in guests');
  }
  
  return response.json();
}

export async function processCheckIn(
  bookingId: string, 
  checkInData: any, 
  staffMember?: string
): Promise<{ message: string; booking: any }> {
  const response = await fetch('/api/bridge-retreats/guests/check-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bookingId,
      checkInData,
      staffMember,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process check-in');
  }
  
  return response.json();
}

export async function fetchCheckOutGuests(date?: string, search?: string): Promise<{ guests: CheckOutGuest[] }> {
  const params = new URLSearchParams();
  
  if (date) params.append('date', date);
  if (search) params.append('search', search);

  const response = await fetch(`/api/bridge-retreats/guests/check-out?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch check-out guests');
  }
  
  return response.json();
}

export async function processCheckOut(
  bookingId: string, 
  checkOutData: any, 
  feedback?: any, 
  staffMember?: string
): Promise<{ message: string; booking: any; finalAmount: number }> {
  const response = await fetch('/api/bridge-retreats/guests/check-out', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bookingId,
      checkOutData,
      feedback,
      staffMember,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process check-out');
  }
  
  return response.json();
} 
 
 
 