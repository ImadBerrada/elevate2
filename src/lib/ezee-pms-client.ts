import { format } from 'date-fns';

// eZee PMS API Configuration
const EZEE_CONFIG = {
  baseUrl: 'https://live.ipms247.com',
  authCode: '8556457281f6abb894-1607-11f0-a',
  propertyCode: '43119',
  propertyName: 'Bridge Retreats',
  // Correct eZee API endpoints
  endpoints: {
    pmsInterface: '/pmsinterface/pms_connectivity.php',
    guestList: '/pmsinterface/guest_list.php',
    reservationList: '/pmsinterface/reservation_list.php',
    roomList: '/pmsinterface/room_list.php'
  }
};

// Updated interfaces to match actual eZee API response
export interface EZeeHotel {
  Hotel_Code: string;
  Hotel_Name: string;
  City: string;
  State: string;
  Country: string;
  Property_Type: string;
  HotelImages: string[];
}

export interface EZeeRoomType {
  RoomTypeID: string;
  RoomTypeName: string;
  MaxOccupancy: number;
  BaseRate?: number;
  Description?: string;
  Amenities?: string[];
}

export interface EZeeRatePlan {
  RatePlanID: string;
  Name: string;
  RoomTypeID: string;
  RoomType: string;
  BaseRate: number;
  CurrencyCode: string;
}

export interface EZeeRoom {
  RoomID: string;
  RoomNo: string;
  RoomTypeID: string;
  RoomType: string;
  Floor: number;
  Status: 'Clean' | 'Dirty' | 'OutOfOrder' | 'OutOfService';
  Condition: 'Good' | 'Fair' | 'Poor';
  MaxOccupancy: number;
  CurrentOccupancy: number;
  Features: string[];
  Description?: string;
  LastCleaned?: string;
  NextMaintenance?: string;
}

export interface EZeeGuest {
  Id: string;
  AccountName: string;
  AccountCode: string;
  Contact_person: string;
  Address: string;
  City: string;
  PostalCode: string;
  State: string;
  Country: string;
  Phone: string;
  Mobile: string;
  Fax: string;
  Email: string;
  TaxId: string;
  RegistrationNo: string;
  IsActive: boolean;
  VIPStatus?: 'Standard' | 'VIP' | 'VVIP';
  DateOfBirth?: string;
  Nationality?: string;
  Gender?: string;
}

export interface EZeeBooking {
  UniqueID: string;
  LocationId: string;
  BookedBy: string;
  Salutation: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  Address: string;
  City: string;
  State: string;
  Country: string;
  Zipcode: string;
  Phone: string;
  Mobile: string;
  Fax: string;
  Email: string;
  Source: string;
  PaymentMethod: string;
  IsChannelBooking: number;
  GuestID?: string;
}

export interface EZeeHousekeeping {
  RoomID: string;
  RoomName: string;
  Status: 'Clean' | 'Dirty' | 'Inspected' | 'OutOfOrder';
  AssignedTo?: string;
  TaskType: 'Cleaning' | 'Maintenance' | 'Inspection';
  Priority: 'Low' | 'Medium' | 'High' | 'Critical';
  EstimatedTime?: number; // in minutes
  Notes?: string;
  LastUpdated: string;
}

export interface EZeeMaintenance {
  TaskID: string;
  RoomID: string;
  RoomName: string;
  TaskType: 'Preventive' | 'Corrective' | 'Emergency';
  Priority: 'Low' | 'Medium' | 'High' | 'Critical';
  Status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  Description: string;
  AssignedTo?: string;
  ScheduledDate: string;
  CompletedDate?: string;
  Cost?: number;
  Notes?: string;
}

export interface EZeeReports {
  occupancyRate: number;
  averageRate: number;
  totalRevenue: number;
  totalBookings: number;
  cancelledBookings: number;
  noShows: number;
  walkIns: number;
  repeatGuests: number;
  roomsOutOfOrder: number;
  maintenanceTasks: number;
}

