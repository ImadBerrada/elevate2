import { 
  LoginInput, 
  RegisterInput, 
  ActivityInput, 
  ContactInput, 
  BusinessInput, 
  EmployerInput,
  UserInput,
  UpdateUserInput
} from './validations';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Always get the latest token from localStorage to avoid stale token issues
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (currentToken && currentToken !== this.token) {
      this.token = currentToken;
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorData: errorData,
          method: config.method,
          headers: config.headers,
          body: config.body
        });
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Only Super Admins can create managers.');
        } else {
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginInput) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterInput) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.clearToken();
  }

  // Companies endpoints
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.industry) searchParams.set('industry', params.industry);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const query = searchParams.toString();
    return this.request<{
      companies: any[];
      pagination: any;
    }>(`/companies${query ? `?${query}` : ''}`);
  }

  async getCompanyById(id: string) {
    return this.request<any>(`/companies/${id}`);
  }

  async createCompany(data: any) {
    return this.request<any>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: string, data: any) {
    return this.request<any>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: string) {
    return this.request<any>(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async getCompaniesList() {
    return this.request<{
      companies: { id: string; name: string; industry: string; location: string; status: string }[];
    }>('/companies/list');
  }

  // Employees endpoints
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.companyId) searchParams.set('companyId', params.companyId);
    if (params?.department) searchParams.set('department', params.department);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const query = searchParams.toString();
    return this.request<{
      employees: any[];
      pagination: any;
    }>(`/employees${query ? `?${query}` : ''}`);
  }

  async getEmployeeById(id: string) {
    return this.request<any>(`/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request<any>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request<any>(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Employee visa endpoints
  async getEmployeeVisa(employeeId: string) {
    return this.request<any>(`/employees/${employeeId}/visa`);
  }

  async createOrUpdateEmployeeVisa(employeeId: string, data: any) {
    return this.request<any>(`/employees/${employeeId}/visa`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployeeVisa(employeeId: string) {
    return this.request<any>(`/employees/${employeeId}/visa`, {
      method: 'DELETE',
    });
  }

  // Activities endpoints
  async getActivities(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request<{
      activities: any[];
      pagination: any;
    }>(`/activities${query ? `?${query}` : ''}`);
  }

  async createActivity(data: ActivityInput) {
    return this.request<any>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contacts endpoints
  async getContacts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    return this.request<{
      contacts: any[];
      pagination: any;
    }>(`/contacts${query ? `?${query}` : ''}`);
  }

  async createContact(data: ContactInput) {
    return this.request<any>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Businesses endpoints
  async getBusinesses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    return this.request<{
      businesses: any[];
      pagination: any;
    }>(`/businesses${query ? `?${query}` : ''}`);
  }

  async createBusiness(data: BusinessInput) {
    return this.request<any>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Employers endpoints
  async getEmployers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    
    const query = searchParams.toString();
    return this.request<{
      employers: any[];
      pagination: any;
    }>(`/employers${query ? `?${query}` : ''}`);
  }

  async createEmployer(data: EmployerInput) {
    return this.request<any>('/employers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployer(id: string, data: EmployerInput) {
    return this.request<any>(`/employers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployer(id: string) {
    return this.request<any>(`/employers/${id}`, {
      method: 'DELETE',
    });
  }

  // Stats endpoint
  async getStats() {
    return this.request<{
      activities: any;
      contacts: any;
      businesses: any;
      employers: any;
      points: any;
      users?: any;
    }>('/stats');
  }

  // Users endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    return this.request<{
      users: any[];
      pagination: any;
    }>(`/users${query ? `?${query}` : ''}`);
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async createUser(data: UserInput) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserInput) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request<{
      total: number;
      active: number;
      inactive: number;
      suspended: number;
      admins: number;
      managers: number;
      users: number;
      newThisMonth: number;
      byRole: Record<string, number>;
      byStatus: Record<string, number>;
      byCompany: Record<string, number>;
    }>('/users/stats');
  }

  // Asset types endpoints
  async getAssetTypes() {
    return this.request<any[]>('/asset-types');
  }

  async createAssetType(data: any) {
    return this.request<any>('/asset-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Company assets endpoints
  async getCompanyAssets(companyId: string) {
    return this.request<any[]>(`/companies/${companyId}/assets`);
  }

  async createCompanyAsset(companyId: string, data: any) {
    return this.request<any>(`/companies/${companyId}/assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCompanyAssetById(companyId: string, assetId: string) {
    return this.request<any>(`/companies/${companyId}/assets/${assetId}`);
  }

  async updateCompanyAsset(companyId: string, assetId: string, data: any) {
    return this.request<any>(`/companies/${companyId}/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompanyAsset(companyId: string, assetId: string) {
    return this.request<any>(`/companies/${companyId}/assets/${assetId}`, {
      method: 'DELETE',
    });
  }

  // Manager endpoints
  async getManagers(params?: {
    includeAssigned?: boolean;
    companyId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.includeAssigned !== undefined) searchParams.set('includeAssigned', params.includeAssigned.toString());
    if (params?.companyId) searchParams.set('companyId', params.companyId);
    
    const query = searchParams.toString();
    return this.request<{
      managers: any[];
    }>(`/managers${query ? `?${query}` : ''}`);
  }

  async createManager(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar?: string;
    companyId?: string; // Legacy single company support
    companyIds?: string[]; // New multiple companies support
    platforms?: string[];
    permissions?: any;
  }) {
    return this.request<any>('/managers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Manager Assignment endpoints
  async getManagerAssignments(params?: {
    companyId?: string;
    userId?: string;
    isActive?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.companyId) searchParams.set('companyId', params.companyId);
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    
    const query = searchParams.toString();
    return this.request<{
      assignments: any[];
    }>(`/manager-assignments${query ? `?${query}` : ''}`);
  }

  async createManagerAssignment(data: {
    userId: string;
    companyId: string;
    platforms?: string[];
    permissions?: any;
  }) {
    return this.request<any>('/manager-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteManagerAssignment(params: {
    assignmentId?: string;
    userId?: string;
    companyId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.assignmentId) searchParams.set('id', params.assignmentId);
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.companyId) searchParams.set('companyId', params.companyId);
    
    const query = searchParams.toString();
    return this.request<{ message: string }>(`/manager-assignments?${query}`, {
      method: 'DELETE',
    });
  }

  // Bridge Retreats endpoints
  async getRetreats(params?: {
    search?: string;
    type?: string;
    status?: string;
    location?: string;
    instructor?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.instructor) searchParams.set('instructor', params.instructor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<{
      retreats: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/bridge-retreats/retreats${query ? `?${query}` : ''}`);
  }

  async getRetreatById(id: string) {
    return this.request<any>(`/bridge-retreats/retreats/${id}`);
  }

  async createRetreat(data: any) {
    return this.request<any>('/bridge-retreats/retreats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRetreat(id: string, data: any) {
    return this.request<any>(`/bridge-retreats/retreats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRetreat(id: string) {
    return this.request<{ message: string }>(`/bridge-retreats/retreats/${id}`, {
      method: 'DELETE',
    });
  }

  async getRetreatAnalytics(params?: {
    period?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.set('period', params.period);
    
    const query = searchParams.toString();
    return this.request<{
      metrics: any;
      revenueByMonth: any[];
      retreatTypes: any[];
      recentBookings: any[];
      topRetreats: any[];
      satisfactionTrends: any[];
      occupancyData: any[];
    }>(`/bridge-retreats/analytics${query ? `?${query}` : ''}`);
  }

  async getRetreatCalendar(params?: {
    year?: number;
    month?: number;
    view?: string;
    weekStart?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set('year', params.year.toString());
    if (params?.month) searchParams.set('month', params.month.toString());
    if (params?.view) searchParams.set('view', params.view);
    if (params?.weekStart) searchParams.set('weekStart', params.weekStart.toString());
    
    const query = searchParams.toString();
    return this.request<{
      retreats: any[];
      conflicts: string[];
      resourceAvailability: any;
      period: any;
    }>(`/bridge-retreats/calendar${query ? `?${query}` : ''}`);
  }

  // Bridge Retreats Booking endpoints
  async getRetreatBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    guestName?: string;
    retreatId?: string;
    startDate?: string;
    endDate?: string;
    paymentStatus?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.guestName) searchParams.set('guestName', params.guestName);
    if (params?.retreatId) searchParams.set('retreatId', params.retreatId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus);

    const query = searchParams.toString();
    return this.request<{
      bookings: any[];
      pagination: any;
      stats: any;
    }>(`/bridge-retreats/bookings${query ? `?${query}` : ''}`);
  }

  async getRetreatBookingById(id: string) {
    return this.request<any>(`/bridge-retreats/bookings/${id}`);
  }

  async createRetreatBooking(data: any) {
    return this.request<any>('/bridge-retreats/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRetreatBooking(id: string, data: any) {
    return this.request<any>(`/bridge-retreats/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelRetreatBooking(id: string) {
    return this.request<any>(`/bridge-retreats/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteRetreatBooking(id: string) {
    return this.request<any>(`/bridge-retreats/bookings/${id}?action=delete`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateRetreatBookings(action: string, bookingIds: string[], data?: any) {
    return this.request<any>('/bridge-retreats/bookings', {
      method: 'PATCH',
      body: JSON.stringify({ action, bookingIds, data }),
    });
  }

  // Waitlist management
  async getRetreatWaitlist(params?: {
    page?: number;
    limit?: number;
    retreatId?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.retreatId) searchParams.set('retreatId', params.retreatId);
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request<{
      waitlist: any[];
      pagination: any;
    }>(`/bridge-retreats/bookings/waitlist${query ? `?${query}` : ''}`);
  }

  async addToRetreatWaitlist(data: any) {
    return this.request<any>('/bridge-retreats/bookings/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async promoteFromWaitlist(bookingIds: string[]) {
    return this.request<any>('/bridge-retreats/bookings/waitlist', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'promote', bookingIds }),
    });
  }

  async autoPromoteWaitlist(retreatId: string) {
    return this.request<any>('/bridge-retreats/bookings/waitlist', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'autoPromote', retreatId }),
    });
  }
}

export const apiClient = new ApiClient(); 