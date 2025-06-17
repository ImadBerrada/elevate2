"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  FileText,
  Banknote,
  Menu,
  Settings,
  Users,
  Home,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Interfaces for API integration
interface Property {
  id: string;
  name: string;
  address: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Agreement {
  id: string;
  agreementNumber: string;
  rentAmount: number;
  tenant: Tenant;
  property: Property;
  rentalUnit: {
    id: string;
    unitNumber: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

interface PaymentHistory {
  id: string;
  agreement: Agreement;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  type: 'INCOMING' | 'OUTGOING';
  referenceNumber?: string;
  description?: string;
  lateFee?: number;
  taxAmount?: number;
  totalAmount: number;
  processingTime?: number; // in minutes
}

interface HistoryStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
  averagePayment: number;
  monthlyGrowth: number;
  completedPayments: number;
  failedPayments: number;
  avgProcessingTime: number;
}

export default function PaymentHistory() {
  const { toggle: toggleSidebar } = useSidebar();
  
  // State management
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    totalPayments: 0,
    totalAmount: 0,
    successRate: 0,
    averagePayment: 0,
    monthlyGrowth: 0,
    completedPayments: 0,
    failedPayments: 0,
    avgProcessingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    tenant?: string;
    agreement?: string;
    property?: string;
    payment?: string;
  }>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const paymentsPerPage = 10;
  
  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  const [isViewPaymentOpen, setIsViewPaymentOpen] = useState(false);

  useEffect(() => {
    // Parse URL parameters for context-aware filtering
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newUrlParams = {
        tenant: params.get('tenant') || undefined,
        agreement: params.get('agreement') || undefined,
        property: params.get('property') || undefined,
        payment: params.get('payment') || undefined,
      };
      setUrlParams(newUrlParams);
      
      if (newUrlParams.tenant) {
        setSuccess(`Viewing payment history for selected tenant`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.agreement) {
        setSuccess(`Viewing payment history for selected agreement`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.property) {
        setSuccess(`Viewing payment history for selected property`);
        setTimeout(() => setSuccess(null), 3000);
      }
    }
    
    fetchData();
  }, [currentPage, searchTerm, statusFilter, typeFilter, methodFilter, dateRange]);

  // Auto-dismiss success/error notifications
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPaymentHistory(),
        fetchPaymentMethods(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: paymentsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(methodFilter !== "all" && { paymentMethod: methodFilter }),
        ...(dateRange !== "all" && { dateRange }),
        ...(urlParams.tenant && { tenantId: urlParams.tenant }),
        ...(urlParams.agreement && { agreementId: urlParams.agreement }),
        ...(urlParams.property && { propertyId: urlParams.property }),
      });

      const response = await fetch(`/api/real-estate/payments/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setTotalPages(Math.ceil((data.total || 0) / paymentsPerPage));
      } else {
        setError('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to fetch payment history');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/real-estate/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      } else {
        // Fallback to default payment methods
        setPaymentMethods([
          { id: 'cash', name: 'Cash', isActive: true },
          { id: 'bank_transfer', name: 'Bank Transfer', isActive: true },
          { id: 'credit_card', name: 'Credit Card', isActive: true },
          { id: 'cheque', name: 'Cheque', isActive: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/real-estate/payments/history/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  // Cross-module navigation handlers
  const handleViewTenant = (payment: PaymentHistory) => {
    window.location.href = `/real-estate/tenants/management?highlight=${payment.agreement.tenant.id}&payment=${payment.id}`;
  };

  const handleViewProperty = (payment: PaymentHistory) => {
    window.location.href = `/real-estate/properties/management?highlight=${payment.agreement.property.id}&tenant=${payment.agreement.tenant.id}`;
  };

  const handleViewLease = (payment: PaymentHistory) => {
    window.location.href = `/real-estate/tenants/leases?agreement=${payment.agreement.id}&highlight=${payment.agreement.id}`;
  };

  const handleViewRentCollection = (payment: PaymentHistory) => {
    window.location.href = `/real-estate/tenants/rent?agreement=${payment.agreement.id}&tenant=${payment.agreement.tenant.id}`;
  };

  const handleViewPayment = (payment: PaymentHistory) => {
    setSelectedPayment(payment);
    setIsViewPaymentOpen(true);
  };

  const handleExportHistory = async () => {
    try {
      const params = new URLSearchParams({
        format: 'excel',
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(dateRange !== "all" && { dateRange }),
      });

      const response = await fetch(`/api/real-estate/payments/history/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Payment history exported successfully');
      } else {
        setError('Failed to export payment history');
      }
    } catch (error) {
      setError('Failed to export payment history');
      console.error('Error exporting payment history:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-green-600";
      case "PENDING": return "text-yellow-600";
      case "FAILED": return "text-red-600";
      case "CANCELLED": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "FAILED": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return CheckCircle;
      case "PENDING": return Clock;
      case "FAILED": return XCircle;
      case "CANCELLED": return AlertCircle;
      default: return Clock;
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === "INCOMING" ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return type === "INCOMING" ? "text-green-600" : "text-blue-600";
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card": return CreditCard;
      case "bank transfer": return Banknote;
      case "cash": return DollarSign;
      default: return CreditCard;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate growth percentage
  const getGrowthDisplay = (value: number) => {
    const isPositive = value >= 0;
    const GrowthIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        <GrowthIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <motion.div
                  className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FileText className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Payment History</h1>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleExportHistory}
                  className="glass-card border-0 hover-glow"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="glass-card border-0 hover-glow">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Search Payments</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input 
                            placeholder="Search by tenant, property, or reference..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Type</label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="incoming">Incoming</SelectItem>
                              <SelectItem value="outgoing">Outgoing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Date Range</label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger>
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Date Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 3 months</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/payments/processing'}
                          className="flex-1"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Processing
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/rent'}
                          className="flex-1"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Rent Collection
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchData}
                        disabled={loading}
                        className="w-full"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Payments
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.totalPayments.toLocaleString()}</div>
                  {getGrowthDisplay(stats.monthlyGrowth)}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(stats.totalAmount)}</div>
                  <p className="text-sm text-green-600 font-medium">Average: {formatCurrency(stats.averagePayment)}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-emerald-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.successRate.toFixed(1)}%</div>
                  <p className="text-sm text-emerald-600 font-medium">{stats.completedPayments} completed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Processing Time
                  </CardTitle>
                  <Clock className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.avgProcessingTime.toFixed(0)}min</div>
                  <p className="text-sm text-purple-600 font-medium">{stats.failedPayments} failed payments</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Payment History Table */}
          <motion.div variants={fadeInUp} className="hover-lift mb-8">
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gradient">
                      Payment History ({payments.length})
                    </CardTitle>
                    <CardDescription>
                      Complete record of all payment transactions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="glass-card border-0 hover-glow"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      className="glass-card border-0 hover-glow"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gradient mb-2">No payment history</h3>
                    <p className="text-muted-foreground">No payments found matching your criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => {
                      const StatusIcon = getStatusIcon(payment.status);
                      const TransactionIcon = getTransactionIcon(payment.type);
                      const MethodIcon = getMethodIcon(payment.paymentMethod.name);

                      return (
                        <motion.div
                          key={payment.id}
                          className="glass-card p-6 rounded-xl border border-white/20 hover-glow"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                                  <TransactionIcon className={`w-6 h-6 text-white`} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gradient truncate">
                                  {payment.agreement.tenant.firstName} {payment.agreement.tenant.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center space-x-2">
                                  <Building2 className="w-4 h-4" />
                                  <span className="truncate">{payment.agreement.property.name} - Unit {payment.agreement.rentalUnit.unitNumber}</span>
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <MethodIcon className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{payment.paymentMethod.name}</span>
                                  </div>
                                  {payment.referenceNumber && (
                                    <span className="text-xs text-muted-foreground">
                                      Ref: {payment.referenceNumber}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(payment.paymentDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gradient">{formatCurrency(payment.totalAmount)}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusBg(payment.status)} variant="outline">
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {payment.status}
                                  </Badge>
                                  <Badge variant="outline" className={payment.type === 'INCOMING' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                    {payment.type}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewPayment(payment)}
                                  className="glass-card border-0 hover-glow"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="glass-card border-0 hover-glow">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewTenant(payment)}>
                                      <Users className="w-4 h-4 mr-2" />
                                      View Tenant
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewProperty(payment)}>
                                      <Building2 className="w-4 h-4 mr-2" />
                                      View Property
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewLease(payment)}>
                                      <FileText className="w-4 h-4 mr-2" />
                                      View Lease
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewRentCollection(payment)}>
                                      <DollarSign className="w-4 h-4 mr-2" />
                                      Rent Collection
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* View Payment Details Modal */}
      <Dialog open={isViewPaymentOpen} onOpenChange={setIsViewPaymentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Payment Details</span>
            </DialogTitle>
            <DialogDescription>
              Complete payment transaction information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gradient">Payment Summary</h3>
                  <Badge className={getStatusBg(selectedPayment.status)} variant="outline">
                    {selectedPayment.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Amount</label>
                    <p className="font-bold text-2xl text-gradient">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <p className="font-bold text-2xl text-gradient">{formatCurrency(selectedPayment.totalAmount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="font-medium">{selectedPayment.paymentMethod.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <Badge variant="outline" className={selectedPayment.type === 'INCOMING' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {selectedPayment.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tenant & Property Information */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="font-semibold text-lg text-gradient mb-4">Tenant & Property</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                    <p className="font-medium">{selectedPayment.agreement.tenant.firstName} {selectedPayment.agreement.tenant.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.agreement.tenant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property</label>
                    <p className="font-medium">{selectedPayment.agreement.property.name}</p>
                    <p className="text-sm text-muted-foreground">Unit {selectedPayment.agreement.rentalUnit.unitNumber}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="font-semibold text-lg text-gradient mb-4">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                    <p className="font-medium">{formatDateTime(selectedPayment.paymentDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="font-medium">{formatDate(selectedPayment.dueDate)}</p>
                  </div>
                  {selectedPayment.referenceNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                      <p className="font-medium">{selectedPayment.referenceNumber}</p>
                    </div>
                  )}
                  {selectedPayment.processingTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Processing Time</label>
                      <p className="font-medium">{selectedPayment.processingTime} minutes</p>
                    </div>
                  )}
                </div>
                
                {selectedPayment.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="font-medium">{selectedPayment.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewPaymentOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success/Error Notifications */}
      {success && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSuccess(null)}
              className="ml-2 hover:bg-green-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setError(null)}
              className="ml-2 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 