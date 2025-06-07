"use client";

import { motion } from "framer-motion";
import { 
  Search,
  Filter,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  UserPlus,
  CreditCard,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Package,
  Target,
  Award,
  BarChart3,
  Activity,
  Zap,
  ShoppingBag,
  Heart,
  Gift,
  Crown,
  Sparkles,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerAvatar } from "@/components/ui/profile-avatar";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AddCustomerModal } from "@/components/modals/add-customer-modal";
import { EditCustomerModal } from "@/components/modals/edit-customer-modal";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn, toNumber } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarahData, useMarahCompany } from "@/hooks/useMarahData";
import { LoadingSpinner, ErrorState, EmptyState, TableSkeleton } from "@/components/ui/enhanced-loading";
import { AdvancedFilters, customerFilters } from "@/components/ui/advanced-filters";
import { MetricGrid, getCustomerMetrics } from "@/components/ui/enhanced-stats";

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

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  balance: number;
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  registrationDate: string;
  customerType?: 'REGULAR' | 'VIP' | 'PREMIUM';
  loyaltyPoints?: number;
  averageOrderValue?: number;
  addresses: Array<{
    id: string;
    name: string;
    address: string;
    zone?: string;
    isDefault: boolean;
  }>;
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onCustomerUpdated: () => void;
}

