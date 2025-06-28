"use client";

import { useState, useEffect } from "react";
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
  TrendingDown,
  Clock,
  Wrench,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Settings,
  Activity,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OperationalMetrics {
  staffEfficiency: number;
  resourceUtilization: number;
  maintenanceCosts: number;
  operationalCosts: number;
  energyEfficiency: number;
  guestToStaffRatio: number;
  averageResponseTime: number;
  equipmentUptime: number;
}

interface StaffingData {
  department: string;
  totalStaff: number;
  activeStaff: number;
  efficiency: number;
  workload: number;
  overtime: number;
  satisfaction: number;
  turnoverRate: number;
  averageExperience: number;
}

interface ResourceUtilization {
  resource: string;
  capacity: number;
  utilized: number;
  utilizationRate: number;
  peakUsage: number;
  cost: number;
  efficiency: number;
  trend: number;
}

interface MaintenanceData {
  area: string;
  scheduledMaintenance: number;
  emergencyRepairs: number;
  totalCost: number;
  averageDowntime: number;
  preventiveRatio: number;
  equipmentAge: number;
  nextMaintenance: string;
}

interface OperationalKPI {
  kpi: string;
  current: number;
  target: number;
  unit: string;
  trend: number;
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
  description: string;
}

export default function OperationalReportsPage() {
  const { isOpen } = useSidebar();
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [staffingData, setStaffingData] = useState<StaffingData[]>([]);
  const [resourceData, setResourceData] = useState<ResourceUtilization[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData[]>([]);
  const [operationalKPIs, setOperationalKPIs] = useState<OperationalKPI[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState("1m");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Mock data
  useEffect(() => {
    const mockMetrics: OperationalMetrics = {
      staffEfficiency: 87.5,
      resourceUtilization: 78.2,
      maintenanceCosts: 45000,
      operationalCosts: 185000,
      energyEfficiency: 82.1,
      guestToStaffRatio: 2.8,
      averageResponseTime: 4.2,
      equipmentUptime: 96.8
    };

    const mockStaffingData: StaffingData[] = [
      {
        department: 'Housekeeping',
        totalStaff: 12,
        activeStaff: 11,
        efficiency: 89.2,
        workload: 78.5,
        overtime: 12.3,
        satisfaction: 4.2,
        turnoverRate: 8.5,
        averageExperience: 3.2
      },
      {
        department: 'Food & Beverage',
        totalStaff: 8,
        activeStaff: 7,
        efficiency: 85.1,
        workload: 82.1,
        overtime: 15.8,
        satisfaction: 4.0,
        turnoverRate: 12.1,
        averageExperience: 2.8
      },
      {
        department: 'Front Desk',
        totalStaff: 6,
        activeStaff: 6,
        efficiency: 92.3,
        workload: 75.2,
        overtime: 8.5,
        satisfaction: 4.5,
        turnoverRate: 5.2,
        averageExperience: 4.1
      },
      {
        department: 'Maintenance',
        totalStaff: 4,
        activeStaff: 4,
        efficiency: 88.7,
        workload: 85.3,
        overtime: 18.2,
        satisfaction: 4.1,
        turnoverRate: 6.8,
        averageExperience: 5.2
      },
      {
        department: 'Activities',
        totalStaff: 5,
        activeStaff: 5,
        efficiency: 91.5,
        workload: 72.8,
        overtime: 6.2,
        satisfaction: 4.7,
        turnoverRate: 3.1,
        averageExperience: 3.8
      },
      {
        department: 'Security',
        totalStaff: 3,
        activeStaff: 3,
        efficiency: 94.2,
        workload: 68.5,
        overtime: 22.1,
        satisfaction: 4.3,
        turnoverRate: 4.2,
        averageExperience: 6.1
      }
    ];

    const mockResourceData: ResourceUtilization[] = [
      {
        resource: 'Guest Rooms',
        capacity: 24,
        utilized: 18,
        utilizationRate: 75.0,
        peakUsage: 22,
        cost: 35000,
        efficiency: 88.2,
        trend: 5.2
      },
      {
        resource: 'Meditation Hall',
        capacity: 50,
        utilized: 42,
        utilizationRate: 84.0,
        peakUsage: 48,
        cost: 8000,
        efficiency: 91.5,
        trend: 8.1
      },
      {
        resource: 'Yoga Studio',
        capacity: 30,
        utilized: 26,
        utilizationRate: 86.7,
        peakUsage: 29,
        cost: 6500,
        efficiency: 89.3,
        trend: 3.2
      },
      {
        resource: 'Dining Hall',
        capacity: 60,
        utilized: 45,
        utilizationRate: 75.0,
        peakUsage: 55,
        cost: 12000,
        efficiency: 82.1,
        trend: -2.1
      },
      {
        resource: 'Spa Facilities',
        capacity: 8,
        utilized: 6,
        utilizationRate: 75.0,
        peakUsage: 8,
        cost: 15000,
        efficiency: 85.7,
        trend: 12.5
      },
      {
        resource: 'Kitchen',
        capacity: 100,
        utilized: 68,
        utilizationRate: 68.0,
        peakUsage: 85,
        cost: 18000,
        efficiency: 78.9,
        trend: -5.3
      }
    ];

    const mockMaintenanceData: MaintenanceData[] = [
      {
        area: 'HVAC Systems',
        scheduledMaintenance: 8,
        emergencyRepairs: 2,
        totalCost: 12500,
        averageDowntime: 2.5,
        preventiveRatio: 80.0,
        equipmentAge: 3.2,
        nextMaintenance: '2024-02-15'
      },
      {
        area: 'Plumbing',
        scheduledMaintenance: 6,
        emergencyRepairs: 4,
        totalCost: 8500,
        averageDowntime: 1.8,
        preventiveRatio: 60.0,
        equipmentAge: 5.1,
        nextMaintenance: '2024-02-20'
      },
      {
        area: 'Electrical',
        scheduledMaintenance: 4,
        emergencyRepairs: 1,
        totalCost: 6200,
        averageDowntime: 3.2,
        preventiveRatio: 80.0,
        equipmentAge: 2.8,
        nextMaintenance: '2024-02-25'
      },
      {
        area: 'Kitchen Equipment',
        scheduledMaintenance: 12,
        emergencyRepairs: 3,
        totalCost: 9800,
        averageDowntime: 4.1,
        preventiveRatio: 80.0,
        equipmentAge: 4.2,
        nextMaintenance: '2024-02-10'
      },
      {
        area: 'Fitness Equipment',
        scheduledMaintenance: 5,
        emergencyRepairs: 1,
        totalCost: 3200,
        averageDowntime: 1.2,
        preventiveRatio: 83.3,
        equipmentAge: 1.8,
        nextMaintenance: '2024-02-28'
      },
      {
        area: 'Audio/Visual',
        scheduledMaintenance: 3,
        emergencyRepairs: 2,
        totalCost: 4800,
        averageDowntime: 2.8,
        preventiveRatio: 60.0,
        equipmentAge: 3.5,
        nextMaintenance: '2024-02-18'
      }
    ];

    const mockOperationalKPIs: OperationalKPI[] = [
      {
        kpi: 'Guest Satisfaction',
        current: 4.7,
        target: 4.5,
        unit: '/5',
        trend: 8.5,
        status: 'GOOD',
        description: 'Overall guest satisfaction rating'
      },
      {
        kpi: 'Staff Efficiency',
        current: 87.5,
        target: 85.0,
        unit: '%',
        trend: 5.2,
        status: 'GOOD',
        description: 'Average staff productivity score'
      },
      {
        kpi: 'Energy Consumption',
        current: 82.1,
        target: 80.0,
        unit: '%',
        trend: -3.2,
        status: 'WARNING',
        description: 'Energy efficiency rating'
      },
      {
        kpi: 'Response Time',
        current: 4.2,
        target: 5.0,
        unit: 'min',
        trend: -12.5,
        status: 'GOOD',
        description: 'Average response time to guest requests'
      },
      {
        kpi: 'Equipment Uptime',
        current: 96.8,
        target: 95.0,
        unit: '%',
        trend: 2.1,
        status: 'GOOD',
        description: 'Equipment availability percentage'
      },
      {
        kpi: 'Maintenance Cost',
        current: 45000,
        target: 50000,
        unit: 'AED',
        trend: -8.5,
        status: 'GOOD',
        description: 'Monthly maintenance expenses'
      },
      {
        kpi: 'Staff Turnover',
        current: 7.2,
        target: 10.0,
        unit: '%',
        trend: -15.2,
        status: 'GOOD',
        description: 'Annual staff turnover rate'
      },
      {
        kpi: 'Guest-to-Staff Ratio',
        current: 2.8,
        target: 3.0,
        unit: ':1',
        trend: 5.8,
        status: 'WARNING',
        description: 'Ratio of guests to active staff'
      }
    ];

    setMetrics(mockMetrics);
    setStaffingData(mockStaffingData);
    setResourceData(mockResourceData);
    setMaintenanceData(mockMaintenanceData);
    setOperationalKPIs(mockOperationalKPIs);
    setLoading(false);
  }, []);

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD': return 'text-green-600';
      case 'WARNING': return 'text-yellow-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getKPIStatusBadge = (status: string) => {
    switch (status) {
      case 'GOOD': return 'default';
      case 'WARNING': return 'secondary';
      case 'CRITICAL': return 'destructive';
      default: return 'outline';
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Operational Reports</h1>
                <p className="text-gray-600">Staffing efficiency, resource utilization, and operational KPIs</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1w">Last week</SelectItem>
                    <SelectItem value="1m">Last month</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Operational Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.staffEfficiency}%</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.guestToStaffRatio}:1 guest-to-staff ratio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.resourceUtilization}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average facility usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Equipment Uptime</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics?.equipmentUptime}%</div>
                  <p className="text-xs text-muted-foreground">
                    System availability
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.averageResponseTime} min</div>
                  <p className="text-xs text-muted-foreground">
                    Average guest request response
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Staffing Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Staffing Efficiency by Department</CardTitle>
                <CardDescription>Performance metrics for each operational department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {staffingData.map((dept) => (
                    <div key={dept.department} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{dept.department}</span>
                          <Badge variant="outline">{dept.activeStaff}/{dept.totalStaff} active</Badge>
                          <Badge variant="secondary">{dept.efficiency}% efficiency</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">Satisfaction: {dept.satisfaction}/5</div>
                          <div className="text-xs text-muted-foreground">
                            {dept.averageExperience}y avg experience
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Workload:</span>
                          <div className="font-semibold">{dept.workload}%</div>
                          <Progress value={dept.workload} className="h-1 mt-1" />
                        </div>
                        <div>
                          <span className="text-muted-foreground">Overtime:</span>
                          <div className={cn(
                            "font-semibold",
                            dept.overtime > 15 ? "text-red-600" : dept.overtime > 10 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {dept.overtime}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Turnover:</span>
                          <div className={cn(
                            "font-semibold",
                            dept.turnoverRate > 10 ? "text-red-600" : dept.turnoverRate > 5 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {dept.turnoverRate}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Efficiency:</span>
                          <div className="font-semibold text-blue-600">{dept.efficiency}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Facility and equipment usage efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {resourceData.map((resource) => (
                    <div key={resource.resource} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{resource.resource}</span>
                          <Badge variant="outline">
                            {resource.utilized}/{resource.capacity} capacity
                          </Badge>
                          <Badge variant={resource.utilizationRate >= 80 ? "default" : resource.utilizationRate >= 60 ? "secondary" : "outline"}>
                            {resource.utilizationRate}% utilized
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">AED {resource.cost.toLocaleString()}</div>
                          <div className={cn(
                            "text-xs flex items-center",
                            resource.trend > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {resource.trend > 0 ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(resource.trend)}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress value={resource.utilizationRate} className="h-2" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Peak Usage:</span>
                          <div className="font-semibold">{resource.peakUsage}/{resource.capacity}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Efficiency:</span>
                          <div className="font-semibold">{resource.efficiency}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost per Unit:</span>
                          <div className="font-semibold">AED {(resource.cost / resource.capacity).toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Analysis
                </CardTitle>
                <CardDescription>Maintenance costs, schedules, and equipment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {maintenanceData.map((maintenance) => (
                    <div key={maintenance.area} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{maintenance.area}</span>
                          <Badge variant="outline">
                            {maintenance.equipmentAge}y old
                          </Badge>
                          <Badge variant={maintenance.preventiveRatio >= 80 ? "default" : maintenance.preventiveRatio >= 60 ? "secondary" : "destructive"}>
                            {maintenance.preventiveRatio}% preventive
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">AED {maintenance.totalCost.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            Next: {format(new Date(maintenance.nextMaintenance), "MMM dd")}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Scheduled:</span>
                          <div className="font-semibold text-green-600">{maintenance.scheduledMaintenance}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Emergency:</span>
                          <div className="font-semibold text-red-600">{maintenance.emergencyRepairs}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Downtime:</span>
                          <div className="font-semibold">{maintenance.averageDowntime}h</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preventive Ratio:</span>
                          <div className={cn(
                            "font-semibold",
                            maintenance.preventiveRatio >= 80 ? "text-green-600" : 
                            maintenance.preventiveRatio >= 60 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {maintenance.preventiveRatio}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress value={maintenance.preventiveRatio} className="h-1" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">Total Maintenance Costs</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    AED {maintenanceData.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {maintenanceData.reduce((sum, item) => sum + item.scheduledMaintenance, 0)} scheduled, {' '}
                    {maintenanceData.reduce((sum, item) => sum + item.emergencyRepairs, 0)} emergency repairs
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>Critical operational metrics and performance targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {operationalKPIs.map((kpi) => (
                    <div key={kpi.kpi} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{kpi.kpi}</span>
                        <Badge variant={getKPIStatusBadge(kpi.status)}>
                          {kpi.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">{kpi.current}{kpi.unit}</div>
                          <div className="text-sm text-muted-foreground">
                            Target: {kpi.target}{kpi.unit}
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center text-sm",
                          kpi.trend > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {kpi.trend > 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(kpi.trend)}%
                        </div>
                      </div>
                      
                      <Progress 
                        value={Math.min((kpi.current / kpi.target) * 100, 100)} 
                        className="h-2" 
                      />
                      
                      <p className="text-xs text-muted-foreground">{kpi.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operational Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Summary</CardTitle>
                <CardDescription>Overall performance status and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Performing Well
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Staff efficiency above target</li>
                      <li>• Equipment uptime excellent</li>
                      <li>• Guest satisfaction high</li>
                      <li>• Response times improving</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-yellow-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Needs Attention
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Energy consumption rising</li>
                      <li>• F&B department overtime high</li>
                      <li>• Kitchen utilization low</li>
                      <li>• Guest-to-staff ratio tight</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Recommendations
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Implement energy-saving measures</li>
                      <li>• Cross-train F&B staff</li>
                      <li>• Optimize kitchen workflows</li>
                      <li>• Consider additional staff hiring</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">8.5/10</div>
                    <div className="text-sm text-muted-foreground">Overall Operational Score</div>
                    <Progress value={85} className="mt-2 h-2" />
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