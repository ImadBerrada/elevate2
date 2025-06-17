"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  CreditCard,
  RefreshCw,
  FileBarChart,
  Receipt,
  MapPin,
  Building,
  X,
  Trash2,
  FileText,
  Menu,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";
import PDFGeneratorService, { InvoicePDFData } from "@/lib/pdf/pdfGenerator";

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

// Interfaces
interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

interface RentalUnit {
  id: string;
  unitNumber: string;
  unitType: {
    name: string;
  };
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
  rentalUnit: RentalUnit;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  lateFee: number;
  agreement: Agreement;
  daysOverdue: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: string;
  description?: string;
  notes?: string;
  agreement: Agreement;
}

interface RentStats {
  monthlyCollected: number;
  collectionRate: number;
  overdueAmount: number;
  overdueCount: number;
  pendingPayments: number;
  lateFees: number;
  avgCollectionTime: number;
  latePaymentRate: number;
}

export default function RentCollection() {
  const { toggle: toggleSidebar } = useSidebar();
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<RentStats>({
    monthlyCollected: 0,
    collectionRate: 0,
    overdueAmount: 0,
    overdueCount: 0,
    pendingPayments: 0,
    lateFees: 0,
    avgCollectionTime: 0,
    latePaymentRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    tenant?: string;
    agreement?: string;
    property?: string;
    createPayment?: string;
  }>({});
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  
  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [isViewPaymentOpen, setIsViewPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Form states
  const [paymentForm, setPaymentForm] = useState({
    agreementId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethodId: '',
    referenceNumber: '',
    notes: '',
    status: 'COMPLETED'
  });

  useEffect(() => {
    // Check URL parameters on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newUrlParams = {
        tenant: params.get('tenant') || undefined,
        agreement: params.get('agreement') || undefined,
        property: params.get('property') || undefined,
        createPayment: params.get('createPayment') || undefined,
      };
      setUrlParams(newUrlParams);
      
      // Auto-filter by tenant if tenant parameter exists
      if (newUrlParams.tenant) {
        setSuccess(`Viewing payments for selected tenant`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      // Auto-filter by agreement if agreement parameter exists
      if (newUrlParams.agreement) {
        setSuccess(`Viewing payments for selected agreement`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      // Auto-filter by property if property parameter exists
      if (newUrlParams.property) {
        setPropertyFilter(newUrlParams.property);
        setSuccess(`Viewing payments for ${newUrlParams.property}`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      // Auto-open payment modal if createPayment parameter exists
      if (newUrlParams.createPayment) {
        setIsPaymentModalOpen(true);
        setPaymentForm(prev => ({
          ...prev,
          agreementId: newUrlParams.createPayment!
        }));
        setSuccess(`Creating payment for selected agreement`);
      }
      
      // Auto-filter by tenant if tenant parameter exists
      if (newUrlParams.tenant) {
        setSearchTerm(''); // Clear search to show tenant filter
        setSuccess(`Showing payments for selected tenant`);
      }
      
      // Auto-filter by property if property parameter exists
      if (newUrlParams.property) {
        setPropertyFilter(newUrlParams.property);
        setSuccess(`Showing payments for selected property`);
      }
    }
    
    fetchData();
  }, []);

  // Recalculate stats when payments change
  useEffect(() => {
    if (payments.length > 0) {
      calculateStatsFromPayments();
    }
  }, [payments]);

  // Auto-dismiss success notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Data fetching functions
  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPayments(),
      fetchInvoices(),
      fetchPaymentMethods(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/real-estate/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/real-estate/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        console.error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
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
          { id: 'cheque', name: 'Cheque', isActive: true },
          { id: 'wire_transfer', name: 'Wire Transfer', isActive: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([
        { id: 'cash', name: 'Cash', isActive: true },
        { id: 'bank_transfer', name: 'Bank Transfer', isActive: true },
        { id: 'credit_card', name: 'Credit Card', isActive: true },
        { id: 'cheque', name: 'Cheque', isActive: true },
        { id: 'wire_transfer', name: 'Wire Transfer', isActive: true }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/real-estate/rent-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Calculate basic stats from payments if API doesn't exist
        calculateStatsFromPayments();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      calculateStatsFromPayments();
    }
  };

  const calculateStatsFromPayments = () => {
    const paidPayments = payments.filter(p => p.status === 'COMPLETED');
    const overduePayments = payments.filter(p => p.status === 'OVERDUE');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    
    const monthlyCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const lateFees = payments.reduce((sum, p) => sum + p.lateFee, 0);
    
    setStats({
      monthlyCollected,
      collectionRate: payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0,
      overdueAmount,
      overdueCount: overduePayments.length,
      pendingPayments: pendingPayments.length,
      lateFees,
      avgCollectionTime: 0, // Would need more data to calculate
      latePaymentRate: payments.length > 0 ? (overduePayments.length / payments.length) * 100 : 0
    });
  };

  // Calculate payment method statistics
  const getPaymentMethodStats = () => {
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Group payments by method
    const methodStats = completedPayments.reduce((acc, payment) => {
      const methodName = payment.paymentMethod?.name || 'Other';
      if (!acc[methodName]) {
        acc[methodName] = { count: 0, amount: 0 };
      }
      acc[methodName].count += 1;
      acc[methodName].amount += payment.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);
    
    // Convert to array with percentages and colors
    const methodColors = {
      'Bank Transfer': 'bg-blue-500',
      'Check': 'bg-green-500',
      'Cheque': 'bg-green-500',
      'Wire Transfer': 'bg-purple-500',
      'Cash': 'bg-orange-500',
      'Credit Card': 'bg-red-500',
      'Other': 'bg-gray-500'
    };
    
    return Object.entries(methodStats)
      .map(([method, stats]) => ({
        method,
        percentage: totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0,
        amount: stats.amount,
        color: methodColors[method as keyof typeof methodColors] || 'bg-gray-500'
      }))
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending
      .slice(0, 6); // Show top 6 methods
  };

  // Filtered data
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      `${payment.agreement.tenant.firstName} ${payment.agreement.tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.agreement.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.agreement.rentalUnit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesProperty = propertyFilter === 'all' || payment.agreement.property.id === propertyFilter;
    
    // Filter by URL parameters
    const matchesTenant = !urlParams.tenant || payment.agreement.tenant.id === urlParams.tenant;
    const matchesAgreement = !urlParams.agreement || payment.agreement.id === urlParams.agreement;
    
    return matchesSearch && matchesStatus && matchesProperty && matchesTenant && matchesAgreement;
  });

  // Handler functions
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...paymentForm,
        amount: Number(paymentForm.amount)
      };
      
      const response = await fetch('/api/real-estate/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        await fetchData();
        setIsPaymentModalOpen(false);
        setSuccess('Payment recorded successfully');
        setPaymentForm({
          agreementId: '',
          amount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethodId: '',
          referenceNumber: '',
          notes: '',
          status: 'COMPLETED'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Failed to create payment');
    }
  };

  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    
    try {
      const paymentData = {
        ...paymentForm,
        amount: Number(paymentForm.amount)
      };
      
      const response = await fetch(`/api/real-estate/payments/${selectedPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        await fetchData();
        setIsEditPaymentOpen(false);
        setSuccess('Payment updated successfully');
        setSelectedPayment(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      setError('Failed to update payment');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      const response = await fetch(`/api/real-estate/payments/${paymentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchData();
        setSuccess('Payment deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError('Failed to delete payment');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "text-green-600";
      case "overdue": return "text-red-600";
      case "pending": return "text-yellow-600";
      case "partial": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "partial": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return CheckCircle;
      case "overdue": return AlertTriangle;
      case "pending": return Clock;
      case "partial": return Clock;
      default: return Clock;
    }
  };

  const getOverdueUrgency = (days: number) => {
    if (days === 0) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    if (days <= 30) return "text-orange-600";
    return "text-red-600";
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

  // Cross-module navigation handlers
  const handleViewTenant = (payment: Payment) => {
    window.location.href = `/real-estate/tenants/management?highlight=${payment.agreement.tenant.id}&payment=${payment.id}`;
  };

  const handleViewProperty = (payment: Payment) => {
    window.location.href = `/real-estate/properties/management?highlight=${payment.agreement.property.id}&tenant=${payment.agreement.tenant.id}`;
  };

  const handleViewLease = (payment: Payment) => {
    window.location.href = `/real-estate/tenants/leases?agreement=${payment.agreement.id}&highlight=${payment.agreement.id}`;
  };

  const handleViewPropertyAppliances = (payment: Payment) => {
    window.location.href = `/real-estate/appliances/inventory?property=${encodeURIComponent(payment.agreement.property.name)}&unit=${payment.agreement.rentalUnit.unitNumber}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading rent collection data...</p>
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
                  <DollarSign className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Rent Collection</h1>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  className="btn-premium"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
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
                            placeholder="Search payments..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Payment Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/management'}
                          className="flex-1"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Tenants
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/leases'}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Leases
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
                    Monthly Collected
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(stats.monthlyCollected)}</div>
                  <p className="text-sm text-green-600 font-medium">{stats.collectionRate.toFixed(1)}% collection rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Amount
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(stats.overdueAmount)}</div>
                  <p className="text-sm text-red-600 font-medium">{stats.overdueCount} overdue payments</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Payments
                  </CardTitle>
                  <Clock className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.pendingPayments}</div>
                  <p className="text-sm text-blue-600 font-medium">Due this week</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Late Fees
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(stats.lateFees)}</div>
                  <p className="text-sm text-green-600 font-medium">{stats.latePaymentRate.toFixed(1)}% late payment rate</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Collection Metrics */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Collection Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        metric: "Collection Rate",
                        value: `${stats.collectionRate.toFixed(1)}%`,
                        status: stats.collectionRate >= 95 ? "excellent" : stats.collectionRate >= 90 ? "good" : "needs improvement",
                        color: stats.collectionRate >= 95 ? "text-green-600" : stats.collectionRate >= 90 ? "text-blue-600" : "text-orange-600"
                      },
                      {
                        metric: "Late Payment Rate",
                        value: `${stats.latePaymentRate.toFixed(1)}%`,
                        status: stats.latePaymentRate <= 5 ? "excellent" : stats.latePaymentRate <= 10 ? "good" : "needs improvement",
                        color: stats.latePaymentRate <= 5 ? "text-green-600" : stats.latePaymentRate <= 10 ? "text-blue-600" : "text-red-600"
                      },
                      {
                        metric: "Outstanding Amount",
                        value: formatCurrency(stats.overdueAmount),
                        status: stats.overdueAmount <= 10000 ? "excellent" : stats.overdueAmount <= 50000 ? "good" : "needs attention",
                        color: stats.overdueAmount <= 10000 ? "text-green-600" : stats.overdueAmount <= 50000 ? "text-blue-600" : "text-red-600"
                      },
                      {
                        metric: "Total Collected",
                        value: formatCurrency(stats.monthlyCollected),
                        status: "tracking",
                        color: "text-gradient"
                      }
                    ].map((metric, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{metric.metric}</h4>
                          <Badge 
                            variant={metric.status === "excellent" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {metric.status}
                          </Badge>
                        </div>
                        <p className={`text-2xl font-bold mb-1 ${metric.color}`}>{metric.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Methods */}
            <motion.div 
              className="lg:col-span-2"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Payment Methods & Trends</CardTitle>
                      <CardDescription>
                        Collection methods and monthly trends
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Payment Methods</h4>
                      {getPaymentMethodStats().length === 0 ? (
                        <div className="text-center py-6">
                          <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No payment data available</p>
                        </div>
                      ) : (
                        getPaymentMethodStats().map((item, index) => (
                          <motion.div 
                            key={item.method}
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${item.color}`} />
                              <span className="font-medium text-foreground">{item.method}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">{item.percentage}%</p>
                              <p className="text-sm text-muted-foreground">{formatCurrency(item.amount)}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Collection Overview</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Total Payments</span>
                            <span className="font-semibold text-foreground">{payments.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Completed</span>
                            <span className="text-sm font-medium text-green-600">
                              {payments.filter(p => p.status === 'COMPLETED').length}
                            </span>
                          </div>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">This Month</span>
                            <span className="font-semibold text-foreground">{formatCurrency(stats.monthlyCollected)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Success Rate</span>
                            <span className="text-sm font-medium text-green-600">
                              {stats.collectionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Outstanding</span>
                            <span className="font-semibold text-red-600">{formatCurrency(stats.overdueAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Late Fees</span>
                            <span className="text-sm font-medium text-orange-600">
                              {formatCurrency(stats.lateFees)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Rent Payments List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <DollarSign className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Rent Payments</CardTitle>
                      <CardDescription>
                        Payment status and collection tracking
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                      <motion.div
                        className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <DollarSign className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {payments.length === 0 
                          ? "No payment records available yet" 
                          : "No payments match your current filters"
                        }
                      </p>
                      {payments.length === 0 && (
                        <Button 
                          className="btn-premium"
                          onClick={() => setIsPaymentModalOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Record First Payment
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredPayments.map((payment, index) => {
                      const StatusIcon = getStatusIcon(payment.status);
                      return (
                        <motion.div 
                          key={payment.id}
                          className="glass-card p-6 rounded-2xl hover-lift group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <motion.div 
                                className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                              >
                                <StatusIcon className="w-6 h-6 text-white" />
                              </motion.div>
                              
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h3 className="font-semibold text-lg text-foreground">PAY-{payment.id.slice(-6)}</h3>
                                  <Badge 
                                    className={`text-xs ${getStatusBg(payment.status)}`}
                                    variant="outline"
                                  >
                                    {payment.status}
                                  </Badge>
                                  {payment.daysOverdue > 0 && (
                                    <Badge 
                                      className={`text-xs ${getOverdueUrgency(payment.daysOverdue) === 'text-red-600' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}
                                      variant="outline"
                                    >
                                      {payment.daysOverdue} days overdue
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                  {payment.agreement.tenant.firstName} {payment.agreement.tenant.lastName}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                  <span>{payment.agreement.property.name} - {payment.agreement.rentalUnit.unitNumber}</span>
                                  <span>•</span>
                                  <span>Due: {formatDate(payment.dueDate)}</span>
                                  {payment.status === 'COMPLETED' && (
                                    <>
                                      <span>•</span>
                                      <span>Paid: {formatDate(payment.paymentDate)}</span>
                                    </>
                                  )}
                                </div>
                                {payment.paymentMethod && (
                                  <p className="text-sm text-muted-foreground">
                                    Payment Method: {payment.paymentMethod.name}
                                  </p>
                                )}
                                {payment.referenceNumber && (
                                  <p className="text-sm text-muted-foreground">
                                    Reference: {payment.referenceNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Payment Amount</p>
                                  <p className="text-lg font-bold text-gradient">{formatCurrency(payment.amount)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Late Fee</p>
                                  <p className={`font-bold ${payment.lateFee === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(payment.lateFee)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  className="btn-premium"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setIsViewPaymentOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setPaymentForm({
                                      agreementId: payment.agreement.id,
                                      amount: payment.amount,
                                      paymentDate: payment.paymentDate.split('T')[0],
                                      paymentMethodId: payment.paymentMethod?.id || '',
                                      referenceNumber: payment.referenceNumber || '',
                                      notes: payment.notes || '',
                                      status: payment.status
                                    });
                                    setIsEditPaymentOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow"
                                  onClick={() => window.location.href = `/real-estate/tenants/management?highlight=${payment.agreement.tenant.id}`}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Tenant
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow"
                                  onClick={() => window.location.href = `/real-estate/tenants/leases?agreement=${payment.agreement.id}`}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Agreement
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeletePayment(payment.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* Error/Success Notifications */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-800 hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 max-w-md"
          >
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{success}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccess(null)}
                  className="text-green-800 hover:bg-green-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Record Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-md glass-modal">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Record Payment</span>
              </DialogTitle>
              <DialogDescription>
                Record a new rent payment from a tenant
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={paymentForm.paymentMethodId} 
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethodId: value })}
                >
                  <SelectTrigger className="glass-input">
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
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="glass-input"
                  placeholder="Optional reference number"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="glass-input"
                  rows={3}
                  placeholder="Optional notes about this payment"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-premium">
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Modal */}
        <Dialog open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen}>
          <DialogContent className="max-w-md glass-modal">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-primary" />
                <span>Edit Payment</span>
              </DialogTitle>
              <DialogDescription>
                Update payment information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditPayment} className="space-y-4">
              <div>
                <Label htmlFor="editAmount">Payment Amount</Label>
                <Input
                  id="editAmount"
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="editPaymentDate">Payment Date</Label>
                <Input
                  id="editPaymentDate"
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={paymentForm.status} 
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, status: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPaymentMethod">Payment Method</Label>
                <Select 
                  value={paymentForm.paymentMethodId} 
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethodId: value })}
                >
                  <SelectTrigger className="glass-input">
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
                <Label htmlFor="editReferenceNumber">Reference Number</Label>
                <Input
                  id="editReferenceNumber"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="glass-input"
                  placeholder="Optional reference number"
                />
              </div>
              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="glass-input"
                  rows={3}
                  placeholder="Optional notes about this payment"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditPaymentOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-premium">
                  Update Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Payment Details Modal */}
        <Dialog open={isViewPaymentOpen} onOpenChange={setIsViewPaymentOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Complete payment information and history
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                {/* Payment Summary */}
                <div className="glass-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Payment Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment ID</p>
                      <p className="font-medium">PAY-{selectedPayment.id.slice(-6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={`${getStatusBg(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-bold text-lg text-gradient">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Late Fee</p>
                      <p className={`font-medium ${selectedPayment.lateFee === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedPayment.lateFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{formatDate(selectedPayment.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Date</p>
                      <p className="font-medium">
                        {selectedPayment.status === 'COMPLETED' 
                          ? formatDate(selectedPayment.paymentDate)
                          : 'Not paid yet'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tenant & Property Info */}
                <div className="glass-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Tenant & Property</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tenant</p>
                      <p className="font-medium">
                        {selectedPayment.agreement.tenant.firstName} {selectedPayment.agreement.tenant.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedPayment.agreement.tenant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Property & Unit</p>
                      <p className="font-medium">{selectedPayment.agreement.property.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Unit {selectedPayment.agreement.rentalUnit.unitNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Reference */}
                {(selectedPayment.paymentMethod || selectedPayment.referenceNumber) && (
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Payment Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPayment.paymentMethod && (
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="font-medium">{selectedPayment.paymentMethod.name}</p>
                        </div>
                      )}
                      {selectedPayment.referenceNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Reference Number</p>
                          <p className="font-medium">{selectedPayment.referenceNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPayment.notes && (
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Notes</h4>
                    <p className="text-muted-foreground">{selectedPayment.notes}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = `/real-estate/tenants/management?highlight=${selectedPayment.agreement.tenant.id}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Tenant
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = `/real-estate/tenants/leases?agreement=${selectedPayment.agreement.id}`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Agreement
                    </Button>
                  </div>
                  <Button onClick={() => setIsViewPaymentOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 