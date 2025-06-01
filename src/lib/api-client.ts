import { 
  LoginInput, 
  RegisterInput, 
  ActivityInput, 
  ContactInput, 
  BusinessInput, 
  EmployerInput 
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
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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

  // Stats endpoint
  async getStats() {
    return this.request<{
      activities: any;
      contacts: any;
      businesses: any;
      employers: any;
      points: any;
    }>('/stats');
  }
}

export const apiClient = new ApiClient(); 