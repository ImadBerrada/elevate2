"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Target,
  Home,
  Bed
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

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
}

export default function OccupancyReportsPage() {
  const { isOpen } = useSidebar();
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [roomTypeData, setRoomTypeData] = useState<RoomTypeOccupancy[]>([]);
  const [seasonalData, setSeasonalData] = useState<SeasonalTrend[]>([]);
  const [metrics, setMetrics] = useState<OccupancyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");

  // Mock data
  useEffect(() => {
    const mockOccupancyData: OccupancyData[] = [];
    const today = new Date();
    const startDate = subMonths(today, 3);
    const days = eachDayOfInterval({ start: startDate, end: today });

    days.forEach((day, index) => {
      const baseOccupancy = 0.65 + Math.sin(index / 7) * 0.2 + Math.random() * 0.15;
      const occupancyRate = Math.max(0.3, Math.min(0.95, baseOccupancy));
      const totalRooms = 24;
      const occupiedRooms = Math.round(totalRooms * occupancyRate);
      const averageDailyRate = 800 + Math.random() * 200;
      const revenue = occupiedRooms * averageDailyRate;
      const revPAR = revenue / totalRooms;

      mockOccupancyData.push({
        date: format(day, "yyyy-MM-dd"),
        totalRooms,
        occupiedRooms,
        occupancyRate: occupancyRate * 100,
        revenue,
        averageDailyRate,
        revPAR
      });
    });

    const mockRoomTypeData: RoomTypeOccupancy[] = [
      {
        roomType: 'Deluxe Suite',
        totalRooms: 8,
        averageOccupancy: 78.5,
        revenue: 125000,
        averageDailyRate: 950,
        revPAR: 746,
        trend: 5.2
      },
      {
        roomType: 'Premium Room',
        totalRooms: 10,
        averageOccupancy: 72.3,
        revenue: 98000,
        averageDailyRate: 750,
        revPAR: 542,
        trend: -2.1
      },
      {
        roomType: 'Standard Room',
        totalRooms: 6,
        averageOccupancy: 65.8,
        revenue: 45000,
        averageDailyRate: 600,
        revPAR: 395,
        trend: 8.7
      }
    ];

    const mockSeasonalData: SeasonalTrend[] = [
      { month: 'Jan', occupancyRate: 68.2, revenue: 85000, bookings: 45, averageDailyRate: 820 },
      { month: 'Feb', occupancyRate: 71.5, revenue: 92000, bookings: 52, averageDailyRate: 835 },
      { month: 'Mar', occupancyRate: 75.8, revenue: 105000, bookings: 58, averageDailyRate: 850 },
      { month: 'Apr', occupancyRate: 82.1, revenue: 125000, bookings: 68, averageDailyRate: 875 },
      { month: 'May', occupancyRate: 78.9, revenue: 118000, bookings: 62, averageDailyRate: 865 },
      { month: 'Jun', occupancyRate: 85.3, revenue: 135000, bookings: 72, averageDailyRate: 890 }
    ];

    const mockMetrics: OccupancyMetrics = {
      currentOccupancy: 76.5,
      averageOccupancy: 74.2,
      peakOccupancy: 95.8,
      totalRevenue: 675000,
      revPAR: 562,
      averageDailyRate: 825,
      totalBookings: 357,
      averageStayLength: 3.2
    };

    setOccupancyData(mockOccupancyData);
    setRoomTypeData(mockRoomTypeData);
    setSeasonalData(mockSeasonalData);
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col overflow-hidden", isOpen ? "lg:ml-64" : "lg:ml-20")}>
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Occupancy Reports</h1>
                <p className="text-gray-600">Room occupancy rates, seasonal trends, and capacity utilization</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.currentOccupancy}%</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +2.3% from yesterday
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.averageOccupancy}%</div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">AED {metrics?.revPAR}</div>
                  <p className="text-xs text-muted-foreground">
                    Revenue per available room
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg stay: {metrics?.averageStayLength} nights
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Occupancy by Room Type */}
            <Card>
              <CardHeader>
                <CardTitle>Occupancy by Room Type</CardTitle>
                <CardDescription>Performance breakdown by room category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roomTypeData.map((roomType) => (
                    <div key={roomType.roomType} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bed className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{roomType.roomType}</span>
                            <p className="text-sm text-muted-foreground">{roomType.totalRooms} rooms</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{roomType.averageOccupancy.toFixed(1)}%</div>
                          <div className={cn(
                            "text-sm flex items-center",
                            roomType.trend > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {roomType.trend > 0 ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(roomType.trend)}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress value={roomType.averageOccupancy} className="h-2" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Revenue:</span>
                          <div className="font-semibold">AED {roomType.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ADR:</span>
                          <div className="font-semibold">AED {roomType.averageDailyRate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">RevPAR:</span>
                          <div className="font-semibold">AED {roomType.revPAR}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Trends</CardTitle>
                <CardDescription>Monthly occupancy patterns and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
                    <div>Month</div>
                    <div>Occupancy</div>
                    <div>Revenue</div>
                    <div>Bookings</div>
                    <div>ADR</div>
                  </div>
                  {seasonalData.map((data) => (
                    <div key={data.month} className="grid grid-cols-5 gap-4 py-2 border-b">
                      <div className="font-medium">{data.month}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{data.occupancyRate}%</span>
                        <Progress value={data.occupancyRate} className="h-1 flex-1" />
                      </div>
                      <div className="font-semibold">AED {data.revenue.toLocaleString()}</div>
                      <div>{data.bookings}</div>
                      <div>AED {data.averageDailyRate}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Capacity Utilization & Performance Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Capacity Utilization
                  </CardTitle>
                  <CardDescription>Room utilization efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Current Utilization</span>
                        <span className="text-sm font-semibold">{metrics?.currentOccupancy}%</span>
                      </div>
                      <Progress value={metrics?.currentOccupancy || 0} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Peak Utilization</span>
                        <span className="text-sm font-semibold">{metrics?.peakOccupancy}%</span>
                      </div>
                      <Progress value={metrics?.peakOccupancy || 0} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-xs text-muted-foreground">Available Rooms</span>
                        <div className="text-lg font-bold">24</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Occupied Today</span>
                        <div className="text-lg font-bold">18</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Performance Indicators
                  </CardTitle>
                  <CardDescription>Key performance benchmarks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Occupancy Target</span>
                      <Badge variant="default">80%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Performance</span>
                      <Badge variant={metrics?.currentOccupancy && metrics.currentOccupancy >= 80 ? "default" : "secondary"}>
                        {metrics?.currentOccupancy}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Target</span>
                      <Badge variant="outline">AED 700K</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Actual Revenue</span>
                      <Badge variant={metrics?.totalRevenue && metrics.totalRevenue >= 700000 ? "default" : "secondary"}>
                        AED {metrics?.totalRevenue ? (metrics.totalRevenue / 1000).toFixed(0) : 0}K
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">RevPAR Target</span>
                      <Badge variant="outline">AED 600</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current RevPAR</span>
                      <Badge variant={metrics?.revPAR && metrics.revPAR >= 600 ? "default" : "secondary"}>
                        AED {metrics?.revPAR}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Occupancy Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Occupancy Trend</CardTitle>
                <CardDescription>Last 30 days occupancy pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2 text-xs text-center font-medium text-muted-foreground">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {occupancyData.slice(-28).map((day, index) => (
                      <div
                        key={day.date}
                        className={cn(
                          "aspect-square rounded flex items-center justify-center text-xs font-medium",
                          day.occupancyRate >= 80 ? "bg-green-500 text-white" :
                          day.occupancyRate >= 60 ? "bg-yellow-500 text-white" :
                          day.occupancyRate >= 40 ? "bg-orange-500 text-white" :
                          "bg-red-500 text-white"
                        )}
                        title={`${format(new Date(day.date), "MMM dd")}: ${day.occupancyRate.toFixed(1)}%`}
                      >
                        {day.occupancyRate.toFixed(0)}%
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Low (&lt;40%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>Fair (40-60%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Good (60-80%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Excellent (80%+)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 