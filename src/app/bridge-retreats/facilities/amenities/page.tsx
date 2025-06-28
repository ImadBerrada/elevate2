'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Activity,
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
  Dumbbell,
  Waves,
  Utensils,
  Coffee,
  TreePine,
  Music,
  Gamepad2,
  Book,
  Car,
  Wifi,
  Thermometer,
  Shield,
  Star,
  MapPin,
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
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Amenity {
  id: string;
  name: string;
  category: 'spa' | 'fitness' | 'dining' | 'recreation' | 'wellness' | 'utility';
  status: 'available' | 'occupied' | 'maintenance' | 'closed';
  location: string;
  capacity: number;
  currentUsage: number;
  coordinator: string;
  operatingHours: string;
  nextMaintenance: string;
  equipment: {
    name: string;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    lastService: string;
  }[];
  bookings: {
    id: string;
    time: string;
    duration: number;
    guest: string;
    type: string;
  }[];
  rating: number;
  issues: number;
  image: string;
  description: string;
  features: string[];
}

const AmenitiesManagementPage = () => {
  const router = useRouter();
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('amenities');

  const [stats, setStats] = useState({
    totalAmenities: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    averageUsage: 0,
    totalEquipment: 0,
    averageRating: 0,
  });

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      setLoading(true);
      
      // Fetch amenities from API
      const response = await fetch('/api/bridge-retreats/facilities/amenities');
      if (!response.ok) {
        throw new Error('Failed to fetch amenities');
      }
      
      const data = await response.json();
      setAmenities(data.amenities || []);
      
      // Set stats from API response
      if (data.stats) {
        setStats(data.stats);
      } else {
        // Calculate stats if not provided
        const amenities = data.amenities || [];
        const totalAmenities = amenities.length;
        const available = amenities.filter((a: any) => a.status === 'available').length;
        const occupied = amenities.filter((a: any) => a.status === 'occupied').length;
        const maintenance = amenities.filter((a: any) => a.status === 'maintenance').length;
        const totalCapacity = amenities.reduce((sum: number, a: any) => sum + a.capacity, 0);
        const totalUsage = amenities.reduce((sum: number, a: any) => sum + a.currentUsage, 0);
        const averageUsage = totalCapacity > 0 ? Math.round((totalUsage / totalCapacity) * 100) : 0;
        const totalEquipment = amenities.reduce((sum: number, a: any) => sum + a.equipment.length, 0);
        const totalRating = amenities.reduce((sum: number, a: any) => sum + a.rating, 0);
        const averageRating = totalAmenities > 0 ? Number((totalRating / totalAmenities).toFixed(1)) : 0;

        setStats({
          totalAmenities,
          available,
          occupied,
          maintenance,
          averageUsage,
          totalEquipment,
          averageRating,
        });
      }
    } catch (error) {
      console.error('Error loading amenities:', error);
      // Set empty state on error
      setAmenities([]);
      setStats({
        totalAmenities: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        averageUsage: 0,
        totalEquipment: 0,
        averageRating: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'occupied':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spa':
        return <Waves className="h-5 w-5 text-blue-600" />;
      case 'fitness':
        return <Dumbbell className="h-5 w-5 text-orange-600" />;
      case 'dining':
        return <Utensils className="h-5 w-5 text-green-600" />;
      case 'recreation':
        return <Gamepad2 className="h-5 w-5 text-purple-600" />;
      case 'wellness':
        return <Activity className="h-5 w-5 text-pink-600" />;
      case 'utility':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAmenities = amenities.filter(amenity => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amenity.coordinator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || amenity.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || amenity.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "min-w-0"
        )}>
          <Header />
          
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Amenities Management
                </h2>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Manage spa, fitness, dining, and recreational facilities, equipment, and schedules.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule</span>
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Amenity
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Amenities</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {stats.totalAmenities}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Available</span>
                    <span className="sm:hidden">Avail.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.available}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Occupied</span>
                    <span className="sm:hidden">Busy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.occupied}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="hidden sm:inline">Maintenance</span>
                    <span className="sm:hidden">Maint.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.maintenance}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Usage</span>
                    <span className="sm:hidden">Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {stats.averageUsage.toFixed(0)}%
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="hidden sm:inline">Equipment</span>
                    <span className="sm:hidden">Equip.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {stats.totalEquipment}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="hidden sm:inline">Avg Rating</span>
                    <span className="sm:hidden">Rating</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.averageRating.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div 
            className="flex flex-col gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search amenities by name or coordinator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-40 border-refined h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="dining">Dining</SelectItem>
                    <SelectItem value="recreation">Recreation</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40 border-refined h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Amenities Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            {/* Amenities Tab */}
            <TabsContent value="amenities">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAmenities.map((amenity, index) => (
                  <motion.div
                    key={amenity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={amenity.image}
                          alt={amenity.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          {getCategoryIcon(amenity.category)}
                        </div>
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                          {getStatusIcon(amenity.status)}
                          <Badge className={getStatusColor(amenity.status)}>
                            {amenity.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold mb-1">
                              {amenity.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {amenity.description}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                View Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Wrench className="h-4 w-4 mr-2" />
                                Schedule Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Amenity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Usage */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Usage</span>
                              <span className="text-sm font-medium">
                                {amenity.currentUsage}/{amenity.capacity}
                              </span>
                            </div>
                            <Progress 
                              value={(amenity.currentUsage / amenity.capacity) * 100} 
                              className="h-2"
                            />
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Coordinator</p>
                              <p className="font-medium">{amenity.coordinator}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Operating Hours</p>
                              <p className="font-medium">{amenity.operatingHours}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {amenity.location}
                              </p>
                            </div>
                          </div>

                          {/* Today's Bookings */}
                          {amenity.bookings.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Today's Bookings</p>
                              <div className="space-y-1">
                                {amenity.bookings.slice(0, 2).map((booking, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                                    <span>{booking.time}</span>
                                    <span className="font-medium">{booking.guest}</span>
                                  </div>
                                ))}
                                {amenity.bookings.length > 2 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{amenity.bookings.length - 2} more bookings
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Features */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Features</p>
                            <div className="flex flex-wrap gap-1">
                              {amenity.features.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {amenity.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{amenity.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Rating and Issues */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium">{amenity.rating}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(amenity.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {amenity.issues > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {amenity.issues} issues
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Equipment Tab */}
            <TabsContent value="equipment">
              <div className="space-y-6">
                {filteredAmenities.map((amenity) => (
                  <Card key={amenity.id} className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {getCategoryIcon(amenity.category)}
                        <span>{amenity.name} - Equipment Inventory</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {amenity.equipment.map((item, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <Badge className={getConditionColor(item.condition)}>
                                {item.condition}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Quantity: {item.quantity}</p>
                              <p>Last Service: {new Date(item.lastService).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <div className="space-y-6">
                {filteredAmenities.map((amenity) => (
                  <Card key={amenity.id} className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {getCategoryIcon(amenity.category)}
                        <span>{amenity.name} - Today's Schedule</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {amenity.bookings.length > 0 ? (
                        <div className="space-y-3">
                          {amenity.bookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{booking.guest}</p>
                                <p className="text-sm text-muted-foreground">{booking.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{booking.time}</p>
                                <p className="text-sm text-muted-foreground">{booking.duration} min</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-muted-foreground">No bookings scheduled for today</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredAmenities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Amenities Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AmenitiesManagementPage; 