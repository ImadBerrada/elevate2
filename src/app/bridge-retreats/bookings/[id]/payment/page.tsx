"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Receipt,
  Download,
  Send,
  Loader2,
  Plus,
  History
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  processedAt: string;
  notes?: string;
}

interface BookingPayment {
  id: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  guest: {
    firstName: string;
    lastName: string;
    email: string;
  };
  retreat: {
    title: string;
    price: number;
  };
  guestCount: number;
  payments: PaymentRecord[];
}

export default function BookingPaymentPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingPayment();
    }
  }, [bookingId]);

  const fetchBookingPayment = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRetreatBookingById(bookingId);
      
      // Transform data for payment view
      const paymentData: BookingPayment = {
        id: data.id,
        totalAmount: data.totalAmount,
        paidAmount: 0, // This would come from payment records
        remainingAmount: data.totalAmount,
        paymentStatus: data.paymentStatus,
        guest: data.guest,
        retreat: data.retreat,
        guestCount: data.guestCount,
        payments: [] // This would come from payment history API
      };
      
      setBooking(paymentData);
    } catch (err) {
      console.error('Failed to fetch booking payment details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!booking || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > booking.remainingAmount) {
      setError('Payment amount cannot exceed remaining balance');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Process payment (this would integrate with actual payment gateway)
      const paymentData = {
        amount,
        method: paymentMethod,
        transactionId: transactionId || undefined,
        notes: paymentNotes || undefined
      };

      // Update booking payment status
      const newPaymentStatus = amount >= booking.remainingAmount ? 'PAID' : 'PARTIAL';
      await apiClient.updateRetreatBooking(booking.id, { paymentStatus: newPaymentStatus });

      setSuccess(`Payment of ${formatCurrency(amount)} processed successfully!`);
      
      // Reset form
      setPaymentAmount('');
      setTransactionId('');
      setPaymentNotes('');
      
      // Refresh booking data
      setTimeout(() => {
        fetchBookingPayment();
      }, 1000);

    } catch (err) {
      console.error('Failed to process payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefund = async (amount: number) => {
    if (!booking) return;

    try {
      setProcessing(true);
      setError(null);

      await apiClient.updateRetreatBooking(booking.id, { paymentStatus: 'REFUNDED' });
      
      setSuccess(`Refund of ${formatCurrency(amount)} processed successfully!`);
      
      setTimeout(() => {
        fetchBookingPayment();
      }, 1000);

    } catch (err) {
      console.error('Failed to process refund:', err);
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setProcessing(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
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
                  <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                  <p className="text-gray-600 mt-1">Process payments and manage billing</p>
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
                {/* Payment Summary */}
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2" />
                          Payment Summary
                        </CardTitle>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(booking.paidAmount)}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {formatCurrency(booking.remainingAmount)}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-gray-600">Guest</p>
                          <p className="font-semibold">
                            {booking.guest.firstName} {booking.guest.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Retreat</p>
                          <p className="font-semibold">{booking.retreat.title}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price per person</p>
                          <p className="font-semibold">{formatCurrency(booking.retreat.price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Number of guests</p>
                          <p className="font-semibold">{booking.guestCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Process Payment */}
                {booking.paymentStatus !== 'PAID' && booking.paymentStatus !== 'REFUNDED' && (
                  <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Process Payment
                        </CardTitle>
                        <CardDescription>
                          Record a new payment for this booking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="paymentAmount">Payment Amount</Label>
                            <Input
                              id="paymentAmount"
                              type="number"
                              step="0.01"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="0.00"
                              max={booking.remainingAmount}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum: {formatCurrency(booking.remainingAmount)}
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                            <Input
                              id="transactionId"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="Enter transaction reference"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paymentNotes">Notes (Optional)</Label>
                            <Input
                              id="paymentNotes"
                              value={paymentNotes}
                              onChange={(e) => setPaymentNotes(e.target.value)}
                              placeholder="Payment notes"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end mt-6">
                          <Button 
                            onClick={handleProcessPayment}
                            disabled={processing || !paymentAmount}
                            className="px-8"
                          >
                            {processing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Process Payment
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Payment History */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <History className="h-5 w-5 mr-2" />
                        Payment History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {booking.payments.length > 0 ? (
                        <div className="space-y-4">
                          {booking.payments.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                                    <p className="text-sm text-gray-600">{payment.method}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={getPaymentStatusColor(payment.status)}>
                                    {payment.status}
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(payment.processedAt)}
                                  </p>
                                </div>
                              </div>
                              
                              {payment.transactionId && (
                                <p className="text-sm text-gray-600">
                                  Transaction ID: {payment.transactionId}
                                </p>
                              )}
                              
                              {payment.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Notes: {payment.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No payment history available</p>
                        </div>
                      )}
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
                        onClick={() => setPaymentAmount(booking.remainingAmount.toString())}
                        disabled={booking.paymentStatus === 'PAID' || booking.paymentStatus === 'REFUNDED'}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Pay Full Amount
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                      
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Payment Link
                      </Button>
                      
                      {booking.paidAmount > 0 && (
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => handleRefund(booking.paidAmount)}
                          disabled={processing || booking.paymentStatus === 'REFUNDED'}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Process Refund
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Status */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">
                            {Math.round((booking.paidAmount / booking.totalAmount) * 100)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((booking.paidAmount / booking.totalAmount) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        
                        <div className="text-center">
                          <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
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