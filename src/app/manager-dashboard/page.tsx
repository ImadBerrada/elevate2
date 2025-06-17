'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  employeeCount: number;
  email: string;
  phone: string;
  website?: string;
  revenue?: string;
  foundedYear?: number;
  createdAt: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  startDate: string;
  companyId: string;
  companyName: string;
}

interface ManagerAssignment {
  id: string;
  companyId: string;
  platforms: string[];
  permissions: {
    canManageAssets: boolean;
    canModifyCompanies: boolean;
    canCreateCompanies: boolean;
    canDeleteCompanies: boolean;
  };
  company: Company;
}

interface DashboardStats {
  totalCompanies: number;
  totalEmployees: number;
  activeCompanies: number;
  inactiveCompanies: number;
  employeesByDepartment: { department: string; count: number }[];
  companiesByIndustry: { industry: string; count: number }[];
  employeeGrowth: { month: string; employees: number }[];
  recentActivities: { id: string; action: string; company: string; date: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [assignments, setAssignments] = useState<ManagerAssignment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalEmployees: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    employeesByDepartment: [],
    companiesByIndustry: [],
    employeeGrowth: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (user?.role === 'MANAGER') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      // Fetch manager assignments
      const assignmentsData = await apiClient.getManagerAssignments({
        userId: user.id
      });

      setAssignments(assignmentsData.assignments || []);

      // Fetch companies data
      const companiesData = await apiClient.getCompanies({ limit: 1000 });
      setCompanies(companiesData.companies || []);

      // Fetch employees data
      const employeesData = await apiClient.getEmployees({ limit: 1000 });
      setEmployees(employeesData.employees || []);

      // Fetch aggregated statistics from the new API endpoint
      try {
        const statsResponse = await fetch('/api/manager-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalCompanies: statsData.totalCompanies,
            totalEmployees: statsData.totalEmployees,
            activeCompanies: statsData.activeCompanies,
            inactiveCompanies: statsData.inactiveCompanies,
            employeesByDepartment: statsData.employeesByDepartment,
            companiesByIndustry: statsData.companiesByIndustry,
            employeeGrowth: statsData.employeeGrowth,
            recentActivities: statsData.recentActivities.map((activity: any) => ({
              ...activity,
              date: new Date(activity.date).toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
                hour12: true
              })
            }))
          });
        } else {
          // Fallback to calculating stats manually
          calculateStats(companiesData.companies || [], employeesData.employees || []);
        }
      } catch (statsError) {
        console.error('Failed to fetch stats from API, using fallback:', statsError);
        // Fallback to calculating stats manually
        calculateStats(companiesData.companies || [], employeesData.employees || []);
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (companiesData: Company[], employeesData: Employee[]) => {
    const activeCompanies = companiesData.filter(c => c.status === 'ACTIVE').length;
    const inactiveCompanies = companiesData.filter(c => c.status !== 'ACTIVE').length;

    // Group employees by department
    const departmentCounts = employeesData.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const employeesByDepartment = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count
    }));

    // Group companies by industry
    const industryCounts = companiesData.reduce((acc, comp) => {
      acc[comp.industry] = (acc[comp.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companiesByIndustry = Object.entries(industryCounts).map(([industry, count]) => ({
      industry,
      count
    }));

    // Generate mock employee growth data (in a real app, this would come from historical data)
    const employeeGrowth = [
      { month: 'Jan', employees: Math.floor(employeesData.length * 0.7) },
      { month: 'Feb', employees: Math.floor(employeesData.length * 0.75) },
      { month: 'Mar', employees: Math.floor(employeesData.length * 0.8) },
      { month: 'Apr', employees: Math.floor(employeesData.length * 0.85) },
      { month: 'May', employees: Math.floor(employeesData.length * 0.9) },
      { month: 'Jun', employees: employeesData.length }
    ];

    // Generate recent activities
    const recentActivities = [
      { id: '1', action: 'New employee added', company: companiesData[0]?.name || 'Company A', date: '2 hours ago' },
      { id: '2', action: 'Company status updated', company: companiesData[1]?.name || 'Company B', date: '5 hours ago' },
      { id: '3', action: 'Employee promoted', company: companiesData[0]?.name || 'Company A', date: '1 day ago' },
      { id: '4', action: 'New department created', company: companiesData[2]?.name || 'Company C', date: '2 days ago' },
    ];

    setStats({
      totalCompanies: companiesData.length,
      totalEmployees: employeesData.length,
      activeCompanies,
      inactiveCompanies,
      employeesByDepartment,
      companiesByIndustry,
      employeeGrowth,
      recentActivities
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'INACTIVE': return <Clock className="w-4 h-4" />;
      case 'SUSPENDED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCompanyEmployees = (companyId: string) => {
    return employees.filter(emp => emp.companyId === companyId);
  };

  if (user?.role !== 'MANAGER') {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Access Denied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>This dashboard is only available for managers.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchDashboardData} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-xl -z-10" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Manager Dashboard
                      </h1>
                      <p className="text-muted-foreground">
                        Welcome back, <span className="font-semibold text-foreground">{user?.firstName}</span>! Here's an overview of your assigned companies.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={fetchDashboardData} 
                  variant="outline"
                  className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600 font-medium">{stats.activeCompanies} active</span>, {stats.inactiveCompanies} inactive
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-emerald-600">{stats.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all assigned companies
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Companies</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-green-600">{stats.activeCompanies}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${stats.totalCompanies > 0 ? (stats.activeCompanies / stats.totalCompanies) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stats.totalCompanies > 0 ? ((stats.activeCompanies / stats.totalCompanies) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Platforms Access</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-purple-600">
                    {[...new Set(assignments.flatMap(a => a.platforms))].length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique platforms assigned
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-4 w-fit bg-muted/50 p-1 rounded-xl shadow-inner">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="companies" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Companies
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activities" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Activities
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Enhanced Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Employee Growth Chart */}
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Employee Growth Trend</CardTitle>
                          <CardDescription>Employee count over the last 6 months</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.employeeGrowth}>
                            <defs>
                              <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="employees" 
                              stroke="#3b82f6" 
                              strokeWidth={3}
                              fill="url(#colorEmployees)"
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Companies by Industry */}
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <PieChart className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Companies by Industry</CardTitle>
                          <CardDescription>Distribution of your assigned companies</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={stats.companiesByIndustry}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ industry, percent }) => `${industry} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {stats.companiesByIndustry.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                              }} 
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Employees by Department */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Employees by Department</CardTitle>
                        <CardDescription>Department distribution across all assigned companies</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.employeesByDepartment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="department" 
                            stroke="#64748b" 
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: 'none', 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                            }} 
                          />
                          <Bar 
                            dataKey="count" 
                            fill="url(#colorBar)" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Companies Tab */}
              <TabsContent value="companies" className="space-y-6">
                {companies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No companies assigned</h3>
                    <p className="text-muted-foreground">You don't have any companies assigned to manage yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => {
                      const assignment = assignments.find(a => a.companyId === company.id);
                      const companyEmployees = getCompanyEmployees(company.id);
                      
                      return (
                        <Card key={company.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardHeader className="relative">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {company.name.charAt(0)}
                                  </div>
                                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    {company.name}
                                  </CardTitle>
                                </div>
                                <CardDescription className="text-sm">{company.industry}</CardDescription>
                              </div>
                              <Badge className={cn(
                                "ml-2 shadow-sm",
                                getStatusColor(company.status)
                              )}>
                                {getStatusIcon(company.status)}
                                <span className="ml-1 text-xs font-medium">{company.status}</span>
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="relative space-y-4 pt-0">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium truncate">{company.location}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                <Users className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium">{companyEmployees.length} employees</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate">{company.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{company.phone}</span>
                              </div>
                            </div>

                            {assignment && assignment.platforms.length > 0 && (
                              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                                <p className="text-sm font-medium mb-2 text-primary">Your Platforms:</p>
                                <div className="flex flex-wrap gap-1">
                                  {assignment.platforms.map((platform) => (
                                    <Badge key={platform} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedCompany(company)}
                                className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              {company.website && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  asChild
                                  className="group-hover:border-primary group-hover:text-primary transition-colors"
                                >
                                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                                    <Globe className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Company Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Performance</CardTitle>
                      <CardDescription>Key metrics for your assigned companies</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {companies.map((company) => {
                        const companyEmployees = getCompanyEmployees(company.id);
                        const activeEmployees = companyEmployees.filter(emp => emp.status === 'ACTIVE').length;
                        const performanceScore = (activeEmployees / Math.max(companyEmployees.length, 1)) * 100;
                        
                        return (
                          <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {activeEmployees}/{companyEmployees.length} active employees
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                {performanceScore >= 90 ? (
                                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`font-medium ${performanceScore >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                                  {performanceScore.toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Performance</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Platform Usage */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Access Summary</CardTitle>
                      <CardDescription>Your access across different platforms</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assignments.map((assignment) => (
                          <div key={assignment.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{assignment.company.name}</p>
                              <Badge variant="outline">{assignment.platforms.length} platforms</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {assignment.platforms.map((platform) => (
                                <Badge key={platform} variant="secondary" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Permissions: {Object.entries(assignment.permissions).filter(([_, value]) => value).length} granted
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Enhanced Activities Tab */}
              <TabsContent value="activities" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Recent Activities</CardTitle>
                        <CardDescription>Latest updates from your assigned companies</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stats.recentActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium mb-1">No recent activities</h3>
                        <p className="text-sm text-muted-foreground">Activities will appear here when they occur.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentActivities.map((activity, index) => (
                          <div 
                            key={activity.id} 
                            className="group relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-background to-muted/20 border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            
                            <div className="relative">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
                              </div>
                              {index < stats.recentActivities.length - 1 && (
                                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-border to-transparent" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {activity.action}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground truncate">
                                  {activity.company}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-xs text-muted-foreground font-medium">
                                {activity.date}
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Enhanced Company Detail Modal */}
            {selectedCompany && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
                <Card className="w-full max-w-3xl max-h-[85vh] overflow-hidden border-0 shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="relative overflow-y-auto max-h-[85vh]">
                    {/* Modal Header */}
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {selectedCompany.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-xl">{selectedCompany.name}</CardTitle>
                              <CardDescription className="text-base">{selectedCompany.industry}</CardDescription>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCompany(null)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <span className="sr-only">Close</span>
                            ✕
                          </Button>
                        </div>
                      </CardHeader>
                    </div>

                    <CardContent className="space-y-6 p-6">
                      {/* Company Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-900">Location</p>
                          </div>
                          <p className="text-sm font-semibold text-blue-800">{selectedCompany.location}</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <p className="text-sm font-medium text-emerald-900">Employees</p>
                          </div>
                          <p className="text-sm font-semibold text-emerald-800">{getCompanyEmployees(selectedCompany.id).length}</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <p className="text-sm font-medium text-purple-900">Founded</p>
                          </div>
                          <p className="text-sm font-semibold text-purple-800">{selectedCompany.foundedYear || 'N/A'}</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-orange-600" />
                            <p className="text-sm font-medium text-orange-900">Status</p>
                          </div>
                          <Badge className={cn("text-xs", getStatusColor(selectedCompany.status))}>
                            {getStatusIcon(selectedCompany.status)}
                            <span className="ml-1">{selectedCompany.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Contact Information
                        </h3>
                        <div className="grid gap-3">
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-background/80">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{selectedCompany.email}</span>
                          </div>
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-background/80">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{selectedCompany.phone}</span>
                          </div>
                          {selectedCompany.website && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-background/80">
                              <Globe className="w-4 h-4 text-purple-600" />
                              <a 
                                href={selectedCompany.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {selectedCompany.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Employees Section */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Team Members ({getCompanyEmployees(selectedCompany.id).length})
                        </h3>
                        {getCompanyEmployees(selectedCompany.id).length === 0 ? (
                          <div className="text-center py-6">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No employees found</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {getCompanyEmployees(selectedCompany.id).map((employee) => (
                              <div key={employee.id} className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-border/50 hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
                                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{employee.firstName} {employee.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{employee.position} • {employee.department}</p>
                                  </div>
                                </div>
                                <Badge 
                                  variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {employee.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 