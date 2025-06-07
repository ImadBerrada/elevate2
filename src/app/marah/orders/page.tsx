"use client";

import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle,
  Truck,
  MapPin,
  User,
  DollarSign,
  Search,
  Filter,
  Plus,
  Calendar,
  Phone,
  Edit,
  Eye,
  MoreHorizontal,
  XCircle,
  AlertCircle,
  CalendarDays,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  UserPlus,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn, toNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderDetailModal } from "@/components/modals/order-detail-modal";
import { AddOrderModal } from "@/components/modals/add-order-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerAvatar, DriverAvatar } from "@/components/ui/profile-avatar";

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

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profilePicture?: string;
    customerType?: string;
  };
  address: {
    id: string;
    name: string;
    address: string;
    zone?: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    status: string;
    profilePicture?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'DELIVERED' | 'ACTIVE' | 'COLLECTING' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  orderDate: string;
  eventDate: string;
  eventEndDate: string;
  eventTime?: string;
  setupTime?: string;
  notes?: string;
  source: string;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  items: Array<{
    id: string;
    quantity: number;
    days: number;
    pricePerDay: number;
    totalPrice: number;
    game: {
      id: string;
      nameEn: string;
      nameAr: string;
      category: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  thisWeekOrders: number;
  thisMonthOrders: number;
  topCustomer: Customer | null;
  topSource: string;
  busyDriver: Driver | null;
  recentOrder: Order | null;
}

export default function OrdersPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [driverFilter, setDriverFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "ACTIVE", label: "Active" },
    { value: "COLLECTING", label: "Collecting" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "all", label: "All Payment Status" },
    { value: "PENDING", label: "Pending Payment" },
    { value: "PARTIAL", label: "Partial Payment" },
    { value: "PAID", label: "Paid" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  const sourceOptions = [
    { value: "all", label: "All Sources" },
    { value: "WEBSITE", label: "Website" },
    { value: "PHONE", label: "Phone" },
    { value: "WHATSAPP", label: "WhatsApp" },
    { value: "SOCIAL_MEDIA", label: "Social Media" },
    { value: "REFERRAL", label: "Referral" },
    { value: "WALK_IN", label: "Walk-in" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchOrders();
      fetchCustomers();
      fetchDrivers();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchOrders();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchOrders();
    }
  }, [searchTerm, statusFilter, paymentStatusFilter, customerFilter, driverFilter, sourceFilter]);

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
          // Auto-create MARAH company if it doesn't exist
          await createMarahCompany();
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch company information');
    }
  };

  const createMarahCompany = async () => {
    try {
      const response = await fetch('/api/companies/marah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMarahCompanyId(data.company.id);
        setError(null);
      } else {
        setError('Failed to create MARAH company. Please try again.');
      }
    } catch (error) {
      console.error('Error creating MARAH company:', error);
      setError('Failed to create MARAH company. Please try again.');
    }
  };

  const fetchOrders = async () => {
    if (!marahCompanyId) return;
    
    try {
      const params = new URLSearchParams({
        companyId: marahCompanyId,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (customerFilter && customerFilter !== 'all') params.append('customerId', customerFilter);
      if (driverFilter && driverFilter !== 'all') {
        if (driverFilter === 'unassigned') {
          params.append('driverId', 'null');
        } else {
          params.append('driverId', driverFilter);
        }
      }
      if (sourceFilter && sourceFilter !== 'all') params.append('source', sourceFilter);

      const response = await fetch(`/api/marah/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!marahCompanyId) return;
    
    try {
      const response = await fetch(`/api/marah/customers?companyId=${marahCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchDrivers = async () => {
    if (!marahCompanyId) return;
    
    try {
      const response = await fetch(`/api/marah/drivers?companyId=${marahCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetail(true);
  };

  const handleEditOrder = (orderId: string) => {
    // For now, just show the order detail modal which allows status updates
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderId(orderId);
      setShowOrderDetail(true);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/marah/orders/${orderId}`, {
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
        fetchOrders(); // Refresh the orders list
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-indigo-100 text-indigo-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COLLECTING': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL': return 'bg-orange-100 text-orange-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'REFUNDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'CONFIRMED': return CheckCircle;
      case 'ASSIGNED': return User;
      case 'DELIVERED': return Truck;
      case 'ACTIVE': return Activity;
      case 'COLLECTING': return Package;
      case 'COMPLETED': return CheckCircle;
      case 'CANCELLED': return XCircle;
      default: return AlertCircle;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'WEBSITE': return 'bg-blue-100 text-blue-800';
      case 'PHONE': return 'bg-green-100 text-green-800';
      case 'WHATSAPP': return 'bg-emerald-100 text-emerald-800';
      case 'SOCIAL_MEDIA': return 'bg-purple-100 text-purple-800';
      case 'REFERRAL': return 'bg-orange-100 text-orange-800';
      case 'WALK_IN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderInitials = (orderNumber: string) => {
    return orderNumber.slice(-3);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setCustomerFilter("all");
    setDriverFilter("all");
    setSourceFilter("all");
  };

  const exportOrders = () => {
    if (orders.length === 0) return;
    
    const headers = ['Order Number', 'Customer', 'Status', 'Payment Status', 'Event Date', 'Total Amount', 'Source', 'Driver'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.orderNumber,
        order.customer.name,
        order.status,
        order.paymentStatus,
        formatDate(order.eventDate),
        order.totalAmount,
        order.source,
        order.driver?.name || 'Unassigned'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOrderStats = (): OrderStats => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const todayOrders = orders.filter(order => new Date(order.orderDate).toDateString() === today).length;
    const thisWeekOrders = orders.filter(order => new Date(order.orderDate) >= thisWeek).length;
    const thisMonthOrders = orders.filter(order => new Date(order.orderDate) >= thisMonth).length;

    // Find top customer by order count
    const customerOrderCounts = orders.reduce((acc, order) => {
      acc[order.customer.id] = (acc[order.customer.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCustomerId = Object.keys(customerOrderCounts).reduce((a, b) => 
      customerOrderCounts[a] > customerOrderCounts[b] ? a : b, ''
    );
    const topCustomer = customers.find(c => c.id === topCustomerId) || null;

    // Find top source
    const sourceCounts = orders.reduce((acc, order) => {
      acc[order.source] = (acc[order.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSource = Object.keys(sourceCounts).reduce((a, b) => 
      sourceCounts[a] > sourceCounts[b] ? a : b, ''
    ) || 'N/A';

    // Find busiest driver
    const driverOrderCounts = orders.reduce((acc, order) => {
      if (order.driver) {
        acc[order.driver.id] = (acc[order.driver.id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const busyDriverId = Object.keys(driverOrderCounts).reduce((a, b) => 
      driverOrderCounts[a] > driverOrderCounts[b] ? a : b, ''
    );
    const busyDriver = drivers.find(d => d.id === busyDriverId) || null;

    // Get most recent order
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentOrder = sortedOrders[0] || null;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      pendingOrders: statusCounts['PENDING'] || 0,
      confirmedOrders: statusCounts['CONFIRMED'] || 0,
      deliveredOrders: statusCounts['DELIVERED'] || 0,
      completedOrders: statusCounts['COMPLETED'] || 0,
      cancelledOrders: statusCounts['CANCELLED'] || 0,
      todayOrders,
      thisWeekOrders,
      thisMonthOrders,
      topCustomer,
      topSource,
      busyDriver,
      recentOrder
    };
  };

  const stats = getOrderStats();

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
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {marahCompanyId ? 'Loading orders...' : 'Setting up MARAH system...'}
                </p>
              </div>
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
                <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchOrders}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
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
                  Orders Management
                </h1>
                <p className="text-muted-foreground">
                  Manage {stats.totalOrders} orders • {stats.todayOrders} today • Updated {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={() => setShowAddOrder(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Statistics Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.thisWeekOrders} this week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.avgOrderValue)} avg order
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Orders
                  </CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.confirmedOrders} confirmed
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.cancelledOrders} cancelled
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Dynamic Filters */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters & Search</CardTitle>
                  <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                    {(searchTerm || customerFilter !== "all" || statusFilter !== "all" || driverFilter !== "all" || sourceFilter !== "all") && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchOrders}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    {orders.length > 0 && (
                      <Button variant="outline" size="sm" onClick={exportOrders}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                      placeholder="Search by order number, customer name, phone, or address..." 
                      className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {/* Status Filter */}
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

                      {/* Customer Filter */}
                      {customers.length > 0 && (
                    <div>
                          <Label htmlFor="customer">Customer</Label>
                          <Select value={customerFilter} onValueChange={setCustomerFilter}>
                        <SelectTrigger>
                              <SelectValue placeholder="All customers" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="all">All Customers</SelectItem>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                      )}

                      {/* Source Filter */}
                    <div>
                        <Label htmlFor="source">Source</Label>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All sources" />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                      {/* Driver Filter */}
                      {drivers.length > 0 && (
                    <div>
                          <Label htmlFor="driver">Driver</Label>
                      <Select value={driverFilter} onValueChange={setDriverFilter}>
                        <SelectTrigger>
                              <SelectValue placeholder="All drivers" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="all">All Drivers</SelectItem>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                                  {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                      )}

                      {/* Payment Status Filter */}
                    <div>
                        <Label htmlFor="paymentStatus">Payment Status</Label>
                        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All payment statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentStatusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    </motion.div>
                  )}

                  {/* Results Summary */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing {orders.length} of {stats.totalOrders} orders
                    </span>
                    {orders.length !== stats.totalOrders && (
                      <span className="text-blue-600">
                        {stats.totalOrders - orders.length} orders filtered out
                      </span>
                    )}
                    </div>
                  </div>
                </CardContent>
            </Card>
          </motion.div>

          {/* Orders Table */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span>Orders Management</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive order tracking and management system
                </CardDescription>
              </CardHeader>

              <CardContent>
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                      <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Event Date</TableHead>
                      <TableHead>Total</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                    {orders.map((order, index) => {
                          const StatusIcon = getStatusIcon(order.status);
                          return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.02 }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                                <div>
                              <div className="font-medium">{order.orderNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                    {formatDate(order.orderDate)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <CustomerAvatar 
                                    customer={order.customer}
                                    size="lg"
                                    className="shadow-lg ring-1 ring-white/10"
                                  />
                                  <div>
                                    <div className="font-medium">{order.customer.name}</div>
                                    <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(order.status)}`}
                            >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                  <Badge 
                                    className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}
                                  >
                                    {order.paymentStatus}
                                  </Badge>
                              </TableCell>
                              <TableCell>
                                  <div>
                                    <div className="font-medium">{formatDate(order.eventDate)}</div>
                              <div className="text-sm text-muted-foreground">{order.eventTime}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                            <span className="font-bold text-green-600">
                              {formatCurrency(order.totalAmount)}
                            </span>
                              </TableCell>
                              <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSourceColor(order.source)}`}
                            >
                                  {order.source.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order.id)}>
                                <Eye className="w-4 h-4" />
                                  </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEditOrder(order.id)}>
                                <Edit className="w-4 h-4" />
                                  </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                                </div>
                              </TableCell>
                        </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || customerFilter !== 'all' || statusFilter !== 'all' || driverFilter !== 'all' || sourceFilter !== 'all'
                        ? "No orders match your current filters."
                        : "No orders have been added yet."
                      }
                    </p>
                    {(searchTerm || customerFilter !== 'all' || statusFilter !== 'all' || driverFilter !== 'all' || sourceFilter !== 'all') ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddOrder(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Order
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      {showOrderDetail && selectedOrderId && (
      <OrderDetailModal
        isOpen={showOrderDetail}
        onClose={() => {
          setShowOrderDetail(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onOrderUpdated={fetchOrders}
      />
      )}

      {showAddOrder && marahCompanyId && (
      <AddOrderModal
        isOpen={showAddOrder}
        onClose={() => setShowAddOrder(false)}
        onOrderCreated={fetchOrders}
        companyId={marahCompanyId}
      />
      )}
    </div>
  );
} 