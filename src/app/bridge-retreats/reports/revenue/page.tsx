"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
  Users,
  Building2,
  FileText,
  Eye,
  Calendar,
  Activity,
  Percent,
  ExternalLink,
  Bell,
  Lightbulb
} from "lucide-react";
import { format as formatDate, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

// Enhanced TypeScript interfaces
interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageDailyRate: number;
  revPAR: number;
  grossProfit: number;
  profitMargin: number;
  forecastedRevenue: number;
  yearOverYearGrowth: number;
  totalBookings: number;
  averageBookingValue: number;
  occupancyRate: number;
}

interface RevenueByRetreatType {
  retreatType: string;
  revenue: number;
  bookings: number;
  averageValue: number;
  profitMargin: number;
  costs: number;
  netProfit: number;
  growthRate: number;
  marketShare: number;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  bookings: number;
  averageDailyRate: number;
  occupancyRate: number;
  target: number;
  variance: number;
}

interface CostAnalysis {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
  budget: number;
  variance: number;
  subcategories?: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

interface RevenueForecast {
  month: string;
  actual?: number;
  forecast: number;
  confidence: number;
  factors: string[];
  lowerBound: number;
  upperBound: number;
}

interface RevenueApiResponse {
  success: boolean;
  data: {
    metrics: RevenueMetrics;
    retreatTypeRevenue: RevenueByRetreatType[];
    monthlyData: MonthlyRevenueData[];
    costAnalysis: CostAnalysis[];
    forecastData: RevenueForecast[];
    lastUpdated: string;
  };
  meta: {
    period: string;
    dateRange: {
      start: string;
      end: string;
    };
    totalRecords: number;
    currency: string;
  };
}

// Simple notification function to replace toast
const showNotification = (title: string, description: string, type: 'success' | 'error' = 'success') => {
  console.log(`${type.toUpperCase()}: ${title} - ${description}`);
  // You can replace this with any notification system you prefer
  if (type === 'error') {
    alert(`Error: ${title}\n${description}`);
  }
};

// Enhanced revenue data hook with proper workflow integration
const useRevenueData = (periodFilter: string, retreatTypeFilter: string) => {
  const [data, setData] = useState<RevenueApiResponse["data"] | null>(null);
  const [meta, setMeta] = useState<RevenueApiResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchRevenueData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        period: periodFilter,
        retreatType: retreatTypeFilter,
        include: 'metrics,trends,forecasts,costs',
        format: 'detailed',
        timestamp: Date.now().toString()
      });

      const response = await fetch(`/api/bridge-retreats/reports/revenue?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch revenue data`);
      }

      const responseData: RevenueApiResponse = await response.json();
      
      if (!responseData.success) {
        throw new Error('Invalid response from server');
      }

      setData(responseData.data);
      setMeta(responseData.meta);
      setLastRefresh(new Date());

      if (isRefresh) {
        showNotification(
          "Revenue Data Updated",
          "Latest revenue analytics have been loaded successfully.",
          'success'
        );
      }

    } catch (err) {
      console.error('Error fetching revenue data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch revenue data';
      setError(errorMessage);
      
      showNotification(
        "Revenue Data Error",
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodFilter, retreatTypeFilter]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchRevenueData(true);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loading, refreshing, fetchRevenueData]);

  const refresh = useCallback(() => fetchRevenueData(true), [fetchRevenueData]);

  return { data, meta, loading, error, refreshing, lastRefresh, refresh };
};

