'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bed,
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
  Thermometer,
  Wifi,
  Car,
  Coffee,
  Tv,
  Bath,
  Wind,
  Shield,
  MapPin,
  User,
  Star,
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

interface Room {
  id: string;
  number: string;
  type: 'standard' | 'deluxe' | 'suite' | 'villa';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out_of_order';
  floor: number;
  capacity: number;
  currentGuests: number;
  facility: string;
  housekeeper: string;
  lastCleaned: string;
  nextMaintenance: string;
  amenities: string[];
  rating: number;
  issues: number;
  images: string[];
  price: number;
  guest?: {
    name: string;
    checkIn: string;
    checkOut: string;
    avatar: string;
  };
  maintenanceHistory: {
    date: string;
    type: string;
    description: string;
    cost: number;
  }[];
}

const RoomManagementPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facilityId = searchParams.get('facility');
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [stats, setStats] = useState({
    totalRooms: 0,
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
    averageOccupancy: 0,
    averageRating: 0,
  });

  useEffect(() => {
    loadRooms();
  }, [facilityId]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch rooms from API
      const response = await fetch('/api/bridge-retreats/facilities/rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      
      const data = await response.json();
      setRooms(data.rooms || []);
      
      // Set stats from API response
      if (data.stats) {
        setStats(data.stats);
      } else {
        // Calculate stats if not provided
        const rooms = data.rooms || [];
        const totalRooms = rooms.length;
        const available = rooms.filter((r: any) => r.status === 'available').length;
        const occupied = rooms.filter((r: any) => r.status === 'occupied').length;
        const cleaning = rooms.filter((r: any) => r.status === 'cleaning').length;
        const maintenance = rooms.filter((r: any) => r.status === 'maintenance').length;
        const totalCapacity = rooms.reduce((sum: number, r: any) => sum + r.capacity, 0);
        const totalOccupancy = rooms.reduce((sum: number, r: any) => sum + r.currentGuests, 0);
        const averageOccupancy = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
        const totalRating = rooms.reduce((sum: number, r: any) => sum + r.rating, 0);
        const averageRating = totalRooms > 0 ? Number((totalRating / totalRooms).toFixed(1)) : 0;

        setStats({
          totalRooms,
          available,
          occupied,
          cleaning,
          maintenance,
          averageOccupancy,
          averageRating,
        });
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      // Set empty state on error
      setRooms([]);
      setStats({
        totalRooms: 0,
        available: 0,
        occupied: 0,
        cleaning: 0,
        maintenance: 0,
        averageOccupancy: 0,
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
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'out_of_order':
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
        return <User className="h-4 w-4 text-blue-500" />;
      case 'cleaning':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'out_of_order':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'standard':
        return 'bg-gray-100 text-gray-800';
      case 'deluxe':
        return 'bg-blue-100 text-blue-800';
      case 'suite':
        return 'bg-purple-100 text-purple-800';
      case 'villa':
        return 'bg-gold-100 text-gold-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.housekeeper.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.guest?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesFloor = filterFloor === 'all' || room.floor.toString() === filterFloor;
    
    return matchesSearch && matchesType && matchesStatus && matchesFloor;
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
                  Room Management
                </h2>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Monitor room status, occupancy, maintenance, and amenity inventory.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule</span>
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
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
                    <Bed className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Rooms</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {stats.totalRooms}
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
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Occupied</span>
                    <span className="sm:hidden">Occ.</span>
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
                    <Settings className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="hidden sm:inline">Cleaning</span>
                    <span className="sm:hidden">Clean</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.cleaning}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="hidden sm:inline">Maintenance</span>
                    <span className="sm:hidden">Maint.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    {stats.maintenance}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Occupancy</span>
                    <span className="sm:hidden">Occ.%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {stats.averageOccupancy.toFixed(0)}%
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
                  placeholder="Search rooms by number, housekeeper, or guest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out_of_order">Out of Order</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterFloor} onValueChange={setFilterFloor}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={room.images[0]}
                      alt={`Room ${room.number}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <Badge className={getTypeColor(room.type)}>
                        {room.type}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      {getStatusIcon(room.status)}
                      <Badge className={getStatusColor(room.status)}>
                        {room.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                        Room {room.number}
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold mb-1">
                          Room {room.number} - Floor {room.floor}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ${room.price}/night • Up to {room.capacity} guests
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
                            <Settings className="h-4 w-4 mr-2" />
                            Schedule Cleaning
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wrench className="h-4 w-4 mr-2" />
                            Request Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Current Guest */}
                      {room.guest && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={room.guest.avatar} />
                              <AvatarFallback>
                                {room.guest.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{room.guest.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(room.guest.checkIn).toLocaleDateString()} - {new Date(room.guest.checkOut).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Occupancy */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Occupancy</span>
                          <span className="text-sm font-medium">
                            {room.currentGuests}/{room.capacity}
                          </span>
                        </div>
                        <Progress 
                          value={(room.currentGuests / room.capacity) * 100} 
                          className="h-2"
                        />
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Housekeeper</p>
                          <p className="font-medium">{room.housekeeper}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Cleaned</p>
                          <p className="font-medium">
                            {new Date(room.lastCleaned).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 4).map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {room.amenities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Rating and Issues */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">{room.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(room.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {room.issues > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {room.issues} issues
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const RoomManagementPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomManagementPage />
    </Suspense>
  );
};

export default RoomManagementPageWrapper; 