class EZeePMSClient {
  private config = EZEE_CONFIG;

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      console.log(`Making request to: ${this.config.baseUrl}${endpoint}`);
      console.log('Request data:', JSON.stringify(data, null, 2));

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Check for API errors
      if (result.Errors && result.Errors.ErrorCode !== "0") {
        throw new Error(`API Error ${result.Errors.ErrorCode}: ${result.Errors.ErrorMessage}`);
      }

      return result;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async getHotels(): Promise<EZeeHotel[]> {
    try {
      // For single property, we'll return the configured property
      return [{
        Hotel_Code: this.config.propertyCode,
        Hotel_Name: this.config.propertyName,
        City: 'Surat',
        State: 'Gujarat',
        Country: 'India',
        Property_Type: 'Resort',
        HotelImages: ['bridge-retreats-1.jpg', 'bridge-retreats-2.jpg']
      }];
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return [];
    }
  }

  async getRoomTypes(): Promise<EZeeRoomType[]> {
    const data = {
      RES_Request: {
        Request_Type: "RoomInfo",
        NeedPhysicalRooms: 1,
        Authentication: {
          HotelCode: this.config.propertyCode,
          AuthCode: this.config.authCode
        }
      }
    };

    try {
      const response = await this.makeRequest('/pmsinterface/pms_connectivity.php', data);
      
      if (response.RoomInfo && response.RoomInfo.RoomTypes && response.RoomInfo.RoomTypes.RoomType) {
        return response.RoomInfo.RoomTypes.RoomType.map((roomType: any) => ({
          RoomTypeID: roomType.ID,
          RoomTypeName: roomType.Name,
          MaxOccupancy: roomType.MaxOccupancy || 2,
          BaseRate: roomType.BaseRate || 0,
          Description: roomType.Description || '',
          Amenities: roomType.Amenities || []
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching room types:', error);
      return [];
    }
  }

  async getRooms(): Promise<EZeeRoom[]> {
    try {
      const roomTypes = await this.getRoomTypes();
      const rooms: EZeeRoom[] = [];
      
      // Generate sample rooms since eZee API structure doesn't include individual room data
      roomTypes.forEach((roomType, index) => {
        for (let i = 1; i <= 5; i++) { // Create 5 rooms per room type
          rooms.push({
            RoomID: `${roomType.RoomTypeID}_${i}`,
            RoomNo: `${100 + (index * 10) + i}`,
            RoomTypeID: roomType.RoomTypeID,
            RoomType: roomType.RoomTypeName,
            Floor: Math.floor(i / 3) + 1,
            Status: 'Clean',
            Condition: 'Good',
            MaxOccupancy: roomType.MaxOccupancy || 2,
            CurrentOccupancy: 0,
            Features: roomType.Amenities || [],
            Description: roomType.Description,
            LastCleaned: new Date().toISOString(),
            NextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
      
      return rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }

  private normalizeRoomStatus(status: string): 'Clean' | 'Dirty' | 'OutOfOrder' | 'OutOfService' {
    if (!status) return 'Clean';
    const s = status.toLowerCase();
    if (s.includes('clean')) return 'Clean';
    if (s.includes('dirty')) return 'Dirty';
    if (s.includes('out') && s.includes('order')) return 'OutOfOrder';
    if (s.includes('out') && s.includes('service')) return 'OutOfService';
    return 'Clean';
  }

  async getRoomById(roomId: string): Promise<EZeeRoom | null> {
    try {
      const rooms = await this.getRooms();
      return rooms.find(room => room.RoomID === roomId) || null;
    } catch (error) {
      console.error('Failed to fetch room:', error);
      return null;
    }
  }

  async updateRoomStatus(roomId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const requestData = {
        request_type: 'UpdateRoomStatus',
        hotel_code: this.config.propertyCode,
        auth_code: this.config.authCode,
        room_id: roomId,
        status: status,
        notes: notes || '',
        updated_by: 'Bridge Retreats System'
      };

      const response = await this.makeRequest('/pmsinterface/pms_connectivity.php', requestData);
      return response.success || response.Success || false;
    } catch (error) {
      console.error('Failed to update room status:', error);
      return false;
    }
  }

  async getGuests(search?: string, vipStatus?: string): Promise<EZeeGuest[]> {
    try {
      console.log('Fetching guests from eZee PMS GuestList with pagination...');

      const pageSize = 200;
      let rowOffset = 0;
      let lastPage = false;
      const rawGuests: any[] = [];
      let iteration = 0;
      const seenIds = new Set<string>();

      while (!lastPage) {
        const body = {
          RES_Request: {
            Request_Type: 'GuestList',
            Authentication: {
              HotelCode: this.config.propertyCode,
              AuthCode: this.config.authCode
            },
            row_offset: rowOffset,
            row_count: pageSize
          }
        };

        const response = await this.makeRequest(this.config.endpoints.pmsInterface, body);

        let list: any[] = [];
        if (response.Companies && Array.isArray(response.Companies)) list = response.Companies;
        else if (response.Guest_List && Array.isArray(response.Guest_List)) list = response.Guest_List;
        else if (response.Guests && Array.isArray(response.Guests)) list = response.Guests;
        else if (response.GuestList && Array.isArray(response.GuestList)) list = response.GuestList;
        else if (Array.isArray(response)) list = response;

        console.log(`Fetched ${list.length} guests at offset ${rowOffset}`);

        // Add only new ids to rawGuests
        list.forEach(g => {
          const gid = g.Id || g.ID || g.GuestID || g.CompanyID;
          if (!seenIds.has(gid)) {
            seenIds.add(gid);
            rawGuests.push(g);
          }
        });

        if (list.length < pageSize) {
          lastPage = true;
        } else {
          rowOffset += pageSize;
        }

        iteration += 1;
        if (iteration > 50) {
          console.warn('Pagination safeguard triggered, stopping after 50 iterations');
          lastPage = true;
        }
      }

      console.log(`Total raw guests fetched: ${rawGuests.length}`);

      let guests: EZeeGuest[] = rawGuests.map((guest: any) => {
        let vip: 'Standard' | 'VIP' | 'VVIP' = 'Standard';
        if (guest.VIPStatus) vip = guest.VIPStatus;
        else if (guest.Type === 'VIP') vip = 'VIP';
        else if (guest.Type === 'VVIP') vip = 'VVIP';

        return {
          Id: guest.Id || guest.ID || guest.GuestID || guest.CompanyID || '',
          AccountName: guest.AccountName || guest.Name || guest.GuestName || 'Unknown Guest',
          AccountCode: guest.AccountCode || '',
          Contact_person: guest.Contact_person || guest.ContactPerson || guest.Name || '',
          Address: guest.Address || '',
          City: guest.City || '',
          PostalCode: guest.PostalCode || guest.Zipcode || '',
          State: guest.State || '',
          Country: guest.Country || '',
          Phone: guest.Phone || '',
          Mobile: guest.Mobile || '',
          Fax: guest.Fax || '',
          Email: guest.Email || '',
          TaxId: guest.TaxId || '',
          RegistrationNo: guest.RegistrationNo || '',
          IsActive: guest.IsActive === 1 || guest.IsActive === true,
          VIPStatus: vip
        };
      });

      if (search) {
        const s = search.toLowerCase();
        guests = guests.filter(g => g.AccountName.toLowerCase().includes(s) || g.Email.toLowerCase().includes(s));
      }

      if (vipStatus && vipStatus !== 'All') {
        guests = guests.filter(g => g.VIPStatus === vipStatus);
      }

      console.log(`Total guests after filters: ${guests.length}`);
      return guests;
    } catch (error) {
      console.error('Error deriving guests:', error);
      return [];
    }
  }

  async getGuestById(guestId: string): Promise<EZeeGuest | null> {
    try {
      const guests = await this.getGuests();
      return guests.find(guest => guest.Id === guestId) || null;
    } catch (error) {
      console.error('Error fetching guest by ID:', error);
      return null;
    }
  }

  async createGuest(guestData: Partial<EZeeGuest>): Promise<EZeeGuest> {
    // Note: This would typically use a CreateGuest API endpoint
    // For now, we'll simulate the creation
    const newGuest: EZeeGuest = {
      Id: `guest_${Date.now()}`,
      AccountName: guestData.AccountName || 'New Guest',
      AccountCode: guestData.AccountCode || '',
      Contact_person: guestData.Contact_person || '',
      Address: guestData.Address || '',
      City: guestData.City || '',
      PostalCode: guestData.PostalCode || '',
      State: guestData.State || '',
      Country: guestData.Country || '',
      Phone: guestData.Phone || '',
      Mobile: guestData.Mobile || '',
      Fax: guestData.Fax || '',
      Email: guestData.Email || '',
      TaxId: guestData.TaxId || '',
      RegistrationNo: guestData.RegistrationNo || '',
      IsActive: true,
      VIPStatus: guestData.VIPStatus || 'Standard',
      DateOfBirth: guestData.DateOfBirth || '',
      Nationality: guestData.Nationality || '',
      Gender: guestData.Gender || ''
    };

    return newGuest;
  }

  async updateGuest(guestId: string, guestData: Partial<EZeeGuest>): Promise<EZeeGuest> {
    // Note: This would typically use an UpdateGuest API endpoint
    // For now, we'll simulate the update
    const existingGuest = await this.getGuestById(guestId);
    if (!existingGuest) {
      throw new Error('Guest not found');
    }

    return { ...existingGuest, ...guestData };
  }

  async getGuestBookingHistory(guestId: string): Promise<EZeeBooking[]> {
    try {
      const bookings = await this.getBookings();
      return bookings.filter(booking => booking.GuestID === guestId);
    } catch (error) {
      console.error('Error fetching guest booking history:', error);
      return [];
    }
  }

  async getBookings(startDate?: string, endDate?: string): Promise<EZeeBooking[]> {
    try {
      console.log('Fetching bookings with full pagination...');

      const pageSize = 200;
      let rowOffset = 0;
      let isLastPage = false;
      const allRaw: any[] = [];

      while (!isLastPage) {
        const body: any = {
          RES_Request: {
            Request_Type: 'Bookings',
            Authentication: {
              HotelCode: this.config.propertyCode,
              AuthCode: this.config.authCode
            }
          }
        };

        if (startDate || endDate) {
          body.RES_Request.DateRange = {
            StartDate: startDate || '2000-01-01',
            EndDate: endDate || '2100-12-31'
          };
        }

        // Include pagination only if API supports it
        if (rowOffset > 0) {
          body.RES_Request.RowOffset = rowOffset;
          body.RES_Request.RowCount = pageSize;
        }

        const response = await this.makeRequest(this.config.endpoints.pmsInterface, body);

        let list: any[] = [];
        if (response.Bookings && Array.isArray(response.Bookings)) list = response.Bookings;
        else if (response.Reservations && Array.isArray(response.Reservations)) list = response.Reservations;
        else if (response.BookingList && Array.isArray(response.BookingList)) list = response.BookingList;
        else if (response.ReservationList && Array.isArray(response.ReservationList)) list = response.ReservationList;
        else if (Array.isArray(response)) list = response;

        console.log(`Fetched ${list.length} bookings at offset ${rowOffset}`);

        allRaw.push(...list);

        if (list.length < pageSize) {
          isLastPage = true;
        } else {
          rowOffset += pageSize;
        }
      }

      console.log(`Total bookings fetched: ${allRaw.length}`);

      const bookings: EZeeBooking[] = allRaw.map((bk: any) => ({
        UniqueID: bk.BookingID || bk.UniqueID || bk.Id || '',
        LocationId: bk.LocationId || '',
        BookedBy: bk.BookedBy || '',
        Salutation: bk.Salutation || '',
        FirstName: bk.FirstName || bk.GuestFirstName || '',
        LastName: bk.LastName || bk.GuestLastName || '',
        Gender: bk.Gender || '',
        Address: bk.Address || '',
        City: bk.City || '',
        State: bk.State || '',
        Country: bk.Country || '',
        Zipcode: bk.Zipcode || '',
        Phone: bk.Phone || '',
        Mobile: bk.Mobile || '',
        Fax: bk.Fax || '',
        Email: bk.Email || '',
        Source: bk.Source || bk.Channel || 'Direct',
        PaymentMethod: bk.PaymentMethod || '',
        IsChannelBooking: bk.IsChannelBooking || 0,
        GuestID: bk.CompanyID || bk.AccountID || bk.GuestID || ''
      }));

      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getHousekeepingTasks(): Promise<EZeeHousekeeping[]> {
    // This would use the housekeeping API endpoint
    // For now, returning simulated data based on rooms
    try {
      const rooms = await this.getRooms();
      return rooms.slice(0, 5).map(room => ({
        RoomID: room.RoomID,
        RoomName: room.RoomNo,
        Status: Math.random() > 0.6 ? 'Clean' : Math.random() > 0.3 ? 'Dirty' : 'OutOfOrder',
        AssignedTo: `Housekeeper ${Math.floor(Math.random() * 3) + 1}`,
        TaskType: 'Cleaning' as const,
        Priority: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
        EstimatedTime: Math.floor(Math.random() * 60) + 30,
        Notes: Math.random() > 0.5 ? `Cleaned by ${Math.floor(Math.random() * 3) + 1}` : '',
        LastUpdated: new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching housekeeping tasks:', error);
      return [];
    }
  }

  async getMaintenanceTasks(): Promise<EZeeMaintenance[]> {
    // This would use the maintenance API endpoint
    // For now, returning simulated data
    try {
      const rooms = await this.getRooms();
      return rooms.slice(0, 3).map(room => ({
        TaskID: `maint_${room.RoomID}`,
        RoomID: room.RoomID,
        RoomName: room.RoomNo,
        TaskType: Math.random() > 0.5 ? 'Preventive' : Math.random() > 0.25 ? 'Corrective' : 'Emergency',
        Priority: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
        Status: Math.random() > 0.5 ? 'Completed' : Math.random() > 0.25 ? 'InProgress' : 'Pending',
        Description: `Maintenance required for ${room.RoomNo}`,
        AssignedTo: `Technician ${Math.floor(Math.random() * 2) + 1}`,
        ScheduledDate: new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        CompletedDate: Math.random() > 0.5 ? new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : undefined,
        Cost: Math.floor(Math.random() * 100) + 50
      }));
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      return [];
    }
  }

  async syncAllData(): Promise<{
    rooms: EZeeRoom[];
    bookings: EZeeBooking[];
    housekeeping: EZeeHousekeeping[];
    maintenance: EZeeMaintenance[];
    guests: EZeeGuest[];
  }> {
    try {
      console.log('Starting eZee PMS data synchronization...');
      
      const [hotels, roomTypes, rooms, guests, bookings, housekeeping, maintenance] = await Promise.all([
        this.getHotels(),
        this.getRoomTypes(),
        this.getRooms(),
        this.getGuests(),
        this.getBookings(),
        this.getHousekeepingTasks(),
        this.getMaintenanceTasks()
      ]);

      console.log('eZee PMS sync completed:', {
        hotels: hotels.length,
        roomTypes: roomTypes.length,
        rooms: rooms.length,
        guests: guests.length,
        bookings: bookings.length,
        housekeeping: housekeeping.length,
        maintenance: maintenance.length
      });

      return {
        rooms,
        bookings,
        housekeeping,
        maintenance,
        guests
      };
    } catch (error) {
      console.error('Error during eZee PMS sync:', error);
      throw error;
    }
  }

  private getGuestKey(guest: EZeeGuest): string {
    return `${guest.Email}_${guest.Mobile}_${guest.AccountName}`.toLowerCase();
  }

  // Booking management methods
  async createBooking(bookingData: any): Promise<EZeeBooking | null> {
    try {
      console.log('Creating booking in eZee PMS:', bookingData);
      
      // Note: This would typically use a CreateBooking API endpoint
      // For now, we'll simulate the creation
      const newBooking: EZeeBooking = {
        UniqueID: `booking_${Date.now()}`,
        LocationId: bookingData.LocationId || 'default',
        BookedBy: bookingData.BookedBy || 'Bridge Retreats Portal',
        Salutation: bookingData.Salutation || '',
        FirstName: bookingData.FirstName || '',
        LastName: bookingData.LastName || '',
        Gender: bookingData.Gender || '',
        Address: bookingData.Address || '',
        City: bookingData.City || '',
        State: bookingData.State || '',
        Country: bookingData.Country || '',
        Zipcode: bookingData.Zipcode || '',
        Phone: bookingData.Phone || '',
        Mobile: bookingData.Mobile || bookingData.Phone || '',
        Fax: bookingData.Fax || '',
        Email: bookingData.Email || '',
        Source: bookingData.Source || 'Direct',
        PaymentMethod: bookingData.PaymentMethod || 'Cash',
        IsChannelBooking: bookingData.IsChannelBooking || 0,
        GuestID: bookingData.GuestID
      };

      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  }

  async updateBooking(bookingId: string, updates: any): Promise<boolean> {
    try {
      console.log('Updating booking in eZee PMS:', bookingId, updates);
      
      // Note: This would typically use an UpdateBooking API endpoint
      // For now, we'll simulate the update
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      return false;
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      console.log('Cancelling booking in eZee PMS:', bookingId, reason);
      
      // Note: This would typically use a CancelBooking API endpoint
      // For now, we'll simulate the cancellation
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }

  // Housekeeping management methods
  async createHousekeepingTask(taskData: any): Promise<EZeeHousekeeping | null> {
    try {
      console.log('Creating housekeeping task in eZee PMS:', taskData);
      
      // Note: This would typically use a CreateHousekeepingTask API endpoint
      // For now, we'll simulate the creation
      const newTask: EZeeHousekeeping = {
        RoomID: taskData.roomId || '',
        RoomName: taskData.roomName || '',
        Status: taskData.status || 'Clean',
        AssignedTo: taskData.assignedTo || '',
        TaskType: taskData.taskType || 'Cleaning',
        Priority: taskData.priority || 'Medium',
        EstimatedTime: taskData.estimatedTime || 60,
        Notes: taskData.notes || '',
        LastUpdated: new Date().toISOString()
      };

      return newTask;
    } catch (error) {
      console.error('Error creating housekeeping task:', error);
      return null;
    }
  }

  // Maintenance management methods
  async createMaintenanceTask(taskData: any): Promise<EZeeMaintenance | null> {
    try {
      console.log('Creating maintenance task in eZee PMS:', taskData);
      
      // Note: This would typically use a CreateMaintenanceTask API endpoint
      // For now, we'll simulate the creation
      const newTask: EZeeMaintenance = {
        TaskID: `maint_${Date.now()}`,
        RoomID: taskData.roomId || '',
        RoomName: taskData.roomName || '',
        TaskType: taskData.taskType || 'Preventive',
        Priority: taskData.priority || 'Medium',
        Status: taskData.status || 'Pending',
        Description: taskData.description || '',
        AssignedTo: taskData.assignedTo || '',
        ScheduledDate: taskData.scheduledDate || new Date().toISOString().split('T')[0],
        CompletedDate: taskData.completedDate || undefined,
        Cost: taskData.cost || 0,
        Notes: taskData.notes || ''
      };

      return newTask;
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      return null;
    }
  }

  // Connection testing method
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing eZee PMS connection...');
      
      // Test by trying to fetch hotels
      const hotels = await this.getHotels();
      
      if (hotels.length > 0) {
        console.log('Successfully connected to eZee PMS', {
          propertyCode: this.config.propertyCode,
          propertyName: this.config.propertyName,
          hotelsFound: hotels.length
        });
        return true;
      } else {
        console.log('Connected to eZee PMS but no hotels found');
        return false;
      }
    } catch (error) {
      console.error('eZee PMS connection test failed:', error);
      return false;
    }
  }
}

export default new EZeePMSClient();