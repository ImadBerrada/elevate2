"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  UserCheck, 
  Users, 
  Home, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  Menu,
  MoreHorizontal,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Interfaces
interface Property {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  area?: string;
  floorArea?: number;
  lotArea?: number;
  purchaseValue?: number;
  status: string;
  occupancyRate?: number;
  image?: string;
  propertyType: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalMonthlyRent: number;
  totalYearlyExpenses: number;
  occupiedUnits: number;
  totalUnits: number;
  rentalUnits: any[];
}

interface UnitType {
  name: string;
}

interface RentalUnit {
  id: string;
  unitNumber: string;
  unitType: UnitType;
  status: string;
  rentAmount: number | string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  securityDeposit?: number | string;
}

interface Agreement {
  id: string;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit?: number;
  status: string;
  property: Property;
  rentalUnit: RentalUnit;
}

interface EnrichedTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  nationality?: string;
  passportNumber?: string;
  emiratesId?: string;
  occupation?: string;
  company?: string;
  monthlyIncome?: number;
  notes?: string;
  status: string;
  agreements: Agreement[];
  currentProperty?: Property;
  currentUnit?: RentalUnit;
  currentRent: number;
  totalPayments: number;
  outstandingInvoices: number;
  paymentStatus?: string;
  _count: {
    agreements: number;
  };
}

interface Stats {
  totalTenants: number;
  activeLeases: number;
  monthlyRevenue: number;
  expiringLeases: number;
  occupancyRate: number;
  paymentStats: {
    current: number;
    overdue: number;
    pending: number;
  };
}

