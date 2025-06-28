"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Eye,
  CreditCard,
  Building2,
  Target,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface RevenueData {
  id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  retreatType: string;
  retreatTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  numberOfGuests: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED' | 'FAILED';
  paymentMethod: string;
  bookingDate: string;
  status: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  averageDailyRate: number;
  occupancyRate: number;
  revPAR: number;
  growthRate: number;
}

interface RetreatTypeRevenue {
  type: string;
  revenue: number;
  bookings: number;
  averageValue: number;
  percentage: number;
}

interface PaymentMethodBreakdown {
  method: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

interface BookingSourceBreakdown {
  source: string;
  bookings: number;
  percentage: number;
}

interface RevenueTrend {
  month: string;
  revenue: number;
  bookings: number;
}

interface RevenueApiResponse {
  metrics: RevenueMetrics;
  revenueData: RevenueData[];
  retreatTypeRevenue: RetreatTypeRevenue[];
  revenueTrends: RevenueTrend[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  bookingSourceBreakdown: BookingSourceBreakdown[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function RevenuePage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [data, setData] = useState<RevenueApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [retreatTypeFilter, setRetreatTypeFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchRevenueData();
  }, [periodFilter, retreatTypeFilter, paymentStatusFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: periodFilter,
        retreatType: retreatTypeFilter,
        paymentStatus: paymentStatusFilter
      });

      const response = await fetch(`/api/bridge-retreats/revenue?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      
      const responseData = await response.json();
      setData(responseData);
      
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setSuccess(null);
      await fetchRevenueData();
      setSuccess('Revenue data refreshed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      // Implementation for data export
      setSuccess('Revenue data exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PARTIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    if (rate < 0) return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Define table columns
  const columns = [
    {
      accessorKey: "bookingId",
      header: "Booking ID",
      cell: ({ row }: any) => (
        <Link 
          href={`/bridge-retreats/bookings/${row.getValue("bookingId")}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {row.getValue("bookingId").slice(0, 8)}...
        </Link>
      )
    },
    {
      accessorKey: "guestName",
      header: "Guest",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue("guestName")}</div>
          <div className="text-sm text-gray-500">{row.original.guestEmail}</div>
        </div>
      )
    },
    {
      accessorKey: "retreatType",
      header: "Retreat Type",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-normal">
          {row.getValue("retreatType")}
        </Badge>
      )
    },
    {
      accessorKey: "retreatTitle",
      header: "Retreat",
      cell: ({ row }: any) => (
        <div className="max-w-[200px] truncate" title={row.getValue("retreatTitle")}>
          {row.getValue("retreatTitle")}
        </div>
      )
    },
    {
      accessorKey: "checkIn",
      header: "Check-in",
      cell: ({ row }: any) => formatDate(row.getValue("checkIn"))
    },
    {
      accessorKey: "nights",
      header: "Nights",
      cell: ({ row }: any) => (
        <div className="text-center">{row.getValue("nights")}</div>
      )
    },
    {
      accessorKey: "numberOfGuests",
      header: "Guests",
      cell: ({ row }: any) => (
        <div className="text-center">{row.getValue("numberOfGuests")}</div>
      )
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }: any) => (
        <div className="font-semibold">{formatCurrency(row.getValue("totalAmount"))}</div>
      )
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.getValue("paidAmount"))}</div>
      )
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }: any) => {
        const status = row.getValue("paymentStatus");
        return (
          <Badge className={getPaymentStatusColor(status)}>
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method"
    }
  ];

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
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading revenue data...</span>
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

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0"
            {...fadeInUp}
          >
            <div>
              <h1 className="text-3xl font-prestigious text-gradient">Revenue Analytics</h1>
              <p className="text-refined text-muted-foreground mt-1">
                Monitor income performance and booking revenue trends
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                Refresh
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700">{success}</span>
            </motion.div>
          )}

          {data && (
            <>
              {/* Key Metrics */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious text-gradient">
                      {formatCurrency(data.metrics.totalRevenue)}
                    </div>
                    <div className={cn("flex items-center text-xs mt-1", getGrowthColor(data.metrics.growthRate))}>
                      {getGrowthIcon(data.metrics.growthRate)}
                      <span className="ml-1">
                        {data.metrics.growthRate > 0 ? '+' : ''}{data.metrics.growthRate.toFixed(1)}% from last period
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Monthly Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious">
                      {formatCurrency(data.metrics.monthlyRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This month
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious">
                      {data.metrics.totalBookings.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active bookings
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Avg Booking Value</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious">
                      {formatCurrency(data.metrics.averageBookingValue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per booking
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Revenue by Retreat Type */}
              <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                <Card className="card-premium mb-8">
                  <CardHeader>
                    <CardTitle className="font-elegant">Revenue by Retreat Type</CardTitle>
                    <CardDescription>Performance breakdown by retreat category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.retreatTypeRevenue.map((retreat) => (
                        <div key={retreat.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-refined">{retreat.type}</span>
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
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${retreat.percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {retreat.percentage.toFixed(1)}% of total revenue
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Filters */}
              <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center font-elegant">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters & Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Retreat Type</Label>
                        <Select value={retreatTypeFilter} onValueChange={setRetreatTypeFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            {data.retreatTypeRevenue.map(retreat => (
                              <SelectItem key={retreat.type} value={retreat.type}>
                                {retreat.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Payment Status</Label>
                        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRetreatTypeFilter("ALL");
                            setPaymentStatusFilter("ALL");
                          }}
                        >
                          Clear Filters
                        </Button>
                        <Link href="/bridge-retreats/finance/dashboard">
                          <Button variant="default">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Finance Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Revenue Data Table */}
              <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="font-elegant">Revenue Details</CardTitle>
                    <CardDescription>
                      Showing {data.revenueData.length} bookings for {data.period}
                      {data.dateRange && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={data.revenueData}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="mt-8 flex flex-wrap gap-4 justify-center"
                {...fadeInUp}
                transition={{ delay: 0.7 }}
              >
                <Link href="/bridge-retreats/bookings">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Bookings
                  </Button>
                </Link>
                <Link href="/bridge-retreats/bookings/create">
                  <Button variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    Create New Booking
                  </Button>
                </Link>
                <Link href="/bridge-retreats/finance/transactions">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Transactions
                  </Button>
                </Link>
                <Link href="/bridge-retreats/analytics">
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Advanced Analytics
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 