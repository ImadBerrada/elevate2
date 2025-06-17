"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
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
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Menu,
  Settings,
  RefreshCw,
  X,
  Users,
  Home,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
  city: string;
  area?: string;
  propertyType?: {
    id: string;
    name: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
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
  rentalUnit: {
    id: string;
    unitNumber: string;
    unitType?: {
      id: string;
      name: string;
    };
  };
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING';
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  agreement: Agreement;
  type: 'RENT' | 'MAINTENANCE' | 'UTILITY' | 'SERVICE' | 'CUSTOM';
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  totalRevenue: number;
  avgPaymentTime: number;
  monthlyGrowth: number;
}

export default function InvoiceHistory() {
  const { toggle: toggleSidebar } = useSidebar();
  
  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    invoice?: string;
    agreement?: string;
    tenant?: string;
    property?: string;
    status?: string;
    type?: string;
  }>({});

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  useEffect(() => {
    // Parse URL parameters for context-aware invoice filtering
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newUrlParams = {
        invoice: params.get('invoice') || undefined,
        agreement: params.get('agreement') || undefined,
        tenant: params.get('tenant') || undefined,
        property: params.get('property') || undefined,
        status: params.get('status') || undefined,
        type: params.get('type') || undefined,
      };
      setUrlParams(newUrlParams);
      
      // Set initial filters based on URL parameters
      if (newUrlParams.status) {
        setStatusFilter(newUrlParams.status);
        setSuccess(`Filtering invoices by status: ${newUrlParams.status}`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.type) {
        setTypeFilter(newUrlParams.type);
        setSuccess(`Filtering invoices by type: ${newUrlParams.type}`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.invoice) {
        setSuccess(`Highlighting invoice: ${newUrlParams.invoice}`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.agreement) {
        setSuccess(`Showing invoices for selected agreement`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.tenant) {
        setSuccess(`Viewing invoices for selected tenant`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.property) {
        setSuccess(`Viewing invoices for selected property`);
        setTimeout(() => setSuccess(null), 3000);
      }
    }
    
    fetchData();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Refetch data when filters change
  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchInvoices(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (typeFilter !== 'all') queryParams.append('type', typeFilter);
      if (urlParams.agreement) queryParams.append('agreementId', urlParams.agreement);
      if (urlParams.tenant) queryParams.append('tenantId', urlParams.tenant);
      if (urlParams.property) queryParams.append('propertyId', urlParams.property);
      
      const response = await fetch(`/api/real-estate/invoices?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalInvoices(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/real-estate/invoices/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't set error for stats as it's not critical
    }
  };

  // Cross-module navigation handlers
  const handleViewTenant = (invoice: Invoice) => {
    window.location.href = `/real-estate/tenants/management?highlight=${invoice.agreement.tenant.id}&invoice=${invoice.id}`;
  };

  const handleViewProperty = (invoice: Invoice) => {
    window.location.href = `/real-estate/properties/management?highlight=${invoice.agreement.property.id}&tenant=${invoice.agreement.tenant.id}`;
  };

  const handleViewAgreement = (invoice: Invoice) => {
    window.location.href = `/real-estate/tenants/leases?agreement=${invoice.agreement.id}&highlight=${invoice.agreement.id}`;
  };

  const handleViewPayments = (invoice: Invoice) => {
    window.location.href = `/real-estate/payments/history?invoice=${invoice.id}&agreement=${invoice.agreement.id}`;
  };

  const handleGenerateInvoice = () => {
    window.location.href = '/real-estate/invoices/generate';
  };

  // Cross-module navigation for other modules
  const handleNavigateToProperties = () => {
    window.location.href = '/real-estate/properties/management';
  };

  const handleNavigateToTenants = () => {
    window.location.href = '/real-estate/tenants/management';
  };

  const handleNavigateToLeases = () => {
    window.location.href = '/real-estate/tenants/leases';
  };

  const handleNavigateToPayments = () => {
    window.location.href = '/real-estate/payments/processing';
  };

  // Helper functions
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

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    window.location.href = `/real-estate/invoices/generate?invoice=${invoice.id}`;
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    window.location.href = `/real-estate/invoices/generate?agreement=${invoice.agreement.id}&type=${invoice.type}`;
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`/api/real-estate/invoices/${invoiceId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setSuccess('Invoice deleted successfully');
          fetchData();
        } else {
          setError('Failed to delete invoice');
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setError('Failed to delete invoice');
      }
    }
  };

  const handleExportInvoices = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (typeFilter !== 'all') queryParams.append('type', typeFilter);
      
      const response = await fetch(`/api/real-estate/invoices/export?${queryParams.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to export invoices');
      }
    } catch (error) {
      console.error('Error exporting invoices:', error);
      setError('Failed to export invoices');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "text-green-600";
      case "sent": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "draft": return "text-gray-600";
      case "overdue": return "text-red-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return CheckCircle;
      case "sent": return Send;
      case "pending": return Clock;
      case "draft": return Edit;
      case "overdue": return AlertCircle;
      case "cancelled": return XCircle;
      default: return FileText;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

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
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-4"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Invoice History</h1>
                    <p className="text-sm text-muted-foreground">Track and manage all property invoices</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="glass-card border-0 hover-glow lg:hidden">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleNavigateToProperties}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Properties
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToTenants}>
                      <Users className="w-4 h-4 mr-2" />
                      Tenants
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToLeases}>
                      <FileText className="w-4 h-4 mr-2" />
                      Lease Agreements
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleNavigateToPayments}>
                      <Receipt className="w-4 h-4 mr-2" />
                      Payments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleGenerateInvoice}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="glass-card border-0 hover-glow" onClick={handleExportInvoices}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button className="btn-premium" onClick={handleGenerateInvoice}>
                  <FileText className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
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
{loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={index} variants={fadeInUp} className="hover-lift">
                  <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                      <div className="w-8 h-8 bg-muted rounded-lg animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : stats ? (
              // Actual stats
              [
                { label: "Total Invoices", value: stats.totalInvoices.toString(), change: `+${stats.monthlyGrowth}%`, trend: stats.monthlyGrowth >= 0 ? "up" : "down", icon: FileText },
                { label: "Paid Invoices", value: stats.paidInvoices.toString(), change: `${((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)}%`, trend: "up", icon: CheckCircle },
                { label: "Pending Amount", value: formatCurrency(stats.pendingAmount), change: `-${((stats.overdueInvoices / stats.totalInvoices) * 100).toFixed(1)}%`, trend: "down", icon: Clock },
                { label: "Overdue", value: stats.overdueInvoices.toString(), change: `${stats.avgPaymentTime}d avg`, trend: stats.overdueInvoices > 0 ? "up" : "down", icon: AlertCircle }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                const TrendIcon = getTrendIcon(stat.trend);
                return (
                  <motion.div key={index} variants={fadeInUp} className="hover-lift">
                    <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </CardTitle>
                        <motion.div
                          className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </motion.div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                        <div className="flex items-center space-x-2">
                          <TrendIcon className={`w-4 h-4 ${getTrendColor(stat.trend)}`} />
                          <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-muted-foreground">vs last month</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              // Error state
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={index} variants={fadeInUp} className="hover-lift">
                  <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Unable to load stats</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            className="glass-card p-6 rounded-2xl mb-8"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search invoices by ID, tenant, or property..." 
                    className="pl-10 glass-card border-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 glass-card border-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 glass-card border-0">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Invoice Table */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.6 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Invoice Records</CardTitle>
                    <CardDescription>
                      Complete history of all property invoices
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {totalInvoices} invoices
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Invoice ID</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Tenant</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Property</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice, index) => {
                        const StatusIcon = getStatusIcon(invoice.status);
                        return (
                          <motion.tr 
                            key={invoice.id}
                            className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.05 }}
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(invoice.status)}`} />
                                <span className="font-medium text-foreground">{invoice.id}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-foreground">{invoice.agreement.tenant.firstName} {invoice.agreement.tenant.lastName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{invoice.agreement.property.name} - Unit {invoice.agreement.rentalUnit.unitNumber}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <Badge variant="outline" className="text-xs">
                                {invoice.type}
                              </Badge>
                            </td>
                            <td className="py-4 px-2">
                              <span className="font-semibold text-gradient">{formatCurrency(invoice.totalAmount)}</span>
                            </td>
                            <td className="py-4 px-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusBg(invoice.status)}`}
                              >
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{invoice.dueDate}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow" onClick={() => handleViewInvoice(invoice)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow" onClick={() => handleEditInvoice(invoice)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow">
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewTenant(invoice)}>
                                      <User className="w-4 h-4 mr-2" />
                                      View Tenant
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewProperty(invoice)}>
                                      <Building2 className="w-4 h-4 mr-2" />
                                      View Property
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewAgreement(invoice)}>
                                      <FileText className="w-4 h-4 mr-2" />
                                      View Agreement
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewPayments(invoice)}>
                                      <Receipt className="w-4 h-4 mr-2" />
                                      View Payments
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/20">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalInvoices)} of {totalInvoices} invoices
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="glass-card border-0 hover-glow"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button 
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm" 
                          className="glass-card border-0 hover-glow"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="glass-card border-0 hover-glow"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* Success/Error Notifications */}
        {success && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-green-600"
                onClick={() => setSuccess(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-600"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Invoice Details Modal */}
        <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Invoice Details - {selectedInvoice?.invoiceNumber}</span>
              </DialogTitle>
              <DialogDescription>
                Complete invoice information and related data
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Invoice Type</label>
                      <Badge variant="outline" className="ml-2">
                        {selectedInvoice.type}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant="outline" className={`ml-2 ${getStatusBg(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                      <p className="text-foreground">{formatDate(selectedInvoice.issueDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                      <p className="text-foreground">{formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                      <p className="text-foreground font-medium">
                        {selectedInvoice.agreement.tenant.firstName} {selectedInvoice.agreement.tenant.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.agreement.tenant.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Property</label>
                      <p className="text-foreground font-medium">{selectedInvoice.agreement.property.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedInvoice.agreement.property.address}, {selectedInvoice.agreement.property.city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Unit {selectedInvoice.agreement.rentalUnit.unitNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Invoice Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Invoice Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5% VAT):</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-foreground mt-1">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvoiceDetails(false)}>
                Close
              </Button>
              {selectedInvoice && (
                <>
                  <Button variant="outline" onClick={() => handleEditInvoice(selectedInvoice)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Invoice
                  </Button>
                  <Button onClick={() => handleViewPayments(selectedInvoice)}>
                    <Receipt className="w-4 h-4 mr-2" />
                    View Payments
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 