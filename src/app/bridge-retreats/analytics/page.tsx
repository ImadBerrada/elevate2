"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  DollarSign,
  Users,
  Bed,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target,
  Activity,
  Clock,
  MapPin,
  Percent,
  Calculator,
  Building2,
  Coffee,
  Utensils,
  Car,
  Wifi
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  target?: string;
  progress?: number;
}

interface ChartData {
  period: string;
  revenue: number;
  occupancy: number;
  bookings: number;
  satisfaction: number;
}

interface ComparisonData {
  metric: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
}

interface TrendData {
  category: string;
  data: { month: string; value: number; }[];
  color: string;
}

export default function BridgeRetreatsAnalytics() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedView, setSelectedView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRetreatAnalytics({ period: selectedPeriod });
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      // For now, use fallback data to avoid breaking the UI
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock analytics data - in production, this would come from APIs
  const analyticsMetrics: AnalyticsMetric[] = [
    {
      title: "Revenue Growth",
      value: "AED 1.2M",
      change: "+18.5%",
      changeType: "increase",
      icon: TrendingUp,
      description: "Monthly revenue vs last period",
      target: "AED 1.5M",
      progress: 80
    },
    {
      title: "Occupancy Rate",
      value: "87.3%",
      change: "+5.2%",
      changeType: "increase",
      icon: Bed,
      description: "Average occupancy this month",
      target: "90%",
      progress: 97
    },
    {
      title: "Guest Satisfaction",
      value: "4.8/5",
      change: "+0.3",
      changeType: "increase",
      icon: Star,
      description: "Average rating from reviews",
      target: "4.9/5",
      progress: 98
    },
    {
      title: "Booking Conversion",
      value: "68.4%",
      change: "-2.1%",
      changeType: "decrease",
      icon: Target,
      description: "Inquiry to booking conversion",
      target: "75%",
      progress: 91
    }
  ];

  const performanceData: ChartData[] = [
    { period: "Jan", revenue: 180000, occupancy: 75, bookings: 120, satisfaction: 4.5 },
    { period: "Feb", revenue: 220000, occupancy: 82, bookings: 145, satisfaction: 4.6 },
    { period: "Mar", revenue: 280000, occupancy: 88, bookings: 165, satisfaction: 4.7 },
    { period: "Apr", revenue: 320000, occupancy: 91, bookings: 180, satisfaction: 4.8 },
    { period: "May", revenue: 350000, occupancy: 89, bookings: 175, satisfaction: 4.7 },
    { period: "Jun", revenue: 380000, occupancy: 93, bookings: 195, satisfaction: 4.9 },
    { period: "Jul", revenue: 420000, occupancy: 95, bookings: 210, satisfaction: 4.8 },
    { period: "Aug", revenue: 390000, occupancy: 87, bookings: 185, satisfaction: 4.6 },
    { period: "Sep", revenue: 410000, occupancy: 90, bookings: 200, satisfaction: 4.8 },
    { period: "Oct", revenue: 450000, occupancy: 92, bookings: 220, satisfaction: 4.9 },
    { period: "Nov", revenue: 480000, occupancy: 89, bookings: 205, satisfaction: 4.7 },
    { period: "Dec", revenue: 520000, occupancy: 94, bookings: 235, satisfaction: 4.8 }
  ];

  const comparisonData: ComparisonData[] = [
    { metric: "Average Daily Rate", current: 850, previous: 780, target: 900, unit: "AED" },
    { metric: "Revenue per Room", current: 740, previous: 680, target: 800, unit: "AED" },
    { metric: "Length of Stay", current: 3.2, previous: 2.8, target: 3.5, unit: "days" },
    { metric: "Guest Return Rate", current: 35, previous: 28, target: 40, unit: "%" },
    { metric: "Booking Lead Time", current: 14, previous: 18, target: 12, unit: "days" },
    { metric: "Cancellation Rate", current: 8.5, previous: 12.3, target: 6, unit: "%" }
  ];

  const trendData: TrendData[] = [
    {
      category: "Room Revenue",
      data: [
        { month: "Jan", value: 145000 },
        { month: "Feb", value: 168000 },
        { month: "Mar", value: 195000 },
        { month: "Apr", value: 220000 },
        { month: "May", value: 235000 },
        { month: "Jun", value: 258000 }
      ],
      color: "blue"
    },
    {
      category: "F&B Revenue",
      data: [
        { month: "Jan", value: 25000 },
        { month: "Feb", value: 32000 },
        { month: "Mar", value: 48000 },
        { month: "Apr", value: 55000 },
        { month: "May", value: 62000 },
        { month: "Jun", value: 68000 }
      ],
      color: "green"
    },
    {
      category: "Activities Revenue",
      data: [
        { month: "Jan", value: 10000 },
        { month: "Feb", value: 20000 },
        { month: "Mar", value: 37000 },
        { month: "Apr", value: 45000 },
        { month: "May", value: 53000 },
        { month: "Jun", value: 54000 }
      ],
      color: "purple"
    }
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return ArrowUpRight;
      case 'decrease': return ArrowDownRight;
      default: return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading Analytics...</span>
          </div>
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

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Analytics Overview
                </h1>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Real-time business intelligence and performance insights for Bridge Retreats.
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Key Performance Metrics */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {analyticsMetrics.map((metric, index) => {
              const ChangeIcon = getChangeIcon(metric.changeType);
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className="text-muted-foreground">{metric.title}</span>
                        <metric.icon className="w-4 h-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-gradient">
                          {metric.value}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex items-center space-x-1 text-sm font-medium",
                            getChangeColor(metric.changeType)
                          )}>
                            {ChangeIcon && <ChangeIcon className="w-3 h-3" />}
                            <span>{metric.change}</span>
                          </div>
                          {metric.target && (
                            <div className="text-xs text-muted-foreground">
                              Target: {metric.target}
                            </div>
                          )}
                        </div>
                        
                        {metric.progress && (
                          <div className="space-y-1">
                            <Progress value={metric.progress} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {metric.progress}% of target
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Analytics Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Performance Chart */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                        Revenue Performance
                      </CardTitle>
                      <CardDescription className="text-refined">
                        Monthly revenue trends and growth patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Simulated Chart Area */}
                        <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-blue-100">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                            <p className="text-sm text-blue-600 font-medium">Revenue Chart</p>
                            <p className="text-xs text-blue-500">Interactive chart would be here</p>
                          </div>
                        </div>
                        
                        {/* Chart Summary */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">AED 1.2M</div>
                            <div className="text-xs text-muted-foreground">This Month</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">+18.5%</div>
                            <div className="text-xs text-muted-foreground">Growth</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">AED 850</div>
                            <div className="text-xs text-muted-foreground">Avg Daily Rate</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Occupancy Analytics */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <PieChart className="w-5 h-5 mr-2 text-green-500" />
                        Occupancy Analytics
                      </CardTitle>
                      <CardDescription className="text-refined">
                        Room utilization and booking patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Simulated Pie Chart */}
                        <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-green-100">
                          <div className="text-center">
                            <PieChart className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <p className="text-sm text-green-600 font-medium">Occupancy Chart</p>
                            <p className="text-xs text-green-500">Room type breakdown</p>
                          </div>
                        </div>
                        
                        {/* Occupancy Breakdown */}
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm">Deluxe Suites</span>
                            </div>
                            <span className="text-sm font-medium">92%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">Standard Rooms</span>
                            </div>
                            <span className="text-sm font-medium">85%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-sm">Family Suites</span>
                            </div>
                            <span className="text-sm font-medium">78%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Guest Satisfaction Metrics */}
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-500" />
                      Guest Satisfaction Breakdown
                    </CardTitle>
                    <CardDescription className="text-refined">
                      Detailed analysis of guest feedback and ratings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Service Quality</span>
                          <span className="text-sm text-muted-foreground">4.9/5</span>
                        </div>
                        <Progress value={98} className="h-2" />
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">+0.2 vs last month</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cleanliness</span>
                          <span className="text-sm text-muted-foreground">4.8/5</span>
                        </div>
                        <Progress value={96} className="h-2" />
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">+0.1 vs last month</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Amenities</span>
                          <span className="text-sm text-muted-foreground">4.7/5</span>
                        </div>
                        <Progress value={94} className="h-2" />
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">+0.3 vs last month</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Value for Money</span>
                          <span className="text-sm text-muted-foreground">4.6/5</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">-0.1 vs last month</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Trends */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                        Revenue Trends
                      </CardTitle>
                      <CardDescription className="text-refined">
                        6-month revenue breakdown by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trendData.map((trend, index) => (
                          <div key={trend.category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  trend.color === 'blue' && "bg-blue-500",
                                  trend.color === 'green' && "bg-green-500",
                                  trend.color === 'purple' && "bg-purple-500"
                                )}></div>
                                <span className="text-sm font-medium">{trend.category}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(trend.data[trend.data.length - 1].value)}
                              </span>
                            </div>
                            <div className="h-16 bg-gray-50 rounded-lg flex items-end justify-between px-2 py-1">
                              {trend.data.map((point, i) => (
                                <div
                                  key={point.month}
                                  className={cn(
                                    "w-8 rounded-t",
                                    trend.color === 'blue' && "bg-blue-200",
                                    trend.color === 'green' && "bg-green-200",
                                    trend.color === 'purple' && "bg-purple-200"
                                  )}
                                  style={{ height: `${(point.value / 300000) * 100}%` }}
                                  title={`${point.month}: ${formatCurrency(point.value)}`}
                                ></div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seasonal Patterns */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                        Seasonal Patterns
                      </CardTitle>
                      <CardDescription className="text-refined">
                        Booking patterns and seasonal trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                          {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
                            <div key={quarter} className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-primary">{quarter}</div>
                              <div className="text-xs text-muted-foreground">
                                {index === 0 && '85% Avg'}
                                {index === 1 && '92% Avg'}
                                {index === 2 && '78% Avg'}
                                {index === 3 && '88% Avg'}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Peak Season (Dec-Mar)</span>
                            <Badge className="bg-green-100 text-green-800">High Demand</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Shoulder Season (Apr-May, Oct-Nov)</span>
                            <Badge className="bg-yellow-100 text-yellow-800">Medium Demand</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Low Season (Jun-Sep)</span>
                            <Badge className="bg-blue-100 text-blue-800">Low Demand</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="space-y-6">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                      Performance Comparison
                    </CardTitle>
                    <CardDescription className="text-refined">
                      Current vs previous period and target benchmarks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparisonData.map((item, index) => (
                        <div key={item.metric} className="p-4 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{item.metric}</h4>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-blue-600">
                                  {item.current}{item.unit}
                                </div>
                                <div className="text-xs text-muted-foreground">Current</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-gray-600">
                                  {item.previous}{item.unit}
                                </div>
                                <div className="text-xs text-muted-foreground">Previous</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-green-600">
                                  {item.target}{item.unit}
                                </div>
                                <div className="text-xs text-muted-foreground">Target</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">vs Previous</div>
                              <div className={cn(
                                "text-sm font-medium flex items-center",
                                item.current > item.previous ? "text-green-600" : "text-red-600"
                              )}>
                                {item.current > item.previous ? (
                                  <ArrowUpRight className="w-3 h-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 mr-1" />
                                )}
                                {Math.abs(((item.current - item.previous) / item.previous) * 100).toFixed(1)}%
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">vs Target</div>
                              <div className={cn(
                                "text-sm font-medium flex items-center",
                                item.current >= item.target ? "text-green-600" : "text-orange-600"
                              )}>
                                {item.current >= item.target ? (
                                  <ArrowUpRight className="w-3 h-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 mr-1" />
                                )}
                                {Math.abs(((item.current - item.target) / item.target) * 100).toFixed(1)}%
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Progress</div>
                              <Progress 
                                value={Math.min((item.current / item.target) * 100, 100)} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Forecasting Tab */}
              <TabsContent value="forecasting" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                        Revenue Forecast
                      </CardTitle>
                      <CardDescription className="text-refined">
                        Projected revenue for next 6 months
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center border border-indigo-100">
                          <div className="text-center">
                            <LineChart className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                            <p className="text-sm text-indigo-600 font-medium">Forecast Chart</p>
                            <p className="text-xs text-indigo-500">Predictive analytics</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-lg font-bold text-indigo-600">AED 8.2M</div>
                            <div className="text-xs text-muted-foreground">6-Month Projection</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">+22%</div>
                            <div className="text-xs text-muted-foreground">Expected Growth</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <Target className="w-5 h-5 mr-2 text-pink-500" />
                        Key Predictions
                      </CardTitle>
                      <CardDescription className="text-refined">
                        AI-powered business insights and recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-green-800">
                                Peak Season Opportunity
                              </div>
                              <div className="text-xs text-green-700 mt-1">
                                December bookings expected to increase by 35% based on historical trends
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-blue-800">
                                Pricing Optimization
                              </div>
                              <div className="text-xs text-blue-700 mt-1">
                                Consider 8% rate increase for weekends to maximize revenue
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-orange-800">
                                Booking Window Trend
                              </div>
                              <div className="text-xs text-orange-700 mt-1">
                                Average booking lead time decreasing - focus on last-minute deals
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Users className="w-4 h-4 text-purple-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-purple-800">
                                Guest Segment Growth
                              </div>
                              <div className="text-xs text-purple-700 mt-1">
                                Corporate retreats segment showing 40% growth potential
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 