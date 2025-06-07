"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Search,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  User,
  AlertCircle,
  XCircle,
  Receipt,
  Banknote,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AddPaymentModal } from "@/components/modals/add-payment-modal";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn, toNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Payment {
  id: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE';
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  transactionId?: string;
  notes?: string;
  paymentDate: string;
  orderId?: string;
  customerId?: string;
  order?: {
    id: string;
    orderNumber: string;
    customer: {
      name: string;
      phone: string;
    };
  };
  customer?: {
    name: string;
    phone: string;
  };
}

export default function PaymentsPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const methodOptions = [
    { value: "all", label: "All Methods" },
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "ONLINE", label: "Online Payment" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "PARTIAL", label: "Partial" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchPayments();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchPayments();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchPayments();
    }
  }, [searchTerm, methodFilter, statusFilter, dateFilter]);

  const fetchMarahCompany = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const marahCompany = data.companies.find((company: any) => 
          company.name === 'MARAH Inflatable Games Rental'
        );
        
        if (marahCompany) {
          setMarahCompanyId(marahCompany.id);
        } else {
          setError('MARAH company not found. Please create it first from the Companies page.');
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch company information');
    }
  };

  const fetchPayments = async () => {
    if (!marahCompanyId) return;
    
    try {
      const params = new URLSearchParams({
        companyId: marahCompanyId,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (methodFilter && methodFilter !== 'all') params.append('method', methodFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter && dateFilter !== 'all') params.append('dateFilter', dateFilter);

      const response = await fetch(`/api/marah/payments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (paymentId: string) => {
    console.log('View payment:', paymentId);
  };

  const handleEditPayment = (paymentId: string) => {
    // For now, payments are typically not edited after creation
    // Instead, show a message or redirect to create a new payment
    alert('Payment editing is not available. Please create a new payment if needed.');
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchPayments();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/marah/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchPayments();
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL': return 'bg-blue-100 text-blue-800';
      case 'REFUNDED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return CheckCircle;
      case 'PENDING': return Clock;
      case 'PARTIAL': return AlertTriangle;
      case 'REFUNDED': return Receipt;
      default: return AlertCircle;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return Banknote;
      case 'CARD': return CreditCard;
      case 'BANK_TRANSFER': return Receipt;
      case 'ONLINE': return Smartphone;
      default: return CreditCard;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CASH': return 'bg-green-100 text-green-800';
      case 'CARD': return 'bg-blue-100 text-blue-800';
      case 'BANK_TRANSFER': return 'bg-purple-100 text-purple-800';
      case 'ONLINE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMethodFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const exportPayments = () => {
    const headers = ['Date', 'Amount', 'Method', 'Status', 'Customer', 'Order', 'Transaction ID'];
    const csvContent = [
      headers.join(','),
      ...payments.map(payment => [
        formatDate(payment.paymentDate),
        payment.amount,
        payment.method,
        payment.status,
        payment.customer?.name || payment.order?.customer?.name || '',
        payment.order?.orderNumber || '',
        payment.transactionId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
    const completedPayments = payments.filter(p => p.status === 'PAID').length;
    const completedAmount = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + toNumber(p.amount), 0);
    const pendingAmount = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + toNumber(p.amount), 0);

    return { totalPayments, totalAmount, completedPayments, completedAmount, pendingAmount };
  };

  const stats = getPaymentStats();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
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
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Page Header */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
                  Payments Management
                </h1>
                <p className="text-muted-foreground">
                  Track and manage payment transactions with detailed analytics
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={exportPayments} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchPayments} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddPayment(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Payment
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Payment Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Payments</span>
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.totalPayments}
                  </div>
                  <p className="text-xs text-blue-600">
                    All transactions
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Amount</span>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(toNumber(stats.totalAmount))}
                  </div>
                  <p className="text-xs text-green-600">
                    All payments
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Completed</span>
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.completedPayments}
                  </div>
                  <p className="text-xs text-purple-600">
                    {formatCurrency(toNumber(stats.completedAmount))}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Pending</span>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(toNumber(stats.pendingAmount))}
                  </div>
                  <p className="text-xs text-orange-600">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Success Rate</span>
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.totalPayments > 0 ? Math.round((stats.completedPayments / stats.totalPayments) * 100) : 0}%
                  </div>
                  <p className="text-xs text-indigo-600">
                    Completion rate
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span>Payment Filtering</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
              </CardHeader>
              
              {showFilters && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Search Payments</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Transaction ID, customer..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="method">Payment Method</Label>
                      <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All methods" />
                        </SelectTrigger>
                        <SelectContent>
                          {methodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date">Date Range</Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {payments.length} payments found
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Payments Table */}
          <motion.div 
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>Payments List</span>
                </CardTitle>
                <CardDescription>
                  Payment transactions with detailed tracking and status management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => {
                          const StatusIcon = getStatusIcon(payment.status);
                          const MethodIcon = getMethodIcon(payment.method);
                          return (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">
                                      {formatDate(payment.paymentDate)}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(toNumber(payment.amount))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getMethodColor(payment.method))}>
                                  <MethodIcon className="w-3 h-3 mr-1" />
                                  {payment.method.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={cn("text-xs cursor-pointer", getStatusColor(payment.status))}
                                  onClick={() => {
                                    const newStatus = payment.status === 'PENDING' ? 'PAID' : 
                                                    payment.status === 'PAID' ? 'PENDING' : payment.status;
                                    if (newStatus !== payment.status) {
                                      handleUpdateStatus(payment.id, newStatus);
                                    }
                                  }}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.customer?.name || payment.order?.customer?.name ? (
                                  <div>
                                    <div className="font-medium text-sm">
                                      {payment.customer?.name || payment.order?.customer?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {payment.customer?.phone || payment.order?.customer?.phone}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    No customer
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {payment.order ? (
                                  <div className="text-sm font-medium">
                                    #{payment.order.orderNumber}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    Direct payment
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {payment.transactionId ? (
                                  <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                    {payment.transactionId}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    No transaction ID
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="View Details"
                                    onClick={() => handleViewPayment(payment.id)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Edit Payment"
                                    onClick={() => handleEditPayment(payment.id)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeletePayment(payment.id)}
                                    title="Delete Payment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || methodFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
                        ? "No payments match your current filters."
                        : "No payments have been recorded yet."
                      }
                    </p>
                    {(searchTerm || methodFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddPayment(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Record First Payment
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        onPaymentCreated={fetchPayments}
        companyId={marahCompanyId || ""}
      />
    </div>
  );
} 