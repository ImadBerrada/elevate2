"use client";

import { motion } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building2, 
  Home, 
  Users, 
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Settings,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  Receipt,
  CreditCard,
  Wrench,
  BarChart3,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface DashboardData {
  portfolio: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    totalTenants: number;
    activeTenants: number;
  };
  financial: {
    totalPropertyValue: number;
    monthlyRentIncome: number;
    incomeGrowth: number;
    yearlyExpenses: number;
    monthlyExpenses: number;
    netIncome: number;
  };
  recentActivities: {
    payments: any[];
    expenses: any[];
    pendingInvoices: any[];
  };
  propertyPerformance: any[];
  monthlyTrend: any[];
  expenseCategories: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function RealEstateHomeContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Handle URL parameters for navigation context
    const fromParam = searchParams.get('from');
    const successParam = searchParams.get('success');
    
    if (successParam) {
      setSuccess(successParam);
      setTimeout(() => setSuccess(null), 5000);
    }
    
    if (fromParam) {
      setSuccess(`Navigated from ${fromParam} module`);
      setTimeout(() => setSuccess(null), 4000);
    }
    
    fetchDashboardData();
  }, [searchParams]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/real-estate/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'dashboard');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
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
            <Button onClick={fetchDashboardData}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

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
                    <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                  </motion.div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl font-elegant text-gradient">Real Estate Portfolio</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-refined">Property Management Hub</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-elegant text-gradient">Real Estate</h1>
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center space-x-2">
                <Button onClick={fetchDashboardData} variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  onClick={() => navigateToModule('reports', { success: 'Navigated from dashboard' })}
                  size="sm"
                  className="btn-premium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </div>
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
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </motion.div>
          )}

          <motion.div 
            className="mb-4 sm:mb-6 lg:mb-8"
            {...fadeInUp}
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-prestigious text-gradient mb-2">
              Real Estate Management Center
            </h2>
            <p className="text-refined text-muted-foreground text-xs sm:text-sm lg:text-base">
              Comprehensive property portfolio management and analytics.
            </p>
          </motion.div>

          {/* Quick Navigation Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('properties/management', { success: 'Navigated from dashboard' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Properties</h3>
                      <p className="text-xs text-muted-foreground">Manage portfolio</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('tenants/management', { success: 'Navigated from dashboard' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Tenants</h3>
                      <p className="text-xs text-muted-foreground">Manage tenants</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('invoices/history', { success: 'Navigated from dashboard' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Receipt className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Invoices</h3>
                      <p className="text-xs text-muted-foreground">Billing & invoices</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('payments/history', { success: 'Navigated from dashboard' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Payments</h3>
                      <p className="text-xs text-muted-foreground">Payment history</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Portfolio Overview Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift"
                onClick={() => navigateToModule('properties/management', { success: 'Viewing property portfolio' })}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Properties</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Total managed properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {formatNumber(dashboardData.portfolio.totalProperties)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatNumber(dashboardData.portfolio.totalUnits)} total units
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift"
                onClick={() => navigateToModule('tenants/management', { success: 'Viewing tenant occupancy' })}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Occupancy</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Current occupancy rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {dashboardData.portfolio.occupancyRate.toFixed(1)}%
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatNumber(dashboardData.portfolio.occupiedUnits)} / {formatNumber(dashboardData.portfolio.totalUnits)} units
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift"
                onClick={() => navigateToModule('invoices/history', { success: 'Viewing rental income details' })}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Monthly Income</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Current month rental income</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {formatCurrency(dashboardData.financial.monthlyRentIncome)}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    {dashboardData.financial.incomeGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    <span className={dashboardData.financial.incomeGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(dashboardData.financial.incomeGrowth).toFixed(1)}% vs last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift"
                onClick={() => navigateToModule('expenses', { success: 'Viewing expense breakdown' })}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Portfolio Value</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Total property value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {formatCurrency(dashboardData.financial.totalPropertyValue)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Net: {formatCurrency(dashboardData.financial.netIncome)}/month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Income Trend */}
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm sm:text-base">Monthly Income Trend</CardTitle>
                      <CardDescription>Last 12 months rental income</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToModule('invoices/history', { success: 'Viewing detailed income analysis' })}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Income']} />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ fill: '#8884d8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Expense Categories */}
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm sm:text-base">Expense Categories</CardTitle>
                      <CardDescription>Year-to-date expense breakdown</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToModule('expenses', { success: 'Viewing detailed expense analysis' })}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.expenseCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {dashboardData.expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activities */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Recent Activities</CardTitle>
                    <CardDescription>Latest payments, expenses, and pending invoices</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToModule('payments/history', { success: 'Viewing all payment activities' })}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payments
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToModule('expenses', { success: 'Viewing all expense activities' })}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Expenses
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Recent Payments */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-green-600">Recent Payments</h4>
                    <div className="space-y-2">
                      {dashboardData.recentActivities.payments.slice(0, 3).map((payment, index) => (
                        <div 
                          key={index} 
                          className="p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                          onClick={() => navigateToModule('payments/history', { 
                            success: 'Viewing payment details',
                            tenant: payment.agreement.tenant.id 
                          })}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-medium">
                                {payment.agreement.tenant.firstName} {payment.agreement.tenant.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.agreement.property.name} - Unit {payment.agreement.rentalUnit.unitNumber}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {formatCurrency(payment.amount)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Expenses */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-orange-600">Recent Expenses</h4>
                    <div className="space-y-2">
                      {dashboardData.recentActivities.expenses.slice(0, 3).map((expense, index) => (
                        <div 
                          key={index} 
                          className="p-2 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => navigateToModule('expenses', { 
                            success: 'Viewing expense details',
                            property: expense.property.name 
                          })}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-medium">{expense.description}</p>
                              <p className="text-xs text-muted-foreground">{expense.property.name}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {formatCurrency(expense.amount)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Invoices */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-red-600">Pending Invoices</h4>
                    <div className="space-y-2">
                      {dashboardData.recentActivities.pendingInvoices.slice(0, 3).map((invoice, index) => (
                        <div 
                          key={index} 
                          className="p-2 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => navigateToModule('invoices/history', { 
                            success: 'Viewing invoice details',
                            tenant: invoice.agreement.tenant.id 
                          })}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-medium">
                                {invoice.agreement.tenant.firstName} {invoice.agreement.tenant.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              {formatCurrency(invoice.totalAmount)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Property Performance */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Property Performance</CardTitle>
                    <CardDescription>Individual property metrics and performance</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToModule('properties/management', { success: 'Viewing detailed property performance' })}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.propertyPerformance.map((property, index) => (
                    <div 
                      key={property.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => navigateToModule('properties/management', { 
                        success: 'Viewing property details',
                        highlight: property.id 
                      })}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{property.name}</h4>
                        <Badge variant="outline" className="text-xs">{property.type}</Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Occupancy:</span>
                          <span className="font-medium">{property.occupancyRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Units:</span>
                          <span>{property.occupiedUnits}/{property.totalUnits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Income:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(property.monthlyIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Income:</span>
                          <span className={`font-medium ${property.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(property.netIncome)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigateToModule('invoices/generate', { success: 'Creating new invoice' })}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">New Invoice</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigateToModule('tenants/management', { success: 'Adding new tenant' })}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Add Tenant</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigateToModule('appliances/maintenance', { success: 'Scheduling maintenance' })}
                  >
                    <Wrench className="w-5 h-5" />
                    <span className="text-sm">Maintenance</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigateToModule('reports', { success: 'Generating reports' })}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm">Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function RealEstateHome() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <RealEstateHomeContent />
    </Suspense>
  );
} 