"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Users, 
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Building2,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
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

interface OccupancyData {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  revenue: number;
  averageDailyRate: number;
  revPAR: number;
}

interface RoomTypeOccupancy {
  roomType: string;
  totalRooms: number;
  averageOccupancy: number;
  revenue: number;
  averageDailyRate: number;
  revPAR: number;
  trend: number;
}

interface SeasonalTrend {
  month: string;
  occupancyRate: number;
  revenue: number;
  bookings: number;
  averageDailyRate: number;
}

interface OccupancyMetrics {
  currentOccupancy: number;
  averageOccupancy: number;
  peakOccupancy: number;
  totalRevenue: number;
  revPAR: number;
  averageDailyRate: number;
  totalBookings: number;
  averageStayLength: number;
  totalRooms: number;
  totalCapacity: number;
}

interface FacilityOverview {
  id: string;
  name: string;
  capacity: number;
  totalRooms: number;
  currentOccupancy: number;
}

interface OccupancyApiResponse {
  dailyOccupancy: OccupancyData[];
  roomTypeOccupancy: RoomTypeOccupancy[];
  seasonalTrends: SeasonalTrend[];
  metrics: OccupancyMetrics;
  facilities: FacilityOverview[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function OccupancyReportsPage() {
  const { isOpen, isDesktop } = useSidebar();
  const router = useRouter();
  const [data, setData] = useState<OccupancyApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState("30");
  const [facilityFilter, setFacilityFilter] = useState("ALL");

  useEffect(() => {
    fetchOccupancyData();
  }, [periodFilter, facilityFilter]);

  const fetchOccupancyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: periodFilter,
        ...(facilityFilter !== "ALL" && { facilityId: facilityFilter })
      });

      const response = await fetch(`/api/bridge-retreats/reports/occupancy?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch occupancy data');
      }
      
      const responseData = await response.json();
      setData(responseData);
      
    } catch (err) {
      console.error('Error fetching occupancy data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch occupancy data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setSuccess(null);
      await fetchOccupancyData();
      setSuccess('Occupancy data refreshed successfully');
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
      setSuccess('Occupancy data exported successfully');
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getOccupancyBadgeVariant = (rate: number) => {
    if (rate >= 80) return "default";
    if (rate >= 60) return "secondary";
    return "destructive";
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? 
      <ArrowUpRight className="h-3 w-3" /> : 
      <ArrowDownRight className="h-3 w-3" />;
  };

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? "text-green-600" : "text-red-600";
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
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading occupancy data...</span>
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
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchOccupancyData} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
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
              <h1 className="text-3xl font-prestigious text-gradient">Occupancy Reports</h1>
              <p className="text-refined text-muted-foreground mt-1">
                Room occupancy rates, seasonal trends, and capacity utilization
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Facilities</SelectItem>
                  {data?.facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
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
                {exporting ? "Exporting..." : "Export"}
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
                <Card className="card-premium">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Current Occupancy
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPercentage(data.metrics.currentOccupancy)}
                    </div>
                    <Progress 
                      value={data.metrics.currentOccupancy} 
                      className="mt-2 h-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {data.metrics.totalRooms} total rooms
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Average Occupancy
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPercentage(data.metrics.averageOccupancy)}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Last {periodFilter} days
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      RevPAR
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(data.metrics.revPAR)}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Revenue per available room
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Total Bookings
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {data.metrics.totalBookings}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Avg stay: {data.metrics.averageStayLength?.toFixed(1)} nights
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Navigation Links */}
              <motion.div 
                {...fadeInUp} 
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Related Reports & Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link href="/bridge-retreats/bookings">
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Bookings
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                      </Link>
                      
                      <Link href="/bridge-retreats/facilities">
                        <Button variant="outline" className="w-full justify-start">
                          <Building2 className="h-4 w-4 mr-2" />
                          Manage Facilities
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                      </Link>
                      
                      <Link href="/bridge-retreats/revenue">
                        <Button variant="outline" className="w-full justify-start">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Revenue Reports
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                      </Link>
                      
                      <Link href="/bridge-retreats/reports">
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          All Reports
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 