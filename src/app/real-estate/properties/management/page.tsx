"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Building2, 
  Settings, 
  Users, 
  Wrench,
  DollarSign,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Loader2,
  X,
  Save,
  Phone,
  Mail,
  User,
  FileText,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

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

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  property?: Property;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  requestDate: string;
  completionDate?: string;
  unitNumber?: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'CLEANING' | 'PAINTING' | 'APPLIANCE' | 'SECURITY' | 'OTHER';
  tenantContact?: {
    name: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PropertyStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  pendingMaintenance: number;
  urgentMaintenance: number;
  avgResponseTime: number;
  tenantSatisfaction: number;
}

export default function PropertyManagement() {
  // State Management
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [maintenanceFilter, setMaintenanceFilter] = useState("all");

  // Pagination for Property Portfolio
  const [propertyCurrentPage, setPropertyCurrentPage] = useState(0);
  const propertiesPerPage = 3;

  // Pagination for Maintenance Requests
  const [maintenanceCurrentPage, setMaintenanceCurrentPage] = useState(0);
  const maintenancePerPage = 3;

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);
  const [showCreateMaintenance, setShowCreateMaintenance] = useState(false);
  const [showUnitManagement, setShowUnitManagement] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  // Form States
  const [maintenanceForm, setMaintenanceForm] = useState({
    propertyId: "",
    title: "",
    description: "",
    priority: "MEDIUM" as MaintenanceRequest['priority'],
    category: "OTHER" as MaintenanceRequest['category'],
    unitNumber: "",
    estimatedCost: "",
    assignedTo: "",
    tenantName: "",
    tenantPhone: "",
    tenantEmail: ""
  });

  const [unitForm, setUnitForm] = useState({
    unitNumber: "",
    unitTypeId: "",
    area: "",
    bedrooms: "0",
    bathrooms: "0",
    parkingSpots: "0",
    rentAmount: "",
    securityDeposit: "",
    status: "VACANT",
    notes: ""
  });

  const [unitTypes, setUnitTypes] = useState<any[]>([]);
  const [rentalUnits, setRentalUnits] = useState<any[]>([]);

  // Data Fetching
  useEffect(() => {
    Promise.all([
      fetchProperties(),
      fetchMaintenanceRequests(),
      fetchStats()
    ]).finally(() => setLoading(false));
    fetchUnitTypes();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPropertyCurrentPage(0);
    setMaintenanceCurrentPage(0);
  }, [searchTerm, statusFilter, typeFilter, maintenanceFilter]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/real-estate/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setError('Failed to fetch properties');
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch('/api/real-estate/maintenance-requests');
      if (response.ok) {
        const data = await response.json();
        setMaintenanceRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance requests:', error);
      // Use mock data for now
      setMaintenanceRequests([
        {
          id: "MR-001",
          propertyId: "1",
          title: "Air conditioning repair",
          description: "AC unit not cooling properly in unit 15A",
          priority: "HIGH",
          status: "IN_PROGRESS",
          assignedTo: "Tech Team Alpha",
          estimatedCost: 850,
          requestDate: "2024-01-18",
          unitNumber: "15A",
          category: "HVAC",
          tenantContact: {
            name: "Sarah Johnson",
            phone: "+971-50-123-4567",
            email: "sarah.j@email.com"
          },
          createdAt: "2024-01-18T10:00:00Z",
          updatedAt: "2024-01-18T10:00:00Z"
        },
        {
          id: "MR-002",
          propertyId: "2",
          title: "Elevator maintenance",
          description: "Scheduled monthly elevator inspection and maintenance",
          priority: "MEDIUM",
          status: "PENDING",
          assignedTo: "Elevator Services Inc",
          estimatedCost: 1200,
          requestDate: "2024-01-17",
          unitNumber: "Floor 8",
          category: "OTHER",
          createdAt: "2024-01-17T09:00:00Z",
          updatedAt: "2024-01-17T09:00:00Z"
        },
        {
          id: "MR-003",
          propertyId: "3",
          title: "Plumbing leak",
          description: "Water leak in shop 5 bathroom, urgent repair needed",
          priority: "URGENT",
          status: "PENDING",
          assignedTo: "Emergency Plumbing",
          estimatedCost: 450,
          requestDate: "2024-01-19",
          unitNumber: "Shop 5",
          category: "PLUMBING",
          tenantContact: {
            name: "Ahmed Al-Rashid",
            phone: "+971-55-987-6543"
          },
          createdAt: "2024-01-19T08:30:00Z",
          updatedAt: "2024-01-19T08:30:00Z"
        }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/real-estate/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalProperties: data.totalProperties || 0,
          totalUnits: data.totalUnits || 0,
          occupiedUnits: data.occupiedUnits || 0,
          occupancyRate: data.occupancyRate || 0,
          totalMonthlyRevenue: data.totalMonthlyRevenue || 0,
          pendingMaintenance: maintenanceRequests.filter(r => r.status === 'PENDING').length,
          urgentMaintenance: maintenanceRequests.filter(r => r.priority === 'URGENT').length,
          avgResponseTime: 4.2,
          tenantSatisfaction: 4.6
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Use calculated stats from properties, with fallback demo data if no properties exist
      const totalUnits = properties.length > 0 ? properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0) : 12;
      const occupiedUnits = properties.length > 0 ? properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0) : 10;
      
      // Calculate rental income
      const rentalRevenue = properties.length > 0 ? properties.reduce((sum, p) => sum + (p.totalMonthlyRent || 0), 0) : 85000;
      
      // Calculate maintenance fee income (charged to tenants/owners for completed work)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const maintenanceFeeIncome = maintenanceRequests
        .filter(r => {
          const requestDate = new Date(r.requestDate);
          return r.status === 'COMPLETED' && 
                 r.actualCost && 
                 requestDate.getMonth() === currentMonth && 
                 requestDate.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + (r.actualCost || 0), 0);
      
      // Use demo maintenance fee income if no real data
      const demoMaintenanceFee = maintenanceRequests.length > 0 ? maintenanceFeeIncome : 15000;
      
      const totalRevenue = rentalRevenue + demoMaintenanceFee;
      
      setStats({
        totalProperties: properties.length > 0 ? properties.length : 4,
        totalUnits,
        occupiedUnits,
        occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 83.3,
        totalMonthlyRevenue: totalRevenue,
        pendingMaintenance: maintenanceRequests.filter(r => r.status === 'PENDING').length,
        urgentMaintenance: maintenanceRequests.filter(r => r.priority === 'URGENT').length,
        avgResponseTime: 4.2,
        tenantSatisfaction: 4.6
      });
    }
  };

  const fetchUnitTypes = async () => {
    try {
      const response = await fetch('/api/real-estate/unit-types');
      if (response.ok) {
        const data = await response.json();
        setUnitTypes(data.unitTypes || []);
      }
    } catch (error) {
      console.error('Error fetching unit types:', error);
    }
  };

  const fetchRentalUnits = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/real-estate/rental-units?propertyId=${propertyId}&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        setRentalUnits(data.units || []);
      }
    } catch (error) {
      console.error('Error fetching rental units:', error);
      setRentalUnits([]);
    }
  };

  const handleCreateUnit = async () => {
    try {
      if (!selectedProperty) return;

      const unitData = {
        unitNumber: unitForm.unitNumber,
        unitTypeId: unitForm.unitTypeId,
        propertyId: selectedProperty.id,
        area: Number(unitForm.area) || undefined,
        bedrooms: Number(unitForm.bedrooms),
        bathrooms: Number(unitForm.bathrooms),
        parkingSpots: Number(unitForm.parkingSpots),
        rentAmount: Number(unitForm.rentAmount),
        securityDeposit: Number(unitForm.securityDeposit) || undefined,
        status: unitForm.status,
        notes: unitForm.notes || undefined
      };

      const response = await fetch('/api/real-estate/rental-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData)
      });

      if (response.ok) {
        await fetchRentalUnits(selectedProperty.id);
        await fetchProperties(); // Refresh property data
        resetUnitForm();
        setShowAddUnit(false);
      } else {
        const error = await response.json();
        console.error('Error creating unit:', error);
      }
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleUpdateUnit = async () => {
    try {
      if (!editingUnit || !selectedProperty) return;

      const unitData = {
        unitNumber: unitForm.unitNumber,
        unitTypeId: unitForm.unitTypeId,
        area: Number(unitForm.area) || undefined,
        bedrooms: Number(unitForm.bedrooms),
        bathrooms: Number(unitForm.bathrooms),
        parkingSpots: Number(unitForm.parkingSpots),
        rentAmount: Number(unitForm.rentAmount),
        securityDeposit: Number(unitForm.securityDeposit) || undefined,
        status: unitForm.status,
        notes: unitForm.notes || undefined
      };

      const response = await fetch(`/api/real-estate/rental-units/${editingUnit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData)
      });

      if (response.ok) {
        await fetchRentalUnits(selectedProperty.id);
        await fetchProperties(); // Refresh property data
        resetUnitForm();
        setEditingUnit(null);
      } else {
        const error = await response.json();
        console.error('Error updating unit:', error);
      }
    } catch (error) {
      console.error('Error updating unit:', error);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      if (!selectedProperty) return;

      const response = await fetch(`/api/real-estate/rental-units/${unitId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRentalUnits(selectedProperty.id);
        await fetchProperties(); // Refresh property data
      } else {
        const error = await response.json();
        console.error('Error deleting unit:', error);
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const resetUnitForm = () => {
    setUnitForm({
      unitNumber: "",
      unitTypeId: "",
      area: "",
      bedrooms: "0",
      bathrooms: "0",
      parkingSpots: "0",
      rentAmount: "",
      securityDeposit: "",
      status: "VACANT",
      notes: ""
    });
  };

  const openEditUnit = (unit: any) => {
    setUnitForm({
      unitNumber: unit.unitNumber || "",
      unitTypeId: unit.unitTypeId || "",
      area: unit.area?.toString() || "",
      bedrooms: unit.bedrooms?.toString() || "0",
      bathrooms: unit.bathrooms?.toString() || "0",
      parkingSpots: unit.parkingSpots?.toString() || "0",
      rentAmount: unit.rentAmount?.toString() || "",
      securityDeposit: unit.securityDeposit?.toString() || "",
      status: unit.status || "VACANT",
      notes: unit.notes || ""
    });
    setEditingUnit(unit);
  };

  const handleManageUnits = (property: Property) => {
    setSelectedProperty(property);
    fetchRentalUnits(property.id);
    setShowUnitManagement(true);
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "needs-attention": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getMaintenanceStatusBg = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "needs-attention": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return CheckCircle;
      case "IN_PROGRESS": return Clock;
      case "PENDING": return AlertTriangle;
      case "CANCELLED": return X;
      default: return Clock;
    }
  };

  const getPriorityBadgeColor = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-800 border-red-200";
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Handler Functions
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const handleViewTenants = (property: Property) => {
    // Navigate to tenant management with property filter
    window.location.href = `/real-estate/tenants/management?property=${encodeURIComponent(property.name)}&highlight=${property.id}`;
  };

  const handleViewAppliances = (property: Property) => {
    // Navigate to appliance inventory with property filter
    window.location.href = `/real-estate/appliances/inventory?property=${encodeURIComponent(property.name)}&highlight=${property.id}`;
  };

  const handleViewLeases = (property: Property) => {
    // Navigate to lease agreements with property filter
    window.location.href = `/real-estate/tenants/leases?property=${encodeURIComponent(property.name)}&highlight=${property.id}`;
  };

  const handleViewRentCollection = (property: Property) => {
    // Navigate to rent collection with property filter
    window.location.href = `/real-estate/tenants/rent?property=${encodeURIComponent(property.name)}&highlight=${property.id}`;
  };

  const handleViewMaintenance = (request: MaintenanceRequest) => {
    setSelectedMaintenance(request);
    setShowMaintenanceModal(true);
  };

  const handleCreateMaintenance = () => {
    setMaintenanceForm({
      propertyId: "",
      title: "",
      description: "",
      priority: "MEDIUM",
      category: "OTHER",
      unitNumber: "",
      estimatedCost: "",
      assignedTo: "",
      tenantName: "",
      tenantPhone: "",
      tenantEmail: ""
    });
    setShowCreateMaintenance(true);
  };

  const handleSubmitMaintenance = async () => {
    try {
      const payload = {
        propertyId: maintenanceForm.propertyId,
        title: maintenanceForm.title,
        description: maintenanceForm.description,
        priority: maintenanceForm.priority,
        category: maintenanceForm.category,
        unitNumber: maintenanceForm.unitNumber || undefined,
        estimatedCost: maintenanceForm.estimatedCost ? parseFloat(maintenanceForm.estimatedCost) : undefined,
        assignedTo: maintenanceForm.assignedTo || undefined,
        tenantContact: (maintenanceForm.tenantName || maintenanceForm.tenantPhone || maintenanceForm.tenantEmail) ? {
          name: maintenanceForm.tenantName,
          phone: maintenanceForm.tenantPhone || undefined,
          email: maintenanceForm.tenantEmail || undefined,
        } : undefined
      };

      const response = await fetch('/api/real-estate/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchMaintenanceRequests();
        setShowCreateMaintenance(false);
      } else {
        const error = await response.json();
        console.error('Failed to create maintenance request:', error);
      }
    } catch (error) {
      console.error('Failed to create maintenance request:', error);
    }
  };

  const handleUpdateMaintenanceStatus = async (id: string, status: MaintenanceRequest['status']) => {
    try {
      const response = await fetch(`/api/real-estate/maintenance-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Failed to update maintenance request:', error);
    }
  };

  // Filtering Functions
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === "all" || property.propertyType.name.toLowerCase() === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredMaintenanceRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = maintenanceFilter === "all" || 
                         request.status.toLowerCase() === maintenanceFilter ||
                         request.priority.toLowerCase() === maintenanceFilter ||
                         request.category.toLowerCase() === maintenanceFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading property management data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <motion.div 
                className="flex items-center space-x-3 sm:space-x-4"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient">Property Management</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Comprehensive property oversight and operations</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search properties..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-48 lg:w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1 sm:w-28 lg:w-32 glass-card border-0">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="flex-1 sm:w-32 lg:w-40 glass-card border-0">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="btn-premium whitespace-nowrap"
                    onClick={handleCreateMaintenance}
                  >
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Request</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Properties
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {stats?.totalProperties || properties.length}
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    {stats?.totalUnits || properties.reduce((sum, p) => sum + p.totalUnits, 0)} total units
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Occupancy Rate
                  </CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {(() => {
                      const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
                      const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
                      const calculatedRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
                      const finalRate = stats?.occupancyRate || calculatedRate;
                      return `${finalRate.toFixed(1)}%`;
                    })()}
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    {(() => {
                      const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
                      const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
                      const finalOccupied = stats?.occupiedUnits || occupiedUnits;
                      const finalTotal = stats?.totalUnits || totalUnits;
                      return `${finalOccupied} of ${finalTotal} occupied`;
                    })()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    AED {(() => {
                      // Calculate rental income
                      const rentalRevenue = properties.reduce((sum, p) => sum + (p.totalMonthlyRent || 0), 0);
                      
                      // Calculate maintenance fee income for current month
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      const maintenanceFeeIncome = maintenanceRequests
                        .filter(r => {
                          const requestDate = new Date(r.requestDate);
                          return r.status === 'COMPLETED' && 
                                 r.actualCost && 
                                 requestDate.getMonth() === currentMonth && 
                                 requestDate.getFullYear() === currentYear;
                        })
                        .reduce((sum, r) => sum + (r.actualCost || 0), 0);
                      
                      // Use demo data if no properties/maintenance
                      const demoRental = properties.length > 0 ? rentalRevenue : 85000;
                      const demoMaintenance = maintenanceRequests.length > 0 ? maintenanceFeeIncome : 15000;
                      
                      const totalRevenue = stats?.totalMonthlyRevenue || (demoRental + demoMaintenance);
                      return totalRevenue.toLocaleString('en-AE');
                    })()}
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    {(() => {
                      const rentalRevenue = properties.reduce((sum, p) => sum + (p.totalMonthlyRent || 0), 0);
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      const maintenanceFeeIncome = maintenanceRequests
                        .filter(r => {
                          const requestDate = new Date(r.requestDate);
                          return r.status === 'COMPLETED' && 
                                 r.actualCost && 
                                 requestDate.getMonth() === currentMonth && 
                                 requestDate.getFullYear() === currentYear;
                        })
                        .reduce((sum, r) => sum + (r.actualCost || 0), 0);
                      
                      const rental = properties.length > 0 ? rentalRevenue : 85000;
                      const maintenance = maintenanceRequests.length > 0 ? maintenanceFeeIncome : 15000;
                      
                      return `AED ${rental.toLocaleString('en-AE')} rental + AED ${maintenance.toLocaleString('en-AE')} maintenance fees`;
                    })()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Maintenance Requests
                  </CardTitle>
                  <Wrench className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {maintenanceRequests.length}
                  </div>
                  <p className="text-sm text-yellow-600 font-medium">
                    {stats?.urgentMaintenance || 0} urgent pending
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10 lg:mb-12">
            {/* Property Overview */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <Building2 className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle>Property Portfolio</CardTitle>
                        <CardDescription>
                          Overview of managed properties ({filteredProperties.length} total)
                        </CardDescription>
                      </div>
                    </div>
                    {filteredProperties.length > propertiesPerPage && (
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPropertyCurrentPage(Math.max(0, propertyCurrentPage - 1))}
                          disabled={propertyCurrentPage === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2 whitespace-nowrap">
                          {propertyCurrentPage + 1} of {Math.ceil(filteredProperties.length / propertiesPerPage)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPropertyCurrentPage(Math.min(Math.ceil(filteredProperties.length / propertiesPerPage) - 1, propertyCurrentPage + 1))}
                          disabled={propertyCurrentPage >= Math.ceil(filteredProperties.length / propertiesPerPage) - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const startIndex = propertyCurrentPage * propertiesPerPage;
                      const endIndex = startIndex + propertiesPerPage;
                      const currentProperties = filteredProperties.slice(startIndex, endIndex);
                      
                      if (currentProperties.length === 0 && filteredProperties.length > 0) {
                        // Reset to first page if current page is empty
                        setPropertyCurrentPage(0);
                        return null;
                      }
                      
                      return currentProperties.map((property, index) => {
                        const occupancyRate = property.totalUnits > 0 
                          ? ((property.occupiedUnits / property.totalUnits) * 100).toFixed(1) + '%'
                          : '0%';
                        
                        return (
                          <motion.div 
                            key={property.id}
                            className="glass-card p-3 sm:p-4 rounded-xl hover-lift cursor-pointer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            onClick={() => handleViewProperty(property)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground truncate">{property.name}</h4>
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{property.address}, {property.city}</span>
                                </div>
                              </div>
                              <Badge 
                                className={`text-xs ${property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} flex-shrink-0`}
                                variant="outline"
                              >
                                {property.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Occupancy</p>
                                <p className="font-semibold text-gradient">{occupancyRate}</p>
                                <p className="text-xs text-muted-foreground">{property.occupiedUnits}/{property.totalUnits} units</p>
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                                <p className="font-semibold text-foreground text-sm sm:text-base">AED {property.totalMonthlyRent.toLocaleString('en-AE')}</p>
                                <p className="text-xs text-muted-foreground">Monthly</p>
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Owner</p>
                                <p className="font-semibold text-foreground text-sm truncate">{property.owner.firstName} {property.owner.lastName}</p>
                                <p className="text-xs text-muted-foreground">Property Owner</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <p className="text-xs text-muted-foreground truncate">
                                Type: {property.propertyType.name}
                              </p>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow flex-1 sm:flex-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProperty(property);
                                  }}
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="ml-1 sm:hidden">View</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="glass-card border-0 hover-glow flex-1 sm:flex-none text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleManageUnits(property);
                                  }}
                                >
                                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="ml-1 hidden sm:inline">Units</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="btn-premium flex-1 sm:flex-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProperty(property);
                                  }}
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Manage</span>
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                    
                    {filteredProperties.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No properties found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance Requests */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <Wrench className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle>Maintenance Requests</CardTitle>
                        <CardDescription>
                          Active maintenance and repair requests ({filteredMaintenanceRequests.length} total)
                        </CardDescription>
                      </div>
                    </div>
                    {filteredMaintenanceRequests.length > maintenancePerPage && (
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMaintenanceCurrentPage(Math.max(0, maintenanceCurrentPage - 1))}
                          disabled={maintenanceCurrentPage === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2 whitespace-nowrap">
                          {maintenanceCurrentPage + 1} of {Math.ceil(filteredMaintenanceRequests.length / maintenancePerPage)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMaintenanceCurrentPage(Math.min(Math.ceil(filteredMaintenanceRequests.length / maintenancePerPage) - 1, maintenanceCurrentPage + 1))}
                          disabled={maintenanceCurrentPage >= Math.ceil(filteredMaintenanceRequests.length / maintenancePerPage) - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                                 {/* Maintenance Filter */}
                 <div className="px-4 sm:px-6 pb-4">
                   <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                     <div className="flex items-center space-x-2">
                       <Filter className="w-4 h-4 text-muted-foreground" />
                       <Label className="text-sm font-medium">Filter by:</Label>
                     </div>
                     <div className="flex flex-1 gap-2">
                       <Select value={maintenanceFilter} onValueChange={setMaintenanceFilter}>
                         <SelectTrigger className="flex-1 sm:w-48">
                           <SelectValue placeholder="Filter maintenance requests" />
                         </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="urgent">Urgent Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="appliance">Appliance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                                           {maintenanceFilter !== "all" && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setMaintenanceFilter("all")}
                           className="h-8 px-3"
                         >
                           <X className="w-3 h-3 sm:mr-1" />
                           <span className="hidden sm:inline">Clear</span>
                         </Button>
                       )}
                     </div>
                   </div>
                 </div>
                
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const startIndex = maintenanceCurrentPage * maintenancePerPage;
                      const endIndex = startIndex + maintenancePerPage;
                      const currentRequests = filteredMaintenanceRequests.slice(startIndex, endIndex);
                      
                      if (currentRequests.length === 0 && filteredMaintenanceRequests.length > 0) {
                        // Reset to first page if current page is empty
                        setMaintenanceCurrentPage(0);
                        return null;
                      }
                      
                      return currentRequests.map((request, index) => {
                        const StatusIcon = getRequestStatusIcon(request.status);
                        const propertyName = properties.find(p => p.id === request.propertyId)?.name || 'Unknown Property';
                        return (
                          <motion.div 
                            key={request.id}
                            className="glass-card p-3 sm:p-4 rounded-xl hover-lift cursor-pointer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            onClick={() => handleViewMaintenance(request)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">{request.id}</h4>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{propertyName}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <Badge 
                                  className={`text-xs ${getPriorityBadgeColor(request.priority)}`}
                                  variant="outline"
                                >
                                  {request.priority}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getStatusBadgeColor(request.status)}`}
                                  variant="outline"
                                >
                                  {request.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="font-medium text-foreground text-sm sm:text-base">{request.title}</p>
                              {request.unitNumber && (
                                <p className="text-xs sm:text-sm text-muted-foreground">Unit: {request.unitNumber}</p>
                              )}
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{request.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Assigned To</p>
                                <p className="font-semibold text-foreground text-sm truncate">{request.assignedTo || 'Unassigned'}</p>
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Est. Cost</p>
                                <p className="font-semibold text-gradient text-sm">
                                  {request.estimatedCost ? `AED ${request.estimatedCost.toLocaleString('en-AE')}` : 'TBD'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                Requested: {new Date(request.requestDate).toLocaleDateString()}
                              </p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="glass-card border-0 hover-glow w-full sm:w-auto"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="ml-2 sm:hidden">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewMaintenance(request)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateMaintenanceStatus(request.id, 'IN_PROGRESS')}
                                    disabled={request.status === 'IN_PROGRESS' || request.status === 'COMPLETED'}
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateMaintenanceStatus(request.id, 'COMPLETED')}
                                    disabled={request.status === 'COMPLETED'}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                    
                    {filteredMaintenanceRequests.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No maintenance requests found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Property Performance Metrics */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Property Performance Metrics</CardTitle>
                    <CardDescription>
                      Key performance indicators across the portfolio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {(() => {
                    // Calculate real metrics with fallback to realistic demo values
                    const hasProperties = properties.length > 0;
                    const hasMaintenanceData = maintenanceRequests.length > 0;
                    
                    // Use real data if available, otherwise demo data
                    const totalUnits = hasProperties ? properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0) : 12;
                    const occupiedUnits = hasProperties ? properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0) : 10;
                    let avgOccupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 83.3;
                    
                    // Ensure valid occupancy rate
                    if (!isFinite(avgOccupancyRate) || isNaN(avgOccupancyRate)) {
                      avgOccupancyRate = 83.3;
                    }
                    // Cap occupancy rate between 0 and 100
                    avgOccupancyRate = Math.min(Math.max(avgOccupancyRate, 0), 100);
                    
                    // Calculate total revenue including rental income and maintenance fees
                    const rentalRevenue = hasProperties ? properties.reduce((sum, p) => sum + (p.totalMonthlyRent || 0), 0) : 85000;
                    
                    // Calculate maintenance fee income from completed maintenance requests
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const maintenanceFeeIncome = maintenanceRequests
                      .filter(r => {
                        const requestDate = new Date(r.requestDate);
                        return r.status === 'COMPLETED' && 
                               r.actualCost && 
                               requestDate.getMonth() === currentMonth && 
                               requestDate.getFullYear() === currentYear;
                      })
                      .reduce((sum, r) => sum + (r.actualCost || 0), 0);
                    
                    const demoMaintenanceFee = hasMaintenanceData ? maintenanceFeeIncome : 15000;
                    const totalRevenue = rentalRevenue + demoMaintenanceFee;
                    let revenuePerUnit = totalUnits > 0 ? totalRevenue / totalUnits : 8333;
                    
                    // Ensure valid revenue per unit
                    if (!isFinite(revenuePerUnit) || isNaN(revenuePerUnit) || revenuePerUnit < 0) {
                      revenuePerUnit = 8333; // Fallback value
                    }
                    
                    // Maintenance Response Time Calculation
                    const completedRequests = maintenanceRequests.filter(r => r.status === 'COMPLETED' && r.completionDate);
                    let avgResponseTime = 0;
                    if (completedRequests.length > 0) {
                      avgResponseTime = completedRequests.reduce((sum, r) => {
                        const requestDate = new Date(r.requestDate);
                        const completionDate = new Date(r.completionDate!);
                        const diffHours = Math.abs(completionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60);
                        return sum + Math.min(diffHours, 168); // Cap at 1 week
                      }, 0) / completedRequests.length;
                    } else {
                      avgResponseTime = hasMaintenanceData ? 24 : 18.5; // Demo: 18.5 hours average
                    }
                    
                    // Maintenance Cost Ratio Calculation
                    const totalMaintenanceCost = maintenanceRequests
                      .filter(r => r.actualCost || r.estimatedCost)
                      .reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
                    const annualRevenue = totalRevenue * 12;
                    let maintenanceCostRatio = 0;
                    
                    // Ensure we have meaningful revenue and cost data to prevent astronomical calculations
                    if (annualRevenue > 1000 && totalMaintenanceCost > 0) {
                      const ratio = (totalMaintenanceCost / annualRevenue) * 100;
                      // Cap the ratio at reasonable limits (max 50%)
                      maintenanceCostRatio = Math.min(Math.max(ratio, 0), 50);
                    } else if (hasProperties && totalMaintenanceCost === 0) {
                      maintenanceCostRatio = 0; // No maintenance costs
                    } else {
                      maintenanceCostRatio = 8.5; // Demo: 8.5%
                    }
                    
                    // Ensure no NaN or Infinity values
                    if (!isFinite(maintenanceCostRatio) || isNaN(maintenanceCostRatio)) {
                      maintenanceCostRatio = hasProperties ? 0 : 8.5;
                    }
                    
                    // Tenant Satisfaction (dynamic based on occupancy)
                    let tenantSatisfactionScore = hasProperties ? 
                      Math.min(5.0, 4.2 + (avgOccupancyRate / 100) * 0.8) : 4.6; // Demo: 4.6/5.0
                    
                    // Ensure valid satisfaction score
                    if (!isFinite(tenantSatisfactionScore) || isNaN(tenantSatisfactionScore)) {
                      tenantSatisfactionScore = 4.6;
                    }
                    
                    // Lease Renewal Rate (estimated based on occupancy)
                    let leaseRenewalRate = hasProperties ? 
                      Math.min(95, Math.max(60, 75 + (avgOccupancyRate - 80) * 0.5)) : 87.2; // Demo: 87.2%
                    
                    // Ensure valid renewal rate
                    if (!isFinite(leaseRenewalRate) || isNaN(leaseRenewalRate)) {
                      leaseRenewalRate = 87.2;
                    }

                    const getStatus = (value: number, thresholds: {excellent: number, good: number}) => {
                      if (value >= thresholds.excellent) return "excellent";
                      if (value >= thresholds.good) return "good";
                      return "needs attention";
                    };

                    return [
                      {
                        metric: "Average Occupancy Rate",
                        value: `${avgOccupancyRate.toFixed(1)}%`,
                        description: "Across all properties",
                        trend: avgOccupancyRate > 90 ? "+2.3%" : avgOccupancyRate > 80 ? "+1.1%" : "-0.5%",
                        status: getStatus(avgOccupancyRate, {excellent: 95, good: 85})
                      },
                      {
                        metric: "Maintenance Response Time",
                        value: avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)} hours` : "N/A",
                        description: "Average response time",
                        trend: avgResponseTime < 24 ? "-0.8 hours" : "+2.3 hours",
                        status: getStatus(24 - avgResponseTime, {excellent: 20, good: 16})
                      },
                      {
                        metric: "Tenant Satisfaction",
                        value: `${tenantSatisfactionScore.toFixed(1)}/5.0`,
                        description: "Based on property metrics",
                        trend: tenantSatisfactionScore > 4.5 ? "+0.2" : tenantSatisfactionScore > 4.0 ? "+0.1" : "-0.1",
                        status: getStatus(tenantSatisfactionScore, {excellent: 4.5, good: 4.0})
                      },
                      {
                        metric: "Revenue per Unit",
                        value: `AED ${revenuePerUnit.toLocaleString('en-AE', {maximumFractionDigits: 0})}`,
                        description: "Rental + maintenance fees",
                        trend: revenuePerUnit > 3000 ? "+AED 185" : revenuePerUnit > 2000 ? "+AED 85" : "-AED 50",
                        status: getStatus(revenuePerUnit, {excellent: 4000, good: 2500})
                      },
                      {
                        metric: "Maintenance Cost Ratio",
                        value: `${maintenanceCostRatio.toFixed(1)}%`,
                        description: "Of total revenue",
                        trend: maintenanceCostRatio < 8 ? "-1.2%" : maintenanceCostRatio < 12 ? "+0.5%" : "+2.1%",
                        status: getStatus(15 - maintenanceCostRatio, {excellent: 10, good: 5})
                      },
                      {
                        metric: "Lease Renewal Rate",
                        value: `${leaseRenewalRate.toFixed(1)}%`,
                        description: "Estimated based on occupancy",
                        trend: leaseRenewalRate > 85 ? "+3.1%" : leaseRenewalRate > 75 ? "+1.5%" : "-1.2%",
                        status: getStatus(leaseRenewalRate, {excellent: 90, good: 80})
                      }
                    ];
                  })().map((item, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-4 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{item.metric}</h4>
                        <Badge 
                          variant={item.status === "excellent" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-gradient mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <p className="text-sm text-green-600 font-medium">{item.trend}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* Property Details Modal */}
        <Dialog open={showPropertyDetails} onOpenChange={setShowPropertyDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedProperty?.name}
              </DialogTitle>
              <DialogDescription>
                Property details and management information
              </DialogDescription>
            </DialogHeader>
            
            {selectedProperty && (
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="units">Units</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Address</Label>
                        <p className="text-foreground">{selectedProperty.address}, {selectedProperty.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Property Type</Label>
                        <p className="text-foreground">{selectedProperty.propertyType.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Owner</Label>
                        <p className="text-foreground">{selectedProperty.owner.firstName} {selectedProperty.owner.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={selectedProperty.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedProperty.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Total Units</Label>
                        <p className="text-2xl font-bold text-gradient">{selectedProperty.totalUnits}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Occupied Units</Label>
                        <p className="text-2xl font-bold text-gradient">{selectedProperty.occupiedUnits}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Monthly Revenue</Label>
                        <p className="text-2xl font-bold text-gradient">AED {selectedProperty.totalMonthlyRent.toLocaleString('en-AE')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Annual Expenses</Label>
                        <p className="text-2xl font-bold text-gradient">AED {selectedProperty.totalYearlyExpenses.toLocaleString('en-AE')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedProperty.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-muted-foreground mt-1">{selectedProperty.description}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="units" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {selectedProperty.rentalUnits?.map((unit: any, index: number) => (
                      <Card key={index} className="glass-card">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Unit {unit.unitNumber || index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Rent:</span>
                              <span className="font-medium">AED {(unit.monthlyRent || 0).toLocaleString('en-AE')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Status:</span>
                              <Badge 
                                variant="outline" 
                                className={unit.status === 'OCCUPIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                              >
                                {unit.status || 'Available'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )) || (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No unit details available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="maintenance" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Maintenance History</h3>
                    <Button 
                      onClick={() => {
                        setMaintenanceForm(prev => ({...prev, propertyId: selectedProperty.id}));
                        setShowCreateMaintenance(true);
                      }}
                      className="btn-premium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {maintenanceRequests
                      .filter(req => req.propertyId === selectedProperty.id)
                      .map((request) => (
                        <Card key={request.id} className="glass-card cursor-pointer hover-lift" onClick={() => handleViewMaintenance(request)}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{request.title}</h4>
                              <div className="flex space-x-2">
                                <Badge className={getPriorityBadgeColor(request.priority)} variant="outline">
                                  {request.priority}
                                </Badge>
                                <Badge className={getStatusBadgeColor(request.status)} variant="outline">
                                  {request.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                              {request.estimatedCost && (
                                <span>Est. Cost: AED {request.estimatedCost.toLocaleString('en-AE')}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {maintenanceRequests.filter(req => req.propertyId === selectedProperty.id).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No maintenance requests for this property</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Maintenance Request Details Modal */}
        <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Maintenance Request Details</DialogTitle>
              <DialogDescription>
                Request ID: {selectedMaintenance?.id}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMaintenance && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={getPriorityBadgeColor(selectedMaintenance.priority)}>
                      {selectedMaintenance.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusBadgeColor(selectedMaintenance.status)}>
                      {selectedMaintenance.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-foreground mt-1">{selectedMaintenance.title}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-muted-foreground mt-1">{selectedMaintenance.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Property</Label>
                    <p className="text-foreground">{properties.find(p => p.id === selectedMaintenance.propertyId)?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit</Label>
                    <p className="text-foreground">{selectedMaintenance.unitNumber || 'General'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Assigned To</Label>
                    <p className="text-foreground">{selectedMaintenance.assignedTo || 'Unassigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-foreground">{selectedMaintenance.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estimated Cost</Label>
                    <p className="text-foreground">{selectedMaintenance.estimatedCost ? `AED ${selectedMaintenance.estimatedCost.toLocaleString('en-AE')}` : 'TBD'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Request Date</Label>
                    <p className="text-foreground">{new Date(selectedMaintenance.requestDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedMaintenance.tenantContact && (
                  <div>
                    <Label className="text-sm font-medium">Tenant Contact</Label>
                    <div className="mt-2 space-y-1">
                      <p className="text-foreground flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {selectedMaintenance.tenantContact.name}
                      </p>
                      {selectedMaintenance.tenantContact.phone && (
                        <p className="text-foreground flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedMaintenance.tenantContact.phone}
                        </p>
                      )}
                      {selectedMaintenance.tenantContact.email && (
                        <p className="text-foreground flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedMaintenance.tenantContact.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <div className="space-x-2">
                    {selectedMaintenance.status === 'PENDING' && (
                      <Button 
                        onClick={() => handleUpdateMaintenanceStatus(selectedMaintenance.id, 'IN_PROGRESS')}
                        className="btn-premium"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start Work
                      </Button>
                    )}
                    {selectedMaintenance.status === 'IN_PROGRESS' && (
                      <Button 
                        onClick={() => handleUpdateMaintenanceStatus(selectedMaintenance.id, 'COMPLETED')}
                        className="btn-premium"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMaintenanceModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Maintenance Request Modal */}
        <Dialog open={showCreateMaintenance} onOpenChange={setShowCreateMaintenance}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
              <DialogDescription>
                Submit a new maintenance request for a property
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property">Property *</Label>
                  <Select 
                    value={maintenanceForm.propertyId} 
                    onValueChange={(value) => setMaintenanceForm(prev => ({...prev, propertyId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select 
                    value={maintenanceForm.priority} 
                    onValueChange={(value: MaintenanceRequest['priority']) => setMaintenanceForm(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title"
                  placeholder="Brief description of the issue"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm(prev => ({...prev, title: e.target.value}))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description"
                  placeholder="Detailed description of the maintenance issue"
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={maintenanceForm.category} 
                    onValueChange={(value: MaintenanceRequest['category']) => setMaintenanceForm(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLUMBING">Plumbing</SelectItem>
                      <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="CLEANING">Cleaning</SelectItem>
                      <SelectItem value="PAINTING">Painting</SelectItem>
                      <SelectItem value="APPLIANCE">Appliance</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input 
                    id="unitNumber"
                    placeholder="e.g., 101, 2A, etc."
                    value={maintenanceForm.unitNumber}
                    onChange={(e) => setMaintenanceForm(prev => ({...prev, unitNumber: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input 
                    id="estimatedCost"
                    type="number"
                    placeholder="0.00"
                    value={maintenanceForm.estimatedCost}
                    onChange={(e) => setMaintenanceForm(prev => ({...prev, estimatedCost: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input 
                    id="assignedTo"
                    placeholder="Contractor or team name"
                    value={maintenanceForm.assignedTo}
                    onChange={(e) => setMaintenanceForm(prev => ({...prev, assignedTo: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Tenant Contact (Optional)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="tenantName">Tenant Name</Label>
                    <Input 
                      id="tenantName"
                      placeholder="Full name"
                      value={maintenanceForm.tenantName}
                      onChange={(e) => setMaintenanceForm(prev => ({...prev, tenantName: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tenantPhone">Phone</Label>
                      <Input 
                        id="tenantPhone"
                        placeholder="+1 (555) 123-4567"
                        value={maintenanceForm.tenantPhone}
                        onChange={(e) => setMaintenanceForm(prev => ({...prev, tenantPhone: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenantEmail">Email</Label>
                      <Input 
                        id="tenantEmail"
                        type="email"
                        placeholder="tenant@email.com"
                        value={maintenanceForm.tenantEmail}
                        onChange={(e) => setMaintenanceForm(prev => ({...prev, tenantEmail: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateMaintenance(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitMaintenance}
                disabled={!maintenanceForm.propertyId || !maintenanceForm.title || !maintenanceForm.description}
                className="btn-premium"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unit Management Modal */}
        <Dialog open={showUnitManagement} onOpenChange={setShowUnitManagement}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Units - {selectedProperty?.name}</DialogTitle>
              <DialogDescription>
                Add, edit, or remove rental units for this property
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Rental Units ({rentalUnits.length})</h3>
                <Button 
                  onClick={() => {
                    resetUnitForm();
                    setShowAddUnit(true);
                  }}
                  className="btn-premium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rentalUnits.map((unit) => (
                  <Card key={unit.id} className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">Unit {unit.unitNumber}</CardTitle>
                          <p className="text-xs text-muted-foreground">{unit.unitType?.name}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={unit.status === 'OCCUPIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {unit.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Rent:</span>
                          <span className="font-medium text-sm">AED {Number(unit.rentAmount || 0).toLocaleString('en-AE')}</span>
                        </div>
                        {unit.area && (
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Area:</span>
                            <span className="text-sm">{unit.area} sq ft</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Bedrooms:</span>
                          <span className="text-sm">{unit.bedrooms || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Bathrooms:</span>
                          <span className="text-sm">{unit.bathrooms || 0}</span>
                        </div>
                        {unit.currentTenant && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">Current Tenant:</p>
                            <p className="text-sm font-medium">{unit.currentTenant.firstName} {unit.currentTenant.lastName}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openEditUnit(unit)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this unit?')) {
                              handleDeleteUnit(unit.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {rentalUnits.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No units found for this property</p>
                    <Button 
                      onClick={() => {
                        resetUnitForm();
                        setShowAddUnit(true);
                      }}
                      className="btn-premium mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Unit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Unit Modal */}
        <Dialog open={showAddUnit || !!editingUnit} onOpenChange={(open) => {
          if (!open) {
            setShowAddUnit(false);
            setEditingUnit(null);
            resetUnitForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
              <DialogDescription>
                {editingUnit ? 'Update unit details' : 'Add a new rental unit to this property'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input 
                    id="unitNumber"
                    placeholder="e.g., 101, 2A, etc."
                    value={unitForm.unitNumber}
                    onChange={(e) => setUnitForm(prev => ({...prev, unitNumber: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="unitType">Unit Type *</Label>
                  <Select 
                    value={unitForm.unitTypeId} 
                    onValueChange={(value) => setUnitForm(prev => ({...prev, unitTypeId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input 
                    id="area"
                    type="number"
                    placeholder="0"
                    value={unitForm.area}
                    onChange={(e) => setUnitForm(prev => ({...prev, area: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input 
                    id="bedrooms"
                    type="number"
                    placeholder="0"
                    value={unitForm.bedrooms}
                    onChange={(e) => setUnitForm(prev => ({...prev, bedrooms: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input 
                    id="bathrooms"
                    type="number"
                    placeholder="0"
                    value={unitForm.bathrooms}
                    onChange={(e) => setUnitForm(prev => ({...prev, bathrooms: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rentAmount">Monthly Rent (AED) *</Label>
                  <Input 
                    id="rentAmount"
                    type="number"
                    placeholder="0"
                    value={unitForm.rentAmount}
                    onChange={(e) => setUnitForm(prev => ({...prev, rentAmount: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="securityDeposit">Security Deposit (AED)</Label>
                  <Input 
                    id="securityDeposit"
                    type="number"
                    placeholder="0"
                    value={unitForm.securityDeposit}
                    onChange={(e) => setUnitForm(prev => ({...prev, securityDeposit: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parkingSpots">Parking Spots</Label>
                  <Input 
                    id="parkingSpots"
                    type="number"
                    placeholder="0"
                    value={unitForm.parkingSpots}
                    onChange={(e) => setUnitForm(prev => ({...prev, parkingSpots: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={unitForm.status} 
                    onValueChange={(value) => setUnitForm(prev => ({...prev, status: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VACANT">Vacant</SelectItem>
                      <SelectItem value="OCCUPIED">Occupied</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Additional notes about this unit"
                  value={unitForm.notes}
                  onChange={(e) => setUnitForm(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddUnit(false);
                  setEditingUnit(null);
                  resetUnitForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingUnit ? handleUpdateUnit : handleCreateUnit}
                disabled={!unitForm.unitNumber || !unitForm.unitTypeId || !unitForm.rentAmount}
                className="btn-premium"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingUnit ? 'Update Unit' : 'Create Unit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 