export default function CustomersPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const { marahCompanyId, loading: companyLoading, error: companyError } = useMarahCompany();
  
  // Filter states
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    status: "all",
    customerType: "all",
    balance: "all"
  });
  
  // Modal states
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Data fetching with custom hook
  const { 
    data: customersData, 
    loading, 
    error, 
    refresh,
    lastUpdated 
  } = useMarahData<{ customers: Customer[]; stats: any }>({
    endpoint: '/api/marah/customers',
    params: marahCompanyId ? { 
      companyId: marahCompanyId,
      ...Object.fromEntries(
        Object.entries(filterValues).filter(([_, value]) => value && value !== 'all')
      )
    } : {},
    enabled: !!marahCompanyId,
    refreshInterval: 60000
  });

  const customers = customersData?.customers || [];

  // Filter handling
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({
      search: "",
      status: "all",
      customerType: "all",
      balance: "all"
    });
  };

  // Memoized filtered customers for performance
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    let filtered = [...customers];

    // Apply search
    if (filterValues.search) {
      const searchLower = filterValues.search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filterValues.status && filterValues.status !== 'all') {
      filtered = filtered.filter(customer => customer.status === filterValues.status);
    }

    if (filterValues.customerType && filterValues.customerType !== 'all') {
      filtered = filtered.filter(customer => customer.customerType === filterValues.customerType);
    }

    if (filterValues.balance && filterValues.balance !== 'all') {
      filtered = filtered.filter(customer => {
        switch (filterValues.balance) {
          case 'positive':
            return customer.balance > 0;
          case 'negative':
            return customer.balance < 0;
          case 'zero':
            return customer.balance === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [customers, filterValues]);

  // Handle company loading and errors
  if (companyLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <LoadingSpinner size="lg" text="Loading MARAH company..." />
          </main>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorState 
              title="Company Error"
              message={companyError}
              onRetry={() => window.location.reload()}
            />
          </main>
        </div>
      </div>
    );
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  const handleEditCustomer = (customerId: string) => {
    const customer = filteredCustomers.find(c => c.id === customerId);
    if (customer) {
      setEditingCustomer(customer);
      setShowEditCustomer(true);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        await refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleToggleStatus = async (customerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      const response = await fetch(`/api/marah/customers/${customerId}`, {
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
        await refresh();
      } else {
        alert('Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer status');
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
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle;
      case 'INACTIVE': return Clock;
      case 'BLOCKED': return XCircle;
      default: return AlertCircle;
    }
  };

  const getBalanceColor = (balance: number) => {
    const numBalance = toNumber(balance);
    if (numBalance > 0) return 'text-green-600';
    if (numBalance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCustomerTypeColor = (type?: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    }
  };

  const getCustomerTypeIcon = (type?: string) => {
    switch (type) {
      case 'VIP':
        return Crown;
      case 'PREMIUM':
        return Sparkles;
      default:
        return User;
    }
  };

  const calculateCustomerScore = (customer: Customer) => {
    let score = 0;
    
    // Order frequency score (0-30)
    if (customer.totalOrders > 20) score += 30;
    else if (customer.totalOrders > 10) score += 20;
    else if (customer.totalOrders > 5) score += 15;
    else if (customer.totalOrders > 0) score += 10;
    
    // Spending score (0-40)
    if (customer.totalSpent > 5000) score += 40;
    else if (customer.totalSpent > 2000) score += 30;
    else if (customer.totalSpent > 1000) score += 20;
    else if (customer.totalSpent > 500) score += 15;
    else if (customer.totalSpent > 0) score += 10;
    
    // Loyalty score (0-20)
    const daysSinceRegistration = customer.registrationDate 
      ? Math.floor((Date.now() - new Date(customer.registrationDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceRegistration > 365) score += 20;
    else if (daysSinceRegistration > 180) score += 15;
    else if (daysSinceRegistration > 90) score += 10;
    else if (daysSinceRegistration > 30) score += 5;
    
    // Status bonus (0-10)
    if (customer.status === 'ACTIVE') score += 10;
    else if (customer.status === 'INACTIVE') score += 5;
    
    return Math.min(score, 100);
  };

  const exportCustomers = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Balance', 'Total Orders', 'Total Spent'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.phone,
        customer.email || '',
        customer.status,
        customer.balance,
        customer.totalOrders,
        customer.totalSpent
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                  Customers Management
                </h1>
                <p className="text-muted-foreground">
                  Manage customer profiles with order history and analytics
                  {lastUpdated && (
                    <span className="ml-2 text-xs">
                      • Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={exportCustomers} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddCustomer(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  New Customer
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Statistics */}
          <motion.div className="mb-6" {...fadeInUp}>
            <MetricGrid 
              metrics={getCustomerMetrics({
                totalCustomers: customers.length,
                activeCustomers: customers.filter(c => c.status === 'ACTIVE').length,
                vipCustomers: customers.filter(c => c.customerType === 'VIP' || c.customerType === 'PREMIUM').length,
                totalRevenue: customers.reduce((sum, c) => sum + toNumber(c.totalSpent), 0),
                totalOrders: customers.reduce((sum, c) => sum + toNumber(c.totalOrders), 0),
                repeatCustomers: customers.filter(c => toNumber(c.totalOrders) > 1).length,
              })} 
              columns={4}
            />
          </motion.div>

          {/* Enhanced Filters */}
          <motion.div className="mb-6" {...fadeInUp}>
            <AdvancedFilters
              filters={customerFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </motion.div>

          {/* Customers Table */}
          <motion.div {...fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Customers List</span>
                    <Badge variant="secondary" className="ml-2">
                      {filteredCustomers.length} customers
                    </Badge>
                  </div>
                  {loading && <LoadingSpinner size="sm" />}
                </CardTitle>
                <CardDescription>
                  Customer profiles with order history and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton rows={5} columns={8} />
                ) : error ? (
                  <ErrorState 
                    title="Failed to load customers"
                    message={error}
                    onRetry={refresh}
                  />
                ) : filteredCustomers.length === 0 ? (
                  <EmptyState
                    title="No customers found"
                    description={
                      Object.values(filterValues).some(v => v && v !== 'all')
                        ? "No customers match your current filters. Try adjusting your search criteria."
                        : "Get started by adding your first customer to the system."
                    }
                    action={{
                      label: "Add Customer",
                      onClick: () => setShowAddCustomer(true)
                    }}
                    icon={<Users className="h-6 w-6" />}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Customer Profile</TableHead>
                          <TableHead className="w-[180px]">Contact Information</TableHead>
                          <TableHead className="w-[120px]">Status & Type</TableHead>
                          <TableHead className="w-[100px]">Balance</TableHead>
                          <TableHead className="w-[120px]">Order History</TableHead>
                          <TableHead className="w-[120px]">Performance</TableHead>
                          <TableHead className="w-[100px]">Last Activity</TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => {
                          const StatusIcon = getStatusIcon(customer.status);
                          const TypeIcon = getCustomerTypeIcon(customer.customerType);
                          const customerScore = calculateCustomerScore(customer);
                          
                          return (
                            <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <CustomerAvatar 
                                      customer={customer}
                                      size="xl"
                                      ring={true}
                                      className="shadow-xl ring-2 ring-white/10"
                                    />
                                    {customer.customerType && customer.customerType !== 'REGULAR' && (
                                      <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                                        <TypeIcon className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">{customer.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      Joined {formatDate(customer.registrationDate)}
                                    </div>
                                    {customer.customerType && customer.customerType !== 'REGULAR' && (
                                      <Badge variant="secondary" className="text-xs mt-1">
                                        {customer.customerType}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm flex items-center">
                                    <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                                    <span className="truncate">{customer.phone}</span>
                                  </div>
                                  {customer.email && (
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <Mail className="w-3 h-3 mr-1" />
                                      <span className="truncate">{customer.email}</span>
                                    </div>
                                  )}
                                  {customer.addresses.length > 0 && (
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {customer.addresses[0].zone || 'Dubai'}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <Badge 
                                    className={cn("text-xs cursor-pointer", getStatusColor(customer.status))}
                                    onClick={() => handleToggleStatus(customer.id, customer.status)}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {customer.status}
                                  </Badge>
                                  {customer.customerType && customer.customerType !== 'REGULAR' && (
                                    <div className="flex items-center">
                                      <TypeIcon className="w-3 h-3 mr-1 text-yellow-500" />
                                      <span className="text-xs text-muted-foreground">{customer.customerType}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">
                                  <span className={getBalanceColor(toNumber(customer.balance))}>
                                    {formatCurrency(toNumber(customer.balance))}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">{customer.totalOrders} orders</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatCurrency(toNumber(customer.totalSpent))} total
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Avg: {formatCurrency(toNumber(customer.totalOrders) > 0 ? toNumber(customer.totalSpent) / toNumber(customer.totalOrders) : 0)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm font-medium">{customerScore}%</div>
                                    <Award className="w-3 h-3 text-yellow-500" />
                                  </div>
                                  <Progress value={customerScore} className="h-1" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs text-muted-foreground">
                                  {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No orders'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewCustomer(customer)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCustomer(customer.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      {showAddCustomer && (
        <AddCustomerModal
          isOpen={showAddCustomer}
          onClose={() => setShowAddCustomer(false)}
          onCustomerCreated={refresh}
          companyId={marahCompanyId || ""}
        />
      )}

      {showCustomerDetail && (
        <CustomerDetailModal
          isOpen={showCustomerDetail}
          onClose={() => setShowCustomerDetail(false)}
          customer={selectedCustomer}
          onCustomerUpdated={refresh}
        />
      )}

      {showEditCustomer && editingCustomer && (
        <EditCustomerModal
          isOpen={showEditCustomer}
          onClose={() => setShowEditCustomer(false)}
          onCustomerUpdated={refresh}
          customer={editingCustomer}
        />
      )}
    </div>
  );
}

// Customer Detail Modal Component
function CustomerDetailModal({ isOpen, onClose, customer, onCustomerUpdated }: CustomerDetailModalProps) {
  if (!isOpen || !customer) return null;

  const StatusIcon = customer.status === 'ACTIVE' ? CheckCircle : customer.status === 'INACTIVE' ? Clock : XCircle;
  const TypeIcon = customer.customerType === 'VIP' ? Crown : customer.customerType === 'PREMIUM' ? Sparkles : User;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCustomerTypeColor = (type?: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    }
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateCustomerScore = (customer: Customer) => {
    let score = 0;
    
    // Order frequency score (0-30)
    if (customer.totalOrders > 20) score += 30;
    else if (customer.totalOrders > 10) score += 20;
    else if (customer.totalOrders > 5) score += 15;
    else if (customer.totalOrders > 0) score += 10;
    
    // Spending score (0-40)
    if (customer.totalSpent > 5000) score += 40;
    else if (customer.totalSpent > 2000) score += 30;
    else if (customer.totalSpent > 1000) score += 20;
    else if (customer.totalSpent > 500) score += 15;
    else if (customer.totalSpent > 0) score += 10;
    
    // Loyalty score (0-20)
    const daysSinceRegistration = customer.registrationDate 
      ? Math.floor((Date.now() - new Date(customer.registrationDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceRegistration > 365) score += 20;
    else if (daysSinceRegistration > 180) score += 15;
    else if (daysSinceRegistration > 90) score += 10;
    else if (daysSinceRegistration > 30) score += 5;
    
    // Status bonus (0-10)
    if (customer.status === 'ACTIVE') score += 10;
    else if (customer.status === 'INACTIVE') score += 5;
    
    return Math.min(score, 100);
  };

  const customerScore = calculateCustomerScore(customer);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <CustomerAvatar 
                  customer={customer}
                  size="3xl"
                  ring={true}
                  ringColor="ring-white/30"
                  className="shadow-2xl border-4 border-white/20"
                />
                {customer.customerType && customer.customerType !== 'REGULAR' && (
                  <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                    <TypeIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {customer.status}
                  </Badge>
                  {customer.customerType && customer.customerType !== 'REGULAR' && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {customer.customerType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="card-premium border-refined">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Score</p>
                        <p className="text-2xl font-bold text-gradient">{customerScore}</p>
                      </div>
                      <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <Progress value={customerScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{customer.totalOrders}</p>
                      </div>
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                        <ShoppingBag className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(toNumber(customer.totalSpent))}</p>
                      </div>
                      <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Order</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(toNumber(customer.totalOrders) > 0 ? toNumber(customer.totalSpent) / toNumber(customer.totalOrders) : 0)}
                        </p>
                      </div>
                      <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {formatDate(customer.registrationDate)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span>Account Balance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      <span className={toNumber(customer.balance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(toNumber(customer.balance))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {toNumber(customer.balance) >= 0 ? 'Credit balance' : 'Outstanding balance'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Recent orders and transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Order history will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle>Delivery Addresses</CardTitle>
                  <CardDescription>Saved delivery locations</CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {customer.addresses.map((address, index) => (
                        <div key={address.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{address.name}</h4>
                            {address.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.address}</p>
                          {address.zone && (
                            <p className="text-xs text-muted-foreground mt-1">Zone: {address.zone}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No addresses saved.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle>Customer Analytics</CardTitle>
                  <CardDescription>Detailed performance metrics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
} 