export default function TenantManagement() {
  const { toggle: toggleSidebar } = useSidebar();
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [tenants, setTenants] = useState<EnrichedTenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rentalUnits, setRentalUnits] = useState<RentalUnit[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTenants: 0,
    activeLeases: 0,
    monthlyRevenue: 0,
    expiringLeases: 0,
    occupancyRate: 0,
    paymentStats: {
      current: 0,
      overdue: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [propertiesLastSync, setPropertiesLastSync] = useState<Date | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  
  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    highlight?: string;
    createFor?: string;
  }>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Dialog states
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  const [isEditTenantOpen, setIsEditTenantOpen] = useState(false);
  const [isViewTenantOpen, setIsViewTenantOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<EnrichedTenant | null>(null);
  
  // Form state
  const [tenantForm, setTenantForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    nationality: '',
    passportNumber: '',
    emiratesId: '',
    occupation: '',
    company: '',
    monthlyIncome: 0,
    notes: '',
    status: 'ACTIVE',
    propertyId: 'none',
    rentalUnitId: 'none',
    monthsRented: 12, // Default to 12 months
    // Rental terms (auto-populated)
    monthlyRent: 0,
    securityDeposit: 0,
    unitArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    parkingSpots: 0
  });

  useEffect(() => {
    // Check URL parameters on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newUrlParams = {
        highlight: params.get('highlight') || undefined,
        createFor: params.get('createFor') || undefined,
      };
      setUrlParams(newUrlParams);
      
      // Auto-highlight tenant if highlight parameter exists
      if (newUrlParams.highlight) {
        setSuccess(`Highlighting selected tenant`);
        // Clear filters to ensure highlighted tenant is visible
        setSearchTerm('');
        setStatusFilter('all');
        setPaymentFilter('all');
      }
    }
    
    fetchData();
    fetchProperties();
  }, []);

  // Auto-refresh properties every 5 minutes to keep data synced
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing properties for sync...');
      fetchProperties();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Refresh properties when tenant modal opens to ensure latest data
  useEffect(() => {
    if (isNewTenantOpen || isEditTenantOpen) {
      console.log('Modal opened - refreshing properties...');
      fetchProperties();
    }
  }, [isNewTenantOpen, isEditTenantOpen]);

  // Auto-dismiss success notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchTenants(),
        fetchAgreements()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      console.log('Fetching properties for tenant form...');
      // Fetch with same parameters as properties listing page to ensure full sync
      const params = new URLSearchParams({
        limit: '1000',
        status: 'ACTIVE' // Only show active properties for tenant assignment
      });
      
      const response = await fetch(`/api/real-estate/properties?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Properties response:', data);
        console.log('Total properties fetched:', data.properties?.length || 0);
        
        // Enhanced logging with full property details
        data.properties?.forEach((property: any, index: number) => {
          console.log(`Property ${index + 1}:`, {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            status: property.status,
            propertyType: property.propertyType?.name,
            owner: `${property.owner?.firstName} ${property.owner?.lastName}`,
            totalUnits: property.totalUnits,
            occupiedUnits: property.occupiedUnits,
            availableUnits: property.totalUnits - property.occupiedUnits,
            totalMonthlyRent: property.totalMonthlyRent,
            occupancyRate: property.totalUnits > 0 ? Math.round((property.occupiedUnits / property.totalUnits) * 100) : 0
          });
        });
        
        // Filter properties to only show those with available units for new tenants
        const propertiesWithAvailableUnits = data.properties?.filter((property: any) => {
          const availableUnits = property.totalUnits - property.occupiedUnits;
          const hasUnits = property.totalUnits > 0;
          const isActive = property.status === 'ACTIVE';
          return hasUnits && availableUnits > 0 && isActive;
        }) || [];
        
        console.log(`Filtered to ${propertiesWithAvailableUnits.length} properties with available units`);
        propertiesWithAvailableUnits.forEach((property: any, index: number) => {
          console.log(`Available Property ${index + 1}:`, {
            name: property.name,
            availableUnits: property.totalUnits - property.occupiedUnits,
            totalUnits: property.totalUnits
          });
        });
        
        setProperties(data.properties || []); // Store all properties for reference
        setPropertiesLastSync(new Date()); // Update sync timestamp
        
        // Show sync success notification
        const availablePropertiesCount = propertiesWithAvailableUnits.length;
        setSyncNotification(`✅ Synced ${data.properties?.length || 0} properties (${availablePropertiesCount} available for assignment)`);
        setTimeout(() => setSyncNotification(null), 3000); // Clear after 3 seconds
        
        // Update stats with property data
        const totalActiveProperties = data.properties?.filter((p: any) => p.status === 'ACTIVE').length || 0;
        const totalUnitsInPortfolio = data.properties?.reduce((sum: number, p: any) => sum + (p.totalUnits || 0), 0) || 0;
        const occupiedUnitsInPortfolio = data.properties?.reduce((sum: number, p: any) => sum + (p.occupiedUnits || 0), 0) || 0;
        
        console.log('Portfolio stats:', {
          totalActiveProperties,
          totalUnitsInPortfolio,
          occupiedUnitsInPortfolio,
          portfolioOccupancyRate: totalUnitsInPortfolio > 0 ? Math.round((occupiedUnitsInPortfolio / totalUnitsInPortfolio) * 100) : 0
        });
        
      } else {
        console.error('Failed to fetch properties:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        setError(`Failed to fetch properties: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Network error while fetching properties');
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchRentalUnits = async (propertyId: string): Promise<void> => {
    try {
      console.log('=== FETCH RENTAL UNITS START ===');
      console.log('Fetching units for property:', propertyId);
      console.log('API URL:', `/api/real-estate/rental-units?propertyId=${propertyId}&limit=1000`);
      const response = await fetch(`/api/real-estate/rental-units?propertyId=${propertyId}&limit=1000`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('FULL API Response:', JSON.stringify(data, null, 2));
        console.log('Units array exists:', !!data.units);
        console.log('Units array type:', typeof data.units);
        console.log('Units array length:', data.units?.length || 0);
        console.log('Total units fetched:', data.units?.length || 0);
        console.log('Available units (not occupied):', data.units?.filter((u: any) => u.status !== 'OCCUPIED').length || 0);
        
        if (data.units && data.units.length > 0) {
          console.log('First unit details:', data.units[0]);
          data.units.forEach((unit: any, index: number) => {
            console.log(`Unit ${index + 1}:`, {
              id: unit.id,
              unitNumber: unit.unitNumber,
              status: unit.status,
              rentAmount: unit.rentAmount,
              rentAmountType: typeof unit.rentAmount,
              unitType: unit.unitType?.name,
              area: unit.area,
              bedrooms: unit.bedrooms,
              bathrooms: unit.bathrooms
            });
          });
        } else {
          console.log('No units found in response');
        }
        
        setRentalUnits(data.units || []);
        console.log('Rental units state set. New length should be:', data.units?.length || 0);
      } else {
        console.error('Failed to fetch rental units:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        setRentalUnits([]);
      }
    } catch (error) {
      console.error('Error fetching rental units:', error);
      console.error('Error stack:', error);
      setRentalUnits([]);
    }
    console.log('=== FETCH RENTAL UNITS END ===');
  };

  const handlePropertyChange = (propertyId: string) => {
    console.log('=== PROPERTY CHANGE EVENT ===');
    console.log('Property changed from:', tenantForm.propertyId, 'to:', propertyId);
    console.log('Selected property name:', properties.find(p => p.id === propertyId)?.name || 'Not found');
    console.log('Current rental units count:', rentalUnits.length);
    
    setTenantForm(prev => ({ 
      ...prev, 
      propertyId, 
      rentalUnitId: 'none',
      // Reset rental terms when property changes
      monthlyRent: 0,
      securityDeposit: 0,
      unitArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpots: 0
    }));
    
    if (propertyId && propertyId !== 'none') {
      console.log('Will fetch rental units for property:', propertyId);
      fetchRentalUnits(propertyId);
    } else {
      console.log('Clearing rental units (propertyId is none or empty)');
      setRentalUnits([]);
    }
    console.log('=== END PROPERTY CHANGE ===');
  };

  const handleRentalUnitChange = (unitId: string) => {
    console.log('=== RENTAL UNIT CHANGE EVENT ===');
    console.log('Rental unit changed from:', tenantForm.rentalUnitId, 'to:', unitId);
    console.log('Available rental units:', rentalUnits.length);
    
    if (unitId === 'none') {
      console.log('Setting unit to none - clearing rental terms');
      setTenantForm(prev => ({
        ...prev,
        rentalUnitId: unitId,
        monthlyRent: 0,
        securityDeposit: 0,
        unitArea: 0,
        bedrooms: 0,
        bathrooms: 0,
        parkingSpots: 0
      }));
    } else {
      const selectedUnit = rentalUnits.find(unit => unit.id === unitId);
      console.log('Selected unit:', selectedUnit);
      if (selectedUnit) {
        console.log('Updating form with unit details:', {
          rentAmount: selectedUnit.rentAmount,
          securityDeposit: selectedUnit.securityDeposit,
          area: selectedUnit.area,
          bedrooms: selectedUnit.bedrooms,
          bathrooms: selectedUnit.bathrooms,
          parkingSpots: selectedUnit.parkingSpots
        });
        setTenantForm(prev => ({
          ...prev,
          rentalUnitId: unitId,
          monthlyRent: Number(selectedUnit.rentAmount) || 0,
          securityDeposit: Number(selectedUnit.securityDeposit) || 0,
          unitArea: selectedUnit.area || 0,
          bedrooms: selectedUnit.bedrooms || 0,
          bathrooms: selectedUnit.bathrooms || 0,
          parkingSpots: selectedUnit.parkingSpots || 0
        }));
      } else {
        console.error('Selected unit not found in rentalUnits array');
      }
    }
    console.log('=== END RENTAL UNIT CHANGE ===');
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/real-estate/tenants?limit=100');
      if (response.ok) {
        const data = await response.json();
        console.log('=== TENANT DATA DEBUG ===');
        console.log('Full response:', data);
        console.log('Tenants count:', data.tenants?.length);
        
        data.tenants?.forEach((tenant: any, index: number) => {
          console.log(`\n--- Tenant ${index + 1}: ${tenant.firstName} ${tenant.lastName} ---`);
          console.log('Tenant ID:', tenant.id);
          console.log('Agreements count:', tenant.agreements?.length || 0);
          console.log('Active agreements:', tenant.agreements?.filter((a: any) => a.status === 'ACTIVE').length || 0);
          console.log('Current property:', tenant.currentProperty);
          console.log('Current unit:', tenant.currentUnit);
          console.log('Current rent:', tenant.currentRent, typeof tenant.currentRent);
          console.log('Total payments:', tenant.totalPayments);
          
          if (tenant.agreements && tenant.agreements.length > 0) {
            tenant.agreements.forEach((agreement: any, aIndex: number) => {
              console.log(`  Agreement ${aIndex + 1}:`, {
                id: agreement.id,
                status: agreement.status,
                rentAmount: agreement.rentAmount,
                property: agreement.property?.name,
                unit: agreement.rentalUnit?.unitNumber
              });
            });
          } else {
            console.log('  No agreements found for this tenant');
          }
        });
        
        console.log('=== END TENANT DEBUG ===');
        
        setTenants(data.tenants || []);
        
        // Calculate basic tenant stats
        const totalTenants = data.tenants?.length || 0;
        const activeLeases = data.tenants?.filter((t: EnrichedTenant) => 
          t.agreements.some(a => a.status === 'ACTIVE')).length || 0;
        
        setStats(prev => ({
          ...prev,
          totalTenants,
          activeLeases,
          occupancyRate: totalTenants > 0 ? (activeLeases / totalTenants) * 100 : 0
        }));
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchAgreements = async () => {
    try {
      const response = await fetch('/api/real-estate/agreements?limit=1000');
      if (response.ok) {
        const data = await response.json();
        console.log('=== AGREEMENTS DATA DEBUG ===');
        console.log('Agreements response:', data);
        console.log('First agreement:', data.agreements?.[0]);
        console.log('Agreement tenant:', data.agreements?.[0]?.tenant);
        console.log('Agreement property:', data.agreements?.[0]?.property);
        console.log('Agreement unit:', data.agreements?.[0]?.rentalUnit);
        console.log('Active agreements count:', data.agreements?.filter((a: any) => a.status === 'ACTIVE').length);
        console.log('=== END AGREEMENTS DEBUG ===');
        
        const agreements = data.agreements || [];
        
        // Calculate revenue and expiring leases
        const monthlyRevenue = agreements
          .filter((a: any) => a.status === 'ACTIVE')
          .reduce((sum: number, a: any) => {
            let rentAmount = a.rentAmount;
            // Handle Prisma Decimal objects
            if (typeof rentAmount === 'object' && rentAmount !== null && 'toNumber' in rentAmount) {
              rentAmount = (rentAmount as any).toNumber();
            } else if (typeof rentAmount === 'string') {
              rentAmount = parseFloat(rentAmount) || 0;
            } else if (typeof rentAmount !== 'number') {
              rentAmount = 0;
            }
            return sum + rentAmount;
          }, 0);
        
        const expiringLeases = agreements
          .filter((a: any) => a.daysUntilExpiry <= 90 && a.daysUntilExpiry > 0).length;
        
        // Calculate payment stats (simplified)
        const totalActive = agreements.filter((a: any) => a.status === 'ACTIVE').length;
        const overdueCount = agreements.filter((a: any) => a.overdueInvoices > 0).length;
        const pendingCount = agreements.filter((a: any) => a.pendingInvoices > 0).length;
        
        setStats(prev => ({
          ...prev,
          monthlyRevenue,
          expiringLeases,
          paymentStats: {
            current: totalActive - overdueCount - pendingCount,
            overdue: overdueCount,
            pending: pendingCount
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
    }
  };

  // Helper functions - moved here to avoid hoisting issues
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatus = (tenant: EnrichedTenant): string => {
    if (tenant.outstandingInvoices > 3) return 'overdue';
    if (tenant.outstandingInvoices > 0) return 'pending';
    return 'current';
  };

  const getTenantStatus = (tenant: EnrichedTenant): string => {
    const activeAgreement = tenant.agreements.find(a => a.status === 'ACTIVE');
    if (!activeAgreement) return 'inactive';
    
    const daysUntilExpiry = Math.ceil((new Date(activeAgreement.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) return 'expiring';
    
    return 'active';
  };

  const getTenantDisplayName = (tenant: EnrichedTenant): string => {
    return `${tenant.firstName} ${tenant.lastName}`;
  };

  const getActiveAgreement = (tenant: EnrichedTenant): Agreement | undefined => {
    return tenant.agreements.find(a => a.status === 'ACTIVE');
  };

  const getCurrentProperty = (tenant: EnrichedTenant): Property | undefined => {
    const activeAgreement = getActiveAgreement(tenant);
    return tenant.currentProperty || activeAgreement?.property;
  };

  const getCurrentUnit = (tenant: EnrichedTenant): RentalUnit | undefined => {
    const activeAgreement = getActiveAgreement(tenant);
    return tenant.currentUnit || activeAgreement?.rentalUnit;
  };

  const getCurrentRent = (tenant: EnrichedTenant): number => {
    const activeAgreement = getActiveAgreement(tenant);
    if (tenant.currentRent) return tenant.currentRent;
    if (activeAgreement?.rentAmount) {
      // Handle Prisma Decimal conversion
      if (typeof activeAgreement.rentAmount === 'object' && activeAgreement.rentAmount !== null && 'toNumber' in activeAgreement.rentAmount) {
        return (activeAgreement.rentAmount as any).toNumber();
      }
      return Number(activeAgreement.rentAmount);
    }
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "expiring": return "text-yellow-600";
      case "expired": return "text-red-600";
      case "pending": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expiring": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "current": return "text-green-600";
      case "overdue": return "text-red-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getPaymentStatusBg = (status: string) => {
    switch (status) {
      case "current": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "current": return CheckCircle;
      case "overdue": return AlertTriangle;
      case "pending": return Clock;
      default: return Clock;
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate monthlyIncome to prevent database overflow
    if (tenantForm.monthlyIncome > 99999999.99) {
      setError('Monthly income cannot exceed 99,999,999.99 AED');
      return;
    }
    
    // Prepare form data, converting "none" values to undefined
    const formData = {
      ...tenantForm,
      propertyId: tenantForm.propertyId === 'none' ? undefined : tenantForm.propertyId,
      rentalUnitId: tenantForm.rentalUnitId === 'none' ? undefined : tenantForm.rentalUnitId,
    };
    
    console.log('Creating tenant with form data:', {
      propertyId: formData.propertyId,
      rentalUnitId: formData.rentalUnitId,
      propertyName: properties.find(p => p.id === formData.propertyId)?.name,
      unitInfo: rentalUnits.find(u => u.id === formData.rentalUnitId)?.unitNumber
    });
    
    try {
      const response = await fetch('/api/real-estate/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchTenants();
        setIsNewTenantOpen(false);
        // Only reset personal info, keep property/unit selection for convenience
        setTenantForm(prev => ({
          ...prev,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          alternatePhone: '',
          nationality: '',
          passportNumber: '',
          emiratesId: '',
          occupation: '',
          company: '',
          monthlyIncome: 0,
          notes: '',
          status: 'ACTIVE',
          // Keep property/unit selection and rental terms
        }));
      } else {
        const errorData = await response.json();
        // Handle specific database errors with user-friendly messages
        if (errorData.error?.includes('numeric field overflow')) {
          setError('One of the numeric values is too large. Please check the monthly income field.');
        } else {
          setError(errorData.error || 'Failed to create tenant');
        }
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      if (error instanceof Error && error.message.includes('numeric field overflow')) {
        setError('Monthly income value is too large. Maximum allowed is 99,999,999.99 AED');
      } else {
        setError('Failed to create tenant');
      }
    }
  };

  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    // Validate monthlyIncome to prevent database overflow
    if (tenantForm.monthlyIncome > 99999999.99) {
      setError('Monthly income cannot exceed 99,999,999.99 AED');
      return;
    }
    
    // Prepare form data, converting "none" values to undefined
    const formData = {
      ...tenantForm,
      propertyId: tenantForm.propertyId === 'none' ? undefined : tenantForm.propertyId,
      rentalUnitId: tenantForm.rentalUnitId === 'none' ? undefined : tenantForm.rentalUnitId,
    };
    
    try {
      const response = await fetch(`/api/real-estate/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchTenants();
        setIsEditTenantOpen(false);
        setSelectedTenant(null);
        resetForm();
      } else {
        const errorData = await response.json();
        // Handle specific database errors with user-friendly messages
        if (errorData.error?.includes('numeric field overflow')) {
          setError('One of the numeric values is too large. Please check the monthly income field.');
        } else {
          setError(errorData.error || 'Failed to update tenant');
        }
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      if (error instanceof Error && error.message.includes('numeric field overflow')) {
        setError('Monthly income value is too large. Maximum allowed is 99,999,999.99 AED');
      } else {
        setError('Failed to update tenant');
      }
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      const response = await fetch(`/api/real-estate/tenants/${selectedTenant.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchTenants();
        setIsDeleteDialogOpen(false);
        setSelectedTenant(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setError('Failed to delete tenant');
    }
  };

  const resetForm = () => {
    setTenantForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      nationality: '',
      passportNumber: '',
      emiratesId: '',
      occupation: '',
      company: '',
      monthlyIncome: 0,
      notes: '',
      status: 'ACTIVE',
      propertyId: 'none',
      rentalUnitId: 'none',
      monthsRented: 12, // Default to 12 months
      // Rental terms (auto-populated)
      monthlyRent: 0,
      securityDeposit: 0,
      unitArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpots: 0
    });
  };

  const openEditDialog = async (tenant: EnrichedTenant) => {
    setSelectedTenant(tenant);
    const currentProperty = getCurrentProperty(tenant);
    const currentUnit = getCurrentUnit(tenant);
    const activeAgreement = getActiveAgreement(tenant);
    const propertyId = currentProperty?.id || 'none';
    
    setTenantForm({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      alternatePhone: tenant.alternatePhone || '',
      nationality: tenant.nationality || '',
      passportNumber: tenant.passportNumber || '',
      emiratesId: tenant.emiratesId || '',
      occupation: tenant.occupation || '',
      company: tenant.company || '',
      monthlyIncome: tenant.monthlyIncome || 0,
      notes: tenant.notes || '',
      status: tenant.status,
      propertyId: propertyId,
      rentalUnitId: currentUnit?.id || 'none',
      monthsRented: 12, // Default for existing tenants
      // Rental terms from active agreement or defaults
      monthlyRent: activeAgreement?.rentAmount || 0,
      securityDeposit: activeAgreement?.securityDeposit || 0,
      unitArea: currentUnit?.area || 0,
      bedrooms: currentUnit?.bedrooms || 0,
      bathrooms: currentUnit?.bathrooms || 0,
      parkingSpots: currentUnit?.parkingSpots || 0
    });
    
    // Load rental units for the selected property
    if (propertyId && propertyId !== 'none') {
      await fetchRentalUnits(propertyId);
    }
    
    setIsEditTenantOpen(true);
  };

  const openViewDialog = (tenant: EnrichedTenant) => {
    setSelectedTenant(tenant);
    setIsViewTenantOpen(true);
  };

  const openDeleteDialog = (tenant: EnrichedTenant) => {
    setSelectedTenant(tenant);
    setIsDeleteDialogOpen(true);
  };

  // Cross-module navigation handlers
  const handleViewProperty = (tenant: EnrichedTenant) => {
    const property = getCurrentProperty(tenant);
    if (property) {
      window.location.href = `/real-estate/properties/management?highlight=${property.id}&tenant=${tenant.id}`;
    }
  };

  const handleViewLeases = (tenant: EnrichedTenant) => {
    window.location.href = `/real-estate/tenants/leases?tenant=${tenant.id}&highlight=${tenant.id}`;
  };

  const handleViewRentPayments = (tenant: EnrichedTenant) => {
    window.location.href = `/real-estate/tenants/rent?tenant=${tenant.id}&highlight=${tenant.id}`;
  };

  const handleViewPropertyAppliances = (tenant: EnrichedTenant) => {
    const property = getCurrentProperty(tenant);
    if (property) {
      window.location.href = `/real-estate/appliances/inventory?property=${encodeURIComponent(property.name)}&unit=${getCurrentUnit(tenant)?.unitNumber}`;
    }
  };

  // Filtered tenants
  const filteredTenants = tenants.filter(tenant => {
    const tenantStatus = getTenantStatus(tenant);
    const paymentStatus = getPaymentStatus(tenant);
    
    const matchesSearch = !searchTerm || 
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      getCurrentProperty(tenant)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenantStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'all' || paymentStatus.toLowerCase() === paymentFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Helper function to normalize rent amount to monthly AED
  const normalizeRentAmount = (rawAmount: any, tenantName: string = ''): number => {
    if (!rawAmount) return 0;
    
    let amount = rawAmount;
    
    // Handle Prisma Decimal objects
    if (typeof amount === 'object' && amount !== null && 'toNumber' in amount) {
      amount = (amount as any).toNumber();
    } else if (typeof amount === 'string') {
      amount = parseFloat(amount) || 0;
    } else if (typeof amount !== 'number') {
      return 0;
    }
    
    // Ensure positive number
    amount = Math.abs(amount);
    
    // Based on UAE real estate market analysis:
    // Typical monthly rent ranges: 1,000 - 50,000 AED
    // If amount > 60,000, likely annual rent
    // If amount > 600,000, likely in fils (smallest currency unit)
    
    if (amount > 600000) {
      // Likely in fils, convert to AED first, then check if annual
      amount = amount / 100;
      if (amount > 60000) {
        amount = amount / 12; // Convert annual to monthly
      }
    } else if (amount > 60000) {
      // Likely annual rent, convert to monthly
      amount = amount / 12;
    }
    
    // Sanity check: if still unreasonably high, cap it
    if (amount > 100000) {
      console.warn(`Unusually high rent amount for ${tenantName}: ${rawAmount} -> ${amount}`);
      amount = 50000; // Cap at reasonable maximum
    }
    
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  };

  // Calculate dynamic stats from actual data
  const calculateStats = () => {
    const totalTenants = tenants.length;
    const activeAgreements = tenants.filter(tenant => 
      tenant.agreements.some(agreement => agreement.status === 'ACTIVE')
    );
    const activeLeases = activeAgreements.length;
    
    // Calculate monthly revenue from current rents with proper normalization
    const monthlyRevenue = tenants.reduce((sum, tenant) => {
      const normalizedRent = normalizeRentAmount(
        tenant.currentRent, 
        `${tenant.firstName} ${tenant.lastName}`
      );
      return sum + normalizedRent;
    }, 0);
    
    // Calculate expiring leases (next 90 days)
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    const expiringLeases = tenants.filter(tenant => {
      const activeAgreement = tenant.agreements.find(agreement => agreement.status === 'ACTIVE');
      if (!activeAgreement) return false;
      const endDate = new Date(activeAgreement.endDate);
      return endDate >= now && endDate <= ninetyDaysFromNow;
    }).length;
    
    // Calculate occupancy rate
    const occupancyRate = totalTenants > 0 ? (activeLeases / totalTenants) * 100 : 0;
    
    // Calculate payment statistics
    const paymentStats = tenants.reduce((stats, tenant) => {
      const paymentStatus = getPaymentStatus(tenant);
      stats[paymentStatus as keyof typeof stats]++;
      return stats;
    }, { current: 0, overdue: 0, pending: 0 });
    
    // Calculate average lease duration
    const activeLeaseAgreements = tenants
      .map(tenant => tenant.agreements.find(agreement => agreement.status === 'ACTIVE'))
      .filter(agreement => agreement !== undefined);
    
    const activeLeaseDurations = activeLeaseAgreements.map(agreement => {
      const start = new Date(agreement!.startDate);
      const end = new Date(agreement!.endDate);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)); // months
    });
    
    const averageLeaseDuration = activeLeaseDurations.length > 0 
      ? Math.round(activeLeaseDurations.reduce((sum, duration) => sum + duration, 0) / activeLeaseDurations.length)
      : 0;
    
    // Calculate renewal rate (simplified - could be enhanced with historical data)
    const renewalRate = activeLeases > 0 ? Math.round((activeLeases / totalTenants) * 100) : 0;
    
    return {
      totalTenants,
      activeLeases,
      monthlyRevenue,
      expiringLeases,
      occupancyRate,
      averageLeaseDuration,
      renewalRate,
      paymentStats
    };
  };

  const dynamicStats = calculateStats();

  // Calculate lease metrics
  const leaseMetrics = [
    {
      metric: "Average Lease Duration",
      value: `${dynamicStats.averageLeaseDuration} months`,
      trend: dynamicStats.averageLeaseDuration >= 12 ? "+2 months" : "-1 month",
      status: dynamicStats.averageLeaseDuration >= 12 ? "good" : "warning"
    },
    {
      metric: "Renewal Rate",
      value: `${dynamicStats.renewalRate}%`,
      trend: dynamicStats.renewalRate >= 80 ? "+5.2%" : "-2.1%",
      status: dynamicStats.renewalRate >= 90 ? "excellent" : dynamicStats.renewalRate >= 70 ? "good" : "warning"
    },
    {
      metric: "Occupancy Rate",
      value: `${Math.round(dynamicStats.occupancyRate)}%`,
      trend: dynamicStats.occupancyRate >= 85 ? "+2.1%" : "-3.2%",
      status: dynamicStats.occupancyRate >= 90 ? "excellent" : dynamicStats.occupancyRate >= 75 ? "good" : "warning"
    },
    {
      metric: "Monthly Revenue",
      value: formatCurrency(dynamicStats.monthlyRevenue),
      trend: "+12.5%", // This could be calculated from historical data
      status: "good"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <motion.div
                  className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <UserCheck className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Tenant Management</h1>
                  {propertiesLastSync && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>Synced</span>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  className="btn-premium"
                  onClick={() => setIsNewTenantOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="glass-card border-0 hover-glow">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Search Tenants</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input 
                            placeholder="Search tenants..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Status Filter</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="expiring">Expiring</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Payment Filter</label>
                          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Payments</SelectItem>
                              <SelectItem value="current">Current</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DropdownMenuSeparator />
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/leases'}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Leases
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/rent'}
                          className="flex-1"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Payments
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tenants
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.totalTenants}</div>
                  <p className="text-sm text-blue-600 font-medium">
                    {stats.totalTenants > 0 ? '+' : ''}{tenants.filter(t => t.status === 'ACTIVE').length} active
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Leases
                  </CardTitle>
                  <FileText className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.activeLeases}</div>
                  <p className="text-sm text-green-600 font-medium">
                    {formatCurrency(stats.monthlyRevenue)}/month revenue
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring Soon
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.expiringLeases}</div>
                  <p className="text-sm text-orange-600 font-medium">Within 30 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Collection Rate
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.occupancyRate.toFixed(1)}%</div>
                  <p className="text-sm text-purple-600 font-medium">Payment performance</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Action Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-premium border-0 hover-lift">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">Lease Agreements</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Manage rental agreements and contracts
                </p>
                <Button 
                  className="btn-premium w-full"
                  onClick={() => window.location.href = '/real-estate/tenants/leases'}
                >
                  View Leases
                </Button>
              </CardContent>
            </Card>

            <Card className="card-premium border-0 hover-lift">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">Rent Collection</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Track payments and collection status
                </p>
                <Button 
                  className="btn-premium w-full"
                  onClick={() => window.location.href = '/real-estate/tenants/rent'}
                >
                  View Payments
                </Button>
              </CardContent>
            </Card>

            <Card className="card-premium border-0 hover-lift">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Users className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">Tenant Management</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Currently viewing tenant records
                </p>
                <Button 
                  variant="outline"
                  className="w-full glass-card border-0"
                  disabled
                >
                  Current Page
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tenant List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Tenant Directory</CardTitle>
                      <CardDescription>
                        Manage tenant information and lease details
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      className="glass-card border-0 hover-glow"
                      onClick={() => window.location.href = '/real-estate/tenants/leases'}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Leases
                    </Button>
                    <Button 
                      variant="outline" 
                      className="glass-card border-0 hover-glow"
                      onClick={() => window.location.href = '/real-estate/tenants/rent'}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      View Payments
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredTenants.length === 0 ? (
                    <div className="text-center py-12">
                      <motion.div
                        className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Users className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Tenants Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {tenants.length === 0 
                          ? "Start by adding your first tenant to the system" 
                          : "No tenants match your current filters"
                        }
                      </p>
                      {tenants.length === 0 && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            className="btn-premium"
                            onClick={() => setIsNewTenantOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Tenant
                          </Button>
                          <Button 
                            variant="outline"
                            className="glass-card border-0"
                            onClick={() => window.location.href = '/real-estate/tenants/leases'}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Create Agreement
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    filteredTenants.map((tenant, index) => {
                      const paymentStatus = getPaymentStatus(tenant);
                      const PaymentIcon = getPaymentStatusIcon(paymentStatus);
                      const tenantStatus = getTenantStatus(tenant);
                      const activeAgreement = getActiveAgreement(tenant);
                      const currentProperty = getCurrentProperty(tenant);
                      const currentUnit = getCurrentUnit(tenant);
                      const currentRent = getCurrentRent(tenant);
                      
                      return (
                        <motion.div 
                          key={tenant.id}
                          className={`glass-card p-6 rounded-2xl hover-lift group ${
                            urlParams.highlight === tenant.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-200' 
                              : ''
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <motion.div 
                                className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                              >
                                <UserCheck className="w-6 h-6 text-white" />
                              </motion.div>
                              
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h3 className="font-semibold text-lg text-foreground">{getTenantDisplayName(tenant)}</h3>
                                  <Badge 
                                    className={`text-xs ${getStatusBg(tenantStatus)}`}
                                    variant="outline"
                                  >
                                    {tenantStatus}
                                  </Badge>
                                  <Badge 
                                    className={`text-xs ${getPaymentStatusBg(paymentStatus)}`}
                                    variant="outline"
                                  >
                                    {paymentStatus}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{tenant.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{tenant.phone}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                      {currentProperty?.name || 'No Property'} - {currentUnit?.unitNumber || 'No Unit'}
                                    </span>
                                  </div>
                                  <span>•</span>
                                  <span>
                                    Lease: {activeAgreement ? formatDate(activeAgreement.startDate) : 'N/A'} to {activeAgreement ? formatDate(activeAgreement.endDate) : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="grid grid-cols-2 gap-6 text-center mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                  <p className="text-lg font-bold text-gradient">{formatCurrency(currentRent)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Payments</p>
                                  <p className="text-lg font-bold text-foreground">{formatCurrency(tenant.totalPayments)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button size="sm" className="btn-premium" onClick={() => openViewDialog(tenant)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline" className="glass-card border-0 hover-glow" onClick={() => openEditDialog(tenant)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                {activeAgreement ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="glass-card border-0 hover-glow"
                                    onClick={() => window.location.href = `/real-estate/tenants/leases?tenant=${tenant.id}`}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Lease
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    className="btn-premium"
                                    onClick={() => window.location.href = `/real-estate/tenants/leases?createFor=${tenant.id}`}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Agreement
                                  </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(tenant)}>
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* New Tenant Dialog */}
          <Dialog open={isNewTenantOpen} onOpenChange={setIsNewTenantOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Tenant</DialogTitle>
                <DialogDescription>
                  Enter tenant information to create a new tenant profile.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={tenantForm.firstName}
                      onChange={(e) => setTenantForm({...tenantForm, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={tenantForm.lastName}
                      onChange={(e) => setTenantForm({...tenantForm, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={tenantForm.email}
                      onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={tenantForm.phone}
                      onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={tenantForm.notes}
                    onChange={(e) => setTenantForm({...tenantForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Clear Form
                  </Button>
                  <div className="space-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsNewTenantOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-premium">
                      Create Tenant
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </main>

        {/* Edit Tenant Dialog */}
        <Dialog open={isEditTenantOpen} onOpenChange={setIsEditTenantOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tenant</DialogTitle>
              <DialogDescription>
                Update tenant information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditTenant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={tenantForm.firstName}
                    onChange={(e) => setTenantForm({...tenantForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <Input
                    id="editLastName"
                    value={tenantForm.lastName}
                    onChange={(e) => setTenantForm({...tenantForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone *</Label>
                  <Input
                    id="editPhone"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editAlternatePhone">Alternate Phone</Label>
                  <Input
                    id="editAlternatePhone"
                    value={tenantForm.alternatePhone}
                    onChange={(e) => setTenantForm({...tenantForm, alternatePhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editNationality">Nationality</Label>
                  <Input
                    id="editNationality"
                    value={tenantForm.nationality}
                    onChange={(e) => setTenantForm({...tenantForm, nationality: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPassportNumber">Passport Number</Label>
                  <Input
                    id="editPassportNumber"
                    value={tenantForm.passportNumber}
                    onChange={(e) => setTenantForm({...tenantForm, passportNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editEmiratesId">Emirates ID</Label>
                  <Input
                    id="editEmiratesId"
                    value={tenantForm.emiratesId}
                    onChange={(e) => setTenantForm({...tenantForm, emiratesId: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editOccupation">Occupation</Label>
                  <Input
                    id="editOccupation"
                    value={tenantForm.occupation}
                    onChange={(e) => setTenantForm({...tenantForm, occupation: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editCompany">Company</Label>
                  <Input
                    id="editCompany"
                    value={tenantForm.company}
                    onChange={(e) => setTenantForm({...tenantForm, company: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editMonthlyIncome">Monthly Income (AED)</Label>
                  <Input
                    id="editMonthlyIncome"
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    value={tenantForm.monthlyIncome}
                    onChange={(e) => setTenantForm({...tenantForm, monthlyIncome: Number(e.target.value)})}
                    placeholder="Max: 99,999,999.99"
                  />
                </div>
                <div>
                  <Label htmlFor="editMonthsRented">Lease Duration (Months)</Label>
                  <Input
                    id="editMonthsRented"
                    type="number"
                    min="1"
                    max="120"
                    value={tenantForm.monthsRented}
                    onChange={(e) => setTenantForm({...tenantForm, monthsRented: Number(e.target.value)})}
                    placeholder="12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={tenantForm.status} onValueChange={(value) => setTenantForm({...tenantForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editProperty">Property</Label>
                  <Select value={tenantForm.propertyId} onValueChange={handlePropertyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Property</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} - {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editRentalUnit">Rental Unit</Label>
                  <Select 
                    value={tenantForm.rentalUnitId} 
                    onValueChange={handleRentalUnitChange}
                    disabled={!tenantForm.propertyId || tenantForm.propertyId === 'none'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tenantForm.propertyId && tenantForm.propertyId !== 'none' ? "Select Unit" : "Select Property First"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Unit</SelectItem>
                      {rentalUnits
                        .filter(unit => unit.status !== 'OCCUPIED' || unit.id === tenantForm.rentalUnitId)
                        .map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          Unit {unit.unitNumber} - {unit.unitType.name}
                          {unit.rentAmount && ` (${formatCurrency(Number(unit.rentAmount))})`}
                          {unit.status === 'OCCUPIED' && ' - OCCUPIED'}
                          {unit.status === 'MAINTENANCE' && ' - MAINTENANCE'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Rental Terms Display */}
              {tenantForm.rentalUnitId !== 'none' && tenantForm.monthlyRent > 0 && (
                <div className="bg-gradient-to-br from-blue-50/80 to-white/80 p-4 rounded-xl border border-blue-200/50">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Rental Terms (Auto-populated)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-700">Monthly Rent</Label>
                      <p className="font-semibold text-blue-900">{formatCurrency(tenantForm.monthlyRent)}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700">Security Deposit</Label>
                      <p className="font-semibold text-blue-900">{formatCurrency(tenantForm.securityDeposit)}</p>
                    </div>
                    {tenantForm.unitArea > 0 && (
                      <div>
                        <Label className="text-blue-700">Unit Area</Label>
                        <p className="font-semibold text-blue-900">{tenantForm.unitArea} sq ft</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-blue-700">Bedrooms / Bathrooms</Label>
                      <p className="font-semibold text-blue-900">{tenantForm.bedrooms} BR / {tenantForm.bathrooms} BA</p>
                    </div>
                    {tenantForm.parkingSpots > 0 && (
                      <div>
                        <Label className="text-blue-700">Parking Spots</Label>
                        <p className="font-semibold text-blue-900">{tenantForm.parkingSpots}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={tenantForm.notes}
                  onChange={(e) => setTenantForm({...tenantForm, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsEditTenantOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-premium">
                  Update Tenant
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Tenant Dialog */}
        <Dialog open={isViewTenantOpen} onOpenChange={setIsViewTenantOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tenant Profile</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedTenant && getTenantDisplayName(selectedTenant)}
              </DialogDescription>
            </DialogHeader>
            {selectedTenant && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                    <p className="font-semibold">{selectedTenant.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                    <p className="font-semibold">{selectedTenant.lastName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-semibold">{selectedTenant.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="font-semibold">{selectedTenant.phone}</p>
                  </div>
                </div>
                {selectedTenant.alternatePhone && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Alternate Phone</Label>
                    <p className="font-semibold">{selectedTenant.alternatePhone}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                    <p className="font-semibold">{selectedTenant.nationality || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={`${getStatusBg(getTenantStatus(selectedTenant))}`}>
                      {getTenantStatus(selectedTenant)}
                    </Badge>
                  </div>
                </div>
                {selectedTenant.passportNumber && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Passport Number</Label>
                    <p className="font-semibold">{selectedTenant.passportNumber}</p>
                  </div>
                )}
                {selectedTenant.emiratesId && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Emirates ID</Label>
                    <p className="font-semibold">{selectedTenant.emiratesId}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                    <p className="font-semibold">{selectedTenant.occupation || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                    <p className="font-semibold">{selectedTenant.company || 'Not specified'}</p>
                  </div>
                </div>
                {selectedTenant.monthlyIncome && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Monthly Income</Label>
                    <p className="font-semibold">{formatCurrency(selectedTenant.monthlyIncome)}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                                  <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Rent</Label>
                  <p className="font-semibold">{formatCurrency(getCurrentRent(selectedTenant))}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Payments</Label>
                  <p className="font-semibold">{formatCurrency(selectedTenant.totalPayments)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Property & Unit</Label>
                <p className="font-semibold">
                  {getCurrentProperty(selectedTenant)?.name || 'No Property'} - {getCurrentUnit(selectedTenant)?.unitNumber || 'No Unit'}
                </p>
              </div>
                {getActiveAgreement(selectedTenant) && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Active Lease Period</Label>
                    <p className="font-semibold">
                      {formatDate(getActiveAgreement(selectedTenant)!.startDate)} to {formatDate(getActiveAgreement(selectedTenant)!.endDate)}
                    </p>
                  </div>
                )}
                {selectedTenant.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                    <p className="font-semibold">{selectedTenant.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Tenant</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedTenant && getTenantDisplayName(selectedTenant)}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTenant}>
                Delete Tenant
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success/Error Notifications */}
        {success && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
              <Button size="sm" variant="ghost" onClick={() => setSuccess(null)} className="text-white hover:bg-green-600">
                ×
              </Button>
            </div>
          </div>
        )}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <Button size="sm" variant="ghost" onClick={() => setError(null)} className="text-white hover:bg-red-600">
                ×
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 