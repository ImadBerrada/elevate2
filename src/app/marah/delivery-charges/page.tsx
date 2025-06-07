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
  MapPin,
  DollarSign,
  Route,
  AlertCircle,
  Calculator,
  Map,
  Navigation,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AddDeliveryChargeModal } from "@/components/modals/add-delivery-charge-modal";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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

interface DeliveryCharge {
  id: string;
  zone: string;
  area: string;
  baseCharge: number;
  perKmCharge: number;
  minimumCharge: number;
  maximumCharge?: number;
  estimatedTime: number; // in minutes
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryChargesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDeliveryCharge, setShowAddDeliveryCharge] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Zones" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchDeliveryCharges();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchDeliveryCharges();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchDeliveryCharges();
    }
  }, [searchTerm, zoneFilter, statusFilter]);

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

  const fetchDeliveryCharges = async () => {
    if (!marahCompanyId) return;
    
    try {
      const params = new URLSearchParams({
        companyId: marahCompanyId,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (zoneFilter && zoneFilter !== 'all') params.append('zone', zoneFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/marah/delivery-charges?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliveryCharges(data.deliveryCharges || []);
      } else {
        setError('Failed to fetch delivery charges');
      }
    } catch (error) {
      console.error('Error fetching delivery charges:', error);
      setError('Failed to fetch delivery charges');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeliveryCharge = (chargeId: string) => {
    console.log('View delivery charge:', chargeId);
  };

  const handleEditDeliveryCharge = (chargeId: string) => {
    // For now, show a message that editing is not implemented
    alert('Delivery charge editing is not yet implemented. This feature will be available soon.');
  };

  const handleDeleteDeliveryCharge = async (chargeId: string) => {
    if (!confirm('Are you sure you want to delete this delivery charge? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/delivery-charges/${chargeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchDeliveryCharges();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete delivery charge');
      }
    } catch (error) {
      console.error('Error deleting delivery charge:', error);
      alert('Failed to delete delivery charge');
    }
  };

  const handleToggleStatus = async (chargeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/marah/delivery-charges/${chargeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchDeliveryCharges();
      } else {
        alert('Failed to update delivery charge status');
      }
    } catch (error) {
      console.error('Error updating delivery charge:', error);
      alert('Failed to update delivery charge status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const clearFilters = () => {
    setSearchTerm("");
    setZoneFilter("all");
    setStatusFilter("all");
  };

  const exportDeliveryCharges = () => {
    const headers = ['Zone', 'Area', 'Base Charge', 'Per KM Charge', 'Min Charge', 'Max Charge', 'Est. Time', 'Status'];
    const csvContent = [
      headers.join(','),
      ...deliveryCharges.map(charge => [
        charge.zone,
        charge.area,
        charge.baseCharge,
        charge.perKmCharge,
        charge.minimumCharge,
        charge.maximumCharge || '',
        charge.estimatedTime,
        charge.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-delivery-charges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDeliveryStats = () => {
    const totalZones = deliveryCharges.length;
    const activeZones = deliveryCharges.filter(c => c.isActive).length;
    const avgBaseCharge = deliveryCharges.length > 0 
      ? deliveryCharges.reduce((sum, c) => sum + c.baseCharge, 0) / deliveryCharges.length
      : 0;
    const avgPerKmCharge = deliveryCharges.length > 0 
      ? deliveryCharges.reduce((sum, c) => sum + c.perKmCharge, 0) / deliveryCharges.length
      : 0;
    const avgEstimatedTime = deliveryCharges.length > 0 
      ? deliveryCharges.reduce((sum, c) => sum + c.estimatedTime, 0) / deliveryCharges.length
      : 0;

    return { totalZones, activeZones, avgBaseCharge, avgPerKmCharge, avgEstimatedTime };
  };

  const stats = getDeliveryStats();

  // Get unique zones for filter
  const uniqueZones = [...new Set(deliveryCharges.map(charge => charge.zone))];
  const zoneOptions = [
    { value: "all", label: "All Zones" },
    ...uniqueZones.map(zone => ({ value: zone, label: zone }))
  ];

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
                  Delivery Charges Management
                </h1>
                <p className="text-muted-foreground">
                  Manage delivery zones and pricing with distance-based calculations
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={exportDeliveryCharges} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchDeliveryCharges} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddDeliveryCharge(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Zone
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Delivery Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Zones</span>
                    <Map className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.totalZones}
                  </div>
                  <p className="text-xs text-blue-600">
                    Delivery areas
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Active Zones</span>
                    <Navigation className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.activeZones}
                  </div>
                  <p className="text-xs text-green-600">
                    Currently serving
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Base Charge</span>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.avgBaseCharge)}
                  </div>
                  <p className="text-xs text-purple-600">
                    Base delivery fee
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Per KM</span>
                    <Route className="h-4 w-4 text-orange-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.avgPerKmCharge)}
                  </div>
                  <p className="text-xs text-orange-600">
                    Per kilometer
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Delivery Time</span>
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatTime(Math.round(stats.avgEstimatedTime))}
                  </div>
                  <p className="text-xs text-indigo-600">
                    Estimated time
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
                    <span>Delivery Zone Filtering</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search Zones</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Zone, area name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="zone">Zone</Label>
                      <Select value={zoneFilter} onValueChange={setZoneFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All zones" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
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

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {deliveryCharges.length} zones found
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Delivery Charges Table */}
          <motion.div 
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Delivery Zones & Charges</span>
                </CardTitle>
                <CardDescription>
                  Delivery zones with pricing structure and estimated delivery times
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliveryCharges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zone & Area</TableHead>
                          <TableHead>Base Charge</TableHead>
                          <TableHead>Per KM Charge</TableHead>
                          <TableHead>Min/Max Charge</TableHead>
                          <TableHead>Est. Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveryCharges.map((charge) => (
                          <TableRow key={charge.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{charge.zone}</div>
                                  <div className="text-sm text-muted-foreground">{charge.area}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(charge.baseCharge)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">
                                {formatCurrency(charge.perKmCharge)}/km
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Min: {formatCurrency(charge.minimumCharge)}</div>
                                {charge.maximumCharge && (
                                  <div>Max: {formatCurrency(charge.maximumCharge)}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{formatTime(charge.estimatedTime)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn("text-xs cursor-pointer", getStatusColor(charge.isActive))}
                                onClick={() => handleToggleStatus(charge.id, charge.isActive)}
                              >
                                {charge.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  title="View Details"
                                  onClick={() => handleViewDeliveryCharge(charge.id)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  title="Edit Zone"
                                  onClick={() => handleEditDeliveryCharge(charge.id)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteDeliveryCharge(charge.id)}
                                  title="Delete Zone"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Delivery Zones Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || zoneFilter !== 'all' || statusFilter !== 'all'
                        ? "No delivery zones match your current filters."
                        : "No delivery zones have been configured yet."
                      }
                    </p>
                    {(searchTerm || zoneFilter !== 'all' || statusFilter !== 'all') ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddDeliveryCharge(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Zone
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Add Delivery Charge Modal */}
      <AddDeliveryChargeModal
        isOpen={showAddDeliveryCharge}
        onClose={() => setShowAddDeliveryCharge(false)}
        onDeliveryChargeCreated={fetchDeliveryCharges}
        companyId={marahCompanyId || ""}
      />
    </div>
  );
} 