// Enhanced export functionality
const useRevenueExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportData = useCallback(async (
    format: 'csv' | 'excel' | 'pdf',
    period: string,
    retreatType: string,
    includeCharts = false
  ) => {
    try {
      setExporting(true);

      const params = new URLSearchParams({
        period,
        retreatType,
        format,
        includeCharts: includeCharts.toString(),
        timestamp: Date.now().toString()
      });

      const response = await fetch(`/api/bridge-retreats/reports/revenue/export?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmm');
      const filename = `revenue-report-${period}-${retreatType}-${timestamp}.${format}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification(
        "Export Successful",
        `Revenue report exported as ${filename}`,
        'success'
      );

      return { success: true, filename };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      showNotification(
        "Export Failed",
        errorMessage,
        'error'
      );
      return { success: false, error: errorMessage };
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportData, exporting };
};

export default function RevenueReportsPage() {
  const { isOpen } = useSidebar();
  const router = useRouter();
  const [periodFilter, setPeriodFilter] = useState("12m");
  const [retreatTypeFilter, setRetreatTypeFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("overview");

  // Custom hooks
  const { data, meta, loading, error, refreshing, lastRefresh, refresh } = useRevenueData(periodFilter, retreatTypeFilter);
  const { exportData, exporting } = useRevenueExport();

  // Advanced insights calculation
  const insights = useMemo(() => {
    if (!data) return null;
    
    return {
      topPerformingType: data.retreatTypeRevenue.length > 0
        ? data.retreatTypeRevenue.reduce((top, current) => 
            current.revenue > top.revenue ? current : top
          ).retreatType
        : null,
      profitabilityTrend: data.metrics.revenueGrowth > 5 
        ? 'increasing' 
        : data.metrics.revenueGrowth < -5 
          ? 'decreasing' 
          : 'stable',
      forecastReliability: data.forecastData.length > 0
        ? data.forecastData.reduce((sum, f) => sum + f.confidence, 0) / data.forecastData.length
        : 0,
      costOptimizationOpportunities: data.costAnalysis.filter(cost => 
        cost.variance > 10 || cost.trend > 15
      ).map(cost => ({
        category: cost.category,
        issue: cost.variance > 10 
          ? `${cost.variance.toFixed(1)}% over budget` 
          : `Costs increasing by ${cost.trend.toFixed(1)}%`,
        severity: cost.variance > 20 || cost.trend > 25 ? 'high' : 'medium'
      }))
    };
  }, [data]);

  // Enhanced export handler
  const handleExport = async (exportFormat: 'csv' | 'excel' | 'pdf') => {
    await exportData(exportFormat, periodFilter, retreatTypeFilter, exportFormat === 'pdf');
  };

  // Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: meta?.currency || 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, [meta?.currency]);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? 
      <ArrowUpRight className="h-3 w-3" /> : 
      <ArrowDownRight className="h-3 w-3" />;
  };

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? "text-green-600" : "text-red-600";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar />
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300",
            isOpen ? "lg:ml-64" : "lg:ml-20"
          )}>
            <Header />
            <main className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading revenue analytics...</span>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar />
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300",
            isOpen ? "lg:ml-64" : "lg:ml-20"
          )}>
            <Header />
            <main className="flex-1 flex items-center justify-center p-6">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-destructive mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Revenue Data Unavailable</span>
                  </div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <div className="flex gap-2">
                    <Button onClick={refresh} disabled={refreshing} className="flex-1">
                      <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                      {refreshing ? "Retrying..." : "Retry"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/bridge-retreats/dashboard')}
                    >
                      Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          isOpen ? "lg:ml-64" : "lg:ml-20"
        )}>
          <Header />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              
              {/* Header */}
              <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gradient">
                    Revenue Analytics
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Comprehensive financial performance analysis and strategic insights
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {periodFilter === '12m' ? 'Last 12 Months' : 
                       periodFilter === '6m' ? 'Last 6 Months' : 'Last 3 Months'}
                    </Badge>
                    {meta?.dateRange && (
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(new Date(meta.dateRange.start), 'MMM dd')} - {formatDate(new Date(meta.dateRange.end), 'MMM dd, yyyy')}
                      </Badge>
                    )}
                    {lastRefresh && (
                      <Badge variant="outline" className="text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        Updated {formatDate(lastRefresh, 'HH:mm')}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-2">
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">Last 3 months</SelectItem>
                      <SelectItem value="6m">Last 6 months</SelectItem>
                      <SelectItem value="12m">Last 12 months</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={retreatTypeFilter} onValueChange={setRetreatTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="Wellness">Wellness</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Spiritual">Spiritual</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={refresh}
                    disabled={refreshing}
                    size="sm"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  </Button>

                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport('csv')}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport('excel')}
                      disabled={exporting}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport('pdf')}
                      disabled={exporting}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </motion.div>

              {data && (
                <>
                  {/* Key Insights Alert */}
                  {insights && insights.costOptimizationOpportunities.length > 0 && (
                    <motion.div {...fadeInUp} className="mb-4">
                      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                                Revenue Optimization Opportunities
                              </h3>
                              <div className="space-y-1">
                                {insights.costOptimizationOpportunities.slice(0, 3).map((opportunity, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                    <Badge 
                                      variant={opportunity.severity === 'high' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {opportunity.severity}
                                    </Badge>
                                    <span>{opportunity.category}: {opportunity.issue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Key Metrics */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    {...fadeInUp}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(data.metrics.totalRevenue)}
                        </div>
                        <div className={cn("flex items-center text-xs mt-1", getTrendColor(data.metrics.revenueGrowth))}>
                          {getTrendIcon(data.metrics.revenueGrowth)}
                          <span className="ml-1">
                            {data.metrics.revenueGrowth > 0 ? '+' : ''}{formatPercentage(data.metrics.revenueGrowth)} from last period
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(data.metrics.grossProfit)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatPercentage(data.metrics.profitMargin)} margin
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(data.metrics.averageDailyRate)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          RevPAR: {formatCurrency(data.metrics.revPAR)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Forecast Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(data.metrics.forecastedRevenue)}
                        </div>
                        <div className={cn("flex items-center text-xs mt-1", getTrendColor(data.metrics.yearOverYearGrowth))}>
                          {getTrendIcon(data.metrics.yearOverYearGrowth)}
                          <span className="ml-1">
                            {formatPercentage(data.metrics.yearOverYearGrowth)} YoY growth
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Analytics Tabs */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="forecast">Forecast</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Revenue by Retreat Type */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Revenue by Retreat Type</CardTitle>
                              <CardDescription>Performance breakdown by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {data.retreatTypeRevenue.map((retreat) => (
                                  <div key={retreat.retreatType} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium">{retreat.retreatType}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {retreat.bookings} bookings
                                        </Badge>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(retreat.revenue)}</div>
                                        <div className="text-sm text-muted-foreground">
                                          Avg: {formatCurrency(retreat.averageValue)}
                                        </div>
                                      </div>
                                    </div>
                                    <Progress value={retreat.marketShare} className="h-2" />
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                      <span>{formatPercentage(retreat.marketShare)} market share</span>
                                      <span className={getTrendColor(retreat.growthRate)}>
                                        {retreat.growthRate > 0 ? '+' : ''}{formatPercentage(retreat.growthRate)} growth
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Key Performance Indicators */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Key Performance Indicators</CardTitle>
                              <CardDescription>Current period performance metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Occupancy Rate</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={data.metrics.occupancyRate} className="w-20 h-2" />
                                    <span className="text-sm font-semibold">{formatPercentage(data.metrics.occupancyRate)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Profit Margin</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={data.metrics.profitMargin} className="w-20 h-2" />
                                    <span className="text-sm font-semibold">{formatPercentage(data.metrics.profitMargin)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Revenue per Booking</span>
                                  <span className="text-sm font-semibold">{formatCurrency(data.metrics.averageBookingValue)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Total Bookings</span>
                                  <span className="text-sm font-semibold">{data.metrics.totalBookings}</span>
                                </div>
                                
                                {insights && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Forecast Confidence</span>
                                    <span className="text-sm font-semibold">{formatPercentage(insights.forecastReliability)}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="trends" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Monthly Revenue Trends</CardTitle>
                            <CardDescription>Performance over time with targets and variance analysis</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {data.monthlyData.map((month) => (
                                <div key={month.month} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{formatDate(new Date(month.month), 'MMMM yyyy')}</span>
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm font-semibold">{formatCurrency(month.revenue)}</span>
                                      <Badge variant={month.variance >= 0 ? "default" : "destructive"}>
                                        {month.variance > 0 ? '+' : ''}{formatPercentage(month.variance)} vs target
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Revenue:</span>
                                      <div className="font-medium">{formatCurrency(month.revenue)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Costs:</span>
                                      <div className="font-medium">{formatCurrency(month.costs)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Profit:</span>
                                      <div className="font-medium">{formatCurrency(month.profit)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Bookings:</span>
                                      <div className="font-medium">{month.bookings}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="breakdown" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Cost Analysis & Budget Performance</CardTitle>
                            <CardDescription>Detailed breakdown of operational costs with variance analysis</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-6">
                              {data.costAnalysis.map((cost) => (
                                <div key={cost.category} className="space-y-3 p-4 border rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-lg">{cost.category}</span>
                                    <div className="text-right">
                                      <div className="font-semibold">{formatCurrency(cost.amount)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {formatPercentage(cost.percentage)} of total
                                      </div>
                                    </div>
                                  </div>
                                  <Progress value={cost.percentage} className="h-2" />
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Budget:</span>
                                      <div className="font-medium">{formatCurrency(cost.budget)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Variance:</span>
                                      <div className={cn("font-medium", cost.variance > 0 ? "text-red-600" : "text-green-600")}>
                                        {cost.variance > 0 ? '+' : ''}{formatPercentage(cost.variance)}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Trend:</span>
                                      <div className={cn("font-medium flex items-center gap-1", getTrendColor(cost.trend))}>
                                        {getTrendIcon(cost.trend)}
                                        {formatPercentage(Math.abs(cost.trend))}
                                      </div>
                                    </div>
                                  </div>
                                  {cost.subcategories && cost.subcategories.length > 0 && (
                                    <div className="ml-4 space-y-2 pt-2 border-t">
                                      {cost.subcategories.map((sub) => (
                                        <div key={sub.name} className="flex justify-between items-center text-sm">
                                          <span className="text-muted-foreground">• {sub.name}</span>
                                          <div className="text-right">
                                            <span className="font-medium">{formatCurrency(sub.amount)}</span>
                                            <span className="text-muted-foreground ml-2">({formatPercentage(sub.percentage)})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="forecast" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Revenue Forecasting & Predictions</CardTitle>
                            <CardDescription>AI-powered forecasting with confidence intervals and key drivers</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {data.forecastData.map((forecast) => (
                                <div key={forecast.month} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-lg">{formatDate(new Date(forecast.month), 'MMMM yyyy')}</span>
                                    <Badge variant="outline" className="bg-white/50">
                                      {formatPercentage(forecast.confidence)} confidence
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <div className="text-center p-3 bg-white/50 rounded-lg">
                                      <div className="text-sm text-muted-foreground">Forecast</div>
                                      <div className="text-lg font-semibold">{formatCurrency(forecast.forecast)}</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/50 rounded-lg">
                                      <div className="text-sm text-muted-foreground">Lower Bound</div>
                                      <div className="text-lg font-medium text-orange-600">{formatCurrency(forecast.lowerBound)}</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/50 rounded-lg">
                                      <div className="text-sm text-muted-foreground">Upper Bound</div>
                                      <div className="text-lg font-medium text-green-600">{formatCurrency(forecast.upperBound)}</div>
                                    </div>
                                  </div>
                                  
                                  {forecast.actual && (
                                    <div className="text-center mb-3 p-3 bg-white/70 rounded-lg">
                                      <div className="text-sm text-muted-foreground">Actual</div>
                                      <div className="text-lg font-bold">{formatCurrency(forecast.actual)}</div>
                                      <div className={cn("text-sm", 
                                        forecast.actual >= forecast.forecast ? "text-green-600" : "text-red-600"
                                      )}>
                                        {forecast.actual >= forecast.forecast ? '+' : ''}{formatPercentage(((forecast.actual - forecast.forecast) / forecast.forecast) * 100)} vs forecast
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <div className="text-sm text-muted-foreground mb-2 font-medium">Key Factors:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {forecast.factors.map((factor, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-white/50">
                                          {factor}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </motion.div>

                  {/* Quick Actions & Integration */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5" />
                          Workflow Integration
                        </CardTitle>
                        <CardDescription>Navigate to related sections for detailed analysis and action items</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Link href="/bridge-retreats/bookings" className="block">
                            <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-primary/5">
                              <div className="flex flex-col items-start w-full">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Bookings</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {data.metrics.totalBookings} active bookings
                                </span>
                              </div>
                            </Button>
                          </Link>
                          
                          <Link href="/bridge-retreats/finance/dashboard" className="block">
                            <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-primary/5">
                              <div className="flex flex-col items-start w-full">
                                <div className="flex items-center gap-2 mb-1">
                                  <BarChart3 className="h-4 w-4" />
                                  <span className="font-medium">Finance</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatPercentage(data.metrics.profitMargin)} margin
                                </span>
                              </div>
                            </Button>
                          </Link>
                          
                          <Link href="/bridge-retreats/reports/occupancy" className="block">
                            <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-primary/5">
                              <div className="flex flex-col items-start w-full">
                                <div className="flex items-center gap-2 mb-1">
                                  <Users className="h-4 w-4" />
                                  <span className="font-medium">Occupancy</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatPercentage(data.metrics.occupancyRate)} occupied
                                </span>
                              </div>
                            </Button>
                          </Link>
                          
                          <Link href="/bridge-retreats/retreats" className="block">
                            <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-primary/5">
                              <div className="flex flex-col items-start w-full">
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="h-4 w-4" />
                                  <span className="font-medium">Retreats</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {insights?.topPerformingType || 'Manage retreats'}
                                </span>
                              </div>
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 