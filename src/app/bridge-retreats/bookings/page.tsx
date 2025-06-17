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
  Send
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

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'WAITLISTED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  specialRequests?: string;
  createdAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
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

export default function BookingsPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [retreatFilter, setRetreatFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [stats, setStats] = useState<any>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [retreats, setRetreats] = useState<any[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchRetreats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter, paymentStatusFilter, retreatFilter, dateRange, pagination.page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { guestName: searchTerm }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(paymentStatusFilter !== 'ALL' && { paymentStatus: paymentStatusFilter }),
        ...(retreatFilter !== 'ALL' && { retreatId: retreatFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      };

      const data = await apiClient.getRetreatBookings(params);
      setBookings(data.bookings || []);
      setPagination(data.pagination);
      setStats(data.stats || {});
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
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
      setSelectedBookings(bookings.map(b => b.id));
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedBookings.length === 0) return;

    try {
      setBulkActionLoading(true);
      await apiClient.bulkUpdateRetreatBookings(action, selectedBookings, data);
      setSelectedBookings([]);
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading bookings...</span>
          </div>
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

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Booking Management
                </h2>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Manage retreat bookings, payments, and guest information.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/bridge-retreats/bookings/create">
                  <Button className="btn-premium">
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
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
                    {stats.totalBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    All time bookings
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Total Revenue</span>
                    <span className="sm:hidden">Revenue</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    From all bookings
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Confirmed</span>
                    <span className="sm:hidden">Confirmed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.statusCounts?.CONFIRMED || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Confirmed bookings
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">Pending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.statusCounts?.PENDING || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Awaiting confirmation
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <motion.div 
            className="flex flex-col gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by guest name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 border-refined h-11">
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
                  <SelectTrigger className="w-full sm:w-40 border-refined h-11">
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

                <Select value={retreatFilter} onValueChange={setRetreatFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-refined h-11">
                    <SelectValue placeholder="Retreat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Retreats</SelectItem>
                    {retreats.map(retreat => (
                      <SelectItem key={retreat.id} value={retreat.id}>
                        {retreat.title}
                      </SelectItem>
                    ))}
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
                    className="border-refined h-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="end-date" className="text-sm whitespace-nowrap">To:</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="border-refined h-9"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedBookings.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedBookings.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('confirm')}
                    disabled={bulkActionLoading}
                    className="h-9"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('cancel')}
                    disabled={bulkActionLoading}
                    className="h-9"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bookings Table */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Bookings</CardTitle>
                <CardDescription className="text-refined">
                  {pagination.total} bookings found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border border-border/30 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedBookings.length === bookings.length && bookings.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[200px]">Guest</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[200px]">Retreat</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[120px]">Dates</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[80px]">Guests</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[100px]">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[100px]">Status</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[100px]">Payment</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[120px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow 
                              key={booking.id} 
                              className="hover:bg-blue-50/50 transition-colors border-b border-border/20"
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedBookings.includes(booking.id)}
                                  onCheckedChange={() => handleSelectBooking(booking.id)}
                                />
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                                      {booking.guest.firstName[0]}{booking.guest.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 truncate">
                                      {booking.guest.firstName} {booking.guest.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      {booking.guest.email}
                                    </div>
                                    {booking.guest.phone && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {booking.guest.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 truncate">
                                    {booking.retreat.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {booking.retreat.type} • {booking.retreat.location}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    Instructor: {booking.retreat.instructor}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {formatDate(booking.checkInDate)}
                                  </div>
                                  <div className="text-muted-foreground">
                                    to {formatDate(booking.checkOutDate)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                                  <span className="font-medium">{booking.guestCount}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(booking.totalAmount)}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                                  {booking.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge className={cn("text-xs", getPaymentStatusColor(booking.paymentStatus))}>
                                  {booking.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center justify-end space-x-1">
                                  <Link href={`/bridge-retreats/bookings/${booking.id}`}>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/bridge-retreats/bookings/${booking.id}/edit`}>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                      title="Edit Booking"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/bridge-retreats/bookings/${booking.id}/payment`}>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                                      title="Payment"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {bookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        No bookings found
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md mx-auto">
                        {searchTerm || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || retreatFilter !== "ALL" || dateRange.start || dateRange.end
                          ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                          : 'Start by creating your first booking for a retreat.'
                        }
                      </p>
                      {!(searchTerm || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || retreatFilter !== "ALL" || dateRange.start || dateRange.end) && (
                        <Link href="/bridge-retreats/bookings/create">
                          <Button className="btn-premium">
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Booking
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/30">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm font-medium">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {error && (
            <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 