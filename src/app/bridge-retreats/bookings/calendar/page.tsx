"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  Edit,
  MoreHorizontal,
  CalendarDays,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface CalendarBooking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'WAITLISTED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  guest: {
    firstName: string;
    lastName: string;
    email: string;
  };
  retreat: {
    id: string;
    title: string;
    type: string;
    location: string;
    instructor: string;
    price: number;
  };
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  bookings: CalendarBooking[];
}

export default function BookingCalendarPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [retreatFilter, setRetreatFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  
  const [retreats, setRetreats] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
    fetchRetreats();
  }, [currentDate]);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter, retreatFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const data = await apiClient.getRetreatBookings({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        limit: 1000
      });
      
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRetreats = async () => {
    try {
      const data = await apiClient.getRetreats({ limit: 1000 });
      setRetreats(data.retreats || []);
    } catch (err) {
      console.error('Failed to fetch retreats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.retreat.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (retreatFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.retreat.id === retreatFilter);
    }

    setFilteredBookings(filtered);
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        bookings: getBookingsForDate(date)
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        bookings: getBookingsForDate(date)
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        bookings: getBookingsForDate(date)
      });
    }
    
    return days;
  };

  const getBookingsForDate = (date: Date): CalendarBooking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredBookings.filter(booking => {
      const checkIn = booking.checkInDate.split('T')[0];
      const checkOut = booking.checkOutDate.split('T')[0];
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CHECKED_OUT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'WAITLISTED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen && !isMobile ? "ml-64" : "ml-0"
      )}>
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between mb-8"
              {...fadeInUp}
            >
              <div className="flex items-center space-x-4">
                <Link href="/bridge-retreats/bookings">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Bookings
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
                  <p className="text-gray-600 mt-1">Visual overview of all bookings</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link href="/bridge-retreats/bookings/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div 
              className="mb-6"
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                        <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={retreatFilter} onValueChange={setRetreatFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Retreats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Retreats</SelectItem>
                        {retreats.map((retreat) => (
                          <SelectItem key={retreat.id} value={retreat.id}>
                            {retreat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={viewMode} onValueChange={(value: "month" | "week") => setViewMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Month View</SelectItem>
                        <SelectItem value="week">Week View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calendar Navigation */}
            <motion.div 
              className="mb-6"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-2xl font-bold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <Button variant="outline" onClick={() => navigateMonth('next')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button variant="outline" onClick={goToToday}>
                        Today
                      </Button>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Total Bookings: {filteredBookings.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calendar Grid */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-0">
                      {/* Day Headers */}
                      {dayNames.map((day) => (
                        <div key={day} className="p-4 text-center font-semibold text-gray-700 border-b">
                          {day}
                        </div>
                      ))}

                      {/* Calendar Days */}
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={cn(
                            "min-h-[120px] p-2 border-b border-r relative",
                            !day.isCurrentMonth && "bg-gray-50",
                            day.date.toDateString() === new Date().toDateString() && "bg-blue-50"
                          )}
                        >
                          <div className={cn(
                            "text-sm font-medium mb-2",
                            !day.isCurrentMonth && "text-gray-400",
                            day.date.toDateString() === new Date().toDateString() && "text-blue-600"
                          )}>
                            {day.date.getDate()}
                          </div>

                          <div className="space-y-1">
                            {day.bookings.slice(0, 3).map((booking) => (
                              <div
                                key={booking.id}
                                className={cn(
                                  "text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow",
                                  getStatusColor(booking.status)
                                )}
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <div className="font-medium truncate">
                                  {booking.guest.firstName} {booking.guest.lastName}
                                </div>
                                <div className="truncate opacity-75">
                                  {booking.retreat.title}
                                </div>
                              </div>
                            ))}
                            
                            {day.bookings.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{day.bookings.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Details Modal */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                  className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Booking Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBooking(null)}
                      >
                        ×
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Guest</p>
                        <p className="font-semibold">
                          {selectedBooking.guest.firstName} {selectedBooking.guest.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedBooking.guest.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Retreat</p>
                        <p className="font-semibold">{selectedBooking.retreat.title}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedBooking.retreat.location}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold">{formatDate(selectedBooking.checkInDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold">{formatDate(selectedBooking.checkOutDate)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Guests</p>
                          <p className="font-semibold">{selectedBooking.guestCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold">{formatCurrency(selectedBooking.totalAmount)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedBooking.status)}>
                          {selectedBooking.status}
                        </Badge>
                        <Badge className={getStatusColor(selectedBooking.paymentStatus)}>
                          {selectedBooking.paymentStatus}
                        </Badge>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Link href={`/bridge-retreats/bookings/${selectedBooking.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/bridge-retreats/bookings/${selectedBooking.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}