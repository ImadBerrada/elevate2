"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Clock,
  Search, 
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
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
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
  CalendarDays,
  Building2,
  Star,
  ArrowUp,
  ArrowDown,
  Send,
  Bell,
  Target,
  Zap
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

interface WaitlistEntry {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: 'WAITLISTED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  specialRequests?: string;
  createdAt: string;
  waitlistPosition: number;
  availableSpots: number;
  canBePromoted: boolean;
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
    capacity: number;
    startDate: string;
    endDate: string;
  };
}

export default function WaitlistPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [retreatFilter, setRetreatFilter] = useState("ALL");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [retreats, setRetreats] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlist();
    fetchRetreats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchWaitlist();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, retreatFilter, pagination.page]);

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(retreatFilter !== 'ALL' && { retreatId: retreatFilter }),
      };

      const data = await apiClient.getRetreatWaitlist(params);
      setWaitlistEntries(data.waitlist || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch waitlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch waitlist');
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

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === waitlistEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(waitlistEntries.map(e => e.id));
    }
  };

  const handlePromoteSelected = async () => {
    if (selectedEntries.length === 0) return;

    try {
      setActionLoading(true);
      const result = await apiClient.promoteFromWaitlist(selectedEntries);
      
      if (result.promotedBookings?.length > 0) {
        setSuccess(`Successfully promoted ${result.promotedBookings.length} booking(s) from waitlist`);
        setSelectedEntries([]);
        fetchWaitlist();
      }
      
      if (result.errors?.length > 0) {
        setError(`Some promotions failed: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote from waitlist');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoPromote = async (retreatId: string) => {
    try {
      setActionLoading(true);
      const result = await apiClient.autoPromoteWaitlist(retreatId);
      
      if (result.promotedCount > 0) {
        setSuccess(`Successfully auto-promoted ${result.promotedCount} booking(s) from waitlist`);
        fetchWaitlist();
      } else {
        setError('No eligible bookings found for promotion');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-promote waitlist');
    } finally {
      setActionLoading(false);
    }
  };

  const getPromotionProbability = (entry: WaitlistEntry) => {
    if (entry.canBePromoted) return 'High';
    if (entry.availableSpots > 0) return 'Medium';
    return 'Low';
  };

  const getPromotionColor = (entry: WaitlistEntry) => {
    if (entry.canBePromoted) return 'text-green-600';
    if (entry.availableSpots > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && waitlistEntries.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading waitlist...</span>
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
                  Waitlist Management
                </h2>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Manage waiting lists and promote guests when spaces become available.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/bridge-retreats/bookings">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Bookings
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
                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="hidden sm:inline">Total Waitlisted</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {waitlistEntries.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Guests waiting
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Ready to Promote</span>
                    <span className="sm:hidden">Ready</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {waitlistEntries.filter(e => e.canBePromoted).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Can be promoted now
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Potential Revenue</span>
                    <span className="sm:hidden">Revenue</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {formatCurrency(waitlistEntries.reduce((sum, e) => sum + e.totalAmount, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    From waitlist
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Conversion Rate</span>
                    <span className="sm:hidden">Rate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    85%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Waitlist to booking
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedEntries.length > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {selectedEntries.length} selected
                    </span>
                    <Button
                      size="sm"
                      onClick={handlePromoteSelected}
                      disabled={actionLoading}
                      className="h-9 btn-premium"
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Promote Selected
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {retreatFilter !== 'ALL' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAutoPromote(retreatFilter)}
                    disabled={actionLoading}
                    className="h-9"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Auto-Promote
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Waitlist Table */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Waitlist Entries</CardTitle>
                <CardDescription className="text-refined">
                  {pagination.total} guests waiting for available spots
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
                                checked={selectedEntries.length === waitlistEntries.length && waitlistEntries.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[60px]">Position</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[200px]">Guest</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[200px]">Retreat</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[120px]">Dates</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[80px]">Guests</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[100px]">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[100px]">Available</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[100px]">Promotion</TableHead>
                            <TableHead className="font-semibold text-gray-900 min-w-[120px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {waitlistEntries.map((entry) => (
                            <TableRow 
                              key={entry.id} 
                              className="hover:bg-blue-50/50 transition-colors border-b border-border/20"
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedEntries.includes(entry.id)}
                                  onCheckedChange={() => handleSelectEntry(entry.id)}
                                />
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="font-mono">
                                    #{entry.waitlistPosition}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                                      {entry.guest.firstName[0]}{entry.guest.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 truncate">
                                      {entry.guest.firstName} {entry.guest.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      {entry.guest.email}
                                    </div>
                                    {entry.guest.phone && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {entry.guest.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 truncate">
                                    {entry.retreat.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {entry.retreat.type} • {entry.retreat.location}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    Capacity: {entry.retreat.capacity}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {formatDate(entry.checkInDate)}
                                  </div>
                                  <div className="text-muted-foreground">
                                    to {formatDate(entry.checkOutDate)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                                  <span className="font-medium">{entry.guestCount}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(entry.totalAmount)}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center">
                                  <span className={cn(
                                    "font-medium",
                                    entry.availableSpots > 0 ? "text-green-600" : "text-red-600"
                                  )}>
                                    {entry.availableSpots}
                                  </span>
                                  <span className="text-muted-foreground ml-1">spots</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center">
                                  {entry.canBePromoted ? (
                                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                  ) : (
                                    <Clock className="w-4 h-4 mr-1 text-yellow-600" />
                                  )}
                                  <span className={cn("text-sm font-medium", getPromotionColor(entry))}>
                                    {getPromotionProbability(entry)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center justify-end space-x-1">
                                  <Link href={`/bridge-retreats/bookings/${entry.id}`}>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  {entry.canBePromoted && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                      onClick={() => handlePromoteSelected()}
                                      title="Promote to Confirmed"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                                    title="Send Notification"
                                  >
                                    <Bell className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {waitlistEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        No waitlist entries
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md mx-auto">
                        {searchTerm || retreatFilter !== "ALL"
                          ? 'No waitlist entries match your current filters.'
                          : 'All retreats have available capacity. Waitlist entries will appear here when retreats are fully booked.'
                        }
                      </p>
                      <Link href="/bridge-retreats/bookings">
                        <Button className="btn-premium">
                          <Eye className="w-4 h-4 mr-2" />
                          View All Bookings
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/30">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
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

          {/* Success/Error Messages */}
          {success && (
            <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-600 text-sm">{success}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccess(null)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

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