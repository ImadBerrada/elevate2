"use client";

import { motion } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FileText, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Building,
  Users,
  Target,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Settings,
  TrendingDown,
  Home,
  Receipt,
  CreditCard,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  period: string;
  generatedDate: string;
  status: string;
  size: string;
  pages: number;
  data?: any;
}

interface ReportsData {
  reports: Report[];
  reportCategories: Array<{
    category: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  keyMetrics: Array<{
    metric: string;
    value: string;
    change: string;
    trend: string;
  }>;
  stats: {
    totalReports: number;
    automatedReports: number;
    dataSources: number;
    reportViews: number;
  };
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  rawData: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    totalTenants: number;
    activeTenants: number;
    activeAgreements: number;
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    totalExpenseAmount: number;
  };
}

function RealEstateReportsContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || 'all');
  const [success, setSuccess] = useState(searchParams.get('success') || '');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReportsData();
  }, [selectedType, selectedPeriod]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedPeriod !== 'all') params.append('period', selectedPeriod);
      
      const response = await fetch(`/api/real-estate/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }
      
      const data = await response.json();
      setReportsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      setGeneratingReport(reportId);
      const response = await fetch(`/api/real-estate/reports/${reportId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load report');
      }
      
      const reportData = await response.json();
      
      // In a real app, this would open a modal or navigate to a detailed report view
      console.log('Report data:', reportData);
      
      // Show success message
      setSuccess(`Report ${reportId} loaded successfully`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setSuccess('Generating new report...');
      // In a real implementation, this would trigger report generation
      setTimeout(() => {
        setSuccess('Report generation initiated. You will be notified when complete.');
      }, 1000);
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const handleExportReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/real-estate/reports/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf', includeCharts: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      setSuccess(`Report ${reportId} export initiated`);
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'reports');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

  const getNavigationInfo = (metric: string) => {
    const metricLower = metric.toLowerCase();
    if (metricLower.includes('revenue') || metricLower.includes('income')) {
      return {
        module: 'invoices/history',
        icon: Receipt,
        label: 'View Invoices'
      };
    } else if (metricLower.includes('occupancy') || metricLower.includes('properties')) {
      return {
        module: 'properties',
        icon: Home,
        label: 'View Properties'
      };
    } else if (metricLower.includes('expenses')) {
      return {
        module: 'expenses',
        icon: CreditCard,
        label: 'View Expenses'
      };
    } else if (metricLower.includes('payment') || metricLower.includes('tenant')) {
      return {
        module: 'tenants/management',
        icon: UserCheck,
        label: 'View Tenants'
      };
    }
    return {
      module: 'home',
      icon: Home,
      label: 'Dashboard'
    };
  };

  const filteredReports = reportsData?.reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "scheduled": return "text-purple-600";
      case "draft": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Financial": return "bg-blue-100 text-blue-800";
      case "Performance": return "bg-green-100 text-green-800";
      case "Operational": return "bg-purple-100 text-purple-800";
      case "Tenant": return "bg-orange-100 text-orange-800";
      case "Market": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchReportsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportsData) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <motion.header 
          className={cn(
            "glass-header sticky top-0 z-50 transition-all duration-300",
            isOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: isOpen ? 0 : 1, 
            y: isOpen ? -20 : 0 
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-2 sm:space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                  </motion.div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl font-elegant text-gradient">Real Estate Reports</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-refined">
                      {reportsData.rawData.totalProperties} properties • {reportsData.rawData.activeTenants} active tenants
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-elegant text-gradient">Reports</h1>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={fetchReportsData} 
                  variant="outline" 
                  size="sm"
                  className="glass-card border-0 hover-glow"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  onClick={handleGenerateReport}
                  size="sm"
                  className="btn-premium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-6">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </motion.div>
          )}

          {/* Quick Navigation Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            {...fadeInUp}
          >
            <Button
              variant="outline"
              className="h-16 glass-card border-0 hover-glow flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateToModule('properties', { success: 'Navigated from reports dashboard' })}
            >
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Properties</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 glass-card border-0 hover-glow flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateToModule('tenants/management', { success: 'Navigated from reports dashboard' })}
            >
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Tenants</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 glass-card border-0 hover-glow flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateToModule('invoices/history', { success: 'Navigated from reports dashboard' })}
            >
              <Receipt className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Invoices</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 glass-card border-0 hover-glow flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateToModule('expenses', { success: 'Navigated from reports dashboard' })}
            >
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Expenses</span>
            </Button>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-6"
            {...fadeInUp}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-0 focus-premium"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48 glass-card border-0">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48 glass-card border-0">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80 cursor-pointer"
                    onClick={() => setSelectedType('all')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Reports
                  </CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                    {reportsData.stats.totalReports}
                  </div>
                  <p className="text-xs lg:text-sm text-green-600 font-medium">
                    +{Math.floor(reportsData.stats.totalReports * 0.2)} this month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Automated
                  </CardTitle>
                  <Target className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                    {reportsData.stats.automatedReports}
                  </div>
                  <p className="text-xs lg:text-sm text-green-600 font-medium">
                    {Math.round((reportsData.stats.automatedReports / reportsData.stats.totalReports) * 100)}% automation
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Data Sources
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                    {reportsData.stats.dataSources}
                  </div>
                  <p className="text-xs lg:text-sm text-blue-600 font-medium">Integrated systems</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Report Views
                  </CardTitle>
                  <Eye className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                    {reportsData.stats.reportViews.toLocaleString()}
                  </div>
                  <p className="text-xs lg:text-sm text-green-600 font-medium">This month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
            {/* Report Categories */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <PieChart className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Report Categories</CardTitle>
                      <CardDescription>
                        Distribution by report type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportsData.reportCategories.map((category, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-lg p-2 -mx-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        onClick={() => setSelectedType(category.category.toLowerCase())}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${category.color}`} />
                          <span className="font-medium text-foreground">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{category.count}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Metrics */}
            <motion.div 
              className="lg:col-span-2"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Key Performance Metrics</CardTitle>
                      <CardDescription>
                        Click metrics to view related data
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reportsData.keyMetrics.map((metric, index) => {
                      const TrendIcon = getTrendIcon(metric.trend);
                      const navInfo = getNavigationInfo(metric.metric);
                      const IconComponent = navInfo.icon;
                      
                      return (
                        <motion.div 
                          key={index}
                          className="glass-card p-4 rounded-xl cursor-pointer hover:bg-accent/30 group"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          onClick={() => {
                            navigateToModule(navInfo.module, { 
                              success: `Navigated from ${metric.metric} metric`,
                              highlight: metric.metric 
                            });
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-foreground text-sm">{metric.metric}</h4>
                              <IconComponent className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                          </div>
                          <p className="text-xl lg:text-2xl font-bold text-gradient mb-1">{metric.value}</p>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                              {metric.change}
                            </p>
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {navInfo.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Revenue Trend Chart */}
          {reportsData.monthlyTrend && reportsData.monthlyTrend.length > 0 && (
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.8 }}
            >
              <Card className="card-premium border-0 mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <BarChart3 className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle>Revenue vs Expenses Trend</CardTitle>
                        <CardDescription>
                          Last 6 months financial performance
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-card border-0 hover-glow"
                      onClick={() => navigateToModule('invoices/history', { 
                        success: 'Viewing detailed financial data',
                        tab: 'analytics' 
                      })}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Detailed View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportsData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis className="text-xs text-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: any) => [`AED ${(value/1000).toFixed(1)}K`, '']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Revenue"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Expenses"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Profit"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reports List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.9 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <FileText className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Recent Reports</CardTitle>
                      <CardDescription>
                        {filteredReports.length} of {reportsData.reports.length} reports
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="glass-card border-0 hover-glow"
                      onClick={() => navigateToModule('invoices/export', { 
                        success: 'Exporting data from reports module' 
                      })}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="glass-card border-0 hover-glow"
                      onClick={() => navigateToModule('home', { 
                        success: 'Navigated to dashboard from reports' 
                      })}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report, index) => (
                    <motion.div 
                      key={report.id}
                      className="glass-card p-4 lg:p-6 rounded-2xl hover-lift group cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleViewReport(report.id)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-4">
                          <motion.div 
                            className="w-10 h-10 lg:w-12 lg:h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                          >
                            <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                          </motion.div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base lg:text-lg text-foreground">{report.title}</h3>
                              <Badge 
                                className={`text-xs ${getStatusBg(report.status)}`}
                                variant="outline"
                              >
                                {report.status}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getTypeColor(report.type)}`}
                                variant="outline"
                              >
                                {report.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{report.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs lg:text-sm text-muted-foreground">
                              <span>Period: {report.period}</span>
                              <span>•</span>
                              <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Size: {report.size}</span>
                              <span>•</span>
                              <span>{report.pages} pages</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Button 
                            size="sm" 
                            className="btn-premium"
                            disabled={generatingReport === report.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReport(report.id);
                            }}
                          >
                            {generatingReport === report.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="glass-card border-0 hover-glow"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportReport(report.id);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedType !== 'all' || selectedPeriod !== 'all' 
                        ? 'No reports match your current filters' 
                        : 'No reports available'
                      }
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <Button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedType('all');
                          setSelectedPeriod('all');
                        }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                      <Button 
                        onClick={handleGenerateReport}
                        className="btn-premium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function RealEstateReports() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <RealEstateReportsContent />
    </Suspense>
  );
} 