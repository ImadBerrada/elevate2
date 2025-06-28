"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Download,
  Send,
  MoreHorizontal,
  Building2,
  Star,
  MessageSquare,
  Heart,
  Shield,
  Utensils,
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ReceiptGeneratorService, BookingReceiptData } from "@/lib/pdf/receiptGenerator";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface BookingDetails {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  paidAmount?: number;
  paymentMethod?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'WAITLISTED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    dietaryRestrictions?: string;
    medicalConditions?: string;
  };
  retreat: {
    id: string;
    title: string;
    type: string;
    location: string;
    instructor: string;
    price: number;
    capacity: number;
    startDate: string;
    endDate: string;
    description: string;
    imageUrl?: string;
  };
  additionalGuests?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    dietaryRestrictions?: string;
    medicalConditions?: string;
  }>;
}

export default function BookingDetailsPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log('BookingDetailsPage useEffect - bookingId:', bookingId);
    console.log('params:', params);
    
    if (bookingId && bookingId !== 'undefined') {
      fetchBookingDetails();
    } else {
      setError('Invalid booking ID. Please check the URL or go back to the bookings list.');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching booking details for ID:', bookingId);
      
      // Validate booking ID format
      if (!bookingId || typeof bookingId !== 'string' || bookingId === 'undefined') {
        throw new Error('Invalid booking ID format');
      }
      
      const data = await apiClient.getRetreatBookingById(bookingId);
      console.log('Successfully fetched booking data:', data);
      setBooking(data);
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      console.error('Booking ID that failed:', bookingId);
      
      // Enhanced error handling
      if (err instanceof Error) {
        if (err.message.includes('Booking not found')) {
          setError(`Booking with ID "${bookingId}" was not found. Please check the URL or go back to the bookings list.`);
        } else if (err.message.includes('Failed to fetch')) {
          setError('Network error: Unable to connect to the server. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred while loading the booking details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;

    try {
      setActionLoading(true);
      await apiClient.updateRetreatBooking(booking.id, { status: newStatus });
      setBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
      setSuccess(`Booking status updated to ${newStatus.toLowerCase()}`);
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus: string, paidAmount?: number) => {
    if (!booking) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const paymentData = {
        paymentStatus: newPaymentStatus,
        paidAmount: paidAmount !== undefined ? paidAmount : booking.paidAmount,
        paymentMethod: booking.paymentMethod || 'CARD'
      };

      const response = await fetch(`/api/bridge-retreats/bookings/${booking.id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const result = await response.json();
      setSuccess(`Payment updated successfully. ${result.paymentDifference > 0 ? 'Financial records updated.' : ''}`);
      
      // Refresh booking details to show updated information
      await fetchBookingDetails();
      
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      setActionLoading(true);
      await apiClient.cancelRetreatBooking(booking.id);
      setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      setSuccess('Booking cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const prepareReceiptData = (): BookingReceiptData => {
    if (!booking) throw new Error('Booking data not available');

    return {
      id: booking.id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestCount: booking.guestCount,
      totalAmount: booking.totalAmount,
      paidAmount: booking.paidAmount || 0,
      paymentMethod: booking.paymentMethod || 'Not specified',
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      guest: {
        firstName: booking.guest.firstName,
        lastName: booking.guest.lastName,
        email: booking.guest.email,
        phone: booking.guest.phone,
      },
      retreat: {
        title: booking.retreat.title,
        type: booking.retreat.type,
        location: booking.retreat.location,
        instructor: booking.retreat.instructor,
        price: booking.retreat.price,
        startDate: booking.retreat.startDate,
        endDate: booking.retreat.endDate,
      },
    };
  };

  const handleDownloadReceipt = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const receiptData = prepareReceiptData();
      await ReceiptGeneratorService.generateValidatedReceiptPDF(receiptData);
      setSuccess('Receipt downloaded successfully');
    } catch (err) {
      console.error('Failed to download receipt:', err);
      setError(err instanceof Error ? err.message : 'Failed to download receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreviewReceipt = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const receiptData = prepareReceiptData();
      await ReceiptGeneratorService.previewBookingReceiptPDF(receiptData);
      setSuccess('Receipt opened in new tab');
    } catch (err) {
      console.error('Failed to preview receipt:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview receipt');
    } finally {
      setActionLoading(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Sidebar />
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen && !isMobile ? "ml-64" : "ml-0"
        )}>
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Sidebar />
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen && !isMobile ? "ml-64" : "ml-0"
        )}>
          <Header />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                
                {/* Debug information */}
                <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-800 mb-2">Debug Information:</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Booking ID:</strong> {bookingId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/bridge-retreats/bookings">
                    <Button>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Bookings
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const allGuests = [booking.guest, ...(booking.additionalGuests || [])];

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
                  <h1 className="text-3xl font-prestigious text-gradient">Booking Details</h1>
                  <p className="text-refined text-muted-foreground mt-1">
                    Booking ID: {booking.id}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(booking.id)}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link href={`/bridge-retreats/bookings/${booking.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Booking
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/bridge-retreats/bookings/${booking.id}/payment`)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/bridge-retreats/bookings/${booking.id}/confirmation`)}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Confirmation
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handlePreviewReceipt}
                      disabled={actionLoading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Generating...' : 'Preview Receipt'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDownloadReceipt}
                      disabled={actionLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Generating...' : 'Download Receipt'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleCancelBooking()}
                      className="text-red-600"
                      disabled={booking.status === 'CANCELLED'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Status Messages */}
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-700">{success}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Booking Overview */}
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center font-elegant">
                          <Calendar className="h-5 w-5 mr-2" />
                          Booking Overview
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-refined text-muted-foreground">Check-in Date</p>
                          <p className="font-elegant">{formatDate(booking.checkInDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-refined text-muted-foreground">Check-out Date</p>
                          <p className="font-elegant">{formatDate(booking.checkOutDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-refined text-muted-foreground">Duration</p>
                          <p className="font-elegant">
                            {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-refined text-muted-foreground">Guests</p>
                          <p className="font-elegant">{booking.guestCount}</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600">Booking Created</p>
                          <p className="font-semibold">{formatDateTime(booking.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="font-semibold">{formatDateTime(booking.updatedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Retreat Information */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Retreat Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold">{booking.retreat.title}</h3>
                            <Badge variant="secondary">{booking.retreat.type}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {booking.retreat.location}
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {booking.retreat.instructor}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {formatDate(booking.retreat.startDate)} - {formatDate(booking.retreat.endDate)}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Capacity: {booking.retreat.capacity}
                            </div>
                          </div>

                          {booking.retreat.description && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">{booking.retreat.description}</p>
                            </div>
                          )}

                          <div className="mt-4">
                            <Link href={`/bridge-retreats/retreats/${booking.retreat.id}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Retreat Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Guest Information */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Guest Information ({allGuests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {allGuests.map((guest, index) => (
                          <div key={guest.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {guest.firstName[0]}{guest.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">
                                    {guest.firstName} {guest.lastName}
                                    {index === 0 && <Badge variant="outline" className="ml-2">Primary</Badge>}
                                  </h4>
                                  <p className="text-sm text-gray-600">{guest.email}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {guest.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{guest.phone}</span>
                                </div>
                              )}
                              
                              {guest.dateOfBirth && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>Born: {formatDate(guest.dateOfBirth)}</span>
                                </div>
                              )}
                              
                              {guest.emergencyContact && (
                                <div className="flex items-center">
                                  <Shield className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>Emergency: {guest.emergencyContact}</span>
                                </div>
                              )}
                              
                              {guest.emergencyPhone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>Emergency: {guest.emergencyPhone}</span>
                                </div>
                              )}
                            </div>

                            {(guest.dietaryRestrictions || guest.medicalConditions) && (
                              <div className="mt-4 space-y-2">
                                {guest.dietaryRestrictions && (
                                  <div className="flex items-start">
                                    <Utensils className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium">Dietary Restrictions:</p>
                                      <p className="text-sm text-gray-600">{guest.dietaryRestrictions}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {guest.medicalConditions && (
                                  <div className="flex items-start">
                                    <Heart className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium">Medical Conditions:</p>
                                      <p className="text-sm text-gray-600">{guest.medicalConditions}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Special Requests
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{booking.specialRequests}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => router.push(`/bridge-retreats/bookings/${booking.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Booking
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => router.push(`/bridge-retreats/bookings/${booking.id}/payment`)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Payment
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => router.push(`/bridge-retreats/bookings/${booking.id}/confirmation`)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Confirmation
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Summary */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Payment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Price per person:</span>
                          <span>{formatCurrency(booking.retreat.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Number of guests:</span>
                          <span>{booking.guestCount}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span className="text-blue-600">{formatCurrency(booking.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Paid Amount:</span>
                          <span className="text-green-600">{formatCurrency(booking.paidAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Remaining Balance:</span>
                          <span className={`${(booking.totalAmount - (booking.paidAmount || 0)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(booking.totalAmount - (booking.paidAmount || 0))}
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                            Payment {booking.paymentStatus}
                          </Badge>
                          {booking.paymentMethod && (
                            <Badge variant="outline" className="ml-2">
                              {booking.paymentMethod}
                            </Badge>
                          )}
                        </div>

                        {/* Quick Payment Actions */}
                        {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
                          <div className="mt-4 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">Quick Payment Actions</p>
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handlePaymentStatusUpdate('PAID', booking.totalAmount)}
                                disabled={actionLoading}
                              >
                                Mark as Fully Paid
                              </Button>
                              {booking.paymentStatus === 'PENDING' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handlePaymentStatusUpdate('PARTIAL', booking.totalAmount * 0.5)}
                                  disabled={actionLoading}
                                >
                                  Mark 50% Paid
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Status Management */}
                <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Booking Status</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].map((status) => (
                            <Button
                              key={status}
                              variant={booking.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusUpdate(status)}
                              disabled={actionLoading || booking.status === 'CANCELLED'}
                              className="text-xs"
                            >
                              {status.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Payment Status</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'].map((status) => (
                            <Button
                              key={status}
                              variant={booking.paymentStatus === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePaymentStatusUpdate(status, booking.paidAmount)}
                              disabled={actionLoading || booking.status === 'CANCELLED'}
                              className="text-xs"
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {booking.status !== 'CANCELLED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking()}
                          disabled={actionLoading}
                          className="w-full"
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}
 
 
 