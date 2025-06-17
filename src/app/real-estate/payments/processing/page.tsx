"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Send,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Banknote,
  Smartphone,
  Globe,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Menu,
  Settings,
  FileText,
  Users,
  Home,
  RefreshCw,
  MoreHorizontal,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

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

interface PendingPayment {
  id: string;
  agreement: Agreement;
  amount: number;
  dueDate: string;
  type: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  daysOverdue: number;
  status: 'PENDING' | 'PROCESSING' | 'FAILED';
}

interface ProcessingStats {
  totalProcessed: number;
  pendingCount: number;
  successRate: number;
  failedCount: number;
  avgProcessingTime: number;
  dailyVolume: number;
}

function PaymentProcessingContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<ProcessingStats>({
    totalProcessed: 0,
    pendingCount: 0,
    successRate: 0,
    failedCount: 0,
    avgProcessingTime: 0,
    dailyVolume: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    tenant?: string;
    agreement?: string;
    property?: string;
    processFor?: string;
  }>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  
  // Modal states
  const [isProcessPaymentOpen, setIsProcessPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  
  // Form state
  const [paymentForm, setPaymentForm] = useState({
    paymentId: '',
    paymentMethodId: '',
    amount: 0,
    processingDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    // Handle URL parameters for navigation context
    const fromParam = searchParams.get('from');
    const successParam = searchParams.get('success');
    const tenantParam = searchParams.get('tenant');
    const agreementParam = searchParams.get('agreement');
    const propertyParam = searchParams.get('property');
    const processForParam = searchParams.get('processFor');
    
      const newUrlParams = {
      tenant: tenantParam || undefined,
      agreement: agreementParam || undefined,
      property: propertyParam || undefined,
      processFor: processForParam || undefined,
      };
      setUrlParams(newUrlParams);
      
    if (successParam) {
      setSuccess(successParam);
      setTimeout(() => setSuccess(null), 5000);
    }
    
    if (fromParam) {
      setSuccess(`Navigated from ${fromParam} module`);
      setTimeout(() => setSuccess(null), 4000);
    }
    
    if (processForParam) {
        setSuccess(`Processing payment for selected item`);
        setTimeout(() => setSuccess(null), 3000);
    }
    
    fetchData();
  }, [searchParams]);

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'payments/processing');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

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
        fetchPendingPayments(),
        fetchPaymentMethods(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load payment processing data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch('/api/real-estate/payments/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data.payments || []);
      } else {
        setError('Failed to fetch pending payments');
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setError('Failed to fetch pending payments');
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
      const response = await fetch('/api/real-estate/payments/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  // Cross-module navigation handlers
  const handleViewTenant = (payment: PendingPayment) => {
    navigateToModule('tenants/management', { 
      success: 'Viewing tenant details from payment processing',
      highlight: payment.agreement.tenant.id,
      payment: payment.id
    });
  };

  const handleViewProperty = (payment: PendingPayment) => {
    navigateToModule('properties/management', { 
      success: 'Viewing property details from payment processing',
      highlight: payment.agreement.property.id,
      tenant: payment.agreement.tenant.id
    });
  };

  const handleViewLease = (payment: PendingPayment) => {
    navigateToModule('tenants/leases', { 
      success: 'Viewing lease details from payment processing',
      agreement: payment.agreement.id,
      highlight: payment.agreement.id
    });
  };

  const handleViewRentCollection = (payment: PendingPayment) => {
    navigateToModule('tenants/rent', { 
      success: 'Viewing rent collection from payment processing',
      agreement: payment.agreement.id,
      tenant: payment.agreement.tenant.id
    });
  };

  const handleProcessPayment = async (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setPaymentForm(prev => ({
      ...prev,
      paymentId: payment.id,
      amount: payment.amount
    }));
    setIsProcessPaymentOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/real-estate/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchPendingPayments();
        setIsProcessPaymentOpen(false);
        setSelectedPayment(null);
        setSuccess('Payment processed successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to process payment');
      }
    } catch (error) {
      setError('Failed to process payment');
      console.error('Error processing payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-600";
      case "PROCESSING": return "text-blue-600";
      case "FAILED": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "FAILED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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

  // Filter pending payments
  const filteredPayments = pendingPayments.filter(payment => {
    const matchesSearch = !searchTerm || 
      `${payment.agreement.tenant.firstName} ${payment.agreement.tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.agreement.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || payment.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Filter by URL parameters
    const matchesTenant = !urlParams.tenant || payment.agreement.tenant.id === urlParams.tenant;
    const matchesAgreement = !urlParams.agreement || payment.agreement.id === urlParams.agreement;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesTenant && matchesAgreement;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment processing data...</p>
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
                <BurgerMenu />
                <motion.div
                  className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CreditCard className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Payment Processing</h1>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
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
                            placeholder="Search by tenant or property..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Priority</label>
                          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Priorities</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/payments/history'}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          History
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
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Processed
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(stats.totalProcessed)}</div>
                  <p className="text-sm text-green-600 font-medium">{stats.dailyVolume} payments today</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Payments
                  </CardTitle>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.pendingCount}</div>
                  <p className="text-sm text-yellow-600 font-medium">Awaiting processing</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.successRate.toFixed(1)}%</div>
                  <p className="text-sm text-blue-600 font-medium">Last 30 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Failed Payments
                  </CardTitle>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.failedCount}</div>
                  <p className="text-sm text-red-600 font-medium">Need attention</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Pending Payments Table */}
          <motion.div variants={fadeInUp} className="hover-lift mb-8">
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gradient">
                      Pending Payments ({filteredPayments.length})
                    </CardTitle>
                    <CardDescription>
                      Payments awaiting processing
                    </CardDescription>
                  </div>
                  <Button className="btn-premium">
                    <Plus className="w-4 h-4 mr-2" />
                    Process All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gradient mb-2">No pending payments</h3>
                    <p className="text-muted-foreground">All payments have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <motion.div
                        key={payment.id}
                        className="glass-card p-6 rounded-xl border border-white/20 hover-glow"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gradient">
                                {payment.agreement.tenant.firstName} {payment.agreement.tenant.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center space-x-2">
                                <Building2 className="w-4 h-4" />
                                <span>{payment.agreement.property.name} - Unit {payment.agreement.rentalUnit.unitNumber}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due: {formatDate(payment.dueDate)} • {payment.daysOverdue > 0 ? `${payment.daysOverdue} days overdue` : 'On time'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gradient">{formatCurrency(payment.amount)}</p>
                              <div className="flex items-center space-x-2">
                                <Badge className={getPriorityColor(payment.priority)} variant="outline">
                                  {payment.priority}
                                </Badge>
                                <Badge className={getStatusBg(payment.status)} variant="outline">
                                  {payment.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
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
                              
                              <Button 
                                onClick={() => handleProcessPayment(payment)}
                                className="btn-premium"
                                size="sm"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Process
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Process Payment Modal */}
      <Dialog open={isProcessPaymentOpen} onOpenChange={setIsProcessPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Process Payment</span>
            </DialogTitle>
            <DialogDescription>
              {selectedPayment && `Processing payment for ${selectedPayment.agreement.tenant.firstName} ${selectedPayment.agreement.tenant.lastName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={paymentForm.paymentMethodId} 
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethodId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="Transaction reference"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProcessPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-premium">
                  <Send className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
              </DialogFooter>
            </form>
          )}
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

export default function PaymentProcessing() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentProcessingContent />
    </Suspense>
  );
} 