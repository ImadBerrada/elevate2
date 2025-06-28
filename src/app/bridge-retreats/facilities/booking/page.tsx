'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Search,
  Plus,
  Settings,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  Building2,
  Coffee,
  Utensils,
  Music,
  Projector,
  Car,
  Star,
  ArrowLeft,
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
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface FacilityBooking {
  id: string;
  facilityName: string;
  eventName: string;
  eventType: 'conference' | 'workshop' | 'wedding' | 'meeting' | 'retreat' | 'celebration';
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attendees: number;
  status: 'pending' | 'confirmed' | 'setup' | 'ongoing' | 'completed' | 'cancelled';
  setupRequirements: string[];
  catering: boolean;
  audioVisual: boolean;
  parking: number;
  specialRequests: string;
  totalCost: number;
  coordinator: string;
  notes: string[];
}

const FacilityBookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facilityFilter = searchParams.get('facility');
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('bookings');

  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmed: 0,
    pending: 0,
    ongoing: 0,
    totalRevenue: 0,
    averageAttendees: 0,
    utilizationRate: 0,
  });

  useEffect(() => {
    loadBookings();
  }, [facilityFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings from API
      const response = await fetch('/api/bridge-retreats/facilities/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);

      // Set stats from API response
      if (data.stats) {
        setStats(data.stats);
      } else {
        // Calculate stats if not provided
        const bookings = data.bookings || [];
        const totalBookings = bookings.length;
        const confirmed = bookings.filter((b: any) => b.status === 'confirmed').length;
        const pending = bookings.filter((b: any) => b.status === 'pending').length;
        const ongoing = bookings.filter((b: any) => b.status === 'ongoing').length;
        const totalRevenue = bookings.reduce((sum: number, b: any) => sum + b.totalCost, 0);
        const totalAttendees = bookings.reduce((sum: number, b: any) => sum + b.attendees, 0);
        const averageAttendees = totalBookings > 0 ? Math.round(totalAttendees / totalBookings) : 0;
        const utilizationRate = 0; // Calculate based on facility capacity

        setStats({
          totalBookings,
          confirmed,
          pending,
          ongoing,
          totalRevenue,
          averageAttendees,
          utilizationRate,
        });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Set empty state on error
      setBookings([]);
      setStats({
        totalBookings: 0,
        confirmed: 0,
        pending: 0,
        ongoing: 0,
        totalRevenue: 0,
        averageAttendees: 0,
        utilizationRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'setup':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-green-100 text-green-800';
      case 'wedding':
        return 'bg-pink-100 text-pink-800';
      case 'meeting':
        return 'bg-gray-100 text-gray-800';
      case 'retreat':
        return 'bg-purple-100 text-purple-800';
      case 'celebration':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesType = filterType === 'all' || booking.eventType === filterType;
    const matchesFacility = !facilityFilter || booking.facilityName.toLowerCase().includes(facilityFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType && matchesFacility;
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
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <button
                onClick={() => router.push('/bridge-retreats/facilities')}
                className="hover:text-foreground transition-colors"
              >
                Facilities
              </button>
              <span>/</span>
              <span className="text-foreground">Facility Booking</span>
              {facilityFilter && (
                <>
                  <span>/</span>
                  <span className="text-foreground">{facilityFilter}</span>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Facility Booking
                </h2>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Book facilities for events, manage resource allocation, and coordinate setups.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/bridge-retreats/facilities')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
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
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Bookings</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {stats.totalBookings}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Confirmed</span>
                    <span className="sm:hidden">Conf.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.confirmed}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">Pend.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Active</span>
                    <span className="sm:hidden">Active</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.ongoing}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Avg Attendees</span>
                    <span className="sm:hidden">Attend.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {Math.round(stats.averageAttendees)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="hidden sm:inline">Utilization</span>
                    <span className="sm:hidden">Util.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {stats.utilizationRate}%
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Revenue</span>
                    <span className="sm:hidden">Rev.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    ${(stats.totalRevenue / 1000).toFixed(0)}K
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
                  placeholder="Search by event name, organizer, or facility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="retreat">Retreat</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg font-semibold">
                            {booking.eventName}
                          </CardTitle>
                          <Badge className={getEventTypeColor(booking.eventType)}>
                            {booking.eventType}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {booking.facilityName}
                          </span>
                        </div>
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Setup
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Event Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Organizer</p>
                          <p className="font-medium">{booking.organizer}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attendees</p>
                          <p className="font-medium flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {booking.attendees}
                          </p>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(booking.startDate).toLocaleDateString()}
                            {booking.startDate !== booking.endDate && 
                              ` - ${new Date(booking.endDate).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Services</p>
                        <div className="flex flex-wrap gap-1">
                          {booking.catering && (
                            <Badge variant="outline" className="text-xs">
                              <Utensils className="h-3 w-3 mr-1" />
                              Catering
                            </Badge>
                          )}
                          {booking.audioVisual && (
                            <Badge variant="outline" className="text-xs">
                              <Projector className="h-3 w-3 mr-1" />
                              A/V Equipment
                            </Badge>
                          )}
                          {booking.parking > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Car className="h-3 w-3 mr-1" />
                              {booking.parking} Parking
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Setup Requirements */}
                      {booking.setupRequirements.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Setup Requirements</p>
                          <div className="flex flex-wrap gap-1">
                            {booking.setupRequirements.slice(0, 3).map((req, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                            {booking.setupRequirements.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{booking.setupRequirements.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact and Cost */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Coordinator</p>
                          <p className="font-medium">{booking.coordinator}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            ${booking.totalCost.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Special Requests</p>
                          <p className="text-sm text-blue-800">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const FacilityBookingPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilityBookingPage />
    </Suspense>
  );
};

export default FacilityBookingPageWrapper; 