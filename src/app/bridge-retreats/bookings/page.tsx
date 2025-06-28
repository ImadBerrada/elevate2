"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Calendar,
  Search, 
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Download,
  Upload,
  RefreshCw,
  UserCheck,
  UserX,
  Loader2,
  CalendarDays,
  Building2,
  Star,
  TrendingUp,
  FileText,
  Send,
  X,
  RotateCcw,
  Hotel,
  Bed,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, parseISO } from "date-fns";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Booking {
  id: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'WAITLISTED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  specialRequests?: string;
  source: string;
  createdAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    fullName: string;
  };
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    facility?: {
      name: string;
    };
  };
  retreat: {
    id: string;
    title: string;
    type: string;
    location: string;
    price: number;
  };
  pmsData?: {
    bookingId: string;
    confirmationNo: string;
    source: string;
    roomId?: string;
    lastUpdated: string;
  };
}

interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  upcomingBookings: number;
  currentGuests: number;
  averageBookingValue: number;
  occupancyRate: number;
}

export default function BookingsPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    checkedInBookings: 0,
    checkedOutBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    upcomingBookings: 0,
    currentGuests: 0,
    averageBookingValue: 0,
    occupancyRate: 0
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter, paymentStatusFilter, dateRange, pagination?.page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      console.log('Fetching bookings from eZee PMS...');
      const response = await fetch(`/api/bridge-retreats/bookings?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      
      if (data.bookings) {
        setBookings(data.bookings);
        setStats(data.stats || stats);
        setRoomTypes(data.roomTypes || []);
        setDataSource(data.source || 'eZee PMS');
        setLastSync(data.lastSync);
        setPagination(prev => ({ ...prev, total: data.total || data.bookings.length }));
        
        console.log(`Loaded ${data.bookings.length} bookings from ${data.source}`);
        
        if (data.bookings.length === 0) {
          setSuccess('No bookings found. This might be because eZee PMS is not returning data or there are no bookings for the selected criteria.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings from eZee PMS');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setSuccess(null);
      await fetchBookings();
      setSuccess('Bookings refreshed successfully from eZee PMS');
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data from eZee PMS. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncPMS = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);
      
      console.log('Syncing with eZee PMS...');
      const response = await fetch('/api/bridge-retreats/bookings?sync=true');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync with eZee PMS');
      }
      
      if (data.bookings) {
        setBookings(data.bookings);
        setStats(data.stats || stats);
        setRoomTypes(data.roomTypes || []);
        setLastSync(data.lastSync);
        setSuccess(`Successfully synced ${data.bookings.length} bookings from eZee PMS`);
      }
    } catch (err) {
      console.error('Failed to sync with eZee PMS:', err);
      setError('Failed to sync with eZee PMS. Please check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  };

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
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800';
      case 'CHECKED_OUT': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'WAITLISTED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(booking => booking.id));
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedBookings.length === 0) return;

    try {
      setBulkActionLoading(true);
      setError(null);
      setSuccess(null);

      for (const bookingId of selectedBookings) {
        switch (action) {
          case 'confirm':
            await fetch(`/api/bridge-retreats/bookings`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId, updates: { status: 'CONFIRMED' } })
            });
            break;
          case 'cancel':
            await fetch(`/api/bridge-retreats/bookings?bookingId=${bookingId}&reason=${data?.reason || 'Bulk cancellation'}`, {
              method: 'DELETE'
            });
            break;
          case 'checkin':
            await fetch(`/api/bridge-retreats/bookings`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId, updates: { status: 'CHECKED_IN' } })
            });
            break;
          case 'checkout':
            await fetch(`/api/bridge-retreats/bookings`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId, updates: { status: 'CHECKED_OUT' } })
            });
            break;
        }
      }

      setSuccess(`Bulk action "${action}" completed for ${selectedBookings.length} bookings`);
      setSelectedBookings([]);
      await fetchBookings();
    } catch (err) {
      console.error('Bulk action failed:', err);
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (paymentStatusFilter !== 'ALL' && booking.paymentStatus !== paymentStatusFilter) {
      return false;
    }
    return true;
  });

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
                <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage retreat bookings from eZee PMS
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
                  onClick={handleRefresh}
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
                  onClick={handleSyncPMS}
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
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                    New Booking
                  </Button>
              </div>
            </div>

            {/* Alerts */}
              {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
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
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">+{stats.upcomingBookings} upcoming</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-600">
                      Avg: {formatCurrency(stats.averageBookingValue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Guests</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.currentGuests}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-blue-600">{stats.checkedInBookings} checked in</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-orange-600">{stats.pendingBookings} pending</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                        placeholder="Search by guest name, email, or confirmation number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Payments</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range and Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="start-date" className="text-sm whitespace-nowrap">From:</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full sm:w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="end-date" className="text-sm whitespace-nowrap">To:</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full sm:w-auto"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedBookings.length > 0 && (
                <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                    {selectedBookings.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('confirm')}
                    disabled={bulkActionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('cancel')}
                    disabled={bulkActionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
                </div>
              </CardContent>
            </Card>

          {/* Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bookings</span>
                  <Badge variant="secondary">{filteredBookings.length} found</Badge>
                </CardTitle>
                <CardDescription>
                  Manage bookings from eZee PMS
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading bookings from eZee PMS...</span>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No bookings found
                    </h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      {searchTerm || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || dateRange.start || dateRange.end
                        ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                        : 'No bookings are currently available from eZee PMS. Check your PMS connection or create a new booking.'
                      }
                    </p>
                    {!(searchTerm || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || dateRange.start || dateRange.end) && (
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Booking
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                              checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Guests</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedBookings.includes(booking.id)}
                                  onCheckedChange={() => handleSelectBooking(booking.id)}
                                />
                              </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                      {booking.guest.firstName[0]}{booking.guest.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">
                                      {booking.guest.firstName} {booking.guest.lastName}
                                    </div>
                                  <div className="text-sm text-gray-500">
                                      {booking.guest.email}
                                    </div>
                                  {booking.confirmationNumber && (
                                    <div className="text-xs text-gray-400">
                                      #{booking.confirmationNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {booking.room.roomType}
                                  </div>
                                <div className="text-sm text-gray-500">
                                  Room {booking.room.roomNumber}
                                  </div>
                                <div className="text-xs text-gray-400">
                                  {booking.source}
                                  </div>
                                </div>
                              </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {formatDate(booking.checkInDate)}
                                  </div>
                                <div className="text-gray-500">
                                    to {formatDate(booking.checkOutDate)}
                                  </div>
                                </div>
                              </TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 text-gray-400" />
                                  <span className="font-medium">{booking.guestCount}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({booking.adults}A{booking.children > 0 ? `, ${booking.children}C` : ''})
                                </span>
                                </div>
                              </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(booking.totalAmount)}
                                </span>
                              </TableCell>
                            <TableCell>
                                <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                                  {booking.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                            <TableCell>
                                <Badge className={cn("text-xs", getPaymentStatusColor(booking.paymentStatus))}>
                                  {booking.paymentStatus}
                                </Badge>
                              </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                  className="h-8 w-8 p-0"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                  className="h-8 w-8 p-0"
                                      title="Edit Booking"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                  className="h-8 w-8 p-0"
                                      title="Payment"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                    </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 
 
 
 