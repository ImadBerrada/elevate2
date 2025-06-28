"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Send,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Eye,
  Edit,
  Loader2,
  MessageSquare,
  Clock,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

interface BookingConfirmation {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  specialRequests?: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  retreat: {
    title: string;
    type: string;
    location: string;
    instructor: string;
    price: number;
    description: string;
  };
  confirmationSent?: boolean;
  lastConfirmationSent?: string;
}

export default function BookingConfirmationPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Email customization state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [includeItinerary, setIncludeItinerary] = useState(true);
  const [includePaymentInfo, setIncludePaymentInfo] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      // Set default email content
      setEmailSubject(`Booking Confirmation - ${booking.retreat.title}`);
      setEmailMessage(generateDefaultMessage());
    }
  }, [booking]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRetreatBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultMessage = () => {
    if (!booking) return '';
    
    return `Dear ${booking.guest.firstName},

Thank you for booking with Bridge Retreats! We're excited to confirm your reservation for "${booking.retreat.title}".

Your booking details:
- Check-in: ${formatDate(booking.checkInDate)}
- Check-out: ${formatDate(booking.checkOutDate)}
- Guests: ${booking.guestCount}
- Location: ${booking.retreat.location}
- Instructor: ${booking.retreat.instructor}

We look forward to providing you with an exceptional retreat experience.

Best regards,
Bridge Retreats Team`;
  };

  const handleSendConfirmation = async () => {
    if (!booking) return;

    try {
      setSending(true);
      setError(null);

      // Send confirmation email (this would integrate with email service)
      const emailData = {
        to: booking.guest.email,
        subject: emailSubject,
        message: emailMessage,
        includeItinerary,
        includePaymentInfo,
        bookingId: booking.id
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Confirmation email sent successfully!');
      
      // Update booking to mark confirmation as sent
      setBooking(prev => prev ? {
        ...prev,
        confirmationSent: true,
        lastConfirmationSent: new Date().toISOString()
      } : null);

    } catch (err) {
      console.error('Failed to send confirmation:', err);
      setError(err instanceof Error ? err.message : 'Failed to send confirmation');
    } finally {
      setSending(false);
    }
  };

  const copyConfirmationText = () => {
    const confirmationText = generateConfirmationText();
    navigator.clipboard.writeText(confirmationText);
    setSuccess('Confirmation text copied to clipboard');
  };

  const generateConfirmationText = () => {
    if (!booking) return '';
    
    return `BOOKING CONFIRMATION

Booking ID: ${booking.id}
Guest: ${booking.guest.firstName} ${booking.guest.lastName}
Email: ${booking.guest.email}
Phone: ${booking.guest.phone || 'Not provided'}

RETREAT DETAILS
${booking.retreat.title}
Type: ${booking.retreat.type}
Location: ${booking.retreat.location}
Instructor: ${booking.retreat.instructor}

BOOKING DETAILS
Check-in: ${formatDate(booking.checkInDate)}
Check-out: ${formatDate(booking.checkOutDate)}
Duration: ${Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days
Guests: ${booking.guestCount}
Total Amount: ${formatCurrency(booking.totalAmount)}
Status: ${booking.status}
Payment Status: ${booking.paymentStatus}

${booking.specialRequests ? `SPECIAL REQUESTS\n${booking.specialRequests}\n\n` : ''}Generated on: ${new Date().toLocaleString()}`;
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
                <Link href="/bridge-retreats/bookings">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen && !isMobile ? "ml-64" : "ml-0"
      )}>
        <Header />
        
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between mb-8"
              {...fadeInUp}
            >
              <div className="flex items-center space-x-4">
                <Link href={`/bridge-retreats/bookings/${bookingId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Booking Details
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Booking Confirmation</h1>
                  <p className="text-gray-600 mt-1">Send confirmation and manage communications</p>
                </div>
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
                {/* Confirmation Status */}
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Mail className="h-5 w-5 mr-2" />
                          Confirmation Status
                        </CardTitle>
                        {booking.confirmationSent ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600">Guest Email</p>
                          <p className="font-semibold">{booking.guest.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Guest Phone</p>
                          <p className="font-semibold">{booking.guest.phone || 'Not provided'}</p>
                        </div>
                        {booking.lastConfirmationSent && (
                          <>
                            <div>
                              <p className="text-sm text-gray-600">Last Sent</p>
                              <p className="font-semibold">{formatDateTime(booking.lastConfirmationSent)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Booking Status</p>
                              <Badge>{booking.status}</Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Email Customization */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Edit className="h-5 w-5 mr-2" />
                        Customize Confirmation Email
                      </CardTitle>
                      <CardDescription>
                        Personalize the confirmation email before sending
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="emailSubject">Email Subject</Label>
                          <Input
                            id="emailSubject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter email subject"
                          />
                        </div>

                        <div>
                          <Label htmlFor="emailMessage">Email Message</Label>
                          <Textarea
                            id="emailMessage"
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            placeholder="Enter email message"
                            rows={10}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Include Additional Information</Label>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={includeItinerary}
                                onChange={(e) => setIncludeItinerary(e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Include retreat itinerary</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={includePaymentInfo}
                                onChange={(e) => setIncludePaymentInfo(e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Include payment information</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button variant="outline" onClick={() => setEmailMessage(generateDefaultMessage())}>
                            Reset to Default
                          </Button>
                          <Button 
                            onClick={handleSendConfirmation}
                            disabled={sending || !emailSubject || !emailMessage}
                          >
                            {sending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Confirmation
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Booking Summary for Confirmation */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Eye className="h-5 w-5 mr-2" />
                        Confirmation Preview
                      </CardTitle>
                      <CardDescription>
                        Preview of the booking details that will be included
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">{booking.retreat.title}</h3>
                            <p className="text-gray-600">{booking.retreat.type}</p>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Check-in: {formatDate(booking.checkInDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Check-out: {formatDate(booking.checkOutDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{booking.retreat.location}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{booking.retreat.instructor}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{booking.guestCount} guests</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold">Total: {formatCurrency(booking.totalAmount)}</span>
                            </div>
                          </div>

                          {booking.specialRequests && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                                <p className="text-sm text-gray-600 mt-1">{booking.specialRequests}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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
                        onClick={copyConfirmationText}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Confirmation Text
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => window.open(`tel:${booking.guest.phone}`)}
                        disabled={!booking.guest.phone}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Guest
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => window.open(`mailto:${booking.guest.email}`)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Guest
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Guest Information */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold">
                            {booking.guest.firstName} {booking.guest.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold">{booking.guest.email}</p>
                        </div>
                        {booking.guest.phone && (
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-semibold">{booking.guest.phone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Communication History */}
                <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Communication History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {booking.confirmationSent ? (
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Mail className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Confirmation sent</p>
                              <p className="text-xs text-gray-500">
                                {booking.lastConfirmationSent && formatDateTime(booking.lastConfirmationSent)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No communications sent yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
 
 
 