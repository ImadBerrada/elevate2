"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Star,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { OrderDetailModal } from "@/components/modals/order-detail-modal";

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

interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  monthlyProfit: number;
  avgMonthlyProfit: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  activeCustomers: number;
  totalGames: number;
  availableGames: number;
  orderCompletionRate: number;
  customerRetentionRate: number;
  gameUtilizationRate: number;
  monthlyGrowth: number;
}

interface TodayOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  status: string;
  eventDate: string;
  eventTime: string;
  totalAmount: number;
  items: Array<{
    game: {
      nameEn: string;
    };
    quantity: number;
  }>;
  address: {
    street: string;
    city: string;
  };
  driver?: {
    name: string;
  };
}

export default function MarahHomePage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [todayOrders, setTodayOrders] = useState<TodayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchDashboardData();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

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

  const fetchDashboardData = async () => {
    if (!marahCompanyId) return;
    
    try {
      // Fetch analytics data
      const analyticsResponse = await fetch(`/api/marah/analytics?companyId=${marahCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      // Fetch today's orders
      const today = new Date().toISOString().split('T')[0];
      const ordersResponse = await fetch(`/api/marah/orders?companyId=${marahCompanyId}&date=${today}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (analyticsResponse.ok && ordersResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        const ordersData = await ordersResponse.json();
        
        setMetrics(analyticsData);
        setTodayOrders(ordersData.orders || []);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderModalOpen(true);
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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'DELIVERED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'PENDING': return Clock;
      case 'CANCELLED': return XCircle;
      case 'DELIVERED': return Truck;
      default: return AlertCircle;
    }
  };

  const exportTodayOrders = () => {
    const headers = ['Order #', 'Customer', 'Status', 'Event Time', 'Amount', 'Items'];
    const csvContent = [
      headers.join(','),
      ...todayOrders.map(order => [
        order.orderNumber,
        order.customer.name,
        order.status,
        formatTime(order.eventTime),
        order.totalAmount,
        order.items.map(item => `${item.game.nameEn} (${item.quantity})`).join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-today-orders-${new Date().toISOString().split('T')[0]}.csv`;
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
          {/* Welcome Section */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
                  Welcome to MARAH Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Real-time metrics and today's orders overview with live updates
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <Button onClick={fetchDashboardData} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Profit</span>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {formatCurrency(metrics?.totalProfit || 0)}
                  </div>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Revenue - Expenses
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Monthly Profit</span>
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {formatCurrency(metrics?.monthlyProfit || 0)}
                  </div>
                  <p className="text-xs text-blue-600 flex items-center">
                    {metrics?.monthlyGrowth && metrics.monthlyGrowth > 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {metrics?.monthlyGrowth?.toFixed(1) || 0}% vs last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Monthly Profit</span>
                    <PieChart className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {formatCurrency(metrics?.avgMonthlyProfit || 0)}
                  </div>
                  <p className="text-xs text-purple-600">
                    Historical average
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Today's Orders</span>
                    <Package className="h-4 w-4 text-orange-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {todayOrders.length}
                  </div>
                  <p className="text-xs text-orange-600">
                    {todayOrders.filter(o => o.status === 'COMPLETED').length} completed
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators and KPIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Order Completion Rate</span>
                    <span className="font-semibold">{metrics?.orderCompletionRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.orderCompletionRate || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Customer Retention Rate</span>
                    <span className="font-semibold">{metrics?.customerRetentionRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.customerRetentionRate || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Game Utilization Rate</span>
                    <span className="font-semibold">{metrics?.gameUtilizationRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.gameUtilizationRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span>Quick Stats</span>
                </CardTitle>
                <CardDescription>Business overview at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics?.totalOrders || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics?.totalCustomers || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Customers</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{metrics?.totalGames || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Games</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{metrics?.availableGames || 0}</div>
                    <div className="text-xs text-muted-foreground">Available Games</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Orders */}
          <motion.div 
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>Today's Orders</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time order tracking with live updates every 30 seconds
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={exportTodayOrders} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={fetchDashboardData} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {todayOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Event Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayOrders.map((order) => {
                          const StatusIcon = getStatusIcon(order.status);
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                #{order.orderNumber}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {order.customer.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{order.customer.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {order.customer.phone}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getStatusColor(order.status))}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{formatTime(order.eventTime)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium max-w-32 truncate">
                                      {order.address.street}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.address.city}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {order.driver ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {order.driver.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-sm">{order.driver.name}</span>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Not Assigned
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div>
                                  <div>{formatCurrency(order.totalAmount)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewOrder(order.id)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditOrder(order.id)}
                                  >
                                    <Edit className="w-3 h-3" />
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
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Today</h3>
                    <p className="text-muted-foreground">
                      No orders scheduled for today yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onOrderUpdated={fetchDashboardData}
      />
    </div>
  );
} 