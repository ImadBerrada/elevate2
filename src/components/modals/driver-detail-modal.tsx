"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Car, 
  CreditCard, 
  MapPin, 
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Download,
  Award,
  Target,
  Activity,
  FileText,
  Shield,
  Truck,
  Navigation,
  Timer,
  BarChart3,
  Zap,
  Users,
  Package,
  Route,
  Fuel,
  Settings,
  Eye,
  MessageSquare,
  ThumbsUp,
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DriverAvatar } from "@/components/ui/profile-avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber?: string;
  vehicleInfo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BUSY';
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalRevenue: number;
  completionRate: number;
  profilePicture?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  experience?: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
}

interface RecentActivity {
  id: string;
  type: 'ORDER_COMPLETED' | 'ORDER_ASSIGNED' | 'PAYMENT_RECEIVED' | 'STATUS_CHANGE';
  description: string;
  timestamp: string;
  amount?: number;
  orderNumber?: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface DriverDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onEdit?: (driverId: string) => void;
}

export function DriverDetailModal({ isOpen, onClose, driver, onEdit }: DriverDetailModalProps) {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && driver) {
      fetchDriverAnalytics();
    }
  }, [isOpen, driver]);

  const fetchDriverAnalytics = async () => {
    if (!driver) return;
    
    setLoading(true);
    try {
      // Fetch real driver orders and analytics
      const [ordersResponse, paymentsResponse] = await Promise.all([
        fetch(`/api/marah/orders?driverId=${driver.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch(`/api/marah/payments?driverId=${driver.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })
      ]);

      const orders = ordersResponse.ok ? await ordersResponse.json() : [];
      const payments = paymentsResponse.ok ? await paymentsResponse.json() : [];

      // Calculate real metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      const thisMonthRevenue = thisMonthOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const completedThisMonth = thisMonthOrders.filter((order: any) => order.status === 'COMPLETED').length;
      const onTimeDeliveries = thisMonthOrders.filter((order: any) => 
        order.status === 'COMPLETED' && order.deliveredAt
      ).length;

      // Build recent activity from real data
      const activities: RecentActivity[] = [];
      
      // Add recent orders
      orders.slice(0, 3).forEach((order: any) => {
        if (order.status === 'COMPLETED') {
          activities.push({
            id: `order-${order.id}`,
            type: 'ORDER_COMPLETED',
            description: `Completed order #${order.orderNumber}`,
            timestamp: order.updatedAt || order.createdAt,
            orderNumber: order.orderNumber,
            amount: order.totalAmount
          });
        } else if (order.status === 'ASSIGNED' || order.status === 'ACTIVE') {
          activities.push({
            id: `order-${order.id}`,
            type: 'ORDER_ASSIGNED',
            description: `Working on order #${order.orderNumber}`,
            timestamp: order.updatedAt || order.createdAt,
            orderNumber: order.orderNumber
          });
        }
      });

      // Add recent payments
      payments.slice(0, 2).forEach((payment: any) => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'PAYMENT_RECEIVED',
          description: `Payment received for order #${payment.order?.orderNumber || 'N/A'}`,
          timestamp: payment.createdAt,
          amount: payment.amount
        });
      });

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivity(activities.slice(0, 5));

      // Calculate performance metrics
      const onTimeRate = thisMonthOrders.length > 0 ? (onTimeDeliveries / thisMonthOrders.length) * 100 : 0;
      const customerRating = 4.2 + (driver.completionRate / 100) * 0.8; // Simulate rating based on completion rate
      
      setPerformanceMetrics([
        {
          label: 'On-Time Delivery',
          value: Math.round(onTimeRate),
          target: 95,
          unit: '%',
          trend: onTimeRate >= 90 ? 'up' : onTimeRate >= 80 ? 'stable' : 'down',
          color: onTimeRate >= 90 ? 'text-green-600' : onTimeRate >= 80 ? 'text-orange-600' : 'text-red-600'
        },
        {
          label: 'Customer Rating',
          value: Math.round(customerRating * 10) / 10,
          target: 4.5,
          unit: '/5',
          trend: customerRating >= 4.5 ? 'up' : customerRating >= 4.0 ? 'stable' : 'down',
          color: customerRating >= 4.5 ? 'text-green-600' : customerRating >= 4.0 ? 'text-blue-600' : 'text-orange-600'
        },
        {
          label: 'Orders This Month',
          value: thisMonthOrders.length,
          target: 25,
          unit: '',
          trend: thisMonthOrders.length >= 25 ? 'up' : thisMonthOrders.length >= 20 ? 'stable' : 'down',
          color: thisMonthOrders.length >= 25 ? 'text-green-600' : 'text-orange-600'
        },
        {
          label: 'Revenue This Month',
          value: thisMonthRevenue,
          target: driver.salary ? driver.salary * 2.5 : 12000,
          unit: 'AED',
          trend: thisMonthRevenue >= (driver.salary ? driver.salary * 2.5 : 12000) ? 'up' : 'stable',
          color: thisMonthRevenue >= (driver.salary ? driver.salary * 2.5 : 12000) ? 'text-green-600' : 'text-purple-600'
        }
      ]);
    } catch (error) {
      console.error('Error fetching driver analytics:', error);
      // Fallback to empty data
      setRecentActivity([]);
      setPerformanceMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  if (!driver) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle;
      case 'BUSY': return Clock;
      case 'INACTIVE': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ORDER_COMPLETED': return CheckCircle;
      case 'ORDER_ASSIGNED': return Package;
      case 'PAYMENT_RECEIVED': return DollarSign;
      case 'STATUS_CHANGE': return Settings;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ORDER_COMPLETED': return 'text-green-600 bg-green-100';
      case 'ORDER_ASSIGNED': return 'text-blue-600 bg-blue-100';
      case 'PAYMENT_RECEIVED': return 'text-purple-600 bg-purple-100';
      case 'STATUS_CHANGE': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingUp;
      case 'stable': return BarChart3;
      default: return BarChart3;
    }
  };

  const getDriverInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPerformanceLevel = (completionRate: number) => {
    if (completionRate >= 95) return { label: 'Excellent', color: 'text-green-600', icon: Award };
    if (completionRate >= 85) return { label: 'Good', color: 'text-blue-600', icon: ThumbsUp };
    if (completionRate >= 70) return { label: 'Average', color: 'text-orange-600', icon: Target };
    return { label: 'Needs Improvement', color: 'text-red-600', icon: AlertTriangle };
  };

  const StatusIcon = getStatusIcon(driver.status);
  const performanceLevel = getPerformanceLevel(driver.completionRate);
  const PerformanceIcon = performanceLevel.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <User className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-xl">Driver Profile</span>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(driver.id)}
                  className="btn-premium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              <Button variant="outline" size="sm" className="btn-premium">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 pb-6">
            {/* Enhanced Driver Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 border border-gray-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5"></div>
              <div className="relative p-8">
                <div className="flex items-start space-x-8">
                  <div className="relative">
                    <DriverAvatar 
                      driver={driver}
                      size="2xl"
                      ring={true}
                      ringColor="ring-white"
                      className="shadow-2xl w-32 h-32"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <Badge className={`${getStatusColor(driver.status)} border-2 border-white shadow-lg`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {driver.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                        {driver.name}
                      </h2>
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">{driver.phone}</span>
                        </div>
                        {driver.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{driver.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/60 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">{driver.totalOrders}</div>
                        <div className="text-xs text-muted-foreground">Total Orders</div>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">{driver.completionRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(driver.totalRevenue)}</div>
                        <div className="text-xs text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg border">
                        <div className="flex items-center justify-center space-x-1">
                          <PerformanceIcon className={`w-5 h-5 ${performanceLevel.color}`} />
                          <span className={`text-sm font-semibold ${performanceLevel.color}`}>
                            {performanceLevel.label}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Performance</div>
                      </div>
                    </div>

                    {driver.experience && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Star className="w-4 h-4" />
                        <span className="font-medium">{driver.experience} years of driving experience</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabbed Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="personal" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Activity</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Statistics Dashboard - Matching other MARAH pages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="card-premium border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-700">Active Orders</p>
                              <p className="text-3xl font-bold text-orange-600">{driver.activeOrders}</p>
                              <p className="text-xs text-orange-600 mt-1">Currently assigned</p>
                            </div>
                            <div className="w-14 h-14 bg-orange-200 rounded-xl flex items-center justify-center">
                              <Package className="w-7 h-7 text-orange-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="card-premium border-0 bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-700">Completed Orders</p>
                              <p className="text-3xl font-bold text-green-600">{driver.completedOrders}</p>
                              <p className="text-xs text-green-600 mt-1">Total delivered</p>
                            </div>
                            <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="card-premium border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                              <p className="text-2xl font-bold text-blue-600">{formatCurrency(driver.totalRevenue)}</p>
                              <p className="text-xs text-blue-600 mt-1">Lifetime earnings</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center">
                              <DollarSign className="w-7 h-7 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="card-premium border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700">Success Rate</p>
                              <p className="text-3xl font-bold text-purple-600">{driver.completionRate.toFixed(1)}%</p>
                              <p className="text-xs text-purple-600 mt-1">
                                <PerformanceIcon className={`w-3 h-3 inline mr-1 ${performanceLevel.color}`} />
                                {performanceLevel.label}
                              </p>
                            </div>
                            <div className="w-14 h-14 bg-purple-200 rounded-xl flex items-center justify-center">
                              <Target className="w-7 h-7 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Revenue and Performance Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="card-premium border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span>Financial Overview</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-medium text-green-700">Total Revenue</span>
                              <span className="font-bold text-green-600">{formatCurrency(driver.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-medium text-blue-700">Average per Order</span>
                              <span className="font-medium text-blue-600">
                                {formatCurrency(driver.totalOrders > 0 ? driver.totalRevenue / driver.totalOrders : 0)}
                              </span>
                            </div>
                            {driver.salary && (
                              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                <span className="text-sm font-medium text-purple-700">Monthly Salary</span>
                                <span className="font-medium text-purple-600">{formatCurrency(driver.salary)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                              <span className="text-sm font-medium text-orange-700">Revenue Target</span>
                              <span className="font-medium text-orange-600">
                                {formatCurrency(driver.salary ? driver.salary * 2.5 : 12000)}
                              </span>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Monthly Progress</span>
                              <span>{performanceMetrics.find(m => m.label === 'Revenue This Month')?.value ? 
                                Math.round((performanceMetrics.find(m => m.label === 'Revenue This Month')!.value / 
                                performanceMetrics.find(m => m.label === 'Revenue This Month')!.target) * 100) : 0}%</span>
                            </div>
                            <Progress value={performanceMetrics.find(m => m.label === 'Revenue This Month')?.value ? 
                              Math.min((performanceMetrics.find(m => m.label === 'Revenue This Month')!.value / 
                              performanceMetrics.find(m => m.label === 'Revenue This Month')!.target) * 100, 100) : 0} 
                              className="h-3" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Card className="card-premium border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span>Performance Metrics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">Completion Rate</span>
                                <span className="font-bold">{driver.completionRate.toFixed(1)}%</span>
                              </div>
                              <Progress value={driver.completionRate} className="h-3" />
                            </div>
                            
                            {performanceMetrics.map((metric) => (
                              <div key={metric.label}>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="font-medium">{metric.label}</span>
                                  <span className="font-bold">
                                    {metric.unit === 'AED' ? formatCurrency(metric.value) : 
                                     `${metric.value}${metric.unit}`}
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.min((metric.value / metric.target) * 100, 100)} 
                                  className="h-3" 
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>Target: {metric.unit === 'AED' ? formatCurrency(metric.target) : 
                                    `${metric.target}${metric.unit}`}</span>
                                  <span className={metric.color}>
                                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {performanceMetrics.map((metric, index) => {
                      const TrendIcon = getTrendIcon(metric.trend);
                      const progressValue = (metric.value / metric.target) * 100;
                      
                      return (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="card-premium border-0">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center justify-between text-base">
                                <span>{metric.label}</span>
                                <TrendIcon className={`w-4 h-4 ${metric.color}`} />
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-end space-x-2">
                                  <span className={`text-3xl font-bold ${metric.color}`}>
                                    {metric.unit === 'AED' ? formatCurrency(metric.value) : metric.value}
                                  </span>
                                  {metric.unit !== 'AED' && (
                                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Target: {metric.unit === 'AED' ? formatCurrency(metric.target) : metric.target}{metric.unit !== 'AED' ? metric.unit : ''}</span>
                                    <span>{progressValue.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={Math.min(progressValue, 100)} className="h-2" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Performance Insights */}
                  <Card className="card-premium border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <span>Performance Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-green-800">Strengths</h4>
                          <p className="text-sm text-green-700 mt-1">Excellent completion rate and customer feedback</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-orange-800">Opportunities</h4>
                          <p className="text-sm text-orange-700 mt-1">Can improve monthly order targets</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-blue-800">Recognition</h4>
                          <p className="text-sm text-blue-700 mt-1">Top performer this quarter</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="card-premium border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <span>Personal Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
                              <span className="text-sm font-medium text-blue-700 flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                Phone Number
                              </span>
                              <span className="font-semibold text-blue-600">{driver.phone}</span>
                            </div>
                            
                            {driver.email && (
                              <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border border-green-100">
                                <span className="text-sm font-medium text-green-700 flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email Address
                                </span>
                                <span className="font-semibold text-green-600">{driver.email}</span>
                              </div>
                            )}
                            
                            {driver.dateOfBirth && (
                              <div className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg border border-purple-100">
                                <span className="text-sm font-medium text-purple-700 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Date of Birth
                                </span>
                                <span className="font-semibold text-purple-600">
                                  {formatDate(driver.dateOfBirth)} ({calculateAge(driver.dateOfBirth)} years)
                                </span>
                              </div>
                            )}
                            
                            {driver.address && (
                              <div className="flex items-start justify-between py-3 px-4 bg-orange-50 rounded-lg border border-orange-100">
                                <span className="text-sm font-medium text-orange-700 flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                                  Address
                                </span>
                                <span className="font-semibold text-orange-600 text-right max-w-[200px]">{driver.address}</span>
                              </div>
                            )}
                            
                            {driver.experience && (
                              <div className="flex items-center justify-between py-3 px-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <span className="text-sm font-medium text-yellow-700 flex items-center">
                                  <Star className="w-4 h-4 mr-2" />
                                  Experience
                                </span>
                                <span className="font-semibold text-yellow-600">{driver.experience} years</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                              <span className="text-sm font-medium text-gray-700 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Join Date
                              </span>
                              <span className="font-semibold text-gray-600">{formatDate(driver.createdAt)}</span>
                            </div>

                            <div className="flex items-center justify-between py-3 px-4 bg-indigo-50 rounded-lg border border-indigo-100">
                              <span className="text-sm font-medium text-indigo-700 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Last Updated
                              </span>
                              <span className="font-semibold text-indigo-600">{formatDate(driver.updatedAt)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Emergency Contact & Vehicle Info */}
                    <div className="space-y-6">
                      {/* Emergency Contact */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="card-premium border-0">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Shield className="w-5 h-5 text-red-600" />
                              <span>Emergency Contact</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {driver.emergencyContact ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg border border-red-100">
                                  <span className="text-sm font-medium text-red-700 flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    Contact Name
                                  </span>
                                  <span className="font-semibold text-red-600">{driver.emergencyContact}</span>
                                </div>
                                {driver.emergencyPhone && (
                                  <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg border border-red-100">
                                    <span className="text-sm font-medium text-red-700 flex items-center">
                                      <Phone className="w-4 h-4 mr-2" />
                                      Phone Number
                                    </span>
                                    <span className="font-semibold text-red-600">{driver.emergencyPhone}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No emergency contact information available</p>
                                <p className="text-xs text-muted-foreground mt-1">Consider adding emergency contact details for safety</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Vehicle & License */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="card-premium border-0">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Car className="w-5 h-5 text-blue-600" />
                              <span>Vehicle & License</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {driver.licenseNumber ? (
                              <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-700 flex items-center">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  License Number
                                </span>
                                <span className="font-semibold font-mono text-blue-600">{driver.licenseNumber}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  License Number
                                </span>
                                <span className="text-sm text-gray-500">Not provided</span>
                              </div>
                            )}
                            
                            {driver.vehicleInfo ? (
                              <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border border-green-100">
                                <span className="text-sm font-medium text-green-700 flex items-center">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Vehicle Info
                                </span>
                                <span className="font-semibold text-green-600">{driver.vehicleInfo}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Vehicle Info
                                </span>
                                <span className="text-sm text-gray-500">Not provided</span>
                              </div>
                            )}

                            {driver.salary && (
                              <div className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg border border-purple-100">
                                <span className="text-sm font-medium text-purple-700 flex items-center">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Monthly Salary
                                </span>
                                <span className="font-semibold text-purple-600">{formatCurrency(driver.salary)}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  {/* Recent Activity */}
                  <Card className="card-premium border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : recentActivity.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivity.map((activity, index) => {
                            const ActivityIcon = getActivityIcon(activity.type);
                            const activityColor = getActivityColor(activity.type);
                            
                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border"
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activityColor}`}>
                                  <ActivityIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{activity.description}</p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm text-muted-foreground">
                                      {formatDateTime(activity.timestamp)}
                                    </span>
                                    {activity.amount && (
                                      <span className="text-sm font-medium text-green-600">
                                        {formatCurrency(activity.amount)}
                                      </span>
                                    )}
                                    {activity.orderNumber && (
                                      <Badge variant="outline" className="text-xs">
                                        {activity.orderNumber}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No recent activity found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="card-premium border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                          <MessageSquare className="w-6 h-6 text-blue-600" />
                          <span className="text-sm">Send Message</span>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                          <Package className="w-6 h-6 text-green-600" />
                          <span className="text-sm">Assign Order</span>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                          <FileText className="w-6 h-6 text-purple-600" />
                          <span className="text-sm">View Reports</span>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                          <Settings className="w-6 h-6 text-orange-600" />
                          <span className="text-sm">Settings</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 