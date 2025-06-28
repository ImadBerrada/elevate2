'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Plus,
  Settings,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Eye,
  Edit,
  MoreHorizontal,
  Activity,
  MapPin,
  Thermometer,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  TreePine,
  RefreshCw,
  Filter,
  Download,
  TrendingUp,
  Star,
  X,
  Loader2,
  Hotel,
  Bed,
  Globe,
  RotateCcw,
  Home,
  Coffee,
  Zap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Room {
  id: string;
  roomNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'CLOSED';
  cleaningStatus: 'CLEAN' | 'NEEDS_CLEANING' | 'DEEP_CLEANING';
  capacity: number;
  currentOccupancy: number;
  roomType: string;
  hasPrivateBath: boolean;
  hasBalcony: boolean;
  hasAC: boolean;
  hasWifi: boolean;
  lastCleaned?: string;
  nextMaintenance?: string;
  assignedHousekeeper?: string;
  floor: number;
  description: string;
  features: string[];
}

interface Amenity {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'CLOSED';
  capacity: number;
  currentUsage: number;
  category: string;
  rating: number;
  coordinator: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category: string;
  scheduledDate: string;
  assignedTo?: string;
  description: string;
  notes?: string;
  cost?: number;
}

interface Facility {
  id: string;
  name: string;
  type: 'ACCOMMODATION' | 'DINING' | 'WELLNESS' | 'RECREATION' | 'UTILITY';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED' | 'RENOVATION';
  capacity: number;
  currentOccupancy: number;
  location: string;
  manager: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  rating: number;
  totalReviews: number;
  issueCount: number;
  image?: string;
  description?: string;
  operatingHours?: string;
  hasWifi: boolean;
  hasParking: boolean;
  parkingSpots?: number;
  rooms: Room[];
  amenities: Amenity[];
  maintenanceRequests: MaintenanceRequest[];
  stats?: {
    totalRooms: number;
    availableRooms: number;
    cleanRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    outOfOrderRooms: number;
    occupancyRate: number;
    roomUtilization: number;
    cleanlinessScore: number;
    maintenanceScore: number;
    activeMaintenanceRequests: number;
    criticalMaintenanceRequests: number;
    totalAmenities: number;
    availableAmenities: number;
    pmsIntegrated: boolean;
    lastPMSSync: string;
    roomOccupancyTrend: string;
    maintenanceEfficiency: number;
    guestSatisfactionScore: number;
  };
  pmsData?: {
    roomTypeId: string;
    totalRoomsInType: number;
    ezeeRoomType: any;
    lastSyncTime: string;
    dataSource: string;
  };
}

