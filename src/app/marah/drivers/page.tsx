"use client";

import { motion } from "framer-motion";
import { 
  Search,
  Filter,
  Truck,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  UserPlus,
  CreditCard,
  MapPin,
  Star,
  TrendingUp,
  Car,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DriverAvatar } from "@/components/ui/profile-avatar";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn, toNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AddDriverModal } from "@/components/modals/add-driver-modal";
import { DriverDetailModal } from "@/components/modals/driver-detail-modal";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber?: string;
  vehicleInfo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BUSY';
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalRevenue: number;
  completionRate: number;
  profilePicture?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  experience?: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
}

export default function DriversPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverDetail, setShowDriverDetail] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Drivers" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "BUSY", label: "Busy" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchDrivers();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchDrivers();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchDrivers();
    }
  }, [searchTerm, statusFilter]);

  const fetchMarahCompany = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const marahCompany = data.companies.find((company: any) => 
          company.name === 'MARAH Inflatable Games Rental'
        );
        
        if (marahCompany) {
          setMarahCompanyId(marahCompany.id);
        } else {
          setError('MARAH company not found. Please create it first from the Companies page.');
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch company information');
    }
  };

  const fetchDrivers = async () => {
    if (!marahCompanyId) return;
    
    try {
      const params = new URLSearchParams({
        companyId: marahCompanyId,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/marah/drivers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      } else {
        setError('Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setSelectedDriver(driver);
      setShowDriverDetail(true);
    }
  };

  const handleEditDriver = (driverId: string) => {
    // For now, just show the driver detail modal
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setSelectedDriver(driver);
      setShowDriverDetail(true);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchDrivers(); // Refresh the drivers list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete driver');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };

  const handleToggleStatus = async (driverId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      const response = await fetch(`/api/marah/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchDrivers(); // Refresh the drivers list
      } else {
        alert('Failed to update driver status');
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Failed to update driver status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'BUSY': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle;
      case 'INACTIVE': return XCircle;
      case 'BUSY': return Clock;
      default: return AlertCircle;
    }
  };

  const getDriverInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const exportDrivers = () => {
    // Create CSV content
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Total Orders', 'Completion Rate', 'Total Revenue'];
    const csvContent = [
      headers.join(','),
      ...drivers.map(driver => [
        driver.name,
        driver.phone,
        driver.email || '',
        driver.status,
        driver.totalOrders,
        `${driver.completionRate.toFixed(1)}%`,
        driver.totalRevenue
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-drivers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDriverStats = () => {
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
    const busyDrivers = drivers.filter(d => d.status === 'BUSY').length;
    const avgCompletionRate = drivers.length > 0 
      ? drivers.reduce((sum, d) => sum + d.completionRate, 0) / drivers.length
      : 0;

    return { totalDrivers, activeDrivers, busyDrivers, avgCompletionRate };
  };

  const stats = getDriverStats();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Page Header */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
                  Drivers Management
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive driver management with profile pictures, performance tracking, and detailed analytics
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={exportDrivers} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchDrivers} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddDriver(true)} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  New Driver
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Driver Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Drivers</span>
                    <Truck className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.totalDrivers}
                  </div>
                  <p className="text-xs text-blue-600">
                    {stats.activeDrivers} active
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Active Drivers</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.activeDrivers}
                  </div>
                  <p className="text-xs text-green-600">
                    Available for delivery
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Busy Drivers</span>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.busyDrivers}
                  </div>
                  <p className="text-xs text-orange-600">
                    Currently on delivery
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Completion</span>
                    <Star className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.avgCompletionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-purple-600">
                    Success rate
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span>Driver Filtering</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
              </CardHeader>
              
              {showFilters && (
                <CardContent className="space-y-4">
                  {/* Search and Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="search">Search Drivers</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Name, phone, license..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status Filter</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {drivers.length} drivers found
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Drivers Table */}
          <motion.div 
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Drivers Directory</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {drivers.length} Total Drivers
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Complete driver profiles with photos, contact information, performance metrics, and employment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {drivers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Driver Profile</TableHead>
                          <TableHead className="w-[200px]">Contact Information</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[180px]">Vehicle Details</TableHead>
                          <TableHead className="w-[150px] text-center">Performance</TableHead>
                          <TableHead className="w-[150px] text-center">Financial</TableHead>
                          <TableHead className="w-[120px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drivers.map((driver) => {
                          const StatusIcon = getStatusIcon(driver.status);
                          return (
                            <TableRow key={driver.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <DriverAvatar 
                                    driver={driver}
                                    size="xl"
                                    ring={true}
                                    className="shadow-xl ring-2 ring-white/10"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">{driver.name}</div>
                                    {driver.licenseNumber && (
                                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                                        <CreditCard className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{driver.licenseNumber}</span>
                                      </div>
                                    )}
                                    {driver.experience && (
                                      <div className="text-xs text-blue-600 flex items-center mt-1">
                                        <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span>{driver.experience} years exp.</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm flex items-center">
                                    <Phone className="w-3 h-3 mr-1 text-muted-foreground flex-shrink-0" />
                                    <span className="truncate">{driver.phone}</span>
                                  </div>
                                  {driver.email && (
                                    <div className="text-sm flex items-center text-muted-foreground">
                                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">{driver.email}</span>
                                    </div>
                                  )}
                                  {driver.address && (
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">{driver.address}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={cn("text-xs cursor-pointer", getStatusColor(driver.status))}
                                  onClick={() => handleToggleStatus(driver.id, driver.status)}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {driver.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Car className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">
                                      {driver.vehicleInfo || 'Not specified'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-center">
                                  <div className="font-semibold">{driver.totalOrders}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {driver.completionRate.toFixed(1)}% success
                                  </div>
                                  {driver.activeOrders > 0 && (
                                    <div className="text-xs text-orange-600">
                                      {driver.activeOrders} active
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-center space-y-1">
                                  <div className="font-semibold text-green-600">
                                    {formatCurrency(toNumber(driver.totalRevenue))}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Total earned
                                  </div>
                                  {driver.salary && (
                                    <div className="text-xs text-blue-600">
                                      {formatCurrency(toNumber(driver.salary))}/month
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="View Details"
                                    onClick={() => handleViewDriver(driver.id)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Edit Driver"
                                    onClick={() => handleEditDriver(driver.id)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteDriver(driver.id)}
                                    title="Delete Driver"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-12 h-12 text-gradient" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-yellow-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gradient mb-2">
                      {searchTerm || statusFilter !== 'all' ? 'No Matching Drivers' : 'Build Your Driver Team'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter !== 'all'
                        ? "No drivers match your current search criteria. Try adjusting your filters or search terms."
                        : "Start building your delivery team by adding your first driver. Upload their profile picture, contact details, and vehicle information."
                      }
                    </p>
                    {(searchTerm || statusFilter !== 'all') ? (
                      <div className="space-x-3">
                        <Button variant="outline" onClick={clearFilters}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Clear Filters
                        </Button>
                        <Button onClick={() => setShowAddDriver(true)} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add New Driver
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setShowAddDriver(true)} size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add Your First Driver
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={showAddDriver}
        onClose={() => setShowAddDriver(false)}
        onDriverCreated={fetchDrivers}
        companyId={marahCompanyId || ""}
      />

      {/* Driver Detail Modal */}
      <DriverDetailModal
        isOpen={showDriverDetail}
        onClose={() => {
          setShowDriverDetail(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
        onEdit={(driverId) => {
          setShowDriverDetail(false);
          handleEditDriver(driverId);
        }}
      />
    </div>
  );
} 