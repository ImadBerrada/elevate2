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
          errorData: errorData
        });
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
      companies: { id: string; name: string; industry: string }[];
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
}

export const apiClient = new ApiClient(); 