const FacilitiesPage = () => {
  const router = useRouter();
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalFacilities: 0,
    operational: 0,
    maintenance: 0,
    averageOccupancy: 0,
    totalCapacity: 0,
    totalOccupancy: 0,
    totalRooms: 0,
    availableRooms: 0,
    pendingMaintenance: 0,
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchTerm, filterType, filterStatus]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      filterFacilities();
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const loadFacilities = async (syncWithPMS = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = syncWithPMS 
        ? '/api/bridge-retreats/facilities?sync=true'
        : '/api/bridge-retreats/facilities';
      
      console.log('Fetching facilities from eZee PMS...');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities from eZee PMS');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const facilitiesData = data.facilities || [];
      
      setFacilities(facilitiesData);
      setStats(data.stats || stats);
      setDataSource(data.source || 'eZee PMS');
      setLastSync(data.lastSync);
      setRoomTypes(data.roomTypes || []);
      
      console.log(`Loaded ${facilitiesData.length} facilities from ${data.source}`);
      
      if (facilitiesData.length === 0) {
        setSuccess('No facilities found. This might be because eZee PMS is not returning data or there are no room types configured.');
      } else {
        setSuccess(`Successfully loaded ${facilitiesData.length} facilities from eZee PMS`);
      }
      
    } catch (error) {
      console.error('Error loading facilities:', error);
      setError(error instanceof Error ? error.message : 'Failed to load facilities from eZee PMS');
      setFacilities([]);
      setStats({
        totalFacilities: 0,
        operational: 0,
        maintenance: 0,
        averageOccupancy: 0,
        totalCapacity: 0,
        totalOccupancy: 0,
        totalRooms: 0,
        availableRooms: 0,
        pendingMaintenance: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFacilities = () => {
    let filtered = facilities;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchLower) ||
        facility.location.toLowerCase().includes(searchLower) ||
        facility.manager.toLowerCase().includes(searchLower) ||
        facility.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(facility => facility.type === filterType.toUpperCase());
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(facility => facility.status === filterStatus.toUpperCase());
    }

    setFilteredFacilities(filtered);
  };

  const handleRefresh = async (syncWithPMS = false) => {
    try {
      if (syncWithPMS) {
        setSyncing(true);
      } else {
      setRefreshing(true);
      }
      setError(null);
      setSuccess(null);
      
      await loadFacilities(syncWithPMS);
      
      if (syncWithPMS) {
        setSuccess('Successfully synced facilities data from eZee PMS');
      } else {
      setSuccess('Facilities data refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing facilities:', error);
      setError('Failed to refresh facilities data. Please try again.');
    } finally {
      setRefreshing(false);
      setSyncing(false);
    }
  };

  const handleRefreshClick = () => handleRefresh(false);
  const handleSyncPMSClick = () => handleRefresh(true);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      case 'RENOVATION': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return <CheckCircle className="w-4 h-4" />;
      case 'MAINTENANCE': return <Wrench className="w-4 h-4" />;
      case 'CLOSED': return <X className="w-4 h-4" />;
      case 'RENOVATION': return <Settings className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACCOMMODATION': return <Home className="w-5 h-5" />;
      case 'DINING': return <Coffee className="w-5 h-5" />;
      case 'WELLNESS': return <Sparkles className="w-5 h-5" />;
      case 'RECREATION': return <Waves className="w-5 h-5" />;
      case 'UTILITY': return <Zap className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const handleViewFacility = (facilityId: string) => {
    router.push(`/bridge-retreats/facilities/${facilityId}`);
  };

  const handleManageFacility = (facilityId: string, facilityType: string) => {
    // Route to different management pages based on facility type
    switch (facilityType) {
      case 'ACCOMMODATION':
        router.push(`/bridge-retreats/facilities/rooms?facilityId=${facilityId}`);
        break;
      case 'DINING':
        router.push(`/bridge-retreats/facilities/dining?facilityId=${facilityId}`);
        break;
      case 'WELLNESS':
        router.push(`/bridge-retreats/facilities/wellness?facilityId=${facilityId}`);
        break;
      default:
        router.push(`/bridge-retreats/facilities/${facilityId}/manage`);
    }
  };

  const handleMaintenanceRequest = (facilityId: string) => {
    router.push(`/bridge-retreats/facilities/maintenance?facilityId=${facilityId}`);
  };

  const handleBookFacility = (facilityId: string) => {
    router.push(`/bridge-retreats/facilities/booking?facilityId=${facilityId}`);
  };

    return (
    <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        isOpen && !isMobile ? "ml-64" : "ml-0"
        )}>
          <Header />
          
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Facilities Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage hotels and rooms from eZee PMS
                  {dataSource && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Globe className="w-3 h-3 mr-1" />
                      {dataSource}
                    </span>
                  )}
                  {lastSync && (
                    <span className="ml-2 text-sm text-gray-500">
                      Last sync: {format(parseISO(lastSync), 'MMM dd, HH:mm')}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
              <Button
                  onClick={handleRefreshClick}
                disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
              >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                Refresh
                </Button>
              <Button 
                  onClick={handleSyncPMSClick}
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {syncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Sync PMS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled
                  title="Facility creation is managed through eZee PMS"
              >
                  <Plus className="w-4 h-4" />
                  Add Facility
                </Button>
            </div>
            </div>

            {/* Alerts */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearMessages}
                      className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
                    >
                    <X className="w-4 h-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearMessages}
                      className="ml-2 h-auto p-0 text-green-600 hover:text-green-800"
                    >
                    <X className="w-4 h-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
          )}

          {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalFacilities}</p>
                  </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">{stats.operational} operational</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                  </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bed className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">{stats.availableRooms} available</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageOccupancy}%</p>
                  </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-600">{stats.totalOccupancy}/{stats.totalCapacity} guests</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maintenance</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
                  </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-orange-600">{stats.maintenance} in maintenance</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search facilities by name, location, or manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Facility Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="dining">Dining</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="recreation">Recreation</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                  </SelectContent>
                </Select>

                      <Select value={viewMode} onValueChange={(value: 'grid' | 'table') => setViewMode(value)}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid View</SelectItem>
                          <SelectItem value="table">Table View</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
              </div>
            </div>
                </CardContent>
              </Card>

            {/* Facilities Display */}
            {loading ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading facilities from eZee PMS...</span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredFacilities.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No facilities found
                    </h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                        : 'No facilities are currently available from eZee PMS. Check your PMS connection or configure room types in eZee PMS.'
                      }
                    </p>
                    <Button onClick={handleSyncPMSClick} disabled={syncing}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Sync with eZee PMS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFacilities.map((facility) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
              >
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(facility.type)}
                    </div>
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {facility.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600">{facility.location}</p>
                            </div>
                          </div>
                          <Badge className={cn("text-xs", getStatusColor(facility.status))}>
                            <span className="flex items-center gap-1">
                      {getStatusIcon(facility.status)}
                        {facility.status}
                            </span>
                      </Badge>
                    </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">{facility.stats?.totalRooms || 0}</p>
                              <p className="text-xs text-gray-600">Total Rooms</p>
                  </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">{facility.stats?.occupancyRate || 0}%</p>
                              <p className="text-xs text-gray-600">Occupancy</p>
                      </div>
                    </div>

                          {/* Room Status */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Available Rooms</span>
                              <span className="font-medium text-green-600">
                                {facility.stats?.availableRooms || 0}
                          </span>
                        </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Occupied Rooms</span>
                              <span className="font-medium text-blue-600">
                                {facility.stats?.occupiedRooms || 0}
                              </span>
                      </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Maintenance</span>
                              <span className="font-medium text-yellow-600">
                                {facility.stats?.activeMaintenanceRequests || 0}
                              </span>
                        </div>
                      </div>

                          {/* Performance Metrics */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cleanliness Score</span>
                              <span className="text-sm font-medium">{facility.stats?.cleanlinessScore || 0}%</span>
                            </div>
                            <Progress value={facility.stats?.cleanlinessScore || 0} className="h-2" />
                      </div>

                          {/* Manager & PMS Info */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Manager</span>
                              <span className="font-medium">{facility.manager}</span>
                          </div>
                            {facility.pmsData && (
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                <span>PMS Room Type</span>
                                <span>{facility.pmsData.roomTypeId}</span>
                        </div>
                        )}
                      </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewFacility(facility.id)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleManageFacility(facility.id, facility.type)}
                              className="flex-1"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleBookFacility(facility.id)}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Facility
                                      </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMaintenanceRequest(facility.id)}>
                                  <Wrench className="w-4 h-4 mr-2" />
                                  Maintenance
                                </DropdownMenuItem>
                                      <DropdownMenuItem>
                                  <Activity className="w-4 h-4 mr-2" />
                                  View Analytics
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                      </div>
                    </div>
                      </CardContent>
                    </Card>
                      </motion.div>
                ))}
            </div>
            ) : (
              // Table view implementation would go here
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-gray-600">Table view implementation coming soon...</p>
                </CardContent>
              </Card>
          )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default FacilitiesPage; 