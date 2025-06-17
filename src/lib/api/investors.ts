// Type definitions matching the frontend components
export interface Investor {
  id: string;
  name: string;
  type: 'INSTITUTIONAL' | 'PRIVATE_EQUITY' | 'VENTURE_CAPITAL' | 'ANGEL' | 'FAMILY_OFFICE' | 'SOVEREIGN_WEALTH';
  investment: number;
  stake: number;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXITED';
  email: string;
  phone?: string;
  primaryContact: string;
  headquarters: string;
  website?: string;
  fundSize?: number;
  investmentFocus: string[];
  lastCommunication?: string;
  nextMeeting?: string;
  performanceRating: number;
  riskProfile: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  communications?: InvestorCommunication[];
  _count?: {
    communications: number;
  };
}

export interface InvestorCommunication {
  id: string;
  investorId: string;
  type: 'EMAIL' | 'MEETING' | 'CALL' | 'REPORT' | 'PROPOSAL';
  subject: string;
  content?: string;
  date: string;
  status: 'SENT' | 'RECEIVED' | 'SCHEDULED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  investor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvestorStats {
  totalInvestors: number;
  totalInvestment: number;
  totalStake: number;
  averageRating: number;
  statusBreakdown: Record<string, number>;
}

export interface CreateInvestorData {
  name: string;
  type: 'INSTITUTIONAL' | 'PRIVATE_EQUITY' | 'VENTURE_CAPITAL' | 'ANGEL' | 'FAMILY_OFFICE' | 'SOVEREIGN_WEALTH';
  investment: number;
  stake: number;
  email: string;
  phone?: string;
  primaryContact: string;
  headquarters: string;
  website?: string;
  fundSize?: number;
  investmentFocus: string[];
  riskProfile?: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface UpdateInvestorData extends Partial<CreateInvestorData> {
  id: string;
}

export interface CreateCommunicationData {
  investorId: string;
  investorName: string;
  type: 'EMAIL' | 'MEETING' | 'CALL' | 'REPORT' | 'PROPOSAL';
  subject: string;
  content?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface InvestorFilters {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface InvestorResponse {
  success: boolean;
  investors: Investor[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: InvestorStats;
}

export interface CommunicationResponse {
  success: boolean;
  communications: InvestorCommunication[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class InvestorService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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

  // Get all investors with filtering and pagination
  async getInvestors(filters: InvestorFilters = {}): Promise<InvestorResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/elevate/investors?${queryString}` : '/elevate/investors';
    
    return this.request<InvestorResponse>(endpoint);
  }

  // Get single investor by ID
  async getInvestor(id: string): Promise<{ success: boolean; investor: Investor }> {
    return this.request<{ success: boolean; investor: Investor }>(`/elevate/investors/${id}`);
  }

  // Create new investor
  async createInvestor(data: CreateInvestorData): Promise<{ success: boolean; investor: Investor; message: string }> {
    return this.request<{ success: boolean; investor: Investor; message: string }>('/elevate/investors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update investor
  async updateInvestor(data: UpdateInvestorData): Promise<{ success: boolean; investor: Investor; message: string }> {
    return this.request<{ success: boolean; investor: Investor; message: string }>('/elevate/investors', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete investor
  async deleteInvestor(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/elevate/investors?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Get communications
  async getCommunications(filters: {
    investorId?: string;
    type?: string;
    status?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<CommunicationResponse> {
    const params = new URLSearchParams();
    
    if (filters.investorId) params.append('investorId', filters.investorId);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/elevate/investors/communications?${queryString}` : '/elevate/investors/communications';
    
    return this.request<CommunicationResponse>(endpoint);
  }

  // Create communication
  async createCommunication(data: CreateCommunicationData): Promise<{ 
    success: boolean; 
    communication: InvestorCommunication; 
    message: string 
  }> {
    return this.request<{ 
      success: boolean; 
      communication: InvestorCommunication; 
      message: string 
    }>('/elevate/investors/communications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper method to transform frontend investor data to API format
  transformToApiFormat(data: any): CreateInvestorData | UpdateInvestorData {
    return {
      ...data,
      type: data.type.toUpperCase().replace(/ /g, '_'),
      riskProfile: data.riskProfile?.toUpperCase(),
      investment: typeof data.investment === 'string' ? parseFloat(data.investment) : data.investment,
      stake: typeof data.stake === 'string' ? parseFloat(data.stake) : data.stake,
      fundSize: data.fundSize ? (typeof data.fundSize === 'string' ? parseFloat(data.fundSize) : data.fundSize) : undefined,
      investmentFocus: Array.isArray(data.investmentFocus) ? data.investmentFocus : 
                       typeof data.investmentFocus === 'string' ? data.investmentFocus.split(',').map((s: string) => s.trim()).filter(Boolean) : []
    };
  }

  // Helper method to transform API investor data to frontend format
  transformFromApiFormat(investor: Investor): any {
    return {
      ...investor,
      type: investor.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      riskProfile: investor.riskProfile.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      contact: {
        email: investor.email,
        phone: investor.phone,
        primaryContact: investor.primaryContact
      }
    };
  }
}

export const investorService = new InvestorService(); 